import type { Bien } from "@/types/property";
import { isUnavailable } from "@/lib/propertyServices";
import { localizePath, type Lang } from "@/i18n/routing";
import { zoneOf, type ZoneId } from "./zones";
import registry from "./areaPages.json";

// Area pages ("villa route de Sidi Rahal"…): every listing of one zone, sale and rental together.
// The registry (areaPages.json) is also read by scripts/generate-sitemap.cjs. Like the search
// landing pages, an area page with no available listing is noindex and left out of the sitemap.
// Texts: general description of the area plus facts taken from our listings (as in zones.ts);
// prices and counts are computed from the listings.

export interface AreaPage {
  zone: ZoneId;
  /** Path in each language, without the language prefix. */
  paths: Record<Lang, string>;
}

export interface AreaCopy {
  /** <title> (≤ 60 characters, no brand) and meta description (≤ 155). */
  title: string;
  description: string;
  h1: string;
  /** What the area is like, in general terms (no market figures). */
  about: string[];
}

export const AREA_PAGES = registry as AreaPage[];

/** Full address of an area page in a language: ("sidi-rahal", "en") → "/en/areas/sidi-rahal-road". */
export const areaPath = (page: AreaPage, lang: Lang) => localizePath(page.paths[lang], lang);

/** The area page at a path (without language prefix) in a language, if any. */
export const findAreaPage = (lang: Lang, basePath: string) =>
  AREA_PAGES.find((page) => page.paths[lang] === basePath.replace(/\/$/, ""));

/** Listings of an area page (available first, then rented/sold). */
export const areaListings = (page: AreaPage, properties: Bien[]) =>
  properties
    .filter((property) => zoneOf(property) === page.zone)
    .sort((a, b) => Number(isUnavailable(a)) - Number(isUnavailable(b)));

/** Available listings only. An area page without any is noindex and left out of the sitemap. */
export const areaAvailable = (page: AreaPage, properties: Bien[]) =>
  areaListings(page, properties).filter((property) => !isUnavailable(property));

/** The area page of a zone, if there is one. */
export const areaPageOf = (zone: ZoneId | null) => (zone ? AREA_PAGES.find((page) => page.zone === zone) : undefined);

export const AREA_COPY: Record<string, Record<Lang, AreaCopy>> = {
  "route-de-fes": {
    fr: {
      title: "Villa route de Fès, Marrakech : à louer et à vendre",
      description: "Villas avec jardin et piscine sur la route de Fès, au nord-est de Marrakech : loyers et prix affichés, photos, visite sur place ou en vidéo.",
      h1: "Villas route de Fès, Marrakech",
      about: [
        "Au nord-est de Marrakech, au-delà de la Palmeraie, la route de Fès est un secteur de villas sur de grands terrains, souvent avec jardin, oliviers et piscine privée. L’ambiance y est plus campagnarde qu’en ville, avec plus d’espace pour le même budget qu’un quartier central.",
        "D’après nos annonces, on y est à environ 15 à 20 minutes du centre. Une voiture est indispensable pour les courses, l’école ou le travail : avant de vous décider, faites le trajet aux heures où vous le ferez au quotidien.",
      ],
    },
    en: {
      title: "Villas on the Fez road, Marrakech: rent or buy",
      description: "Villas with a garden and pool on the Fez road, north-east of Marrakech: rents and prices shown, photos, viewings on site or by video.",
      h1: "Villas on the Fez road, Marrakech",
      about: [
        "North-east of Marrakech, beyond the Palmeraie, the Fez road is an area of villas on large plots, often with a garden, olive trees and a private pool. It feels more like the countryside than the city, with more space for the same budget than a central district.",
        "According to our listings, it is about 15 to 20 minutes from the centre. A car is essential for shopping, school or work: before you decide, drive the route at the times you will travel every day.",
      ],
    },
    es: {
      title: "Villas en la carretera de Fez, Marrakech",
      description: "Villas con jardín y piscina en la carretera de Fez, al noreste de Marrakech: alquileres y precios indicados, fotos, visita presencial o por vídeo.",
      h1: "Villas en la carretera de Fez, Marrakech",
      about: [
        "Al noreste de Marrakech, más allá de la Palmeraie, la carretera de Fez es una zona de villas en grandes parcelas, a menudo con jardín, olivos y piscina privada. El ambiente es más de campo que de ciudad, con más espacio por el mismo presupuesto que un barrio céntrico.",
        "Según nuestros anuncios, está a unos 15 o 20 minutos del centro. El coche es imprescindible para las compras, el colegio o el trabajo: antes de decidirse, haga el trayecto a las horas en que lo hará cada día.",
      ],
    },
  },
  "sidi-rahal": {
    fr: {
      title: "Villa avec piscine route de Sidi Rahal, Marrakech",
      description: "Villas avec piscine sur la route de Sidi Rahal, à l’est de Marrakech : au calme, sans vis-à-vis, vue sur l’Atlas. Loyers et prix affichés.",
      h1: "Villas avec piscine route de Sidi Rahal",
      about: [
        "À l’est de Marrakech, la route de Sidi Rahal traverse un secteur rural où l’on trouve des villas sur de grands terrains, loin du bruit de la ville. Par temps clair, certaines ont une vue dégagée sur les sommets de l’Atlas.",
        "C’est un choix pour ceux qui veulent de l’espace, une piscine privée et du calme. Nos biens de ce secteur sont accessibles par une route goudronnée. Une voiture est indispensable ; vérifiez l’accès, l’eau et le temps de trajet vers la ville avant de vous engager.",
      ],
    },
    en: {
      title: "Villa with pool on the Sidi Rahal road, Marrakech",
      description: "Villas with a pool on the Sidi Rahal road, east of Marrakech: quiet, not overlooked, Atlas views. Rents and prices shown on every listing.",
      h1: "Villas with a pool on the Sidi Rahal road",
      about: [
        "East of Marrakech, the Sidi Rahal road runs through a rural area with villas on large plots, away from the noise of the city. On clear days, some have an open view of the Atlas peaks.",
        "It suits people who want space, a private pool and peace and quiet. Our properties in this area are reached by a paved road. A car is essential; check the access road, the water supply and the drive into town before you commit.",
      ],
    },
    es: {
      title: "Villa con piscina en la carretera de Sidi Rahal",
      description: "Villas con piscina en la carretera de Sidi Rahal, al este de Marrakech: tranquilas, sin vecinos a la vista, vistas al Atlas. Precios indicados.",
      h1: "Villas con piscina en la carretera de Sidi Rahal",
      about: [
        "Al este de Marrakech, la carretera de Sidi Rahal atraviesa una zona rural con villas en grandes parcelas, lejos del ruido de la ciudad. Con el cielo despejado, algunas tienen vistas abiertas a las cumbres del Atlas.",
        "Es una opción para quien busca espacio, piscina privada y tranquilidad. A nuestros inmuebles de esta zona se llega por carretera asfaltada. El coche es imprescindible; compruebe el acceso, el agua y el tiempo de trayecto a la ciudad antes de comprometerse.",
      ],
    },
  },
  golf: {
    fr: {
      title: "Villa et appartement près des golfs de Marrakech",
      description: "Villas et appartements dans les domaines du secteur des golfs de Marrakech, comme Prestigia Ambre : résidences sécurisées, piscine, loyers affichés.",
      h1: "Villas et appartements dans le secteur des golfs",
      about: [
        "Marrakech compte plusieurs parcours de golf autour de la ville. Autour de certains se sont construits des domaines résidentiels fermés, avec gardiennage, espaces verts et piscines, comme Prestigia Ambre.",
        "On y vit en appartement ou en villa, dans un cadre calme et entretenu. D’après nos annonces, ce secteur est à quelques minutes de l’aéroport et de l’Hivernage : un bon compromis pour ceux qui veulent la sécurité d’une résidence sans s’éloigner de la ville. Une voiture reste nécessaire au quotidien.",
      ],
    },
    en: {
      title: "Villas and apartments in Marrakech’s golf area",
      description: "Villas and apartments in the golf estates of Marrakech, such as Prestigia Ambre: gated residences with pools, rents and prices shown.",
      h1: "Villas and apartments in the golf area",
      about: [
        "Marrakech has several golf courses around the city. Gated residential estates have been built around some of them, with security, green spaces and pools, such as Prestigia Ambre.",
        "People live there in apartments or villas, in a quiet, well-kept setting. According to our listings, the area is a few minutes from the airport and Hivernage: a good compromise for those who want the security of a gated residence without moving far from the city. A car is still needed day to day.",
      ],
    },
    es: {
      title: "Villas y apartamentos en la zona de golf, Marrakech",
      description: "Villas y apartamentos en los complejos de golf de Marrakech, como Prestigia Ambre: residencias vigiladas con piscina, precios indicados.",
      h1: "Villas y apartamentos en la zona de golf",
      about: [
        "Marrakech cuenta con varios campos de golf alrededor de la ciudad. Junto a algunos se han construido complejos residenciales cerrados, con vigilancia, zonas verdes y piscinas, como Prestigia Ambre.",
        "Se vive en apartamento o en villa, en un entorno tranquilo y cuidado. Según nuestros anuncios, la zona está a pocos minutos del aeropuerto y de Hivernage: un buen término medio para quien quiere la seguridad de una residencia sin alejarse de la ciudad. El coche sigue siendo necesario a diario.",
      ],
    },
  },
  palmeraie: {
    fr: {
      title: "Palmeraie de Marrakech : biens à louer et à vendre",
      description: "Maisons, villas et riads à la Palmeraie de Marrakech, dans des résidences sécurisées et verdoyantes : prix et loyers affichés, photos, visite.",
      h1: "Biens à la Palmeraie de Marrakech",
      about: [
        "Au nord-est de la ville, la Palmeraie est la grande oasis historique de Marrakech. On y trouve des villas, des maisons et des riads dans de grands jardins ou au sein de résidences fermées, comme dans le quartier d’Ennakhil.",
        "Le cadre est verdoyant et calme, à quelques kilomètres du centre. Pour qui : familles et amateurs de jardin et de piscine privée. Une voiture est indispensable.",
      ],
    },
    en: {
      title: "Palmeraie, Marrakech: property to rent and buy",
      description: "Houses, villas and riads in the Palmeraie of Marrakech, in green, gated residences: prices and rents shown, photos, viewings on request.",
      h1: "Property in the Palmeraie, Marrakech",
      about: [
        "North-east of the city, the Palmeraie is Marrakech’s great historic oasis. It has villas, houses and riads set in large gardens or within gated residences, such as in the Ennakhil area.",
        "The setting is green and quiet, a few kilometres from the centre. It suits families and anyone who wants a garden and a private pool. A car is essential.",
      ],
    },
    es: {
      title: "Palmeraie de Marrakech: inmuebles en alquiler y venta",
      description: "Casas, villas y riads en la Palmeraie de Marrakech, en residencias cerradas y arboladas: precios y alquileres indicados, fotos, visitas.",
      h1: "Inmuebles en la Palmeraie de Marrakech",
      about: [
        "Al noreste de la ciudad, la Palmeraie es el gran oasis histórico de Marrakech. Reúne villas, casas y riads en grandes jardines o dentro de residencias cerradas, como en el barrio de Ennakhil.",
        "El entorno es verde y tranquilo, a pocos kilómetros del centro. Ideal para familias y para quien quiere jardín y piscina privada. El coche es imprescindible.",
      ],
    },
  },
  "route-ourika": {
    fr: {
      title: "Villa route de l’Ourika, Marrakech, avec piscine",
      description: "Villas avec piscine sur la route de l’Ourika, au sud de Marrakech vers l’Atlas : résidences calmes, vue sur le golf ou l’Atlas, loyers affichés.",
      h1: "Villas route de l’Ourika, Marrakech",
      about: [
        "Au sud de Marrakech, la route de l’Ourika part vers l’Atlas et la vallée de l’Ourika. Le long de cet axe, on trouve des villas dans des résidences calmes, certaines en bordure de golf, d’autres avec de grands jardins tournés vers les montagnes.",
        "On y gagne de l’espace et du calme en restant proche de la ville : d’après nos annonces, nos villas de ce secteur sont à une dizaine de kilomètres de Marrakech. Une voiture est indispensable.",
      ],
    },
    en: {
      title: "Villa with pool on the Ourika road, Marrakech",
      description: "Villas with a pool on the Ourika road, south of Marrakech towards the Atlas: quiet residences, golf or mountain views, rents shown.",
      h1: "Villas on the Ourika road, Marrakech",
      about: [
        "South of Marrakech, the Ourika road heads towards the Atlas and the Ourika valley. Along it are villas in quiet residences, some next to a golf course, others with large gardens facing the mountains.",
        "You gain space and quiet while staying close to the city: according to our listings, our villas in this area are about ten kilometres from Marrakech. A car is essential.",
      ],
    },
    es: {
      title: "Villa con piscina en la carretera de Ourika",
      description: "Villas con piscina en la carretera de Ourika, al sur de Marrakech hacia el Atlas: residencias tranquilas, vistas al golf o al Atlas, precios indicados.",
      h1: "Villas en la carretera de Ourika, Marrakech",
      about: [
        "Al sur de Marrakech, la carretera de Ourika sale hacia el Atlas y el valle del Ourika. A lo largo de ella hay villas en residencias tranquilas, algunas junto a un campo de golf y otras con grandes jardines orientados a las montañas.",
        "Se gana espacio y tranquilidad sin alejarse de la ciudad: según nuestros anuncios, nuestras villas de esta zona están a unos diez kilómetros de Marrakech. El coche es imprescindible.",
      ],
    },
  },
  gueliz: {
    fr: {
      title: "Appartement à Guéliz, centre de Marrakech",
      description: "Appartements à Guéliz, le centre moderne de Marrakech : commerces et cafés à pied, résidences avec parking. Loyers et prix affichés, visite.",
      h1: "Appartements à Guéliz, Marrakech",
      about: [
        "Construit à l’époque du protectorat, Guéliz est le centre moderne de Marrakech : commerces, cafés, restaurants, galeries, salles de sport et cabinets médicaux. On y vit surtout en appartement, dans des immeubles et résidences récents.",
        "Pour qui : actifs, couples et expatriés qui veulent tout faire à pied et se passer de voiture au quotidien. À savoir : le quartier est vivant, donc parfois bruyant près des grands axes.",
      ],
    },
    en: {
      title: "Apartments in Gueliz, central Marrakech",
      description: "Apartments in Gueliz, the modern centre of Marrakech: shops and cafés on foot, residences with parking. Rents and prices shown, viewings.",
      h1: "Apartments in Gueliz, Marrakech",
      about: [
        "Built during the French protectorate, Gueliz is Marrakech’s modern centre: shops, cafés, restaurants, galleries, gyms and doctors. Most people live in apartments, in recent buildings and residences.",
        "It suits professionals, couples and expats who want to do everything on foot and manage without a car day to day. Good to know: it is lively, so sometimes noisy near the main roads.",
      ],
    },
    es: {
      title: "Apartamentos en Gueliz, centro de Marrakech",
      description: "Apartamentos en Gueliz, el centro moderno de Marrakech: tiendas y cafés a pie, residencias con parking. Alquileres y precios indicados.",
      h1: "Apartamentos en Gueliz, Marrakech",
      about: [
        "Construido durante el protectorado francés, Gueliz es el centro moderno de Marrakech: comercios, cafés, restaurantes, galerías, gimnasios y consultas médicas. Se vive sobre todo en apartamentos, en edificios y residencias recientes.",
        "Para quién: profesionales, parejas y expatriados que quieren hacerlo todo a pie y prescindir del coche a diario. A tener en cuenta: es animado, y a veces ruidoso cerca de las grandes avenidas.",
      ],
    },
  },
};
