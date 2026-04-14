export interface Property {
  id: string;
  title: string;
  description: string | null;
  price: number; // Keep for legacy
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
