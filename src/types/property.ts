// ─── Legacy Property (ancienne table) ────────────────────────────────────────
export interface Property {
  id: string;
  title: string;
  description: string | null;
  price: number;
  price_vente: number;
  price_location_courte: number;
  price_location_longue: number;
  transaction_types: string[];
  property_type: string;
  bedrooms: number | null;
  secure_parking: boolean;
  environment_type: string | null;
  proximities: Array<{ place: string; time: string }>;
  image_urls: string[];
  is_available: boolean;
  created_at: string;
  updated_at: string;
}

export interface VisitRequest {
  id: string;
  property_id: string;
  client_name: string;
  client_phone: string;
  requested_date: string;
  status: string;
  created_at: string;
}

// ─── Bien (nouvelle table properties_v2) ─────────────────────────────────────
export type BienType = 'villa' | 'appartement' | 'riad' | 'maison' | 'terrain';
export type BienService = 'location-longue-duree' | 'location-courte-duree' | 'vente' | 'sous-location';
export type BienStatut = 'publie' | 'brouillon' | 'vendu-loue';
export type BienDevise = 'MAD' | 'EUR';

export const BIEN_TYPES: BienType[] = ['villa', 'appartement', 'riad', 'maison', 'terrain'];
export const BIEN_SERVICES: BienService[] = ['location-longue-duree', 'location-courte-duree', 'vente', 'sous-location'];
export const BIEN_STATUTS: BienStatut[] = ['publie', 'brouillon', 'vendu-loue'];
export const BIEN_DEVISES: BienDevise[] = ['MAD', 'EUR'];

export const QUARTIERS = [
  'Hivernage',
  'Gueliz',
  'Palmeraie',
  'Medina',
  'Chrifia',
  'Targa',
  'Route de l\'Ourika',
  'Route d\'Amizmiz',
  'Sidi Ghanem',
  'Agdal',
  'Route de Fes',
];

export const EQUIPEMENTS_LIST = [
  'Piscine',
  'Jardin',
  'Climatisation',
  'Chauffage central',
  'Cuisine équipée',
  'Parking',
  'Gardiennage 24/7',
  'Ascenseur',
  'Salle de sport',
  'Terrasse',
  'Hammam',
  'Cheminée',
  'Internet Fibre',
];

// ... (omit lines 43 to 71) ...

export interface Bien {
  id: string;
  titre: string;
  type: BienType;
  services: BienService[];
  prix_vente: number | null;
  prix_location_longue: number | null;
  prix_location_courte: number | null;
  prix: number | null; // Legacy/Default
  devise: BienDevise;
  surface_habitable: number | null;
  surface_terrain: number | null;
  chambres: number | null;
  salles_de_bain: number | null;
  quartier: string | null;
  description_courte: string | null;
  description_longue: string | null;
  equipements: string[];
  photos: string[];
  photo_principale: string | null;
  proximites: Array<{ place: string; time: string }>;
  statut: BienStatut;
  disponible_le: string | null;
  reference: string | null;
  latitude: number | null;
  longitude: number | null;
  created_at: string;
  updated_at: string;
}

export type BienInsert = Omit<Bien, 'id' | 'created_at' | 'updated_at'>;
export type BienUpdate = Partial<BienInsert>;
