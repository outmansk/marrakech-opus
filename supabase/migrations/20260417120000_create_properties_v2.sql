-- =====================================================
-- Migration : Création de la table properties_v2
-- Pour le panel admin /admin/biens
-- =====================================================

CREATE TABLE IF NOT EXISTS properties_v2 (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  titre TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN (
    'villa','appartement','riad','maison','terrain'
  )),
  service TEXT NOT NULL CHECK (service IN (
    'location-longue-duree',
    'sous-location',
    'vente'
  )),
  prix NUMERIC,
  devise TEXT DEFAULT 'MAD',
  surface_habitable NUMERIC,
  surface_terrain NUMERIC,
  chambres INTEGER,
  salles_de_bain INTEGER,
  quartier TEXT,
  description_courte TEXT,
  description_longue TEXT,
  equipements TEXT[] DEFAULT '{}',
  photos TEXT[] DEFAULT '{}',
  photo_principale TEXT,
  statut TEXT DEFAULT 'brouillon' CHECK (statut IN (
    'publie','brouillon','vendu-loue'
  )),
  disponible_le DATE,
  reference TEXT UNIQUE,
  latitude NUMERIC,
  longitude NUMERIC,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security
ALTER TABLE properties_v2 ENABLE ROW LEVEL SECURITY;

-- Lecture publique pour les biens publiés
CREATE POLICY "public can view published v2" ON properties_v2
  FOR SELECT USING (statut = 'publie');

-- Admin peut tout faire (utilisateur connecté)
CREATE POLICY "admin full access v2" ON properties_v2
  FOR ALL USING (auth.role() = 'authenticated');

-- Trigger pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_properties_v2_updated_at ON properties_v2;
CREATE TRIGGER update_properties_v2_updated_at
  BEFORE UPDATE ON properties_v2
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
