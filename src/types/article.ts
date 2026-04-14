export interface Article {
  id: string;
  slug: string;
  title: string;
  category: 'location-longue-duree' | 'sous-location' | 'vente' | 'terrain';
  content: string;
  excerpt?: string;
  meta_title?: string;
  meta_description?: string;
  image_url?: string;
  est_publie: boolean;
  created_at: string;
  updated_at: string;
}
