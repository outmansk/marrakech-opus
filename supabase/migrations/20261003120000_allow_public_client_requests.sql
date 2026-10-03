GRANT INSERT ON TABLE public.client_leads TO anon, authenticated;

DROP POLICY IF EXISTS "Public can submit client requests" ON public.client_leads;
CREATE POLICY "Public can submit client requests"
  ON public.client_leads
  FOR INSERT
  TO anon, authenticated
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

NOTIFY pgrst, 'reload schema';
