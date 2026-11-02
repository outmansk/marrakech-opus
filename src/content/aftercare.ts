import type { Lang } from "@/i18n/routing";

// "After the signature": the agency stays the client's contact once the lease or the sale is signed.
// Confirmed by the agency (Nov 2026): for every client (tenants, buyers, owners), included in the agency
// fee, sometimes charged when the work is large. Shown on the home page, the property page, the About
// page and in the long-term rental FAQ; mirrored in llms.txt (scripts/generate-sitemap.cjs, AFTERCARE).

export type AftercareServiceId = "travaux" | "entretien" | "mediation" | "installation" | "distance";

interface AftercareCopy {
  eyebrow: string;
  title: string;
  intro: string;
  moments: { label: string; text: string }[];
  servicesTitle: string;
  services: { id: AftercareServiceId; title: string; text: string }[];
  storyLabel: string;
  story: string;
  pricing: string;
  cta: string;
  whatsapp: string;
  /** One line for the property page. */
  short: { strong: string; text: string };
  faq: { q: string; a: string };
}

export const AFTERCARE: Record<Lang, AftercareCopy> = {
  fr: {
    eyebrow: "Après la signature",
    title: "On ne vous laisse pas à la signature.",
    intro: "Trouver le bien n’est que le début. Une fois installé, les vraies questions arrivent : une fuite, des travaux, une femme de ménage de confiance, un souci avec le propriétaire. Vous gardez le même interlocuteur, joignable sur WhatsApp, pendant toute votre location, après votre achat ou quand vous êtes loin de votre bien.",
    moments: [
      { label: "Avant", text: "Nous cherchons avec vous, nous organisons les visites et nous négocions." },
      { label: "Le jour J", text: "État des lieux, remise des clés, eau, électricité et internet." },
      { label: "Après", text: "Nous restons votre contact sur place pour tout ce qui touche au logement." },
    ],
    servicesTitle: "Ce que nous organisons pour vous",
    services: [
      { id: "travaux", title: "Travaux et réparations", text: "Plombier, électricien, peintre : nous trouvons des artisans de confiance et nous surveillons le chantier." },
      { id: "entretien", title: "Entretien de la maison", text: "Femme de ménage, jardinier, entretien de la piscine." },
      { id: "mediation", title: "Un souci avec le propriétaire", text: "Nous faisons le lien et cherchons la solution avec chacun." },
      { id: "installation", title: "Mise en route", text: "Ouverture de l’eau, de l’électricité et d’internet." },
      { id: "distance", title: "Propriétaires à distance", text: "Suivi du bien et des locataires quand vous n’êtes pas à Marrakech." },
    ],
    storyLabel: "Un exemple",
    story: "Un client français devait refaire entièrement sa cuisine. Nous avons trouvé le plombier et les artisans, puis surveillé le chantier du début à la fin. Il n’a eu qu’un seul interlocuteur et n’a jamais été seul face aux entreprises.",
    pricing: "Cet accompagnement est inclus dans nos frais d’agence. Pour un chantier important, le suivi peut être facturé : nous en parlons avec vous avant de commencer.",
    cta: "En parler sur WhatsApp",
    whatsapp: "Bonjour, j’aimerais en savoir plus sur votre accompagnement après la signature.",
    short: { strong: "Après la signature", text: "nous restons votre contact : travaux, ménage, souci avec le propriétaire." },
    faq: {
      q: "L’agence vous aide-t-elle après la signature du bail ?",
      a: "Oui. Après la signature, Live In Marrakech reste votre contact : artisans pour les travaux et les réparations, avec le suivi du chantier, femme de ménage, jardinier, entretien de la piscine, lien avec le propriétaire en cas de souci, mise en route de l’eau, de l’électricité et d’internet. C’est inclus dans les frais d’agence ; un gros chantier peut être facturé à part, annoncé à l’avance.",
    },
  },
  en: {
    eyebrow: "After the signature",
    title: "We don’t leave you once the contract is signed.",
    intro: "Finding the home is only the beginning. Once you have moved in, the real questions come up: a leak, some work to do, a cleaner you can trust, an issue with the landlord. You keep the same contact, on WhatsApp, for as long as you rent, after you buy, or while you are away from your property.",
    moments: [
      { label: "Before", text: "We search with you, arrange the viewings and negotiate." },
      { label: "Moving day", text: "Check-in inventory, key handover, water, electricity and internet." },
      { label: "After", text: "We stay your local contact for anything to do with the home." },
    ],
    servicesTitle: "What we arrange for you",
    services: [
      { id: "travaux", title: "Works and repairs", text: "Plumber, electrician, painter: we find trusted tradespeople and oversee the work." },
      { id: "entretien", title: "Home upkeep", text: "Cleaner, gardener, pool maintenance." },
      { id: "mediation", title: "An issue with the landlord", text: "We act as the go-between and work out a solution with both sides." },
      { id: "installation", title: "Getting set up", text: "Water, electricity and internet connection." },
      { id: "distance", title: "Owners living abroad", text: "We look after the property and the tenants while you are away from Marrakech." },
    ],
    storyLabel: "An example",
    story: "A French client needed to redo his whole kitchen. We found the plumber and the tradespeople, then oversaw the work from start to finish. He had a single contact and never had to deal with the contractors on his own.",
    pricing: "This support is included in our agency fee. For a large project, overseeing the work may be charged separately: we discuss it with you before anything starts.",
    cta: "Talk about it on WhatsApp",
    whatsapp: "Hello, I would like to know more about your support after the signature.",
    short: { strong: "After the signature", text: "we stay your contact: repairs, cleaning, any issue with the landlord." },
    faq: {
      q: "Does the agency help after the lease is signed?",
      a: "Yes. After the signature, Live In Marrakech stays your contact: tradespeople for works and repairs, with the work overseen, a cleaner, a gardener, pool maintenance, a go-between with the landlord if there is an issue, and getting water, electricity and internet set up. It is included in the agency fee; a large project may be charged separately, agreed in advance.",
    },
  },
  es: {
    eyebrow: "Después de la firma",
    title: "No le dejamos solo después de la firma.",
    intro: "Encontrar la vivienda es solo el principio. Una vez instalado, llegan las verdaderas preguntas: una fuga, unas obras, una asistenta de confianza, un problema con el propietario. Usted mantiene el mismo interlocutor, por WhatsApp, durante todo el alquiler, después de la compra o mientras está lejos de su inmueble.",
    moments: [
      { label: "Antes", text: "Buscamos con usted, organizamos las visitas y negociamos." },
      { label: "El día de la entrada", text: "Inventario de entrada, entrega de llaves, agua, electricidad e internet." },
      { label: "Después", text: "Seguimos siendo su contacto en Marrakech para todo lo relacionado con la vivienda." },
    ],
    servicesTitle: "Lo que organizamos por usted",
    services: [
      { id: "travaux", title: "Obras y reparaciones", text: "Fontanero, electricista, pintor: buscamos profesionales de confianza y supervisamos la obra." },
      { id: "entretien", title: "Mantenimiento de la casa", text: "Asistenta, jardinero, mantenimiento de la piscina." },
      { id: "mediation", title: "Un problema con el propietario", text: "Hacemos de enlace y buscamos la solución con ambas partes." },
      { id: "installation", title: "Puesta en marcha", text: "Alta del agua, la electricidad e internet." },
      { id: "distance", title: "Propietarios a distancia", text: "Seguimiento del inmueble y de los inquilinos cuando usted no está en Marrakech." },
    ],
    storyLabel: "Un ejemplo",
    story: "Un cliente francés tenía que rehacer toda su cocina. Buscamos al fontanero y a los profesionales, y supervisamos la obra de principio a fin. Tuvo un solo interlocutor y nunca estuvo solo frente a las empresas.",
    pricing: "Este acompañamiento está incluido en nuestros honorarios de agencia. En una obra importante, la supervisión puede facturarse aparte: lo hablamos con usted antes de empezar.",
    cta: "Hablarlo por WhatsApp",
    whatsapp: "Hola, me gustaría saber más sobre su acompañamiento después de la firma.",
    short: { strong: "Después de la firma", text: "seguimos siendo su contacto: obras, limpieza, problemas con el propietario." },
    faq: {
      q: "¿La agencia ayuda después de firmar el contrato?",
      a: "Sí. Después de la firma, Live In Marrakech sigue siendo su contacto: profesionales para obras y reparaciones, con la obra supervisada, asistenta, jardinero, mantenimiento de la piscina, enlace con el propietario si hay un problema y alta del agua, la electricidad e internet. Está incluido en los honorarios de agencia; una obra importante puede facturarse aparte, acordado de antemano.",
    },
  },
};
