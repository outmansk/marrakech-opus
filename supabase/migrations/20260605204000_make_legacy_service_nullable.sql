-- Migration: Make legacy service column nullable and drop its constraint
-- This allows services array to include 'location-courte-duree' as the primary service in values.services[0]
ALTER TABLE public.properties_v2 DROP CONSTRAINT IF EXISTS properties_v2_service_check;
ALTER TABLE public.properties_v2 ALTER COLUMN service DROP NOT NULL;

-- Reload schema cache
NOTIFY pgrst, 'reload schema';
