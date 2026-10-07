// Language lives in the URL: French at the root, English under /en, Spanish under /es.
// One address per language is what lets Google index each version separately.

import landings from "@/content/landings.json";

export const LANGS = ["fr", "en", "es"] as const;
export type Lang = (typeof LANGS)[number];
export const DEFAULT_LANG: Lang = "fr";

export const OG_LOCALES: Record<Lang, string> = { fr: "fr_FR", en: "en_US", es: "es_ES" };

export const isLang = (value: string | undefined | null): value is Lang =>
  !!value && (LANGS as readonly string[]).includes(value);

/** "/en/catalogue" → "en", "/catalogue" → "fr" */
export function langFromPath(pathname: string): Lang {
  const first = pathname.split("/")[1];
  return isLang(first) && first !== DEFAULT_LANG ? first : DEFAULT_LANG;
}

/** "/en/catalogue" → "/catalogue", "/en" → "/" */
export function stripLang(pathname: string): string {
  const lang = langFromPath(pathname);
  if (lang === DEFAULT_LANG) return pathname || "/";
  const rest = pathname.slice(lang.length + 1);
  return rest === "" ? "/" : rest;
}

/** ("/catalogue?type=vente", "en") → "/en/catalogue?type=vente" */
export function localizePath(path: string, lang: Lang): string {
  if (!path.startsWith("/")) return path;
  if (lang === DEFAULT_LANG) return path;
  return path === "/" ? `/${lang}` : `/${lang}${path}`;
}

/**
 * Same page in another language. Blog articles have their own address per language,
 * so from an article the switch goes to the blog of that language.
 */
export function languageSwitchPath(pathname: string, search: string, lang: Lang): string {
  const base = stripLang(pathname);
  if (base.startsWith("/blog/")) return localizePath("/blog", lang);
  // Search landing pages have a translated address in each language.
  const from = langFromPath(pathname);
  const landing = landings.find((entry) => (entry.paths as Record<string, string>)[from] === base);
  if (landing) return localizePath((landing.paths as Record<Lang, string>)[lang], lang);
  return localizePath(base, lang) + search;
}
