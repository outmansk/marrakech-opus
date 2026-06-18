import { useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';

// ─── Constants ────────────────────────────────────────────────────────────────
export const SITE_NAME = 'Live In Marrakech';
export const BASE_URL = 'https://liveinmarrakech.com';
const DEFAULT_OG_IMAGE = `${BASE_URL}/og-image.jpg`;

// ─── Types ────────────────────────────────────────────────────────────────────
export interface UseSEOParams {
  title: string;
  description: string;
  image?: string;
  /** Open Graph type – defaults to "website" */
  type?: string;
  /** JSON-LD object to inject as a <script type="application/ld+json"> */
  schema?: Record<string, unknown>;
}

export interface UseSEOReturn {
  fullTitle: string;
  description: string;
  canonicalUrl: string;
  ogImage: string;
  type: string;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useSEO({
  title,
  description,
  image,
  type = 'website',
  schema,
}: UseSEOParams): UseSEOReturn {
  const { pathname } = useLocation();

  const fullTitle = `${title} | ${SITE_NAME}`;
  const canonicalUrl = `${BASE_URL}${pathname}`;
  const ogImage = image || DEFAULT_OG_IMAGE;

  // Stable serialisation for the dependency array
  const schemaString = useMemo(
    () => (schema ? JSON.stringify(schema) : null),
    [schema],
  );

  // Inject / remove JSON-LD <script> in <head>
  useEffect(() => {
    if (!schemaString) return;

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = schemaString;
    script.setAttribute('data-seo-jsonld', 'true');
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, [schemaString]);

  return { fullTitle, description, canonicalUrl, ogImage, type };
}
