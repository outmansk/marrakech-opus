import deals from "@/content/propertyDeals.json";
import type { Lang } from "@/i18n/routing";
import type { Bien } from "@/types/property";
import { isSoldOnly, isUnavailable } from "@/lib/propertyServices";

// Biens conclus par l'agence (src/content/propertyDeals.json) : profil anonyme et montant,
// affichés seulement quand le bien est au statut « vendu-loue ».

interface Deal { profil: Record<Lang, string> | null; loyer: number | null; prix: number | null; mois: string | null }
const DEALS = deals as unknown as Record<string, Deal>;

const MONTHS: Record<Lang, string[]> = {
  fr: ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"],
  en: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
  es: ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"],
};
const pick = (lang: Lang, fr: string, en: string, es: string) => (lang === "en" ? en : lang === "es" ? es : fr);
const amount = (value: number, lang: Lang) => new Intl.NumberFormat(lang === "en" ? "en-GB" : lang).format(value);

/** Requête des biens conclus (préchargée pour le pré-rendu de l'accueil dans entry-server.tsx). */
/** Carrousel « Nos biens » de l'accueil (préchargé aussi). */
export const CAROUSEL_QUERY = { statut: ["publie", "vendu-loue"] };

export const RECENT_DEALS_QUERY = { statut: "vendu-loue" };

export const dealOf = (property: Pick<Bien, "id" | "statut">) => (isUnavailable(property) ? DEALS[property.id] ?? null : null);

/** Ordre des listes publiques : biens conclus avec fiche (confiance) d'abord, puis disponibles, puis les autres loués/vendus. */
export const dealsFirst = <T extends Bien>(list: T[]) => {
  const rank = (property: T) => (dealOf(property) ? 0 : isUnavailable(property) ? 2 : 1);
  return [...list].sort((a, b) => rank(a) - rank(b));
};

/** « Louée à une cliente française en octobre 2026 · 10 000 MAD / mois ». Null sans fiche de conclusion. */
export function dealLine(property: Bien, lang: Lang): string | null {
  const deal = dealOf(property);
  if (!deal) return null;
  const sold = isSoldOnly(property);
  // Accord en genre : une villa, une maison, une parcela… / un appartement, un riad, un terrain.
  const femFr = property.type === "villa" || property.type === "maison";
  const femEs = property.type === "villa" || property.type === "maison";
  const verb = sold
    ? pick(lang, femFr ? "Vendue à" : "Vendu à", "Sold to", femEs ? "Vendida a" : "Vendido a")
    : pick(lang, femFr ? "Louée à" : "Loué à", "Rented to", femEs ? "Alquilada a" : "Alquilado a");
  const [year, month] = (deal.mois ?? "").split("-").map(Number);
  const when = year && month ? ` ${pick(lang, "en", "in", "en")} ${MONTHS[lang][month - 1]} ${year}` : "";
  const value = sold ? deal.prix : deal.loyer;
  const price = value ? ` · ${amount(value, lang)} ${property.devise || "MAD"}${sold ? "" : pick(lang, " / mois", " / month", " / mes")}` : "";
  // Sans profil client : « Louée · 16 500 MAD / mois ».
  const head = deal.profil ? `${verb} ${deal.profil[lang]}` : verb.replace(/ (à|to|a)$/, "");
  return `${head}${when}${price}`;
}
