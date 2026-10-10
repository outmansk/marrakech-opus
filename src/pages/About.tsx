import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import InfoPageLayout from "@/components/InfoPageLayout";
import { useLocalePath } from "@/hooks/useLocalePath";
import { useLocalizedText } from "@/hooks/useLocalizedText";
import { propertiesQueryOptions } from "@/hooks/useBiens";
import { BASE_URL } from "@/hooks/useSEO";
import { AGENCY } from "@/content/agency";
import { landingPath } from "@/content/landings";
import { ZONES, zoneOf } from "@/content/zones";
import { isUnavailable } from "@/lib/propertyServices";

// Only facts confirmed by the agency or read from the listings; story and founding year appear once filled in AGENCY.
export default function About() {
  const { lang, lp } = useLocalePath();
  const tL = useLocalizedText();
  const { data: properties = [] } = useQuery(propertiesQueryOptions({ statut: ["publie", "vendu-loue"] }));
  const available = properties.filter((property) => !isUnavailable(property));
  const zones = [...new Set(available.map((property) => zoneOf(property)).filter(Boolean))] as (keyof typeof ZONES)[];
  const story = AGENCY.story[lang];

  const h1 = tL("À propos de Live In Marrakech", "About Live In Marrakech", "Sobre Live In Marrakech");
  return (
    <InfoPageLayout
      path="/a-propos"
      h1={h1}
      title={tL("À propos : agence immobilière à Marrakech", "About us: real estate agency in Marrakech", "Quiénes somos: inmobiliaria en Marrakech")}
      description={tL(
        "Live In Marrakech, agence immobilière à Marrakech : vente, location à l’année, sous-location et séjours. Nos règles de location et nos coordonnées.",
        "Live In Marrakech, a real estate agency in Marrakech: sales, long-term rentals, sublets and short stays. Our rental rules and contact details.",
        "Live In Marrakech, inmobiliaria en Marrakech: venta, alquiler de larga duración, subarriendo y estancias. Nuestras condiciones y contacto.",
      )}
      schema={[{
        "@context": "https://schema.org",
        "@type": "AboutPage",
        "inLanguage": lang,
        "url": `${BASE_URL}${lp("/a-propos")}`,
        "about": { "@id": `${BASE_URL}/#business` },
      }]}
    >
      <section>
        <p>
          {tL(
            `Live In Marrakech est une agence immobilière installée à ${AGENCY.city} (${AGENCY.area}). Nous proposons des biens à vendre, à louer à l’année, en sous-location et en séjour de courte durée, à Marrakech et dans ses environs.`,
            `Live In Marrakech is a real estate agency based in ${AGENCY.city} (${AGENCY.area}). We offer homes for sale, for long-term rent, for sublet and for short stays, in and around Marrakech.`,
            `Live In Marrakech es una inmobiliaria con sede en ${AGENCY.city} (${AGENCY.area}). Ofrecemos inmuebles en venta, en alquiler de larga duración, en subarriendo y para estancias cortas, en Marrakech y sus alrededores.`,
          )}
          {AGENCY.foundedYear && ` ${tL("Agence fondée en", "Founded in", "Fundada en")} ${AGENCY.foundedYear}.`}
        </p>
        {story && <p>{story}</p>}
      </section>

      <section>
        <h2>{tL("Ce que nous proposons", "What we offer", "Lo que ofrecemos")}</h2>
        <ul>
          <li><Link to={landingPath("location", lang)}>{tL("Location longue durée", "Long-term rentals", "Alquiler de larga duración")}</Link> — {tL("villas et appartements, meublés ou vides, avec un bail d’un an minimum.", "villas and apartments, furnished or unfurnished, with a one-year minimum lease.", "villas y pisos, amueblados o no, con contrato de un año como mínimo.")}</li>
          <li><Link to={landingPath("vente", lang)}>{tL("Vente", "Sales", "Venta")}</Link> — {tL("villas, maisons et riads, selon les disponibilités.", "villas, houses and riads, depending on availability.", "villas, casas y riads, según disponibilidad.")}</li>
          <li><Link to={lp("/demande")}>{tL("Recherche sur mesure", "Tailored search", "Búsqueda a medida")}</Link> — {tL("décrivez le bien que vous cherchez, nous vous envoyons une sélection.", "describe the home you are looking for and we send you a selection.", "describa el inmueble que busca y le enviamos una selección.")}</li>
        </ul>
      </section>

      <section>
        <h2>{tL("Nos règles de location à l’année", "Our long-term rental rules", "Nuestras condiciones de alquiler")}</h2>
        <ul>
          <li>{tL("Bail d’un an minimum.", "One-year minimum lease.", "Contrato de un año como mínimo.")}</li>
          <li>{tL("Dépôt de garantie : un mois de loyer, meublé ou vide.", "Security deposit: one month’s rent, furnished or unfurnished.", "Fianza: un mes de alquiler, amueblada o sin amueblar.")}</li>
          <li>{tL("Document demandé : un passeport ou une carte d’identité, rien d’autre.", "Document required: a passport or a national ID card, nothing else.", "Documento necesario: un pasaporte o un documento de identidad, nada más.")}</li>
          <li>{tL("Visite sur place ou en vidéo sur WhatsApp.", "In-person or video viewings on WhatsApp.", "Visita en persona o por vídeo en WhatsApp.")}</li>
        </ul>
      </section>

      {zones.length > 0 && (
        <section>
          <h2>{tL("Où se trouvent nos biens", "Where our homes are", "Dónde están nuestros inmuebles")}</h2>
          <p>{zones.map((zone) => ZONES[zone].label[lang]).join(" · ")}</p>
        </section>
      )}

      <section>
        <h2>{tL("Nous contacter", "Contact us", "Contacto")}</h2>
        <p>
          {tL("Téléphone et WhatsApp", "Phone and WhatsApp", "Teléfono y WhatsApp")} : <a href={`tel:${AGENCY.phone}`}>{AGENCY.phoneDisplay}</a><br />
          {tL("E-mail", "Email", "Correo")} : <a href={`mailto:${AGENCY.email}`}>{AGENCY.email}</a><br />
          {AGENCY.streetAddress ? AGENCY.streetAddress : `${AGENCY.area}, ${AGENCY.city}`}
        </p>
      </section>
    </InfoPageLayout>
  );
}
