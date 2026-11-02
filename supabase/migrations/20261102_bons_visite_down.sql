-- Annulation de 20261102_bons_visite.sql. ATTENTION : supprime aussi les bons déjà signés.
-- Téléchargez d'abord les PDF à conserver depuis l'admin.
BEGIN;
DROP FUNCTION IF EXISTS public.signer_bon_visite(TEXT, TEXT, TEXT, TEXT, TEXT);
DROP FUNCTION IF EXISTS public.bon_visite_public(TEXT);
DROP TABLE IF EXISTS public.bons_visite;
DROP FUNCTION IF EXISTS public.bons_visite_verrou();
NOTIFY pgrst, 'reload schema';
COMMIT;
