import type { Lang } from "@/i18n/routing";

// Long-term rental pages: texts built from the listings and from the rules confirmed by the agency
// (1-year lease minimum; deposit 1 month's rent, furnished or not; passport or ID card only).
// No market averages: every figure is computed from the available listings.

export const PHONE_DISPLAY = "+212 6 05 38 70 41";

export type RentalPageKind = "all" | "appartement" | "villa";

export interface RentalFacts {
  kind: RentalPageKind;
  count: number;
  /** Formatted monthly rents of the available listings ("7 000 MAD"). */
  min: string | null;
  max: string | null;
  /** Cheapest listing of the page's type, with its area. */
  cheapest: { rent: string; zone: string } | null;
  /** Areas with an available listing, in display form. */
  zones: string[];
  /** Cheapest apartment and its area (for the "affordable apartment" question on the hub). */
  cheapestApartment: { rent: string; zone: string } | null;
}

const list = (items: string[], lang: Lang) => {
  if (items.length <= 1) return items.join("");
  const last = { fr: " et ", en: " and ", es: " y " }[lang];
  return `${items.slice(0, -1).join(", ")}${last}${items[items.length - 1]}`;
};

export function rentalIntroFigures(lang: Lang, f: RentalFacts) {
  if (!f.count || !f.min) return "";
  const range = f.min === f.max ? f.min : `${f.min} – ${f.max}`;
  return {
    fr: `Nos ${f.count} ${f.count > 1 ? "biens disponibles se louent" : "bien disponible se loue"} actuellement ${f.min === f.max ? "" : "de "}${f.min === f.max ? range : `${f.min} à ${f.max}`} par mois.`,
    en: `Our ${f.count} available ${f.count > 1 ? "properties rent" : "property rents"} for ${range} per month at the moment.`,
    es: `${f.count > 1 ? `Nuestros ${f.count} inmuebles disponibles se alquilan` : "Nuestro inmueble disponible se alquila"} ahora por ${range} al mes.`,
  }[lang];
}

export function rentalSections(lang: Lang) {
  return {
    rentsHeading: { fr: "Combien coûte un loyer à Marrakech ?", en: "How much is rent in Marrakech?", es: "¿Cuánto cuesta un alquiler en Marrakech?" }[lang],
    rentsNote: {
      fr: "Ces loyers sont ceux de nos biens disponibles aujourd’hui, pas une moyenne du marché.",
      en: "These are the rents of our properties available today, not a market average.",
      es: "Son los alquileres de nuestros inmuebles disponibles hoy, no una media del mercado.",
    }[lang],
    rentsColumns: {
      fr: ["Type", "Zone", "Loyer mensuel", "Biens"],
      en: ["Type", "Area", "Monthly rent", "Properties"],
      es: ["Tipo", "Zona", "Alquiler mensual", "Inmuebles"],
    }[lang],
    furnished: {
      heading: { fr: "Meublé ou vide ?", en: "Furnished or unfurnished?", es: "¿Amueblado o sin amueblar?" }[lang],
      paragraphs: {
        fr: [
          "Un logement meublé est livré avec le mobilier et l’équipement nécessaires pour s’installer rapidement. Un logement vide se loue sans mobilier : vous apportez le vôtre.",
          "Chez Live In Marrakech, le bail est d’un an minimum dans les deux cas. Le dépôt de garantie est d’un mois de loyer, meublé ou vide. Le badge « Meublé » ou « Vide » l’indique sur chaque annonce dès que l’information est renseignée.",
          "Avant de signer, faites l’inventaire du mobilier et de l’électroménager pour un meublé, et vérifiez la climatisation et le chauffage dans tous les cas.",
        ],
        en: [
          "A furnished home comes with the furniture and equipment you need to move in quickly. An unfurnished home is rented without furniture: you bring your own.",
          "At Live In Marrakech, the lease is one year minimum in both cases. The security deposit is one month’s rent, furnished or unfurnished. A “Furnished” or “Unfurnished” badge shows it on each listing once the information is filled in.",
          "Before signing, check the furniture and appliance inventory of a furnished home, and test the air conditioning and heating in every case.",
        ],
        es: [
          "Una vivienda amueblada se entrega con los muebles y el equipamiento necesarios para instalarse rápido. Una vivienda sin amueblar se alquila vacía: usted aporta sus muebles.",
          "En Live In Marrakech, el contrato es de un año como mínimo en ambos casos. La fianza es de un mes de alquiler, amueblada o sin amueblar. La etiqueta « Amueblado » o « Sin amueblar » lo indica en cada anuncio cuando el dato está informado.",
          "Antes de firmar, revise el inventario de muebles y electrodomésticos de una vivienda amueblada, y compruebe el aire acondicionado y la calefacción en todos los casos.",
        ],
      }[lang],
    },
    zonesHeading: { fr: "Dans quels quartiers ?", en: "Which areas?", es: "¿En qué zonas?" }[lang],
    zonesIntro: {
      fr: "Voici les zones où nous avons aujourd’hui des biens à louer. Pour comparer tous les quartiers de Marrakech, lisez notre guide",
      en: "These are the areas where we currently have homes for rent. To compare every area of Marrakech, read our guide",
      es: "Estas son las zonas donde tenemos hoy inmuebles en alquiler. Para comparar todos los barrios de Marrakech, lea nuestra guía",
    }[lang],
    zonesGuide: {
      fr: { label: "Dans quel quartier vivre à Marrakech ?", path: "/blog/quartiers-marrakech-ou-vivre" },
      en: { label: "Where to live in Marrakech", path: "/en/blog/best-areas-to-live-marrakech" },
      es: { label: "¿En qué barrio vivir en Marrakech?", path: "/es/blog/mejores-barrios-marrakech" },
    }[lang],
    settleGuide: {
      fr: { label: "S’installer à Marrakech : le guide pratique", path: "/blog/s-installer-a-marrakech-expatries" },
      en: { label: "Moving to Marrakech: the practical guide", path: "/en/blog/moving-to-marrakech-expat-guide" },
      es: { label: "Mudarse a Marrakech: la guía práctica", path: "/es/blog/mudarse-a-marrakech-guia-expatriados" },
    }[lang],
    howTo: {
      heading: { fr: "Comment louer avec nous", en: "How to rent with us", es: "Cómo alquilar con nosotros" }[lang],
      steps: {
        fr: [
          ["Décrivez votre recherche", "Budget, zone, nombre de chambres, meublé ou vide : remplissez le formulaire ou écrivez-nous sur WhatsApp."],
          ["Recevez une sélection", "Nous vous envoyons les biens qui correspondent, y compris ceux qui ne sont pas encore en ligne."],
          ["Visitez sur place ou en vidéo", "Visite privée à Marrakech, ou en direct sur WhatsApp si vous êtes encore à l’étranger."],
          ["Signez le bail", "Bail d’un an minimum, dépôt de garantie d’un mois de loyer et une pièce d’identité : passeport ou carte d’identité."],
        ],
        en: [
          ["Describe your search", "Budget, area, number of bedrooms, furnished or not: fill in the form or message us on WhatsApp."],
          ["Get a selection", "We send you the matching homes, including some that are not online yet."],
          ["Visit in person or by video", "A private viewing in Marrakech, or live on WhatsApp if you are still abroad."],
          ["Sign the lease", "One-year lease minimum, a security deposit of one month’s rent and one ID: passport or national ID card."],
        ],
        es: [
          ["Describa su búsqueda", "Presupuesto, zona, número de dormitorios, amueblado o no: rellene el formulario o escríbanos por WhatsApp."],
          ["Reciba una selección", "Le enviamos los inmuebles que encajan, incluidos algunos que aún no están publicados."],
          ["Visite en persona o por vídeo", "Visita privada en Marrakech, o en directo por WhatsApp si todavía está en el extranjero."],
          ["Firme el contrato", "Contrato de un año como mínimo, fianza de un mes de alquiler y un documento: pasaporte o documento de identidad."],
        ],
      }[lang],
    },
  };
}

/** Questions answered with figures from the listings; answers start with the direct answer (about 40–60 words). */
export function rentalFaq(lang: Lang, f: RentalFacts): { q: string; a: string }[] {
  const range = f.min && f.max ? (f.min === f.max ? f.min : { fr: `entre ${f.min} et ${f.max}`, en: `between ${f.min} and ${f.max}`, es: `entre ${f.min} y ${f.max}` }[lang]) : null;
  const zones = list(f.zones, lang);
  const what = {
    all: { fr: "nos biens", en: "our homes", es: "nuestros inmuebles" },
    appartement: { fr: "nos appartements", en: "our apartments", es: "nuestros apartamentos" },
    villa: { fr: "nos villas", en: "our villas", es: "nuestras villas" },
  }[f.kind][lang];

  const price = {
    fr: {
      q: f.kind === "villa" ? "Quel est le prix d’une villa à louer à Marrakech ?" : f.kind === "appartement" ? "Quel est le prix d’un appartement à louer à Marrakech ?" : "Quel est le prix d’un loyer à Marrakech ?",
      a: range
        ? `Chez Live In Marrakech, ${what} disponibles en location longue durée se louent ${range} par mois. Ce sont nos loyers actuels, pas une moyenne du marché : le prix dépend surtout du type de bien, de la zone, de la surface et des équipements comme la piscine.`
        : "Nous n’avons pas de bien de ce type disponible en ce moment. Décrivez votre budget et votre zone sur notre formulaire : nous vous envoyons une sélection, y compris des biens qui ne sont pas encore en ligne, avec leur loyer mensuel.",
    },
    en: {
      q: f.kind === "villa" ? "How much does it cost to rent a villa in Marrakech?" : f.kind === "appartement" ? "How much does it cost to rent an apartment in Marrakech?" : "How much is rent in Marrakech?",
      a: range
        ? `At Live In Marrakech, ${what} available for long-term rent cost ${range} per month. These are our current rents, not a market average: the price depends mostly on the type of home, the area, the size and features such as a pool.`
        : "We have no home of this type available right now. Tell us your budget and preferred area on our form and we will send you a selection, including homes that are not online yet, with their monthly rent.",
    },
    es: {
      q: f.kind === "villa" ? "¿Cuánto cuesta alquilar una villa en Marrakech?" : f.kind === "appartement" ? "¿Cuánto cuesta alquilar un apartamento en Marrakech?" : "¿Cuánto cuesta un alquiler en Marrakech?",
      a: range
        ? `En Live In Marrakech, ${what} disponibles en alquiler de larga duración cuestan ${range} al mes. Son nuestros alquileres actuales, no una media del mercado: el precio depende sobre todo del tipo de inmueble, la zona, la superficie y equipamientos como la piscina.`
        : "No tenemos ningún inmueble de este tipo disponible ahora mismo. Indíquenos su presupuesto y zona en nuestro formulario y le enviaremos una selección, incluidos inmuebles aún no publicados, con su alquiler mensual.",
    },
  }[lang];

  const cheap = f.kind === "villa"
    ? {
        fr: {
          q: "Où trouver une villa avec piscine à louer à l’année ?",
          a: f.cheapest
            ? `Nos villas disponibles à l’année se trouvent ${zones ? `dans ces zones : ${zones}` : "autour de Marrakech"}. La moins chère se loue ${f.cheapest.rent} par mois (${f.cheapest.zone}). Chaque annonce détaille les équipements, dont la piscine ; si aucune ne convient, décrivez votre recherche et nous vous envoyons une sélection.`
            : "Aucune villa n’est disponible en ce moment. Décrivez votre recherche (budget, zone, nombre de chambres) : nous vous envoyons une sélection, y compris des villas qui ne sont pas encore en ligne.",
        },
        en: {
          q: "Where can I find a villa with a pool for long-term rent?",
          a: f.cheapest
            ? `Our villas available by the year are ${zones ? `in these areas: ${zones}` : "around Marrakech"}. The most affordable rents for ${f.cheapest.rent} per month (${f.cheapest.zone}). Each listing details the features, including the pool; if none fits, describe your search and we will send you a selection.`
            : "No villa is available right now. Describe your search (budget, area, bedrooms) and we will send you a selection, including villas that are not online yet.",
        },
        es: {
          q: "¿Dónde encontrar una villa con piscina en alquiler por años?",
          a: f.cheapest
            ? `Nuestras villas disponibles por años están ${zones ? `en estas zonas: ${zones}` : "alrededor de Marrakech"}. La más económica se alquila por ${f.cheapest.rent} al mes (${f.cheapest.zone}). Cada anuncio detalla el equipamiento, incluida la piscina; si ninguna encaja, describa su búsqueda y le enviaremos una selección.`
            : "No hay ninguna villa disponible ahora mismo. Describa su búsqueda (presupuesto, zona, dormitorios) y le enviaremos una selección, incluidas villas aún no publicadas.",
        },
      }[lang]
    : {
        fr: {
          q: "Où trouver un appartement pas cher à Marrakech ?",
          a: f.cheapestApartment
            ? `Notre appartement le moins cher se loue ${f.cheapestApartment.rent} par mois, à ${f.cheapestApartment.zone}. Si votre budget est plus serré ou si vous visez un autre quartier, décrivez votre recherche sur notre formulaire : nous vous envoyons une sélection, y compris des appartements qui ne sont pas encore en ligne.`
            : "Aucun appartement n’est disponible en ce moment. Décrivez votre budget et votre quartier sur notre formulaire : nous vous envoyons une sélection, y compris des appartements qui ne sont pas encore en ligne.",
        },
        en: {
          q: "Where can I find an affordable apartment in Marrakech?",
          a: f.cheapestApartment
            ? `Our most affordable apartment rents for ${f.cheapestApartment.rent} per month, in ${f.cheapestApartment.zone}. If your budget is tighter or you want another area, describe your search on our form and we will send you a selection, including apartments that are not online yet.`
            : "No apartment is available right now. Tell us your budget and area on our form and we will send you a selection, including apartments that are not online yet.",
        },
        es: {
          q: "¿Dónde encontrar un apartamento barato en Marrakech?",
          a: f.cheapestApartment
            ? `Nuestro apartamento más económico se alquila por ${f.cheapestApartment.rent} al mes, en ${f.cheapestApartment.zone}. Si su presupuesto es más ajustado o busca otro barrio, describa su búsqueda en nuestro formulario y le enviaremos una selección, incluidos apartamentos aún no publicados.`
            : "No hay ningún apartamento disponible ahora mismo. Indíquenos su presupuesto y barrio en nuestro formulario y le enviaremos una selección, incluidos apartamentos aún no publicados.",
        },
      }[lang];

  const fixed = {
    fr: [
      { q: "Peut-on louer meublé à l’année ?", a: "Oui. Une partie de nos biens se loue meublée, avec un bail d’un an minimum comme pour une location vide. Le statut meublé ou vide est indiqué sur chaque annonce dès qu’il est renseigné. Le dépôt de garantie est d’un mois de loyer, comme pour un logement vide." },
      { q: "Quels documents faut-il pour louer ?", a: "Un passeport ou une carte d’identité suffit. Nous ne demandons pas d’autre document pour louer à l’année avec Live In Marrakech. Le bail est signé pour un an minimum, et le dépôt de garantie est d’un mois de loyer, meublé ou vide." },
      { q: "Quelle est la caution ?", a: "Le dépôt de garantie est d’un mois de loyer, que le logement soit meublé ou vide. Il est restitué en fin de bail, selon l’état des lieux de sortie comparé à celui de l’entrée. Son montant exact figure dans le bail d’un an." },
      { q: "Peut-on visiter à distance ?", a: `Oui. Nous organisons des visites en vidéo en direct sur WhatsApp, au ${PHONE_DISPLAY}, pour que vous voyiez le bien avant de venir à Marrakech. La visite sur place et la signature du bail d’un an peuvent ensuite se faire à votre arrivée.` },
    ],
    en: [
      { q: "Can I rent a furnished home for a year?", a: "Yes. Some of our homes are rented furnished, with a one-year minimum lease just like an unfurnished rental. Each listing shows whether it is furnished or unfurnished once the information is filled in. The security deposit is one month’s rent, as for an unfurnished home." },
      { q: "What documents do I need to rent?", a: "A passport or a national ID card is enough. We ask for no other document to rent long term with Live In Marrakech. The lease is signed for one year minimum, and the security deposit is one month’s rent, furnished or unfurnished." },
      { q: "How much is the security deposit?", a: "The security deposit is one month’s rent, whether the home is furnished or unfurnished. It is returned at the end of the lease, based on the check-out inventory compared with the check-in one. The exact amount is written in the one-year lease." },
      { q: "Can I view a home remotely?", a: `Yes. We run live video viewings on WhatsApp, on ${PHONE_DISPLAY}, so you can see the home before coming to Marrakech. The in-person visit and the signing of the one-year lease can then take place when you arrive.` },
    ],
    es: [
      { q: "¿Se puede alquilar amueblado por un año?", a: "Sí. Parte de nuestros inmuebles se alquila amueblada, con un contrato de un año como mínimo, igual que un alquiler sin amueblar. Cada anuncio indica si está amueblado o no cuando el dato está informado. La fianza es de un mes de alquiler, igual que sin amueblar." },
      { q: "¿Qué documentos se necesitan para alquilar?", a: "Basta con un pasaporte o un documento de identidad. No pedimos ningún otro documento para alquilar por años con Live In Marrakech. El contrato se firma por un año como mínimo, y la fianza es de un mes de alquiler, amueblado o sin amueblar." },
      { q: "¿Cuánto es la fianza?", a: "La fianza es de un mes de alquiler, tanto si la vivienda está amueblada como si no. Se devuelve al final del contrato, según el estado de salida comparado con el de entrada. El importe exacto figura en el contrato de un año." },
      { q: "¿Se puede visitar a distancia?", a: `Sí. Hacemos visitas en vídeo en directo por WhatsApp, en el ${PHONE_DISPLAY}, para que vea el inmueble antes de venir a Marrakech. La visita presencial y la firma del contrato de un año pueden hacerse después, a su llegada.` },
    ],
  }[lang];

  return [price, cheap, ...fixed];
}

/** WhatsApp link with a message naming the page the visitor comes from. */
export function whatsappFromPage(lang: Lang, pageName: string) {
  const text = {
    fr: `Bonjour, je vous contacte depuis la page « ${pageName} » de votre site.`,
    en: `Hello, I am contacting you from the “${pageName}” page of your website.`,
    es: `Hola, les escribo desde la página « ${pageName} » de su web.`,
  }[lang];
  return `https://wa.me/212605387041?text=${encodeURIComponent(text)}`;
}
