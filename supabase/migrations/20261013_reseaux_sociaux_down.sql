-- Annulation de 20261013_reseaux_sociaux.sql : supprime la section Réseaux sociaux
-- et remet les règles d'envoi public des formulaires comme avant. Les clients, visites
-- et messages restent ; seules leurs colonnes d'origine sont retirées.

DROP TRIGGER IF EXISTS client_leads_social_origin ON public.client_leads;
DROP TRIGGER IF EXISTS visit_requests_social_origin ON public.visit_requests;
DROP TRIGGER IF EXISTS contact_messages_social_origin ON public.contact_messages;
DROP FUNCTION IF EXISTS public.resolve_social_origin();
DROP FUNCTION IF EXISTS public.track_social_click(INTEGER, TEXT);

DROP POLICY IF EXISTS "Public can create visit requests" ON public.visit_requests;
CREATE POLICY "Public can create visit requests" ON public.visit_requests
  FOR INSERT TO anon, authenticated
  WITH CHECK (status IN ('en-attente', 'pending') AND property_v2_id IS NOT NULL);
DROP POLICY IF EXISTS "Public can send contact messages" ON public.contact_messages;
CREATE POLICY "Public can send contact messages" ON public.contact_messages
  FOR INSERT TO anon, authenticated WITH CHECK (true);
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
  );

ALTER TABLE public.client_leads
  DROP COLUMN IF EXISTS origine_ref, DROP COLUMN IF EXISTS origine_publication_id,
  DROP COLUMN IF EXISTS origine_groupe_id, DROP COLUMN IF EXISTS origine_reseau, DROP COLUMN IF EXISTS bien_id;
ALTER TABLE public.visit_requests
  DROP COLUMN IF EXISTS origine_ref, DROP COLUMN IF EXISTS origine_publication_id,
  DROP COLUMN IF EXISTS origine_groupe_id, DROP COLUMN IF EXISTS origine_reseau;
ALTER TABLE public.contact_messages
  DROP COLUMN IF EXISTS origine_ref, DROP COLUMN IF EXISTS origine_publication_id,
  DROP COLUMN IF EXISTS origine_groupe_id, DROP COLUMN IF EXISTS origine_reseau, DROP COLUMN IF EXISTS bien_id;

DROP TABLE IF EXISTS public.social_clicks;
DROP TABLE IF EXISTS public.social_account_alerts;
DROP TABLE IF EXISTS public.social_publications;
DROP TABLE IF EXISTS public.social_groups;
DROP FUNCTION IF EXISTS public.social_publications_statut_change();

NOTIFY pgrst, 'reload schema';
