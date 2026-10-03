CREATE TABLE IF NOT EXISTS public.client_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  source TEXT NOT NULL DEFAULT 'WhatsApp',
  transaction_type TEXT NOT NULL DEFAULT 'location-longue-duree'
    CHECK (transaction_type IN ('location-longue-duree', 'vente')),
  property_types TEXT[] NOT NULL DEFAULT '{}',
  budget_min NUMERIC,
  budget_max NUMERIC,
  preferred_areas TEXT[] NOT NULL DEFAULT '{}',
  bedrooms_min INTEGER,
  furnishing TEXT NOT NULL DEFAULT 'any'
    CHECK (furnishing IN ('any', 'furnished', 'unfurnished')),
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
  CONSTRAINT client_leads_budget_valid CHECK (
    budget_min IS NULL OR budget_max IS NULL OR budget_min <= budget_max
  ),
  CONSTRAINT client_leads_distance_positive CHECK (
    max_distance_km IS NULL OR max_distance_km >= 0
  ),
  CONSTRAINT client_leads_bedrooms_positive CHECK (
    bedrooms_min IS NULL OR bedrooms_min >= 0
  )
);

CREATE INDEX IF NOT EXISTS client_leads_status_idx ON public.client_leads(status);
CREATE INDEX IF NOT EXISTS client_leads_follow_up_idx ON public.client_leads(next_follow_up_at);
CREATE INDEX IF NOT EXISTS client_leads_created_at_idx ON public.client_leads(created_at DESC);

ALTER TABLE public.client_leads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins manage client leads" ON public.client_leads;
CREATE POLICY "Admins manage client leads"
  ON public.client_leads
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE OR REPLACE FUNCTION public.set_client_leads_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS client_leads_updated_at ON public.client_leads;
CREATE TRIGGER client_leads_updated_at
  BEFORE UPDATE ON public.client_leads
  FOR EACH ROW EXECUTE FUNCTION public.set_client_leads_updated_at();

NOTIFY pgrst, 'reload schema';
