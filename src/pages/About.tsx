import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import InfoPageLayout from "@/components/InfoPageLayout";
import { useLocalePath } from "@/hooks/useLocalePath";
import { useLocalizedText } from "@/hooks/useLocalizedText";
import { propertiesQueryOptions } from "@/hooks/useBiens";
import { BASE_URL } from "@/hooks/useSEO";
import { AGENCY } from "@/content/agency";
import { AFTERCARE } from "@/content/aftercare";
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
  const after = AFTERCARE[lang];

  const h1 = tL("À propos de Live In Marrakech", "About Live In Marrakech", "Sobre Live In Marrakech");
  return (
    <InfoPageLayout
      path="/a-propos"
      h1={h1}
      title={tL("À propos : agence immobilière à Marrakech", "About us: real estate agency in Marrakech", "Quiénes somos: inmobiliaria en Marrakech")}
      description={tL(
        "Live In Marrakech, agence immobilière à Marrakech : vente, location à l’année et sous-location pour Airbnb. Nos règles de location et nos coordonnées.",
        "Live In Marrakech, a real estate agency in Marrakech: sales, long-term rentals and sublets for Airbnb. Our rental rules and contact details.",
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
            `Live In Marrakech est une agence immobilière installée à ${AGENCY.city} (${AGENCY.area}). Nous proposons des biens à vendre, à louer à l’année et en sous-location (louer un bien pour l’exploiter en Airbnb avec l’accord du propriétaire), à Marrakech et dans ses environs. Pour un séjour de courte durée, demandez-nous : nous cherchons pour vous.`,
            `Live In Marrakech is a real estate agency based in ${AGENCY.city} (${AGENCY.area}). We offer homes for sale, for long-term rent and for sublet (renting a home to run it as an Airbnb, with the owner’s permission), in and around Marrakech. For a short stay, just ask: we will search for you.`,
            `Live In Marrakech es una inmobiliaria con sede en ${AGENCY.city} (${AGENCY.area}). Ofrecemos inmuebles en venta, en alquiler de larga duración y en subarriendo (alquilar un inmueble para explotarlo en Airbnb con el permiso del propietario), en Marrakech y sus alrededores. Para una estancia corta, pregúntenos: buscamos por usted.`,
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

      <section id="apres-la-signature">
        <h2>{after.title}</h2>
        <p>{after.intro}</p>
        <ul>
          {after.services.map(({ id, title, text }) => (
            <li key={id}><strong>{title}</strong> — {text}</li>
          ))}
        </ul>
        <p><em>{after.storyLabel} : </em>{after.story}</p>
        <p>{after.pricing}</p>
      </section>

      <section>
        <h2>{tL("Nos règles de location à l’année", "Our long-term rental rules", "Nuestras condiciones de alquiler")}</h2>
        <ul>
          <li>{tL("Bail d’un an minimum.", "One-year minimum lease.", "Contrato de un año como mínimo.")}</li>
          <li>{tL("Dépôt de garantie : deux mois de loyer pour un logement meublé, un mois pour un logement vide.", "Security deposit: two months’ rent for a furnished home, one month for an unfurnished one.", "Fianza: dos meses de alquiler para una vivienda amueblada, un mes para una sin amueblar.")}</li>
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
