-- Bons de visite signés à distance (visite sur place ou à distance).
-- L'agence prépare le bon dans l'admin (/manage-xk92p/bons-visite) ; la cliente
-- l'ouvre par un lien secret (/bon-visite/<jeton>), le lit, le signe au doigt.
-- Aucun accès public à la table : la cliente passe uniquement par les deux
-- fonctions bon_visite_public() et signer_bon_visite(), avec son jeton.
-- Un bon signé ne peut plus être modifié (trigger), seulement supprimé par un admin.
-- À coller dans Supabase → SQL Editor. Idempotent. Annulation : 20261102_bons_visite_down.sql
-- ════════════════════════════════════════════════════════════════════════
BEGIN;

CREATE TABLE IF NOT EXISTS public.bons_visite (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numero BIGINT GENERATED ALWAYS AS IDENTITY UNIQUE,
  -- 64 caractères hexadécimaux tirés de deux UUID v4 : lien impossible à deviner.
  jeton TEXT NOT NULL UNIQUE DEFAULT (replace(gen_random_uuid()::text, '-', '') || replace(gen_random_uuid()::text, '-', '')),
  -- Préparation par l'agence
  type_bien TEXT NOT NULL CHECK (type_bien IN ('villa', 'appartement')),
  bien TEXT NOT NULL CHECK (length(btrim(bien)) BETWEEN 2 AND 300),
  quartier TEXT NOT NULL CHECK (length(btrim(quartier)) BETWEEN 2 AND 120),
  date_visite DATE NOT NULL,
  prix NUMERIC(12, 2) NOT NULL CHECK (prix > 0 AND prix < 100000000),
  prix_unite TEXT NOT NULL CHECK (prix_unite IN ('mois', 'nuit')),
  -- Texte lu et accepté par la cliente (fixé ici, jamais envoyé par le navigateur)
  texte TEXT NOT NULL DEFAULT 'Je confirme avoir effectué une visite du bien indiqué ci-dessus avec l’agence Live In Marrakech.

Ce document confirme uniquement la présentation du bien. Il ne constitue ni une réservation, ni un engagement de location ou d’achat.',
  texte_confirmation TEXT NOT NULL DEFAULT 'Je confirme que les informations ci-dessus sont exactes.',
  -- Signature par la cliente
  statut TEXT NOT NULL DEFAULT 'a-signer' CHECK (statut IN ('a-signer', 'signe')),
  client_nom TEXT,
  client_telephone TEXT,
  client_email TEXT,
  signature TEXT CHECK (signature IS NULL OR (signature LIKE 'data:image/png;base64,%' AND length(signature) <= 400000)),
  signe_le TIMESTAMPTZ,
  empreinte TEXT,
  created_by UUID DEFAULT auth.uid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT bons_visite_etat_coherent CHECK (
    (statut = 'a-signer' AND client_nom IS NULL AND client_telephone IS NULL AND signature IS NULL AND signe_le IS NULL AND empreinte IS NULL)
    OR (statut = 'signe' AND client_nom IS NOT NULL AND client_telephone IS NOT NULL AND signature IS NOT NULL AND signe_le IS NOT NULL AND empreinte IS NOT NULL)
  )
);

CREATE INDEX IF NOT EXISTS bons_visite_created_at_idx ON public.bons_visite (created_at DESC);

ALTER TABLE public.bons_visite ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins manage visit vouchers" ON public.bons_visite;
CREATE POLICY "Admins manage visit vouchers" ON public.bons_visite
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Aucun droit pour anon. L'admin ne choisit que les champs de préparation :
-- jeton, texte, signature et horodatage restent hors de sa portée.
REVOKE ALL ON public.bons_visite FROM anon, authenticated;
GRANT SELECT, DELETE ON public.bons_visite TO authenticated;
GRANT INSERT (type_bien, bien, quartier, date_visite, prix, prix_unite) ON public.bons_visite TO authenticated;
GRANT UPDATE (type_bien, bien, quartier, date_visite, prix, prix_unite) ON public.bons_visite TO authenticated;

-- Verrou : un bon signé ne change plus, et seul signer_bon_visite() peut le signer.
CREATE OR REPLACE FUNCTION public.bons_visite_verrou()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF OLD.statut = 'signe' THEN
    RAISE EXCEPTION 'bon_deja_signe' USING HINT = 'Un bon de visite signé ne peut plus être modifié.';
  END IF;
  IF NEW.statut = 'signe' AND coalesce(current_setting('app.signature_bon', true), '') <> 'oui' THEN
    RAISE EXCEPTION 'signature_reservee' USING HINT = 'Seule la cliente peut signer, depuis son lien.';
  END IF;
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS bons_visite_verrou ON public.bons_visite;
CREATE TRIGGER bons_visite_verrou
  BEFORE UPDATE ON public.bons_visite
  FOR EACH ROW EXECUTE FUNCTION public.bons_visite_verrou();

-- Lecture par la cliente : uniquement le bon de son jeton.
CREATE OR REPLACE FUNCTION public.bon_visite_public(p_jeton TEXT)
RETURNS TABLE (
  numero BIGINT, type_bien TEXT, bien TEXT, quartier TEXT, date_visite DATE, prix NUMERIC, prix_unite TEXT,
  texte TEXT, texte_confirmation TEXT, statut TEXT, client_nom TEXT, client_telephone TEXT, client_email TEXT,
  signature TEXT, signe_le TIMESTAMPTZ, empreinte TEXT
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT b.numero, b.type_bien, b.bien, b.quartier, b.date_visite, b.prix, b.prix_unite,
         b.texte, b.texte_confirmation, b.statut, b.client_nom, b.client_telephone, b.client_email,
         b.signature, b.signe_le, b.empreinte
  FROM public.bons_visite b
  WHERE p_jeton ~ '^[0-9a-f]{64}$' AND b.jeton = p_jeton;
$$;

-- Signature par la cliente. Date et heure prises par le serveur.
CREATE OR REPLACE FUNCTION public.signer_bon_visite(p_jeton TEXT, p_nom TEXT, p_telephone TEXT, p_email TEXT, p_signature TEXT)
RETURNS TABLE (
  numero BIGINT, type_bien TEXT, bien TEXT, quartier TEXT, date_visite DATE, prix NUMERIC, prix_unite TEXT,
  texte TEXT, texte_confirmation TEXT, statut TEXT, client_nom TEXT, client_telephone TEXT, client_email TEXT,
  signature TEXT, signe_le TIMESTAMPTZ, empreinte TEXT
)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v public.bons_visite;
  v_nom TEXT := btrim(coalesce(p_nom, ''));
  v_tel TEXT := btrim(coalesce(p_telephone, ''));
  v_email TEXT := nullif(btrim(coalesce(p_email, '')), '');
  v_now TIMESTAMPTZ := now();
BEGIN
  IF p_jeton IS NULL OR p_jeton !~ '^[0-9a-f]{64}$' THEN
    RAISE EXCEPTION 'bon_introuvable';
  END IF;
  SELECT * INTO v FROM public.bons_visite b WHERE b.jeton = p_jeton FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'bon_introuvable';
  END IF;
  IF v.statut = 'signe' THEN
    RAISE EXCEPTION 'bon_deja_signe';
  END IF;
  IF length(v_nom) NOT BETWEEN 2 AND 120 THEN
    RAISE EXCEPTION 'nom_invalide';
  END IF;
  IF v_tel !~ '^\+[0-9]{1,4} [0-9]{6,14}$' THEN
    RAISE EXCEPTION 'telephone_invalide';
  END IF;
  IF v_email IS NOT NULL AND (length(v_email) > 254 OR v_email !~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$') THEN
    RAISE EXCEPTION 'email_invalide';
  END IF;
  IF p_signature IS NULL OR p_signature NOT LIKE 'data:image/png;base64,%' OR length(p_signature) NOT BETWEEN 200 AND 400000 THEN
    RAISE EXCEPTION 'signature_invalide';
  END IF;

  PERFORM set_config('app.signature_bon', 'oui', true);
  UPDATE public.bons_visite b SET
    statut = 'signe',
    client_nom = v_nom,
    client_telephone = v_tel,
    client_email = v_email,
    signature = p_signature,
    signe_le = v_now,
    empreinte = encode(sha256(convert_to(concat_ws('|',
      v.numero, v.type_bien, v.bien, v.quartier, v.date_visite, v.prix, v.prix_unite, v.texte, v.texte_confirmation,
      v_nom, v_tel, coalesce(v_email, ''), p_signature,
      to_char(v_now AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.US"Z"')), 'UTF8')), 'hex')
  WHERE b.id = v.id;
  PERFORM set_config('app.signature_bon', '', true);

  RETURN QUERY SELECT * FROM public.bon_visite_public(p_jeton);
END;
$$;

REVOKE ALL ON FUNCTION public.bon_visite_public(TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.signer_bon_visite(TEXT, TEXT, TEXT, TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.bon_visite_public(TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.signer_bon_visite(TEXT, TEXT, TEXT, TEXT, TEXT) TO anon, authenticated;

NOTIFY pgrst, 'reload schema';
COMMIT;
