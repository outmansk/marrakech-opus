-- Migration to add proximites column
ALTER TABLE public.properties_v2 
ADD COLUMN IF NOT EXISTS proximites JSONB DEFAULT '[]'::jsonb;

-- Reload schema cache
NOTIFY pgrst, 'reload schema';
