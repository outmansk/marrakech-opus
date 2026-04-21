-- =====================================================
-- ÉTAPE 1 : Vérifier la structure actuelle de la table
-- Exécute seulement ce SELECT d'abord pour voir les colonnes
-- =====================================================

SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'articles' 
AND table_schema = 'public'
ORDER BY ordinal_position;
