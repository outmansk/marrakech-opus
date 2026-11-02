-- Annulation de 20261103_bons_visite_texte.sql : remet « visite virtuelle » sur les bons non signés.
BEGIN;

ALTER TABLE public.bons_visite ALTER COLUMN texte SET DEFAULT 'Je confirme avoir effectué une visite virtuelle du bien indiqué ci-dessus avec l’agence Live In Marrakech.

Ce document confirme uniquement la présentation du bien. Il ne constitue ni une réservation, ni un engagement de location ou d’achat.';

UPDATE public.bons_visite
SET texte = replace(texte, 'une visite du bien', 'une visite virtuelle du bien')
WHERE statut = 'a-signer' AND texte LIKE '%une visite du bien%';

NOTIFY pgrst, 'reload schema';
COMMIT;
