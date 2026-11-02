-- Les nouveaux bons de visite sont numérotés à partir de BV-0110.
-- Les bons déjà créés gardent leur numéro (il fait partie de l'empreinte des bons signés).
-- Idempotent : ne recule jamais la numérotation.
DO $$
BEGIN
  IF coalesce((SELECT max(numero) FROM public.bons_visite), 0) < 110 THEN
    ALTER TABLE public.bons_visite ALTER COLUMN numero RESTART WITH 110;
  END IF;
END;
$$;
