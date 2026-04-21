-- Migration sécurisée pour transaction_types

ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS transaction_types TEXT[] DEFAULT '{}';
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS price_vente NUMERIC DEFAULT 0;
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS price_location_courte NUMERIC DEFAULT 0;
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS price_location_longue NUMERIC DEFAULT 0;

DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'transaction_type') THEN
    EXECUTE 'ALTER TABLE public.properties DROP CONSTRAINT IF EXISTS properties_transaction_type_check';
    EXECUTE 'UPDATE public.properties SET transaction_types = ARRAY[transaction_type::text] WHERE transaction_type IS NOT NULL';
    EXECUTE 'UPDATE public.properties SET price_vente = price WHERE transaction_type = ''vente''';
    EXECUTE 'UPDATE public.properties SET price_location_courte = price WHERE transaction_type = ''location_courte''';
    EXECUTE 'UPDATE public.properties SET price_location_longue = price WHERE transaction_type = ''location_longue''';
    EXECUTE 'ALTER TABLE public.properties DROP COLUMN transaction_type';
  END IF;
END $$;
