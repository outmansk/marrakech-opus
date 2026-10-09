import type { Bien, BienService, BienType } from "@/types/property";
import type { Lang } from "@/i18n/routing";
import { getServices } from "@/lib/propertyServices";
import suggestions from "@/content/propertyTranslations.json";
import { zoneLabel } from "@/content/zones";

// Property texts and labels in the visitor's language.
// Texts: the translated columns of properties_v2 (edited in the admin) win; while they are empty,
// the proposed translations of src/content/propertyTranslations.json are used. A property with
// neither is shown in French on /en and /es pages, which are then kept out of search results.

type TextFields = { titre: string; description_courte: string; description_longue: string };
const SUGGESTED = suggestions as unknown as Record<string, Partial<Record<Lang, TextFields>>>;

export interface PropertyText extends TextFields {
  /** False when /en or /es has to fall back to the French text. */
  translated: boolean;
}

export function propertyText(bien: Bien, lang: Lang): PropertyText {
  const fr = { titre: bien.titre, description_courte: bien.description_courte ?? "", description_longue: bien.description_longue ?? "" };
  if (lang === "fr") return { ...fr, translated: true };
  const fromDb = {
    titre: bien[`titre_${lang}`] ?? "",
    description_courte: bien[`description_courte_${lang}`] ?? "",
    description_longue: bien[`description_longue_${lang}`] ?? "",
  };
  const suggested = SUGGESTED[bien.id]?.[lang];
  const titre = fromDb.titre || suggested?.titre || "";
  if (!titre) return { ...fr, translated: false };
  return {
    titre,
    description_courte: fromDb.description_courte || suggested?.description_courte || "",
    description_longue: fromDb.description_longue || suggested?.description_longue || "",
    translated: true,
  };
}

/** True when a proposed translation from the repository exists for this property and language. */
export const hasSuggestedTranslation = (id: string, lang: Lang) => !!SUGGESTED[id]?.[lang]?.titre;
export const suggestedTranslation = (id: string, lang: Lang) => SUGGESTED[id]?.[lang];

const pick = (lang: Lang, fr: string, en: string, es: string) => (lang === "en" ? en : lang === "es" ? es : fr);

export const TYPE_NAMES: Record<BienType, Record<Lang, [string, string]>> = {
  villa: { fr: ["Villa", "Villas"], en: ["Villa", "Villas"], es: ["Villa", "Villas"] },
  appartement: { fr: ["Appartement", "Appartements"], en: ["Apartment", "Apartments"], es: ["Apartamento", "Apartamentos"] },
  riad: { fr: ["Riad", "Riads"], en: ["Riad", "Riads"], es: ["Riad", "Riads"] },
  maison: { fr: ["Maison", "Maisons"], en: ["House", "Houses"], es: ["Casa", "Casas"] },
  terrain: { fr: ["Terrain", "Terrains"], en: ["Land", "Land"], es: ["Terreno", "Terrenos"] },
};
export const typeName = (type: BienType, lang: Lang) => TYPE_NAMES[type]?.[lang][0] ?? type;

export const serviceName = (service: BienService, lang: Lang) =>
  ({
    vente: pick(lang, "Vente", "For sale", "En venta"),
    "location-longue-duree": pick(lang, "Location longue durée", "Long-term rental", "Alquiler de larga duración"),
    "location-courte-duree": pick(lang, "Séjour courte durée", "Short stay", "Estancia corta"),
    "sous-location": pick(lang, "Sous-location", "Sublet", "Subarriendo"),
  })[service] ?? service;

const EQUIPMENTS: Record<string, [string, string]> = {
  Piscine: ["Pool", "Piscina"],
  Jardin: ["Garden", "Jardín"],
  Climatisation: ["Air conditioning", "Aire acondicionado"],
  "Chauffage central": ["Central heating", "Calefacción central"],
  "Cuisine équipée": ["Equipped kitchen", "Cocina equipada"],
  Parking: ["Parking", "Aparcamiento"],
  "Gardiennage 24/7": ["24/7 security", "Vigilancia 24/7"],
  Ascenseur: ["Lift", "Ascensor"],
  "Salle de sport": ["Gym", "Gimnasio"],
  Terrasse: ["Terrace", "Terraza"],
  "Terrasse panoramique": ["Panoramic terrace", "Terraza panorámica"],
  Hammam: ["Hammam", "Hammam"],
  Cheminée: ["Fireplace", "Chimenea"],
  "Internet Fibre": ["Fibre internet", "Internet por fibra"],
  Meublé: ["Furnished", "Amueblado"],
  Télévision: ["Television", "Televisión"],
  Garage: ["Garage", "Garaje"],
  "Logement du personnel": ["Staff quarters", "Alojamiento del personal"],
};
export function equipmentName(name: string, lang: Lang) {
  const entry = EQUIPMENTS[name];
  return lang === "fr" || !entry ? name : lang === "en" ? entry[0] : entry[1];
}

// Nearby places as typed in the admin: common words translated, proper names kept.
const PLACES: Record<string, [string, string]> = {
  "Marrakech (centre)": ["Marrakech (city centre)", "Marrakech (centro)"],
  "Centre-ville": ["City centre", "Centro de la ciudad"],
  "Centre-ville (Gueliz)": ["City centre (Gueliz)", "Centro (Gueliz)"],
  Médina: ["Medina", "Medina"],
  "Parcours de Golf": ["Golf course", "Campo de golf"],
  "Montagnes de l'Atlas": ["Atlas Mountains", "Montañas del Atlas"],
  Aéroport: ["Airport", "Aeropuerto"],
  "Aéroport Marrakech-Ménara": ["Marrakech-Menara Airport", "Aeropuerto Marrakech-Menara"],
  "Golf de Prestigia": ["Prestigia golf course", "Golf de Prestigia"],
  "Quartier de l'Hivernage": ["Hivernage district", "Barrio de Hivernage"],
  "Jardin Majorelle": ["Majorelle Garden", "Jardín Majorelle"],
  "Place Jemaa el-Fna": ["Jemaa el-Fna Square", "Plaza Jemaa el-Fna"],
};
export function placeName(place: string, lang: Lang) {
  const entry = PLACES[place.trim()];
  return lang === "fr" || !entry ? place : lang === "en" ? entry[0] : entry[1];
}
export function distanceLabel(time: string, lang: Lang) {
  if (lang === "fr") return time;
  return time.trim() === "Vue directe" ? pick(lang, "", "Direct view", "Vista directa") : time;
}

const money = (value: number, devise: string, lang: Lang) => `${new Intl.NumberFormat(lang === "en" ? "en-GB" : lang).format(value)} ${devise}`;

/** Price shown in titles and descriptions: rent per month first for rentals, otherwise the sale price. */
function headlinePrice(bien: Bien, lang: Lang) {
  const services = getServices(bien);
  const devise = bien.devise || "MAD";
  if (services.includes("location-longue-duree") && bien.prix_location_longue) {
    return `${money(bien.prix_location_longue, devise, lang)}${pick(lang, "/mois", "/month", "/mes")}`;
  }
  if (services.includes("vente") && bien.prix_vente) return money(bien.prix_vente, devise, lang);
  return null;
}


/** <title> of a property page: "Villa 5 ch. Route de Fes – 25 000 MAD/mois", shortened to fit 60 characters. */
export function propertySeoTitle(bien: Bien, lang: Lang) {
  const type = typeName(bien.type, lang);
  const beds = bien.chambres ? pick(lang, ` ${bien.chambres} ch.`, ` ${bien.chambres}-bed`, ` ${bien.chambres} dorm.`) : "";
  const head = lang === "en" && beds ? `${beds.trim()} ${type.toLowerCase()}` : `${type}${beds}`;
  const price = headlinePrice(bien, lang);
  const candidates = [
    `${head} ${zoneLabel(bien, lang)}${price ? ` – ${price}` : ""}`,
    `${head} ${zoneLabel(bien, lang)}`,
    `${head} Marrakech`,
  ];
  return candidates.find((title) => title.length <= 60) ?? candidates[candidates.length - 1].slice(0, 60);
}

/** Meta description: price, bedrooms, surface, area and a visit / WhatsApp call to action, ≤ 155 characters. */
export function propertyMetaDescription(bien: Bien, lang: Lang) {
  const type = typeName(bien.type, lang);
  const service = getServices(bien).includes("location-longue-duree")
    ? pick(lang, "à louer à l'année", "for long-term rent", "en alquiler de larga duración")
    : getServices(bien).includes("vente")
      ? pick(lang, "à vendre", "for sale", "en venta")
      : "";
  const facts = [
    bien.chambres ? pick(lang, `${bien.chambres} chambres`, `${bien.chambres} bedrooms`, `${bien.chambres} dormitorios`) : null,
    bien.surface_habitable ? `${bien.surface_habitable} m²` : null,
    headlinePrice(bien, lang),
  ].filter(Boolean).join(", ");
  const cta = pick(lang, "Visite et infos sur WhatsApp.", "Book a visit on WhatsApp.", "Visita e info por WhatsApp.");
  const text = [type, service].filter(Boolean).join(" ") + pick(lang, " à ", " in ", " en ") + zoneLabel(bien, lang);
  const full = `${text}${facts ? `${lang === "fr" ? " : " : ": "}${facts}` : ""}. ${cta}`;
  return full.length <= 155 ? full : `${full.slice(0, 152).replace(/\s+\S*$/, "")}…`;
}
