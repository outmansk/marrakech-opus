-- Fiche « Déjà loué / vendu » saisie dans l'admin (liste des biens → « Marquer « Déjà loué / vendu »… »).
-- Profil ANONYME choisi dans des listes (type de client + nationalité, jamais de nom : loi 09-08),
-- montant conclu et mois. Le site public compose la phrase en FR/EN/ES (src/lib/dealProfile.ts).
-- Reprend aussi les fiches déjà saisies dans src/content/propertyDeals.json.
-- À coller dans Supabase → SQL Editor. Idempotent. Annulation : 20261104_biens_conclusion_down.sql
BEGIN;

ALTER TABLE public.properties_v2
  ADD COLUMN IF NOT EXISTS conclusion_client TEXT,
  ADD COLUMN IF NOT EXISTS conclusion_nationalite TEXT,
  ADD COLUMN IF NOT EXISTS conclusion_montant NUMERIC,
  ADD COLUMN IF NOT EXISTS conclusion_mois TEXT;

ALTER TABLE public.properties_v2 DROP CONSTRAINT IF EXISTS properties_v2_conclusion_check;
ALTER TABLE public.properties_v2 ADD CONSTRAINT properties_v2_conclusion_check CHECK (
  (conclusion_client IS NULL OR conclusion_client IN ('couple', 'famille', 'client', 'cliente', 'entreprise'))
  AND (conclusion_nationalite IS NULL OR conclusion_nationalite ~ '^[a-z]{3,20}$')
  AND (conclusion_montant IS NULL OR conclusion_montant > 0)
  AND (conclusion_mois IS NULL OR conclusion_mois ~ '^[0-9]{4}-(0[1-9]|1[0-2])$')
);

-- Fiches existantes (src/content/propertyDeals.json), seulement si rien n'est encore saisi en base.
UPDATE public.properties_v2 p SET
  conclusion_client = d.client, conclusion_nationalite = d.nat, conclusion_montant = d.montant, conclusion_mois = d.mois
FROM (VALUES
  ('28342b88-f26c-48fc-be40-52cb54342e9b'::uuid, 'cliente', 'francaise', 10000, NULL),
  ('ccb89162-f950-4f65-b33b-2d1f7a551153'::uuid, 'couple', 'belge', 16000, NULL),
  ('5909c6c4-a5e9-4502-80c9-be6b944f737b'::uuid, 'couple', 'francaise', 12000, NULL),
  ('a570cfc9-6859-41e2-9e83-0e5d49e88837'::uuid, 'client', 'francaise', 13000, '2026-09')
) AS d(id, client, nat, montant, mois)
WHERE p.id = d.id AND p.conclusion_client IS NULL AND p.conclusion_montant IS NULL AND p.conclusion_mois IS NULL;

NOTIFY pgrst, 'reload schema';
COMMIT;
