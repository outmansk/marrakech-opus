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

NOTIFY pgrst, 'reload schema';
