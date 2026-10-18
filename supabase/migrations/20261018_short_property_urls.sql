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
