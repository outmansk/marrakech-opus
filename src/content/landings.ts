import { queryOptions } from "@tanstack/react-query";
import type { BienService, BienType } from "@/types/property";
import { localizePath, type Lang } from "@/i18n/routing";
import registry from "./landings.json";

// Search landing pages ("villas à vendre à Marrakech"…). The registry (landings.json) is
// also read by scripts/generate-sitemap.cjs; the texts live in landingCopy.<lang>.ts.

export type LandingId =
  | "vente" | "vente-villas" | "vente-appartements" | "vente-riads" | "vente-maisons" | "vente-terrains"
  | "location" | "location-appartements" | "location-villas";

export interface Landing {
  id: LandingId;
  service: Extract<BienService, "vente" | "location-longue-duree">;
  /** Absent on the two hub pages (all types of one service). */
  type?: BienType;
  /** Short link text in each language ("Villas à vendre"). */
  label: Record<Lang, string>;
  /** Path in each language, without the language prefix. */
  paths: Record<Lang, string>;
}

export interface LandingCopy {
  /** <title> and meta description */
  title: string;
  description: string;
  eyebrow: string;
  h1: string;
  /** Short factual answer shown at the top (also what AI assistants quote). */
  answer: string;
  sections: { heading: string; paragraphs: string[] }[];
  faq: { q: string; a: string }[];
  /** Neighbourhoods to suggest, as stored in properties_v2.quartier. */
  areas: string[];
}

export const LANDINGS = registry as Landing[];
const BY_ID = Object.fromEntries(LANDINGS.map((landing) => [landing.id, landing])) as Record<LandingId, Landing>;

export const getLanding = (id: LandingId) => BY_ID[id];

/** Full address of a landing page in a language: ("vente-villas", "en") → "/en/for-sale/villas-marrakech". */
export const landingPath = (id: LandingId, lang: Lang) => localizePath(BY_ID[id].paths[lang], lang);

/** The landing page at a path (without language prefix) in a language, if any. */
export const findLanding = (lang: Lang, basePath: string) =>
  LANDINGS.find((landing) => landing.paths[lang] === basePath.replace(/\/$/, ""));

/** The landing page for a service and property type, e.g. to link a property to its listing page. */
export const landingFor = (service: string, type?: string) =>
  LANDINGS.find((landing) => landing.service === service && landing.type === type);

const copyModules = import.meta.glob<{ default: Record<LandingId, LandingCopy> }>("./landingCopy.*.ts");

/** Texts of every landing page in one language, loaded on demand (one chunk per language). */
export const landingCopyQueryOptions = (lang: Lang) => queryOptions({
  queryKey: ["landing-copy", lang],
  queryFn: async () => (await copyModules[`./landingCopy.${lang}.ts`]()).default,
  staleTime: Infinity,
});
