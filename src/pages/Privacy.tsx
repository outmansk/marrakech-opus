import InfoPageLayout from "@/components/InfoPageLayout";
import { useLocalePath } from "@/hooks/useLocalePath";
import { useLocalizedText } from "@/hooks/useLocalizedText";
import { AGENCY, PROVIDERS } from "@/content/agency";

// Privacy policy. Lists exactly what the public forms send (Contact.tsx, VisitModal.tsx,
// PropertyRequest.tsx); keep it in sync when a form changes. Retention period and CNDP number
// appear once filled in src/content/agency.ts.
export default function Privacy() {
  const { lang } = useLocalePath();
  const tL = useLocalizedText();
  const retention = AGENCY.dataRetention[lang];
  const h1 = tL("Politique de confidentialité", "Privacy policy", "Política de privacidad");

  return (
    <InfoPageLayout
      path="/confidentialite"
      h1={h1}
      title={tL("Politique de confidentialité", "Privacy policy", "Política de privacidad")}
      description={tL(
        "Données collectées par les formulaires de liveinmarrakech.com, usage, prestataires techniques et vos droits (loi marocaine 09-08).",
        "Data collected by the liveinmarrakech.com forms, how it is used, technical providers and your rights under Moroccan law 09-08.",
        "Datos recogidos por los formularios de liveinmarrakech.com, uso, proveedores técnicos y sus derechos según la ley marroquí 09-08.",
      )}
    >
      <section>
        <p>
          {tL(
            `${AGENCY.name} est responsable des données envoyées par les formulaires de ce site. Nous les utilisons uniquement pour répondre à votre demande : vous rappeler, organiser une visite ou vous proposer des biens. Elles ne sont ni vendues ni cédées à des tiers.`,
            `${AGENCY.name} is responsible for the data sent through the forms on this site. We use it only to answer your request: calling you back, arranging a viewing or sending you properties. It is never sold or passed on to third parties.`,
            `${AGENCY.name} es responsable de los datos enviados a través de los formularios de este sitio. Solo los utilizamos para responder a su solicitud: llamarle, organizar una visita o proponerle inmuebles. No se venden ni se ceden a terceros.`,
          )}
        </p>
      </section>

      <section>
        <h2>{tL("Données collectées", "Data we collect", "Datos que recogemos")}</h2>
        <ul>
          <li>{tL(
            "Formulaire de contact : nom, adresse e-mail, téléphone (facultatif) et message.",
            "Contact form: name, email address, phone number (optional) and message.",
            "Formulario de contacto: nombre, correo electrónico, teléfono (opcional) y mensaje.",
          )}</li>
          <li>{tL(
            "Demande de visite : nom, téléphone, date souhaitée et bien concerné.",
            "Viewing request: name, phone number, preferred date and the property concerned.",
            "Solicitud de visita: nombre, teléfono, fecha deseada y el inmueble en cuestión.",
          )}</li>
          <li>{tL(
            "Formulaire « Demande » : nom, téléphone, e-mail (facultatif), projet (achat ou location), types de biens, budget, quartiers, nombre de chambres, meublé ou non, date d’emménagement, lieu de référence et distance, profession, profil et remarques (facultatifs).",
            "Request form: name, phone number, email (optional), project (buying or renting), property types, budget, areas, bedrooms, furnished or not, move-in date, reference location and distance, occupation, profile and notes (optional).",
            "Formulario de solicitud: nombre, teléfono, correo (opcional), proyecto (compra o alquiler), tipos de inmueble, presupuesto, zonas, dormitorios, amueblado o no, fecha de entrada, lugar de referencia y distancia, profesión, perfil y observaciones (opcionales).",
          )}</li>
        </ul>
        <p>{tL(
          "Si vous nous écrivez sur WhatsApp, l’échange passe par WhatsApp et suit ses propres règles de confidentialité.",
          "If you message us on WhatsApp, the conversation goes through WhatsApp and follows its own privacy rules.",
          "Si nos escribe por WhatsApp, la conversación pasa por WhatsApp y se rige por sus propias normas de privacidad.",
        )}</p>
      </section>

      <section>
        <h2>{tL("Prestataires techniques", "Technical providers", "Proveedores técnicos")}</h2>
        <ul>
          <li>{tL("Hébergement du site", "Website hosting", "Alojamiento del sitio")} : {PROVIDERS.hosting.split(",")[0]}</li>
          <li>{tL("Base de données (formulaires et annonces)", "Database (forms and listings)", "Base de datos (formularios y anuncios)")} : {PROVIDERS.database}</li>
          <li>{tL("Images", "Images", "Imágenes")} : {PROVIDERS.images}</li>
          <li>{tL("Polices de caractères", "Fonts", "Tipografías")} : Google Fonts</li>
        </ul>
        <p>{tL(
          "Ces prestataires peuvent traiter des données hors du Maroc, uniquement pour faire fonctionner le site.",
          "These providers may process data outside Morocco, solely to run the site.",
          "Estos proveedores pueden tratar datos fuera de Marruecos, únicamente para el funcionamiento del sitio.",
        )}</p>
      </section>

      <section>
        <h2>{tL("Cookies", "Cookies", "Cookies")}</h2>
        <p>{tL(
          "Le site n’utilise ni cookie publicitaire ni outil de mesure d’audience. Le stockage du navigateur sert seulement à garder la session de l’équipe de l’agence connectée.",
          "The site uses no advertising cookies and no audience-measurement tool. Browser storage is only used to keep the agency team’s session signed in.",
          "El sitio no utiliza cookies publicitarias ni herramientas de medición de audiencia. El almacenamiento del navegador solo sirve para mantener abierta la sesión del equipo de la agencia.",
        )}</p>
      </section>

      {retention && (
        <section>
          <h2>{tL("Durée de conservation", "Retention period", "Plazo de conservación")}</h2>
          <p>{retention}</p>
        </section>
      )}

      <section>
        <h2>{tL("Vos droits", "Your rights", "Sus derechos")}</h2>
        <p>
          {tL(
            "Conformément à la loi marocaine n° 09-08 relative à la protection des personnes physiques à l’égard du traitement des données à caractère personnel, vous pouvez accéder à vos données, les faire rectifier ou vous opposer à leur traitement. Écrivez-nous à",
            "Under Moroccan law no. 09-08 on the protection of individuals with regard to the processing of personal data, you can access your data, have it corrected or object to its processing. Write to us at",
            "De acuerdo con la ley marroquí n.º 09-08 sobre la protección de las personas físicas en el tratamiento de datos personales, puede acceder a sus datos, rectificarlos u oponerse a su tratamiento. Escríbanos a",
          )}{" "}
          <a href={`mailto:${AGENCY.email}`}>{AGENCY.email}</a>.
        </p>
        <p>{tL(
          "Vous pouvez aussi saisir la Commission nationale de contrôle de la protection des données à caractère personnel (CNDP).",
          "You can also contact Morocco’s data protection authority, the CNDP.",
          "También puede dirigirse a la autoridad marroquí de protección de datos, la CNDP.",
        )}{AGENCY.cndpNumber && ` ${tL("Déclaration CNDP n°", "CNDP declaration no.", "Declaración CNDP n.º")} ${AGENCY.cndpNumber}.`}</p>
      </section>
    </InfoPageLayout>
  );
}
