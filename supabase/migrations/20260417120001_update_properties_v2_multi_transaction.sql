 -- =====================================================
-- Migration : Mise à jour de properties_v2 pour multi-services
-- Support de la vente, location longue et courte durée simultanée
-- =====================================================

-- 1. Ajouter les colonnes de prix spécifiques
ALTER TABLE public.properties_v2 ADD COLUMN IF NOT EXISTS prix_vente NUMERIC;
ALTER TABLE public.properties_v2 ADD COLUMN IF NOT EXISTS prix_location_longue NUMERIC;
ALTER TABLE public.properties_v2 ADD COLUMN IF NOT EXISTS prix_location_courte NUMERIC;

-- 2. Ajouter la colonne services (tableau)
ALTER TABLE public.properties_v2 ADD COLUMN IF NOT EXISTS services TEXT[] DEFAULT '{}';

-- 3. Migration des données existantes (de service -> services)
UPDATE public.properties_v2 
SET services = ARRAY[service] 
WHERE services = '{}' AND service IS NOT NULL;

-- 4. On peut garder 'service' et 'prix' pour la compatibilité legacy si besoin
-- Mais l'UI utilisera les nouveaux champs.
