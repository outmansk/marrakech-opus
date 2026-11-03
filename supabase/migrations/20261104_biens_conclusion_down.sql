-- Annulation de 20261104_biens_conclusion.sql : supprime les fiches « Déjà loué » saisies dans l'admin
-- (le site revient aux seules fiches de src/content/propertyDeals.json).
BEGIN;
ALTER TABLE public.properties_v2 DROP CONSTRAINT IF EXISTS properties_v2_conclusion_check;
ALTER TABLE public.properties_v2
  DROP COLUMN IF EXISTS conclusion_client,
  DROP COLUMN IF EXISTS conclusion_nationalite,
  DROP COLUMN IF EXISTS conclusion_montant,
  DROP COLUMN IF EXISTS conclusion_mois;
NOTIFY pgrst, 'reload schema';
COMMIT;
