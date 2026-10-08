import { useLocation } from 'react-router-dom';
import { LANGS, DEFAULT_LANG, langFromPath, localizePath, stripLang, type Lang } from '@/i18n/routing';

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
  /** JSON-LD object(s) rendered as <script type="application/ld+json"> */
  schema?: Record<string, unknown> | Record<string, unknown>[];
  /**
   * Paths of this page in each language (with their language prefix).
   * Defaults to the same path in every language; pass a partial map when
   * some translations do not exist (blog articles).
   */
  alternates?: Partial<Record<Lang, string>>;
  /** Overrides the canonical path (e.g. a property's slug URL). */
  canonicalPath?: string;
  /** Keep the page out of search results (404…). */
  noindex?: boolean;
}

export interface UseSEOReturn {
  fullTitle: string;
  description: string;
  canonicalUrl: string;
  ogImage: string;
  type: string;
  lang: Lang;
  alternates: { lang: Lang | 'x-default'; href: string }[];
}

const absolute = (path: string) => `${BASE_URL}${path === '/' ? '' : path}` || BASE_URL;

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useSEO({
  title,
  description,
  image,
  type = 'website',
  alternates,
  canonicalPath,
}: UseSEOParams): UseSEOReturn {
  const { pathname } = useLocation();
  const lang = langFromPath(pathname);
  const path = canonicalPath ?? pathname;

  const paths: Partial<Record<Lang, string>> = alternates
    ?? Object.fromEntries(LANGS.map((l) => [l, localizePath(stripLang(path), l)]));
  const links: UseSEOReturn['alternates'] = LANGS
    .filter((l) => paths[l])
    .map((l) => ({ lang: l, href: absolute(paths[l]!) }));
  if (paths[DEFAULT_LANG]) links.push({ lang: 'x-default', href: absolute(paths[DEFAULT_LANG]!) });

  return {
    fullTitle: `${title} | ${SITE_NAME}`,
    description,
    canonicalUrl: absolute(path),
    ogImage: image || DEFAULT_OG_IMAGE,
    type,
    lang,
    // Always reciprocal: every version of the page, itself included (a French-only page lists fr + x-default).
    alternates: links,
  };
}
