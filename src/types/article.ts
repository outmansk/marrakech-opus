import type { Lang } from "@/i18n/routing";

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
  /** Language of the article; defaults to 'fr' in the database. */
  lang?: Lang;
  /** Same value on every translation of one article, so the pages can link to each other (hreflang). */
  translation_key?: string | null;
  created_at: string;
  updated_at: string;
}
