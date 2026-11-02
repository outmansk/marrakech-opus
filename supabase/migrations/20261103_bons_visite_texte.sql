-- Bons de visite : texte général (visite sur place ou à distance), sans « virtuelle ».
-- Change le texte par défaut et met à jour les bons pas encore signés.
-- Les bons déjà signés gardent le texte accepté (verrouillés par trigger).
-- À coller dans Supabase → SQL Editor. Idempotent. Annulation : 20261103_bons_visite_texte_down.sql
BEGIN;

ALTER TABLE public.bons_visite ALTER COLUMN texte SET DEFAULT 'Je confirme avoir effectué une visite du bien indiqué ci-dessus avec l’agence Live In Marrakech.

Ce document confirme uniquement la présentation du bien. Il ne constitue ni une réservation, ni un engagement de location ou d’achat.';

UPDATE public.bons_visite
SET texte = replace(texte, 'une visite virtuelle du bien', 'une visite du bien')
WHERE statut = 'a-signer' AND texte LIKE '%une visite virtuelle du bien%';

NOTIFY pgrst, 'reload schema';
COMMIT;
