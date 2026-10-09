import { Link } from "react-router-dom";
import InfoPageLayout from "@/components/InfoPageLayout";
import { useLocalePath } from "@/hooks/useLocalePath";
import { useLocalizedText } from "@/hooks/useLocalizedText";
import { AGENCY, PROVIDERS } from "@/content/agency";

// Legal notice. Company identifiers are shown only once filled in src/content/agency.ts.
// Kept out of search results (noindex): it has no value as a search result.
export default function LegalNotice() {
  const { lp } = useLocalePath();
  const tL = useLocalizedText();
  const ids = [
    AGENCY.legalName && [tL("Raison sociale", "Company name", "Razón social"), AGENCY.legalName],
    AGENCY.legalForm && [tL("Forme juridique", "Legal form", "Forma jurídica"), AGENCY.legalForm],
    AGENCY.rc && [tL("Registre du commerce (RC)", "Trade register (RC)", "Registro mercantil (RC)"), AGENCY.rc],
    AGENCY.ice && ["ICE", AGENCY.ice],
    AGENCY.taxId && [tL("Identifiant fiscal (IF)", "Tax ID (IF)", "Identificador fiscal (IF)"), AGENCY.taxId],
    AGENCY.streetAddress && [tL("Adresse", "Address", "Dirección"), AGENCY.streetAddress],
    AGENCY.publicationDirector && [tL("Directeur de la publication", "Publication director", "Director de la publicación"), AGENCY.publicationDirector],
  ].filter(Boolean) as [string, string][];

  return (
    <InfoPageLayout
      path="/mentions-legales"
      noindex
      h1={tL("Mentions légales", "Legal notice", "Aviso legal")}
      title={tL("Mentions légales", "Legal notice", "Aviso legal")}
      description={tL("Éditeur du site liveinmarrakech.com, hébergement et contact.", "Publisher of liveinmarrakech.com, hosting and contact.", "Editor de liveinmarrakech.com, alojamiento y contacto.")}
    >
      <section>
        <h2>{tL("Éditeur du site", "Website publisher", "Editor del sitio")}</h2>
        <p>{AGENCY.name}, {AGENCY.area}, {AGENCY.city}</p>
        {ids.map(([label, value]) => <p key={label}>{label} : {value}</p>)}
        <p>
          {tL("Téléphone", "Phone", "Teléfono")} : <a href={`tel:${AGENCY.phone}`}>{AGENCY.phoneDisplay}</a> · {tL("E-mail", "Email", "Correo")} : <a href={`mailto:${AGENCY.email}`}>{AGENCY.email}</a>
        </p>
      </section>
      <section>
        <h2>{tL("Hébergement", "Hosting", "Alojamiento")}</h2>
        <p>{PROVIDERS.hosting}</p>
      </section>
      <section>
        <h2>{tL("Données personnelles", "Personal data", "Datos personales")}</h2>
        <p>
          {tL("Voir notre", "See our", "Consulte nuestra")} <Link to={lp("/confidentialite")}>{tL("politique de confidentialité", "privacy policy", "política de privacidad")}</Link>.
        </p>
      </section>
    </InfoPageLayout>
  );
}
