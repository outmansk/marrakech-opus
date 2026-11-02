-- Annulation de 20261103_bons_visite_liens_courts.sql : les nouveaux bons reprennent un jeton de 64 caractères.
-- Les bons créés avec un lien court restent lisibles (les fonctions acceptent toujours les deux formats).
BEGIN;
ALTER TABLE public.bons_visite ALTER COLUMN jeton
  SET DEFAULT (replace(gen_random_uuid()::text, '-', '') || replace(gen_random_uuid()::text, '-', ''));
NOTIFY pgrst, 'reload schema';
COMMIT;
