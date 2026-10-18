-- Compatibility rollback: keep assigned slugs so shared short URLs continue working.
-- The preceding application version already supports stored slugs.
BEGIN;
DROP TRIGGER IF EXISTS properties_v2_assign_slug ON public.properties_v2;
DROP FUNCTION IF EXISTS public.assign_property_slug();
NOTIFY pgrst, 'reload schema';
COMMIT;
