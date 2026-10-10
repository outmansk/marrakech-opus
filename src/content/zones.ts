import type { Bien } from "@/types/property";
import type { Lang } from "@/i18n/routing";
import facts from "./propertyFacts.json";

// Areas where the agency actually has properties. The descriptions only restate what the
// listings themselves say (distances, setting); nothing here comes from market data.

type Facts = { zone?: ZoneId; meuble?: boolean };
const FACTS = facts as unknown as Record<string, Facts>;

export type ZoneId = "route-de-fes" | "sidi-rahal" | "chrifia" | "golf" | "palmeraie" | "village-touristique";

export const ZONES: Record<ZoneId, { label: Record<Lang, string>; text: Record<Lang, string> }> = {
  "route-de-fes": {
    label: { fr: "Route de Fès", en: "Fez road", es: "Carretera de Fez" },
    text: {
      fr: "Au nord-est de Marrakech, la route de Fès accueille des villas avec jardin et piscine, dans un environnement calme. D’après nos annonces, on y est à environ 15 à 20 minutes du centre et à une douzaine de kilomètres du Jardin Majorelle.",
      en: "North-east of Marrakech, the Fez road is home to villas with a garden and pool in a quiet setting. According to our listings, it is about 15 to 20 minutes from the centre and around 12 km from the Majorelle Garden.",
      es: "Al noreste de Marrakech, la carretera de Fez reúne villas con jardín y piscina en un entorno tranquilo. Según nuestros anuncios, está a unos 15 o 20 minutos del centro y a unos 12 km del Jardín Majorelle.",
    },
  },
  "sidi-rahal": {
    label: { fr: "Route de Sidi Rahal", en: "Sidi Rahal road", es: "Carretera de Sidi Rahal" },
    text: {
      fr: "À l’est de la ville, la route de Sidi Rahal offre des villas au calme, sans vis-à-vis, dont certaines avec une vue panoramique sur l’Atlas. Nos biens de ce secteur sont accessibles par une route goudronnée.",
      en: "East of the city, the Sidi Rahal road offers quiet villas with no overlooking neighbours, some with a panoramic view of the Atlas. Our properties in this area are reached by a paved road.",
      es: "Al este de la ciudad, la carretera de Sidi Rahal ofrece villas tranquilas, sin vecinos a la vista, algunas con vistas panorámicas al Atlas. A nuestros inmuebles de esta zona se llega por carretera asfaltada.",
    },
  },
  chrifia: {
    label: { fr: "Chrifia", en: "Chrifia", es: "Chrifia" },
    text: {
      fr: "Au sud-ouest de Marrakech, Chrifia est un quartier résidentiel paisible. Notre appartement y est situé dans une résidence sécurisée avec ascenseur, à environ 15 minutes du centre-ville.",
      en: "South-west of Marrakech, Chrifia is a peaceful residential area. Our apartment there is in a secure building with a lift, about 15 minutes from the city centre.",
      es: "Al suroeste de Marrakech, Chrifia es un barrio residencial tranquilo. Nuestro apartamento está en una residencia segura con ascensor, a unos 15 minutos del centro.",
    },
  },
  golf: {
    label: { fr: "Secteur des golfs", en: "Golf area", es: "Zona de los golfs" },
    text: {
      fr: "Autour des parcours de golf, on trouve des domaines sécurisés avec piscines et espaces verts, comme Prestigia Ambre. D’après nos annonces, ce secteur est à quelques minutes de l’aéroport et de l’Hivernage.",
      en: "Around the golf courses are secure estates with pools and green spaces, such as Prestigia Ambre. According to our listings, the area is a few minutes from the airport and Hivernage.",
      es: "Alrededor de los campos de golf hay complejos seguros con piscinas y zonas verdes, como Prestigia Ambre. Según nuestros anuncios, la zona está a pocos minutos del aeropuerto y de Hivernage.",
    },
  },
  palmeraie: {
    label: { fr: "Palmeraie", en: "Palmeraie", es: "Palmeraie" },
    text: {
      fr: "Dans la Palmeraie, notre bien se trouve au sein d’une résidence sécurisée et verdoyante du quartier d’Ennakhil.",
      en: "In the Palmeraie, our property is in a secure, green residence in the Ennakhil area.",
      es: "En la Palmeraie, nuestro inmueble está en una residencia segura y arbolada del barrio de Ennakhil.",
    },
  },
  "village-touristique": {
    label: { fr: "Village Touristique", en: "Village Touristique", es: "Village Touristique" },
    text: {
      fr: "Au Village Touristique, notre riad est situé au calme, à quelques minutes de Guéliz selon l’annonce.",
      en: "In the Village Touristique, our riad is in a quiet spot, a few minutes from Gueliz according to the listing.",
      es: "En el Village Touristique, nuestro riad está en una zona tranquila, a pocos minutos de Gueliz según el anuncio.",
    },
  },
};

const QUARTIER_TO_ZONE: Record<string, ZoneId> = {
  "Route de Fes": "route-de-fes",
  Chrifia: "chrifia",
  Palmeraie: "palmeraie",
};

/** Zone of a property: from its quartier, else from the confirmed facts file. */
export function zoneOf(property: Pick<Bien, "id" | "quartier">): ZoneId | null {
  const fromQuartier = property.quartier ? QUARTIER_TO_ZONE[property.quartier.trim()] : undefined;
  return fromQuartier ?? FACTS[property.id]?.zone ?? null;
}

/** Area to display: zone label, else the raw quartier, else "Marrakech". */
export function zoneLabel(property: Pick<Bien, "id" | "quartier">, lang: Lang) {
  const zone = zoneOf(property);
  return zone ? ZONES[zone].label[lang] : property.quartier?.trim() || "Marrakech";
}

const ZONE_IN: Record<ZoneId, Record<Lang, string>> = {
  "route-de-fes": { fr: "sur la route de Fès", en: "on the Fez road", es: "en la carretera de Fez" },
  "sidi-rahal": { fr: "sur la route de Sidi Rahal", en: "on the Sidi Rahal road", es: "en la carretera de Sidi Rahal" },
  chrifia: { fr: "à Chrifia", en: "in Chrifia", es: "en Chrifia" },
  golf: { fr: "dans le secteur des golfs", en: "in the golf area", es: "en la zona de los golfs" },
  palmeraie: { fr: "à la Palmeraie", en: "in the Palmeraie", es: "en la Palmeraie" },
  "village-touristique": { fr: "au Village Touristique", en: "in the Village Touristique", es: "en el Village Touristique" },
};

/** "sur la route de Fès", "in Chrifia"…: the area with the right preposition, for sentences. */
export function inZone(property: Pick<Bien, "id" | "quartier">, lang: Lang) {
  const zone = zoneOf(property);
  if (zone) return ZONE_IN[zone][lang];
  return `${lang === "fr" ? "à" : lang === "en" ? "in" : "en"} ${property.quartier?.trim() || "Marrakech"}`;
}

/** Furnished status: database first, then the facts confirmed by the agency; null = not specified. */
export function furnishedOf(property: Pick<Bien, "id" | "meuble">): boolean | null {
  if (property.meuble === true || property.meuble === false) return property.meuble;
  return FACTS[property.id]?.meuble ?? null;
}
