-- Keep legacy visit requests readable while new requests target properties_v2.
ALTER TABLE public.visit_requests
  ALTER COLUMN property_id DROP NOT NULL;

ALTER TABLE public.visit_requests
  ADD COLUMN IF NOT EXISTS property_v2_id UUID
  REFERENCES public.properties_v2(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS visit_requests_property_v2_id_idx
  ON public.visit_requests(property_v2_id);

ALTER TABLE public.visit_requests
  DROP CONSTRAINT IF EXISTS visit_requests_has_property;

ALTER TABLE public.visit_requests
  ADD CONSTRAINT visit_requests_has_property
  CHECK (property_id IS NOT NULL OR property_v2_id IS NOT NULL) NOT VALID;

ALTER TABLE public.visit_requests
  VALIDATE CONSTRAINT visit_requests_has_property;

NOTIFY pgrst, 'reload schema';
