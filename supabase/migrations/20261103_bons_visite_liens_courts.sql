-- Liens courts pour les bons de visite : /bon/k7m2x9qp4wza au lieu de /bon-visite/<64 caractères>.
-- Jeton de 12 caractères (alphabet de 32 signes sans 0/o/1/l : 60 bits aléatoires), toujours impossible à deviner.
-- Les bons déjà créés passent aussi au lien court (leur ancien lien long ne fonctionne plus : renvoyer le nouveau).
-- À coller dans Supabase → SQL Editor après 20261102_bons_visite.sql. Idempotent. Annulation : 20261103_bons_visite_liens_courts_down.sql
BEGIN;

CREATE OR REPLACE FUNCTION public.jeton_bon_court()
RETURNS TEXT LANGUAGE plpgsql VOLATILE AS $$
DECLARE
  alphabet CONSTANT TEXT := 'abcdefghijkmnpqrstuvwxyz23456789';
  -- Octets entièrement aléatoires de deux UUID v4 (on évite ceux qui portent la version et la variante).
  octets BYTEA := uuid_send(gen_random_uuid()) || uuid_send(gen_random_uuid());
  positions CONSTANT INT[] := ARRAY[0, 1, 2, 3, 4, 5, 7, 9, 10, 11, 12, 13];
  resultat TEXT := '';
  i INT;
BEGIN
  FOREACH i IN ARRAY positions LOOP
    resultat := resultat || substr(alphabet, (get_byte(octets, i) % 32) + 1, 1);
  END LOOP;
  RETURN resultat;
END;
$$;

ALTER TABLE public.bons_visite ALTER COLUMN jeton SET DEFAULT public.jeton_bon_court();

-- Tous les bons passent au lien court, y compris ceux déjà créés (signés ou non).
-- Le jeton ne fait pas partie de l'empreinte SHA-256 : le contenu signé reste intact.
-- Le verrou des bons signés est suspendu le temps de cette seule mise à jour.
ALTER TABLE public.bons_visite DISABLE TRIGGER bons_visite_verrou;
UPDATE public.bons_visite SET jeton = public.jeton_bon_court() WHERE jeton ~ '^[0-9a-f]{64}$';
ALTER TABLE public.bons_visite ENABLE TRIGGER bons_visite_verrou;

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
  WHERE p_jeton ~ '^([0-9a-f]{64}|[a-z2-9]{12})$' AND b.jeton = p_jeton;
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
  IF p_jeton IS NULL OR p_jeton !~ '^([0-9a-f]{64}|[a-z2-9]{12})$' THEN
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
