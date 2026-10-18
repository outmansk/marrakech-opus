-- =====================================================================
-- Live In Marrakech — full database schema (consolidated baseline)
-- Run once on a fresh Supabase project: SQL Editor → paste → Run.
-- Replaces replaying the historical files in supabase/migrations/.
-- =====================================================================

-- ─── Roles ───────────────────────────────────────────────────────────
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile" ON public.profiles
  FOR SELECT TO authenticated USING (auth.uid() = id);

-- Every new auth user gets a non-admin profile.
CREATE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, role) VALUES (NEW.id, 'user');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- SECURITY DEFINER avoids RLS recursion when policies check the admin role.
CREATE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin');
$$;

CREATE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- ─── Properties ──────────────────────────────────────────────────────
CREATE TABLE public.properties_v2 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titre TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('villa', 'appartement', 'riad', 'maison', 'terrain')),
  service TEXT,
  services TEXT[] NOT NULL DEFAULT '{}',
  prix NUMERIC,
  prix_vente NUMERIC,
  prix_location_longue NUMERIC,
  prix_location_courte NUMERIC,
  devise TEXT NOT NULL DEFAULT 'MAD',
  surface_habitable NUMERIC,
  surface_terrain NUMERIC,
  chambres INTEGER,
  salles_de_bain INTEGER,
  quartier TEXT,
  description_courte TEXT,
  description_longue TEXT,
  equipements TEXT[] DEFAULT '{}',
  proximites JSONB DEFAULT '[]'::jsonb,
  photos TEXT[] DEFAULT '{}',
  photo_principale TEXT,
  statut TEXT NOT NULL DEFAULT 'brouillon' CHECK (statut IN ('publie', 'brouillon', 'vendu-loue')),
  disponible_le DATE,
  reference TEXT UNIQUE,
  latitude NUMERIC,
  longitude NUMERIC,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.properties_v2 ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view published properties" ON public.properties_v2
  FOR SELECT USING (statut IN ('publie', 'vendu-loue') OR public.is_admin());
CREATE POLICY "Admins manage properties" ON public.properties_v2
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE TRIGGER properties_v2_updated_at
  BEFORE UPDATE ON public.properties_v2
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ─── Blog ────────────────────────────────────────────────────────────
CREATE TABLE public.articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  meta_title TEXT,
  meta_description TEXT,
  image_url TEXT,
  est_publie BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view published articles" ON public.articles
  FOR SELECT USING (est_publie = true OR public.is_admin());
CREATE POLICY "Admins manage articles" ON public.articles
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE TRIGGER articles_updated_at
  BEFORE UPDATE ON public.articles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ─── Visit requests ──────────────────────────────────────────────────
CREATE TABLE public.visit_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID, -- legacy v1 reference, kept for type compatibility
  property_v2_id UUID REFERENCES public.properties_v2(id) ON DELETE SET NULL,
  client_name TEXT NOT NULL CHECK (length(btrim(client_name)) BETWEEN 2 AND 120),
  client_phone TEXT NOT NULL CHECK (length(client_phone) <= 40),
  requested_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'en-attente',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX visit_requests_property_v2_id_idx ON public.visit_requests(property_v2_id);

ALTER TABLE public.visit_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can create visit requests" ON public.visit_requests
  FOR INSERT TO anon, authenticated
  WITH CHECK (status IN ('en-attente', 'pending') AND property_v2_id IS NOT NULL);
CREATE POLICY "Admins manage visit requests" ON public.visit_requests
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ─── Contact messages ────────────────────────────────────────────────
CREATE TABLE public.contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL CHECK (length(btrim(name)) BETWEEN 1 AND 120),
  email TEXT NOT NULL CHECK (length(email) <= 254),
  phone TEXT CHECK (phone IS NULL OR length(phone) <= 40),
  message TEXT NOT NULL CHECK (length(message) <= 5000),
  traite BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can send contact messages" ON public.contact_messages
  FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Admins manage contact messages" ON public.contact_messages
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ─── Client leads (CRM + public request form) ────────────────────────
CREATE TABLE public.client_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  source TEXT NOT NULL DEFAULT 'WhatsApp',
  transaction_type TEXT NOT NULL DEFAULT 'location-longue-duree'
    CHECK (transaction_type IN ('location-longue-duree', 'location-courte-duree', 'vente')),
  property_types TEXT[] NOT NULL DEFAULT '{}',
  budget_min NUMERIC,
  budget_max NUMERIC,
  preferred_areas TEXT[] NOT NULL DEFAULT '{}',
  bedrooms_min INTEGER,
  furnishing TEXT NOT NULL DEFAULT 'any' CHECK (furnishing IN ('any', 'furnished', 'unfurnished')),
  available_from DATE,
  reference_location TEXT,
  max_distance_km NUMERIC,
  profession TEXT,
  client_profile TEXT,
  status TEXT NOT NULL DEFAULT 'nouveau'
    CHECK (status IN ('nouveau', 'contacte', 'qualification', 'visite', 'negociation', 'converti', 'perdu')),
  next_follow_up_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  CONSTRAINT client_leads_budget_valid CHECK (budget_min IS NULL OR budget_max IS NULL OR budget_min <= budget_max),
  CONSTRAINT client_leads_distance_positive CHECK (max_distance_km IS NULL OR max_distance_km >= 0),
  CONSTRAINT client_leads_bedrooms_positive CHECK (bedrooms_min IS NULL OR bedrooms_min >= 0)
);

CREATE INDEX client_leads_status_idx ON public.client_leads(status);
CREATE INDEX client_leads_follow_up_idx ON public.client_leads(next_follow_up_at);
CREATE INDEX client_leads_created_at_idx ON public.client_leads(created_at DESC);

ALTER TABLE public.client_leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage client leads" ON public.client_leads
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Public can submit client requests" ON public.client_leads
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    source = 'Site web'
    AND status = 'nouveau'
    AND created_by IS NULL
    AND length(btrim(name)) BETWEEN 2 AND 120
    AND length(regexp_replace(phone, '[^0-9]', '', 'g')) BETWEEN 8 AND 15
    AND (email IS NULL OR length(email) <= 254)
    AND property_types <@ ARRAY['villa', 'appartement', 'riad', 'maison', 'terrain']::text[]
    AND cardinality(property_types) <= 5
    AND cardinality(preferred_areas) <= 8
    AND (budget_min IS NULL OR budget_min BETWEEN 0 AND 100000000)
    AND (budget_max IS NULL OR budget_max BETWEEN 0 AND 100000000)
    AND (bedrooms_min IS NULL OR bedrooms_min BETWEEN 0 AND 20)
    AND (max_distance_km IS NULL OR max_distance_km BETWEEN 0 AND 500)
    AND (profession IS NULL OR length(profession) <= 120)
    AND (client_profile IS NULL OR length(client_profile) <= 250)
    AND (reference_location IS NULL OR length(reference_location) <= 200)
    AND (notes IS NULL OR length(notes) <= 1500)
  );

CREATE TRIGGER client_leads_updated_at
  BEFORE UPDATE ON public.client_leads
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ─── Table privileges for the API roles ──────────────────────────────
GRANT SELECT ON public.properties_v2, public.articles TO anon;
GRANT INSERT ON public.visit_requests, public.contact_messages, public.client_leads TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;


-- ─── Agenda & carnet de contacts (propriétaires, agences, clients, partenaires)

CREATE TABLE IF NOT EXISTS public.contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nom TEXT NOT NULL CHECK (length(btrim(nom)) BETWEEN 1 AND 120),
  telephone TEXT CHECK (telephone IS NULL OR length(telephone) <= 40),
  email TEXT CHECK (email IS NULL OR length(email) <= 254),
  role TEXT NOT NULL DEFAULT 'proprietaire'
    CHECK (role IN ('proprietaire', 'intermediaire', 'agence', 'client', 'partenaire', 'autre')),
  societe TEXT CHECK (societe IS NULL OR length(societe) <= 120),
  bien_id UUID REFERENCES public.properties_v2(id) ON DELETE SET NULL,
  notes TEXT CHECK (notes IS NULL OR length(notes) <= 5000),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.taches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL DEFAULT 'appel'
    CHECK (type IN ('appel', 'rendez-vous', 'visite', 'relance', 'prospection', 'note')),
  titre TEXT NOT NULL CHECK (length(btrim(titre)) BETWEEN 1 AND 200),
  echeance TIMESTAMPTZ,            -- vide = note / à faire sans date
  fait BOOLEAN NOT NULL DEFAULT false,
  fait_le TIMESTAMPTZ,
  contact_id UUID REFERENCES public.contacts(id) ON DELETE SET NULL,
  bien_id UUID REFERENCES public.properties_v2(id) ON DELETE SET NULL,
  lead_id UUID REFERENCES public.client_leads(id) ON DELETE SET NULL,
  lieu TEXT CHECK (lieu IS NULL OR length(lieu) <= 200),
  notes TEXT CHECK (notes IS NULL OR length(notes) <= 5000),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS contacts_role_idx ON public.contacts(role);
CREATE INDEX IF NOT EXISTS taches_echeance_idx ON public.taches(fait, echeance);
CREATE INDEX IF NOT EXISTS taches_contact_idx ON public.taches(contact_id);
CREATE INDEX IF NOT EXISTS taches_lead_idx ON public.taches(lead_id);

ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.taches ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins manage contacts" ON public.contacts;
CREATE POLICY "Admins manage contacts" ON public.contacts
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins manage tasks" ON public.taches;
CREATE POLICY "Admins manage tasks" ON public.taches
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

GRANT SELECT, INSERT, UPDATE, DELETE ON public.contacts, public.taches TO authenticated;

DROP TRIGGER IF EXISTS contacts_updated_at ON public.contacts;
CREATE TRIGGER contacts_updated_at BEFORE UPDATE ON public.contacts
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS taches_updated_at ON public.taches;
CREATE TRIGGER taches_updated_at BEFORE UPDATE ON public.taches
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ─── Blog languages (FR / EN / ES) ──────────────────────────────────
-- Each article is written in one language and published at /blog/…, /en/blog/… or /es/blog/….
-- Translations of the same article share a translation_key (used for hreflang links).

ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS lang TEXT NOT NULL DEFAULT 'fr';
ALTER TABLE public.articles DROP CONSTRAINT IF EXISTS articles_lang_check;
ALTER TABLE public.articles ADD CONSTRAINT articles_lang_check CHECK (lang IN ('fr', 'en', 'es'));
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS translation_key TEXT
  CHECK (translation_key IS NULL OR translation_key ~ '^[a-z0-9-]{1,120}$');

CREATE INDEX IF NOT EXISTS articles_lang_published_idx ON public.articles(lang, est_publie);
CREATE INDEX IF NOT EXISTS articles_translation_key_idx ON public.articles(translation_key);

-- ─── Property translations (EN / ES) and furnished status ────────────
-- Empty translation → the site uses the proposed text of src/content/propertyTranslations.json.
-- meuble: true = furnished, false = unfurnished, NULL = not specified yet.

ALTER TABLE public.properties_v2
  ADD COLUMN IF NOT EXISTS titre_en TEXT,
  ADD COLUMN IF NOT EXISTS titre_es TEXT,
  ADD COLUMN IF NOT EXISTS description_courte_en TEXT,
  ADD COLUMN IF NOT EXISTS description_courte_es TEXT,
  ADD COLUMN IF NOT EXISTS description_longue_en TEXT,
  ADD COLUMN IF NOT EXISTS description_longue_es TEXT,
  ADD COLUMN IF NOT EXISTS traduction_a_relire BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS meuble BOOLEAN;

NOTIFY pgrst, 'reload schema';


-- ════════════════════════════════════════════════════════════════════════
-- Copie de supabase/migrations/20261013_reseaux_sociaux.sql (annulation : …_down.sql)
-- ════════════════════════════════════════════════════════════════════════
-- Réseaux sociaux : suivi de la diffusion des biens (admin /manage-xk92p/reseaux)
-- À coller dans Supabase → SQL Editor. Idempotent : peut être relancé sans risque.
-- Annulation : 20261013_reseaux_sociaux_down.sql
-- Aucun mot de passe ni jeton de réseau social n'est stocké : la section ne publie rien.
-- ════════════════════════════════════════════════════════════════════════

-- ─── Groupes et pages ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.social_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code INTEGER GENERATED BY DEFAULT AS IDENTITY UNIQUE,          -- court, utilisé dans les liens suivis (?g=)
  nom TEXT NOT NULL CHECK (length(btrim(nom)) BETWEEN 1 AND 200),
  lien TEXT CHECK (lien IS NULL OR length(lien) <= 500),
  reseau TEXT NOT NULL DEFAULT 'facebook'
    CHECK (reseau IN ('facebook', 'instagram', 'marketplace', 'whatsapp', 'tiktok', 'linkedin', 'autre')),
  membres INTEGER CHECK (membres IS NULL OR membres >= 0),
  type TEXT NOT NULL DEFAULT 'immo' CHECK (type IN ('immo', 'expat', 'quartier', 'autre')),
  langue TEXT NOT NULL DEFAULT 'fr' CHECK (langue IN ('fr', 'en', 'fr-en', 'autre')),
  regles TEXT CHECK (regles IS NULL OR length(regles) <= 4000),
  agences_interdites BOOLEAN NOT NULL DEFAULT false,
  immobilier_interdit BOOLEAN NOT NULL DEFAULT false,
  approbation_obligatoire BOOLEAN NOT NULL DEFAULT false,
  statut TEXT NOT NULL DEFAULT 'actif' CHECK (statut IN ('actif', 'a-eviter', 'reserve')),
  statut_raison TEXT CHECK (statut_raison IS NULL OR length(statut_raison) <= 500),
  is_demo BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS social_groups_lien_key ON public.social_groups (lower(lien)) WHERE lien IS NOT NULL;

-- ─── Publications ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.social_publications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code INTEGER GENERATED BY DEFAULT AS IDENTITY UNIQUE,          -- référence courte « FB-12 » et ?p= des liens suivis
  -- Bien du site. Pas de clé étrangère : les biens encore décrits dans le code (src/content/fileProperties.json)
  -- ont un identifiant qui n'est pas dans properties_v2 tant qu'ils n'y ont pas été insérés.
  bien_id UUID,
  bien_hors_site TEXT CHECK (bien_hors_site IS NULL OR length(bien_hors_site) <= 200),
  groupe_id UUID REFERENCES public.social_groups(id) ON DELETE SET NULL,
  reseau TEXT NOT NULL DEFAULT 'facebook'
    CHECK (reseau IN ('facebook', 'instagram', 'marketplace', 'whatsapp', 'tiktok', 'linkedin', 'autre')),
  publie_le TIMESTAMPTZ NOT NULL DEFAULT now(),
  langue TEXT NOT NULL DEFAULT 'fr' CHECK (langue IN ('fr', 'en', 'fr-en', 'autre')),
  texte_debut TEXT CHECK (texte_debut IS NULL OR length(texte_debut) <= 1000),
  nb_photos INTEGER CHECK (nb_photos IS NULL OR nb_photos BETWEEN 0 AND 100),
  lien TEXT CHECK (lien IS NULL OR length(lien) <= 500),
  publie_par TEXT NOT NULL DEFAULT 'moi' CHECK (publie_par IN ('moi', 'claude', 'autre')),
  statut TEXT NOT NULL DEFAULT 'en-attente' CHECK (statut IN ('en-attente', 'en-ligne', 'refusee', 'supprimee', 'expiree')),
  statut_change_le TIMESTAMPTZ NOT NULL DEFAULT now(),
  remarque TEXT CHECK (remarque IS NULL OR length(remarque) <= 2000),
  origine TEXT NOT NULL DEFAULT 'manuel' CHECK (origine IN ('manuel', 'import', 'api')),
  is_demo BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT social_publications_bien CHECK (bien_id IS NOT NULL OR bien_hors_site IS NOT NULL)
);
CREATE INDEX IF NOT EXISTS social_publications_bien_idx ON public.social_publications (bien_id);
CREATE INDEX IF NOT EXISTS social_publications_groupe_idx ON public.social_publications (groupe_id);
CREATE INDEX IF NOT EXISTS social_publications_date_idx ON public.social_publications (publie_le DESC);
CREATE INDEX IF NOT EXISTS social_publications_statut_idx ON public.social_publications (statut);

-- ─── Clics arrivés par un lien suivi (aucune donnée personnelle) ──────
CREATE TABLE IF NOT EXISTS public.social_clicks (
  id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  publication_id UUID NOT NULL REFERENCES public.social_publications(id) ON DELETE CASCADE,
  path TEXT CHECK (path IS NULL OR length(path) <= 300),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS social_clicks_publication_idx ON public.social_clicks (publication_id);
CREATE INDEX IF NOT EXISTS social_clicks_date_idx ON public.social_clicks (created_at DESC);

-- ─── Alertes de compte (avertissement, vérification, blocage…) ────────
CREATE TABLE IF NOT EXISTS public.social_account_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  survenue_le TIMESTAMPTZ NOT NULL DEFAULT now(),
  reseau TEXT NOT NULL DEFAULT 'facebook'
    CHECK (reseau IN ('facebook', 'instagram', 'marketplace', 'whatsapp', 'tiktok', 'linkedin', 'autre')),
  type TEXT NOT NULL CHECK (type IN ('avertissement', 'verification', 'blocage', 'publication-refusee')),
  compte TEXT CHECK (compte IS NULL OR length(compte) <= 200),
  remarque TEXT CHECK (remarque IS NULL OR length(remarque) <= 2000),
  is_demo BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS social_account_alerts_date_idx ON public.social_account_alerts (survenue_le DESC);

DROP TRIGGER IF EXISTS social_groups_updated_at ON public.social_groups;
CREATE TRIGGER social_groups_updated_at BEFORE UPDATE ON public.social_groups
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
DROP TRIGGER IF EXISTS social_publications_updated_at ON public.social_publications;
CREATE TRIGGER social_publications_updated_at BEFORE UPDATE ON public.social_publications
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- La date de changement de statut suit le statut.
CREATE OR REPLACE FUNCTION public.social_publications_statut_change()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.statut IS DISTINCT FROM OLD.statut THEN NEW.statut_change_le := now(); END IF;
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS social_publications_statut ON public.social_publications;
CREATE TRIGGER social_publications_statut BEFORE UPDATE ON public.social_publications
  FOR EACH ROW EXECUTE FUNCTION public.social_publications_statut_change();

ALTER TABLE public.social_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_publications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_account_alerts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins manage social groups" ON public.social_groups;
CREATE POLICY "Admins manage social groups" ON public.social_groups
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS "Admins manage social publications" ON public.social_publications;
CREATE POLICY "Admins manage social publications" ON public.social_publications
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS "Admins read social clicks" ON public.social_clicks;
CREATE POLICY "Admins read social clicks" ON public.social_clicks
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS "Admins manage social alerts" ON public.social_account_alerts;
CREATE POLICY "Admins manage social alerts" ON public.social_account_alerts
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

GRANT SELECT, INSERT, UPDATE, DELETE ON public.social_groups, public.social_publications,
  public.social_clicks, public.social_account_alerts TO authenticated;

-- ─── Origine des clients : colonnes facultatives sur les tables existantes ─
-- Nécessaires pour savoir d'où vient un client, une visite ou un message, et pour quel bien.
-- Toutes nullables : les lignes existantes et les formulaires actuels ne changent pas.
ALTER TABLE public.client_leads
  ADD COLUMN IF NOT EXISTS bien_id UUID,
  ADD COLUMN IF NOT EXISTS origine_reseau TEXT,
  ADD COLUMN IF NOT EXISTS origine_groupe_id UUID REFERENCES public.social_groups(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS origine_publication_id UUID REFERENCES public.social_publications(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS origine_ref TEXT CHECK (origine_ref IS NULL OR origine_ref ~ '^[A-Z]{2}-[0-9]{1,9}$');
ALTER TABLE public.visit_requests
  ADD COLUMN IF NOT EXISTS origine_reseau TEXT,
  ADD COLUMN IF NOT EXISTS origine_groupe_id UUID REFERENCES public.social_groups(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS origine_publication_id UUID REFERENCES public.social_publications(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS origine_ref TEXT CHECK (origine_ref IS NULL OR origine_ref ~ '^[A-Z]{2}-[0-9]{1,9}$');
ALTER TABLE public.contact_messages
  ADD COLUMN IF NOT EXISTS bien_id UUID,
  ADD COLUMN IF NOT EXISTS origine_reseau TEXT,
  ADD COLUMN IF NOT EXISTS origine_groupe_id UUID REFERENCES public.social_groups(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS origine_publication_id UUID REFERENCES public.social_publications(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS origine_ref TEXT CHECK (origine_ref IS NULL OR origine_ref ~ '^[A-Z]{2}-[0-9]{1,9}$');

CREATE INDEX IF NOT EXISTS client_leads_origine_publication_idx ON public.client_leads (origine_publication_id);
CREATE INDEX IF NOT EXISTS client_leads_bien_idx ON public.client_leads (bien_id);
CREATE INDEX IF NOT EXISTS visit_requests_origine_publication_idx ON public.visit_requests (origine_publication_id);

-- Un formulaire du site n'envoie que la référence courte (« FB-12 ») gardée dans le navigateur :
-- on retrouve ici la publication, le groupe et le réseau. Les champs saisis par l'admin ne sont pas écrasés.
CREATE OR REPLACE FUNCTION public.resolve_social_origin()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE pub public.social_publications%ROWTYPE;
BEGIN
  IF NEW.origine_ref ~ '^[A-Z]{2}-[0-9]{1,9}$' AND NEW.origine_publication_id IS NULL THEN
    SELECT * INTO pub FROM public.social_publications WHERE code = split_part(NEW.origine_ref, '-', 2)::integer;
    IF FOUND THEN
      NEW.origine_publication_id := pub.id;
      NEW.origine_groupe_id := COALESCE(NEW.origine_groupe_id, pub.groupe_id);
      NEW.origine_reseau := COALESCE(NEW.origine_reseau, pub.reseau);
    END IF;
  END IF;
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS client_leads_social_origin ON public.client_leads;
CREATE TRIGGER client_leads_social_origin BEFORE INSERT ON public.client_leads FOR EACH ROW EXECUTE FUNCTION public.resolve_social_origin();
DROP TRIGGER IF EXISTS visit_requests_social_origin ON public.visit_requests;
CREATE TRIGGER visit_requests_social_origin BEFORE INSERT ON public.visit_requests FOR EACH ROW EXECUTE FUNCTION public.resolve_social_origin();
DROP TRIGGER IF EXISTS contact_messages_social_origin ON public.contact_messages;
CREATE TRIGGER contact_messages_social_origin BEFORE INSERT ON public.contact_messages FOR EACH ROW EXECUTE FUNCTION public.resolve_social_origin();

-- Les formulaires publics ne peuvent envoyer que la référence courte, jamais l'origine résolue.
DROP POLICY IF EXISTS "Public can create visit requests" ON public.visit_requests;
CREATE POLICY "Public can create visit requests" ON public.visit_requests
  FOR INSERT TO anon, authenticated
  WITH CHECK (status IN ('en-attente', 'pending') AND property_v2_id IS NOT NULL
    AND origine_publication_id IS NULL AND origine_groupe_id IS NULL AND origine_reseau IS NULL);
DROP POLICY IF EXISTS "Public can send contact messages" ON public.contact_messages;
CREATE POLICY "Public can send contact messages" ON public.contact_messages
  FOR INSERT TO anon, authenticated
  WITH CHECK (origine_publication_id IS NULL AND origine_groupe_id IS NULL AND origine_reseau IS NULL);
DROP POLICY IF EXISTS "Public can submit client requests" ON public.client_leads;
CREATE POLICY "Public can submit client requests" ON public.client_leads
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    source = 'Site web'
    AND status = 'nouveau'
    AND created_by IS NULL
    AND length(btrim(name)) BETWEEN 2 AND 120
    AND length(regexp_replace(phone, '[^0-9]', '', 'g')) BETWEEN 8 AND 15
    AND (email IS NULL OR length(email) <= 254)
    AND property_types <@ ARRAY['villa', 'appartement', 'riad', 'maison', 'terrain']::text[]
    AND cardinality(property_types) <= 5
    AND cardinality(preferred_areas) <= 8
    AND (budget_min IS NULL OR budget_min BETWEEN 0 AND 100000000)
    AND (budget_max IS NULL OR budget_max BETWEEN 0 AND 100000000)
    AND (bedrooms_min IS NULL OR bedrooms_min BETWEEN 0 AND 20)
    AND (max_distance_km IS NULL OR max_distance_km BETWEEN 0 AND 500)
    AND (profession IS NULL OR length(profession) <= 120)
    AND (client_profile IS NULL OR length(client_profile) <= 250)
    AND (reference_location IS NULL OR length(reference_location) <= 200)
    AND (notes IS NULL OR length(notes) <= 1500)
    AND origine_publication_id IS NULL AND origine_groupe_id IS NULL AND origine_reseau IS NULL
  );

-- ─── Enregistrement d'un clic depuis le site (visiteur anonyme) ───────
-- Le visiteur n'a aucun accès aux tables : il appelle cette fonction avec la référence du lien.
CREATE OR REPLACE FUNCTION public.track_social_click(p_code INTEGER, p_path TEXT DEFAULT NULL)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE pub_id UUID;
BEGIN
  SELECT id INTO pub_id FROM public.social_publications WHERE code = p_code;
  IF pub_id IS NOT NULL THEN
    INSERT INTO public.social_clicks (publication_id, path) VALUES (pub_id, left(p_path, 300));
  END IF;
END $$;
REVOKE ALL ON FUNCTION public.track_social_click(INTEGER, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.track_social_click(INTEGER, TEXT) TO anon, authenticated;

NOTIFY pgrst, 'reload schema';


-- ─── Short property address (/bien/<slug>) ────────────────────────────
-- New properties get a short slug (villa-golf-atlas) instead of <title>-<uuid>.
-- Existing properties keep slug NULL and their current address.

ALTER TABLE public.properties_v2 ADD COLUMN IF NOT EXISTS slug TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS properties_v2_slug_key ON public.properties_v2(slug) WHERE slug IS NOT NULL;

NOTIFY pgrst, 'reload schema';


-- Short, stable property URLs. Run once in the Supabase SQL editor before deployment.
-- Idempotent. Existing non-empty slugs are preserved. All statuses are included.
BEGIN;
LOCK TABLE public.properties_v2 IN SHARE ROW EXCLUSIVE MODE;
ALTER TABLE public.properties_v2 ADD COLUMN IF NOT EXISTS slug TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS properties_v2_slug_key ON public.properties_v2(slug) WHERE slug IS NOT NULL;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM public.properties_v2 p JOIN (VALUES
      ('ccb89162-f950-4f65-b33b-2d1f7a551153'::uuid, 'villa-machmam'),
      ('f0590681-c07d-4fdb-88b0-b480e958b40a'::uuid, 'riad-medina-touareg'),
      ('5e990dd2-cd67-487b-a201-f0b46b7721e3'::uuid, 'villa-bouzar'),
      ('8e584940-602f-4e2f-8db2-b8cdc28e18c6'::uuid, 'villa-bensilam'),
      ('5909c6c4-a5e9-4502-80c9-be6b944f737b'::uuid, 'maison-route-essaouira'),
      ('76b25b2d-43f5-45a0-bd3e-abf31d386dd3'::uuid, 'appartement-zara-gueliz'),
      ('5ae8e008-1dc3-4e27-8e5f-d056dfd0daca'::uuid, 'villa-golf-atlas')
  ) AS r(id, slug) ON p.slug = r.slug AND p.id <> r.id) THEN
    RAISE EXCEPTION 'A stored property slug conflicts with a reserved file property URL. Resolve the conflict before migration.';
  END IF;
END $$;

CREATE OR REPLACE FUNCTION public.assign_property_slug()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY INVOKER SET search_path = public AS $$
DECLARE
  base TEXT;
  candidate TEXT;
  suffix INTEGER := 1;
  reserved_slug TEXT;
BEGIN
  -- Titles and prices may change without changing the URL.
  IF TG_OP = 'UPDATE' AND NULLIF(OLD.slug, '') IS NOT NULL THEN
    IF NEW.slug IS DISTINCT FROM OLD.slug THEN
      RAISE EXCEPTION 'The property URL is permanent; keep its existing slug.';
    END IF;
    RETURN NEW;
  END IF;
  -- Serialize slug allocation (including inserts performed outside the admin).
  PERFORM pg_advisory_xact_lock(1818848869, 1936487783);
  SELECT r.slug INTO reserved_slug FROM (VALUES
      ('ccb89162-f950-4f65-b33b-2d1f7a551153'::uuid, 'villa-machmam'),
      ('f0590681-c07d-4fdb-88b0-b480e958b40a'::uuid, 'riad-medina-touareg'),
      ('5e990dd2-cd67-487b-a201-f0b46b7721e3'::uuid, 'villa-bouzar'),
      ('8e584940-602f-4e2f-8db2-b8cdc28e18c6'::uuid, 'villa-bensilam'),
      ('5909c6c4-a5e9-4502-80c9-be6b944f737b'::uuid, 'maison-route-essaouira'),
      ('76b25b2d-43f5-45a0-bd3e-abf31d386dd3'::uuid, 'appartement-zara-gueliz'),
      ('5ae8e008-1dc3-4e27-8e5f-d056dfd0daca'::uuid, 'villa-golf-atlas')
  ) AS r(id, slug) WHERE r.id = NEW.id;
  base := COALESCE(NULLIF(NEW.slug, ''), reserved_slug,
    CASE WHEN NEW.id = 'f15fbf1e-43b1-407d-a275-273457382ae1'::uuid THEN 'villa-apple-garden' END);
  IF base IS NULL THEN
    base := lower(translate(COALESCE(NEW.titre, ''),
      'ÀÂÄÁÃÅàâäáãåÇçÈÉÊËèéêëÌÍÎÏìíîïÑñÒÓÔÖÕòóôöõÙÚÛÜùúûüÝŸýÿ',
      'AAAAAAaaaaaaCcEEEEeeeeIIIIiiiiNnOOOOOoooooUUUUuuuuYYyy'));
    base := replace(replace(base, 'œ', 'oe'), 'æ', 'ae');
    base := trim(BOTH '-' FROM regexp_replace(base, '[^a-z0-9]+', '-', 'g'));
    IF length(base) > 40 THEN
      base := CASE WHEN substring(base FROM 41 FOR 1) = '-' THEN left(base, 40)
        WHEN position('-' IN left(base, 40)) > 0 THEN regexp_replace(left(base, 40), '-[^-]*$', '')
        ELSE left(base, 40) END;
    END IF;
    base := COALESCE(NULLIF(base, ''), 'bien');
  END IF;
  IF base !~ '^[a-z0-9]+(-[a-z0-9]+)*$' OR length(base) > 80
     OR base ~ '(^|-)[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' THEN
    RAISE EXCEPTION 'Invalid short property slug: %', base;
  END IF;
  candidate := base;
  LOOP
    EXIT WHEN NOT EXISTS (SELECT 1 FROM public.properties_v2 p WHERE p.slug = candidate AND p.id <> NEW.id)
      AND NOT EXISTS (SELECT 1 FROM (VALUES
      ('ccb89162-f950-4f65-b33b-2d1f7a551153'::uuid, 'villa-machmam'),
      ('f0590681-c07d-4fdb-88b0-b480e958b40a'::uuid, 'riad-medina-touareg'),
      ('5e990dd2-cd67-487b-a201-f0b46b7721e3'::uuid, 'villa-bouzar'),
      ('8e584940-602f-4e2f-8db2-b8cdc28e18c6'::uuid, 'villa-bensilam'),
      ('5909c6c4-a5e9-4502-80c9-be6b944f737b'::uuid, 'maison-route-essaouira'),
      ('76b25b2d-43f5-45a0-bd3e-abf31d386dd3'::uuid, 'appartement-zara-gueliz'),
      ('5ae8e008-1dc3-4e27-8e5f-d056dfd0daca'::uuid, 'villa-golf-atlas')
      ) AS r(id, slug) WHERE r.slug = candidate AND r.id <> NEW.id);
    suffix := suffix + 1;
    candidate := base || '-' || suffix::text;
  END LOOP;
  NEW.slug := candidate;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS properties_v2_assign_slug ON public.properties_v2;
CREATE TRIGGER properties_v2_assign_slug BEFORE INSERT OR UPDATE ON public.properties_v2
  FOR EACH ROW EXECUTE FUNCTION public.assign_property_slug();

-- A slug-only migration must not invalidate timestamp-based editorial overrides.
-- The table lock excludes other writers until the timestamp trigger is restored.
DO $$
DECLARE property RECORD; timestamp_trigger "char";
BEGIN
  SELECT tgenabled INTO timestamp_trigger FROM pg_trigger
    WHERE tgrelid = 'public.properties_v2'::regclass AND tgname = 'properties_v2_updated_at';
  IF timestamp_trigger IN ('O', 'A', 'R') THEN
    ALTER TABLE public.properties_v2 DISABLE TRIGGER properties_v2_updated_at;
  END IF;
  UPDATE public.properties_v2 SET slug = NULL
    WHERE id = 'f15fbf1e-43b1-407d-a275-273457382ae1'::uuid AND NULLIF(slug, '') IS NULL;
  FOR property IN SELECT id FROM public.properties_v2 WHERE NULLIF(slug, '') IS NULL ORDER BY id LOOP
    UPDATE public.properties_v2 SET slug = NULL WHERE id = property.id;
  END LOOP;
  IF timestamp_trigger = 'O' THEN
    ALTER TABLE public.properties_v2 ENABLE TRIGGER properties_v2_updated_at;
  ELSIF timestamp_trigger = 'A' THEN
    ALTER TABLE public.properties_v2 ENABLE ALWAYS TRIGGER properties_v2_updated_at;
  ELSIF timestamp_trigger = 'R' THEN
    ALTER TABLE public.properties_v2 ENABLE REPLICA TRIGGER properties_v2_updated_at;
  END IF;
END $$;
NOTIFY pgrst, 'reload schema';
COMMIT;
