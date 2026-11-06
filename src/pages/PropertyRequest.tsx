import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import type { LucideIcon } from "lucide-react";
import {
  ArrowLeft, ArrowRight, Ban, Baby, Box, Briefcase, Building2, CalendarClock, CalendarRange, Check, Compass, Eye, Heart,
  Home, House, KeyRound, LandPlot, Landmark, Loader2, Luggage, MapPin, MessageCircle, Palette, Palmtree, PartyPopper,
  ShieldCheck, Shuffle, Sofa, Sparkles, Sprout, Sun, Trees, TrendingUp, User, Users, UsersRound, Waves, Wine, X, Zap,
} from "lucide-react";
import { toast } from "sonner";
import SEOHead from "@/components/SEOHead";
import Breadcrumbs from "@/components/Breadcrumbs";
import { breadcrumbJsonLd } from "@/lib/breadcrumbs";
import { insertWithOrigin } from "@/lib/social/attribution";
import { useLocalePath } from "@/hooks/useLocalePath";
import type { Lang } from "@/i18n/routing";
import { ZONES, type ZoneId } from "@/content/zones";
import { AGENCY } from "@/content/agency";
import { groupDigits } from "@/lib/propertyDetail";
import { whatsappHref } from "@/lib/contact";
import "./PropertyRequest.css";

// « Décrire ma recherche » : a short interactive questionnaire, one question per screen with large
// tap targets. Single-choice answers move on by themselves; the last screen asks for contact details.
// Answers go to client_leads (real columns where they exist, the rest as readable French lines in
// `notes`, which the agency reads in the CRM). Only real areas (src/content/zones.ts) are offered.

type L = Record<Lang, string>;
type Project = "achat" | "location" | "souslocation" | "sejour";
/** Dates of a stay are kept apart: datesFrom / datesTo (YYYY-MM-DD) and datesFlexible ("1"). */
type Answers = Partial<Record<QuestionId | "datesFrom" | "datesTo" | "datesFlexible", string | string[]>>;
type QuestionId =
  | "project" | "type" | "usage" | "household" | "group" | "occasion" | "style" | "garden" | "pool"
  | "furnished" | "bedrooms" | "areas" | "budget" | "timing" | "dates";

interface Option {
  id: string;
  label: L;
  hint?: L;
  icon?: LucideIcon;
  /** Shorter text for the summary chips. */
  short?: L;
  /** Budget bounds (MAD), bedrooms, furnishing: copied into the matching database columns. */
  min?: number;
  max?: number;
}

interface Question {
  id: QuestionId;
  title: L;
  subtitle?: L;
  kind: "single" | "multi" | "dates";
  options?: (answers: Answers, lang: Lang) => Option[];
  /** Shown only when this returns true. */
  when?: (answers: Answers) => boolean;
  /** Prefix of the summary chip (« Jardin : indispensable »). */
  chip?: L;
  /** Label of the answer in the CRM notes (French). Omitted for answers stored in their own column. */
  note?: string;
}

const t = (fr: string, en: string, es: string): L => ({ fr, en, es });
const project = (a: Answers) => a.project as Project | undefined;
const type = (a: Answers) => a.type as string | undefined;
const ANY = t("Peu importe", "No preference", "Me da igual");

const money = (value: number, lang: Lang) => (value >= 1_000_000
  ? `${String(value / 1_000_000).replace(".", lang === "en" ? "." : ",")} M`
  : groupDigits(value, lang));

function budgetOptions(answers: Answers): Option[] {
  const p = project(answers);
  const [unit, steps] = p === "achat"
    ? [t("MAD", "MAD", "MAD"), [1_500_000, 3_000_000, 5_000_000, 8_000_000]]
    : p === "sejour"
      ? [t("MAD / nuit", "MAD / night", "MAD / noche"), [1_500, 3_000, 6_000]]
      : [t("MAD / mois", "MAD / month", "MAD / mes"), [8_000, 12_000, 18_000, 25_000]];
  const ranges: Option[] = [
    { id: `0-${steps[0]}`, max: steps[0], label: t(`Moins de ${money(steps[0], "fr")} ${unit.fr}`, `Under ${money(steps[0], "en")} ${unit.en}`, `Menos de ${money(steps[0], "es")} ${unit.es}`) },
    ...steps.slice(1).map((high, i) => ({ id: `${steps[i]}-${high}`, min: steps[i], max: high, label: t(`${money(steps[i], "fr")} à ${money(high, "fr")} ${unit.fr}`, `${money(steps[i], "en")} to ${money(high, "en")} ${unit.en}`, `De ${money(steps[i], "es")} a ${money(high, "es")} ${unit.es}`) })),
    { id: `${steps[steps.length - 1]}+`, min: steps[steps.length - 1], label: t(`Plus de ${money(steps[steps.length - 1], "fr")} ${unit.fr}`, `Over ${money(steps[steps.length - 1], "en")} ${unit.en}`, `Más de ${money(steps[steps.length - 1], "es")} ${unit.es}`) },
    { id: "unknown", icon: Compass, label: t("Je ne sais pas encore", "I don’t know yet", "Aún no lo sé"), hint: t("On en parle ensemble", "We’ll talk it through", "Lo hablamos juntos") },
  ];
  return ranges;
}

const QUESTIONS: Question[] = [
  {
    id: "project", kind: "single",
    title: t("Quel est votre projet à Marrakech ?", "What is your plan in Marrakech?", "¿Cuál es su proyecto en Marrakech?"),
    subtitle: t("Touchez une réponse, on passe à la suite.", "Tap an answer to move on.", "Toque una respuesta para continuar."),
    options: () => [
      { id: "achat", icon: KeyRound, label: t("Acheter", "Buy", "Comprar"), hint: t("Devenir propriétaire", "Become an owner", "Ser propietario") },
      { id: "location", icon: CalendarRange, label: t("Louer à l’année", "Rent long term", "Alquilar por años"), hint: t("Bail d’un an minimum", "One-year lease minimum", "Contrato de un año mínimo") },
      { id: "souslocation", icon: Luggage, label: t("Louer pour sous-louer", "Rent to sublet", "Alquilar para subarrendar"), hint: t("Exploiter le bien en Airbnb", "Run the home as an Airbnb", "Explotarlo en Airbnb") },
      // Not the agency's focus: offered on request only (the agency searches case by case).
      { id: "sejour", icon: Palmtree, label: t("Courte durée", "Short stay", "Estancia corta"), hint: t("Sur demande : nous cherchons pour vous", "On request: we search for you", "Bajo petición: buscamos por usted") },
    ],
  },
  {
    id: "type", kind: "single", note: "Type",
    title: t("Quel type de bien ?", "What kind of property?", "¿Qué tipo de inmueble?"),
    options: (a) => [
      { id: "villa", icon: House, label: t("Villa", "Villa", "Villa"), hint: t("Jardin, souvent piscine", "Garden, often a pool", "Jardín, a menudo piscina") },
      { id: "appartement", icon: Building2, label: t("Appartement", "Apartment", "Apartamento"), hint: t("En ville ou en résidence", "In town or a residence", "En ciudad o residencia") },
      { id: "riad", icon: Landmark, label: t("Riad", "Riad", "Riad"), hint: t("Patio, architecture marocaine", "Patio, Moroccan architecture", "Patio, arquitectura marroquí") },
      { id: "maison", icon: Home, label: t("Maison", "House", "Casa"), hint: t("Plus simple qu’une villa", "Simpler than a villa", "Más sencilla que una villa") },
      ...(project(a) === "achat" ? [{ id: "terrain", icon: LandPlot, label: t("Terrain", "Land", "Terreno"), hint: t("Pour construire", "To build on", "Para construir") }] : []),
      { id: "any", icon: Shuffle, label: ANY, hint: t("Montrez-moi ce qui existe", "Show me what there is", "Muéstrenme lo que hay") },
    ],
  },
  {
    id: "usage", kind: "single", note: "Usage", when: (a) => project(a) === "achat",
    title: t("C’est pour…", "It’s for…", "Es para…"),
    options: () => [
      { id: "vivre", icon: Heart, label: t("Y vivre à l’année", "Living there all year", "Vivir todo el año"), short: t("Pour y vivre", "To live in", "Para vivir") },
      { id: "secondaire", icon: Sun, label: t("Une résidence secondaire", "A holiday home", "Una segunda residencia"), short: t("Résidence secondaire", "Holiday home", "Segunda residencia") },
      { id: "airbnb", icon: Luggage, label: t("La louer aux vacanciers (type Airbnb)", "Renting to holidaymakers (Airbnb-style)", "Alquilarla a turistas (tipo Airbnb)"), short: t("Pour Airbnb", "For Airbnb", "Para Airbnb") },
      { id: "investir", icon: TrendingUp, label: t("Un investissement", "An investment", "Una inversión"), hint: t("Location à l’année ou revente", "Long-term letting or resale", "Alquiler anual o reventa") },
    ],
  },
  {
    id: "household", kind: "single", note: "Pour", when: (a) => project(a) === "location",
    title: t("Qui va y habiter ?", "Who will live there?", "¿Quién vivirá allí?"),
    options: () => [
      { id: "seul", icon: User, label: t("Moi seul(e)", "Just me", "Yo solo/a") },
      { id: "couple", icon: Users, label: t("En couple", "A couple", "En pareja") },
      { id: "famille", icon: Baby, label: t("En famille, avec enfants", "A family with children", "En familia, con niños") },
      { id: "pro", icon: Briefcase, label: t("Pour le travail", "For work", "Por trabajo"), hint: t("Mutation, entreprise, colocation", "Relocation, company, flat-share", "Traslado, empresa, piso compartido") },
    ],
  },
  {
    id: "group", kind: "single", note: "Voyageurs", when: (a) => project(a) === "sejour",
    title: t("Vous serez combien ?", "How many of you?", "¿Cuántos serán?"),
    options: () => [
      { id: "2", icon: User, label: t("1 ou 2 personnes", "1 or 2 people", "1 o 2 personas") },
      { id: "3-4", icon: Users, label: t("3 à 4 personnes", "3 to 4 people", "3 a 4 personas") },
      { id: "5-8", icon: UsersRound, label: t("5 à 8 personnes", "5 to 8 people", "5 a 8 personas") },
      { id: "9+", icon: PartyPopper, label: t("9 personnes ou plus", "9 people or more", "9 personas o más") },
    ],
  },
  {
    id: "occasion", kind: "single", note: "Occasion", when: (a) => project(a) === "sejour",
    title: t("Pour quelle occasion ?", "What’s the occasion?", "¿Para qué ocasión?"),
    options: () => [
      { id: "vacances", icon: Sun, label: t("Des vacances", "A holiday", "Unas vacaciones") },
      { id: "amis", icon: Wine, label: t("Entre amis", "With friends", "Con amigos") },
      { id: "evenement", icon: PartyPopper, label: t("Un événement", "An event", "Un evento"), hint: t("Mariage, anniversaire…", "Wedding, birthday…", "Boda, cumpleaños…") },
      { id: "travail", icon: Briefcase, label: t("Le travail", "Work", "Trabajo") },
    ],
  },
  {
    id: "style", kind: "single", note: "Style", chip: t("Style", "Style", "Estilo"), when: (a) => type(a) !== "terrain",
    title: t("Quel style vous ressemble ?", "Which style feels like you?", "¿Qué estilo le representa?"),
    options: () => [
      { id: "moderne", icon: Sparkles, label: t("Moderne", "Modern", "Moderno"), hint: t("Lignes épurées, lumineux", "Clean lines, bright", "Líneas limpias, luminoso") },
      { id: "beldi", icon: Landmark, label: t("Beldi traditionnel", "Traditional beldi", "Beldi tradicional"), hint: t("Zellige, tadelakt, bois sculpté", "Zellige, tadelakt, carved wood", "Zellige, tadelakt, madera tallada") },
      { id: "beldi-moderne", icon: Palette, label: t("Beldi modernisé", "Modern beldi", "Beldi modernizado"), hint: t("Le charme marocain, le confort d’aujourd’hui", "Moroccan charm, today’s comfort", "Encanto marroquí, confort actual") },
      { id: "any", icon: Shuffle, label: ANY },
    ],
  },
  {
    id: "garden", kind: "single", note: "Jardin", chip: t("Jardin", "Garden", "Jardín"), when: (a) => ["villa", "maison", "any", undefined].includes(type(a)),
    title: t("Un grand jardin, pour vous c’est…", "A large garden is…", "Un jardín grande es…"),
    options: () => [
      { id: "essentiel", icon: Trees, label: t("Indispensable, j’adore", "A must, I love it", "Imprescindible, me encanta") },
      { id: "petit", icon: Sprout, label: t("Un petit extérieur suffit", "A small outdoor space is enough", "Basta un pequeño exterior") },
      { id: "any", icon: Shuffle, label: t("Ça m’est égal", "I don’t mind", "Me da igual") },
    ],
  },
  {
    id: "pool", kind: "single", note: "Piscine", chip: t("Piscine", "Pool", "Piscina"), when: (a) => type(a) !== "terrain",
    title: t("Et la piscine ?", "And a pool?", "¿Y la piscina?"),
    options: () => [
      { id: "indispensable", icon: Waves, label: t("Indispensable", "A must", "Imprescindible") },
      { id: "plus", icon: Sparkles, label: t("Un plus, pas obligatoire", "Nice to have", "Un extra, no obligatorio") },
      { id: "non", icon: Ban, label: t("Pas nécessaire", "Not needed", "No es necesaria") },
    ],
  },
  {
    id: "furnished", kind: "single", chip: t("Logement", "Home", "Vivienda"), when: (a) => project(a) === "location" || project(a) === "souslocation",
    title: t("Meublé ou vide ?", "Furnished or unfurnished?", "¿Amueblado o sin amueblar?"),
    subtitle: t("Caution : 2 mois de loyer en meublé, 1 mois en vide.", "Deposit: 2 months’ rent furnished, 1 month unfurnished.", "Fianza: 2 meses amueblado, 1 mes sin amueblar."),
    options: () => [
      { id: "furnished", icon: Sofa, label: t("Meublé", "Furnished", "Amueblado"), hint: t("Je pose mes valises", "Just bring my suitcases", "Llego con mis maletas") },
      { id: "unfurnished", icon: Box, label: t("Vide", "Unfurnished", "Sin amueblar"), hint: t("J’apporte mes meubles", "I bring my furniture", "Traigo mis muebles") },
      { id: "any", icon: Shuffle, label: ANY },
    ],
  },
  {
    id: "bedrooms", kind: "single", when: (a) => type(a) !== "terrain",
    title: t("Combien de chambres ?", "How many bedrooms?", "¿Cuántos dormitorios?"),
    options: () => [
      ...["1", "2", "3", "4"].map((n) => ({ id: n, min: Number(n), label: t(n, n, n) })),
      { id: "5", min: 5, label: t("5 et +", "5 +", "5 o más") },
      { id: "any", label: ANY },
    ],
  },
  {
    id: "areas", kind: "multi",
    title: t("Des quartiers en tête ?", "Any areas in mind?", "¿Algún barrio en mente?"),
    subtitle: t("Plusieurs choix possibles, ou laissez-nous vous conseiller.", "Pick several, or let us advise you.", "Puede elegir varios, o dejar que le aconsejemos."),
    options: (_a, lang) => [
      ...(Object.keys(ZONES) as ZoneId[]).map((id) => ({ id, icon: MapPin, label: ZONES[id].label })),
      { id: "conseil", icon: Compass, label: t("Conseillez-moi", "Advise me", "Aconséjenme") },
    ].sort((x, y) => (x.id === "conseil" ? 1 : y.id === "conseil" ? -1 : x.label[lang].localeCompare(y.label[lang], lang))),
  },
  {
    id: "budget", kind: "single",
    title: t("Quel budget ?", "What budget?", "¿Qué presupuesto?"),
    subtitle: t("Une fourchette suffit, elle reste confidentielle.", "A range is enough, it stays confidential.", "Basta un rango, es confidencial."),
    options: budgetOptions,
  },
  {
    id: "timing", kind: "single", note: "Quand", chip: t("Quand", "When", "Cuándo"), when: (a) => project(a) !== "sejour",
    title: t("Pour quand ?", "When?", "¿Para cuándo?"),
    options: () => [
      { id: "asap", icon: Zap, label: t("Dès que possible", "As soon as possible", "Lo antes posible") },
      { id: "1-3", icon: CalendarClock, label: t("Dans 1 à 3 mois", "In 1 to 3 months", "En 1 a 3 meses") },
      { id: "3+", icon: CalendarRange, label: t("Dans plus de 3 mois", "In more than 3 months", "En más de 3 meses") },
      { id: "regarde", icon: Eye, label: t("Je regarde seulement", "Just looking", "Solo estoy mirando") },
    ],
  },
  {
    id: "dates", kind: "dates", when: (a) => project(a) === "sejour",
    title: t("Vos dates ?", "Your dates?", "¿Sus fechas?"),
    subtitle: t("Même approximatives.", "Even rough ones.", "Aunque sean aproximadas."),
  },
];

const UI = {
  title: t("Décrire ma recherche immobilière à Marrakech", "Describe your property search in Marrakech", "Describa su búsqueda inmobiliaria en Marrakech"),
  description: t(
    "Achat, location à l’année ou sous-location pour Airbnb : répondez à quelques questions en une minute, l’agence vous envoie une sélection de biens à Marrakech.",
    "Buying, long-term rental or a sublet for Airbnb: answer a few questions in a minute and the agency sends you a selection of homes in Marrakech.",
    "Compra, alquiler anual o subarriendo para Airbnb: responda a unas preguntas en un minuto y la agencia le envía una selección de inmuebles en Marrakech.",
  ),
  h1: t("Trouvons votre bien à Marrakech", "Let’s find your home in Marrakech", "Encontremos su inmueble en Marrakech"),
  minute: t("1 minute · quelques touches", "1 minute · a few taps", "1 minuto · unos toques"),
  step: t("Question {n} sur {total}", "Question {n} of {total}", "Pregunta {n} de {total}"),
  back: t("Retour", "Back", "Atrás"),
  quit: t("Quitter", "Leave", "Salir"),
  next: t("Continuer", "Continue", "Continuar"),
  skip: t("Passer", "Skip", "Omitir"),
  arrival: t("Arrivée", "Arrival", "Llegada"),
  departure: t("Départ", "Departure", "Salida"),
  flexible: t("Mes dates sont flexibles", "My dates are flexible", "Mis fechas son flexibles"),
  contactTitle: t("Dernière étape : où vous répondre ?", "Last step: where can we reach you?", "Último paso: ¿dónde le respondemos?"),
  contactSub: t("Un conseiller vous écrit sur WhatsApp ou par téléphone avec une sélection.", "An advisor messages you on WhatsApp or calls with a selection.", "Un asesor le escribe por WhatsApp o le llama con una selección."),
  yourSearch: t("Votre recherche", "Your search", "Su búsqueda"),
  name: t("Votre nom", "Your name", "Su nombre"),
  phone: t("Téléphone ou WhatsApp, avec l’indicatif", "Phone or WhatsApp, with country code", "Teléfono o WhatsApp, con prefijo"),
  email: t("E-mail (facultatif)", "Email (optional)", "Correo (opcional)"),
  message: t("Autre chose à nous dire ? (facultatif)", "Anything else? (optional)", "¿Algo más? (opcional)"),
  messagePlaceholder: t("Ex. : plain-pied, proche d’une école, animaux acceptés…", "E.g. single storey, near a school, pets allowed…", "Ej.: una sola planta, cerca de un colegio, se aceptan mascotas…"),
  consent: t("J’accepte que Live In Marrakech me contacte au sujet de cette recherche.", "I agree that Live In Marrakech may contact me about this search.", "Acepto que Live In Marrakech me contacte sobre esta búsqueda."),
  privacy: t("Confidentialité", "Privacy", "Privacidad"),
  submit: t("Envoyer ma recherche", "Send my search", "Enviar mi búsqueda"),
  nameError: t("Indiquez votre nom (2 lettres minimum).", "Please enter your name (at least 2 letters).", "Indique su nombre (mínimo 2 letras)."),
  phoneError: t("Indiquez un numéro valide, avec l’indicatif (ex. +33 6 12 34 56 78).", "Enter a valid number with the country code (e.g. +44 7700 900123).", "Indique un número válido con prefijo (ej. +34 612 34 56 78)."),
  consentError: t("Cochez la case pour que nous puissions vous contacter.", "Tick the box so we can contact you.", "Marque la casilla para que podamos contactarle."),
  sendError: t("L’envoi n’a pas abouti. Réessayez ou écrivez-nous sur WhatsApp.", "Sending failed. Try again or message us on WhatsApp.", "No se pudo enviar. Inténtelo de nuevo o escríbanos por WhatsApp."),
  doneTitle: t("Merci {name}, c’est envoyé !", "Thank you {name}, it’s sent!", "¡Gracias {name}, enviado!"),
  doneText: t("Un conseiller vous recontacte très vite avec une sélection. Pour aller plus vite, écrivez-nous sur WhatsApp.", "An advisor will get back to you shortly with a selection. To speed things up, message us on WhatsApp.", "Un asesor le contactará muy pronto con una selección. Para ir más rápido, escríbanos por WhatsApp."),
  reference: t("Votre référence", "Your reference", "Su referencia"),
  whatsapp: t("Continuer sur WhatsApp", "Continue on WhatsApp", "Seguir por WhatsApp"),
  catalogue: t("Voir les biens disponibles", "See available homes", "Ver los inmuebles disponibles"),
  safe: t("Vos réponses restent confidentielles", "Your answers stay confidential", "Sus respuestas son confidenciales"),
};

const CONTACT_STEP = "contact";
const DONE_STEP = "done";
type StepId = QuestionId | typeof CONTACT_STEP | typeof DONE_STEP;

export default function PropertyRequest() {
  const { lang, lp } = useLocalePath();
  const [answers, setAnswers] = useState<Answers>({});
  const [stepId, setStepId] = useState<StepId>("project");
  const [direction, setDirection] = useState<"forward" | "back">("forward");
  const [contact, setContact] = useState({ name: "", phone: "", email: "", message: "", consent: false, website: "" });
  const [errors, setErrors] = useState<{ name?: boolean; phone?: boolean; consent?: boolean }>({});
  const [loading, setLoading] = useState(false);
  const [reference, setReference] = useState("");
  const advanceTimer = useRef<number>();
  const summaryRef = useRef<HTMLUListElement>(null);

  const flow = useMemo(() => QUESTIONS.filter((q) => !q.when || q.when(answers)), [answers]);
  const steps: StepId[] = [...flow.map((q) => q.id), CONTACT_STEP];
  const index = stepId === DONE_STEP ? steps.length : Math.max(0, steps.indexOf(stepId));
  const question = flow.find((q) => q.id === stepId);
  const progress = stepId === DONE_STEP ? 100 : Math.round((index / steps.length) * 100);

  const go = (next: StepId, dir: "forward" | "back") => {
    window.clearTimeout(advanceTimer.current);
    setDirection(dir);
    setStepId(next);
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const nextAfter = (id: StepId, nextAnswers: Answers): StepId => {
    const ids: StepId[] = [...QUESTIONS.filter((q) => !q.when || q.when(nextAnswers)).map((q) => q.id), CONTACT_STEP];
    return ids[ids.indexOf(id) + 1] ?? CONTACT_STEP;
  };
  const back = () => index > 0 && go(steps[index - 1], "back");

  const choose = (q: Question, option: Option) => {
    if (q.kind === "multi") {
      setAnswers((prev) => {
        const current = (prev[q.id] as string[] | undefined) ?? [];
        const picked = option.id === "conseil" ? (current.includes("conseil") ? [] : ["conseil"])
          : current.includes(option.id) ? current.filter((v) => v !== option.id) : [...current.filter((v) => v !== "conseil"), option.id].slice(0, 8);
        return { ...prev, [q.id]: picked };
      });
      return;
    }
    const nextAnswers = { ...answers, [q.id]: option.id };
    // A new project changes the budget scale and some questions: drop answers that no longer apply.
    if (q.id === "project" && answers.project !== option.id) {
      delete nextAnswers.budget;
      if (option.id !== "achat" && nextAnswers.type === "terrain") delete nextAnswers.type;
    }
    setAnswers(nextAnswers);
    window.clearTimeout(advanceTimer.current);
    advanceTimer.current = window.setTimeout(() => go(nextAfter(q.id, nextAnswers), "forward"), 260);
  };

  const label = (q: Question, id: string) => q.options?.(answers, lang).find((o) => o.id === id)?.label[lang] ?? id;
  const chipLabel = (q: Question, id: string) => {
    const option = q.options?.(answers, lang).find((o) => o.id === id);
    const text = option?.short?.[lang] ?? option?.label[lang] ?? id;
    return q.chip ? `${q.chip[lang]} : ${text.charAt(0).toLowerCase()}${text.slice(1)}` : text;
  };
  const frLabel = (q: Question, id: string) => q.options?.(answers, "fr").find((o) => o.id === id)?.label.fr ?? id;
  const dayMonth = (iso?: string | string[]) => (typeof iso === "string" && iso ? iso.slice(8, 10) + "/" + iso.slice(5, 7) : "");
  const datesText = [dayMonth(answers.datesFrom), dayMonth(answers.datesTo)].filter(Boolean).join(" → ");
  const summary = flow.flatMap((q) => {
    if (q.kind === "dates") return datesText ? [{ q, text: datesText }] : [];
    const value = answers[q.id];
    if (!value || (Array.isArray(value) && !value.length)) return [];
    const text = Array.isArray(value) ? value.map((v) => label(q, v)).join(", ") : chipLabel(q, value);
    return [{ q, text: q.id === "bedrooms" && value !== "any" ? `${text} ${{ fr: "ch.", en: "bed", es: "dorm." }[lang]}` : text }];
  });

  // Keep the latest answer in view in the one-line summary (phones).
  useEffect(() => {
    const row = summaryRef.current;
    if (row && typeof row.scrollTo === "function") row.scrollTo({ left: row.scrollWidth, behavior: "smooth" });
  }, [summary.length]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (contact.website || loading) return;
    const digits = contact.phone.replace(/\D/g, "");
    const nextErrors = { name: contact.name.trim().length < 2, phone: digits.length < 8 || digits.length > 15, consent: !contact.consent };
    setErrors(nextErrors);
    if (nextErrors.name) return void toast.error(UI.nameError[lang]);
    if (nextErrors.phone) return void toast.error(UI.phoneError[lang]);
    if (nextErrors.consent) return void toast.error(UI.consentError[lang]);

    setLoading(true);
    const ref = `LIM-${Date.now().toString(36).slice(-4).toUpperCase()}${Math.random().toString(36).slice(2, 4).toUpperCase()}`;
    const byId = (id: QuestionId) => QUESTIONS.find((q) => q.id === id)!;
    const pick = (id: QuestionId) => (flow.some((q) => q.id === id) ? answers[id] : undefined) as string | undefined;
    const budget = byId("budget").options!(answers, "fr").find((o) => o.id === pick("budget"));
    const bedrooms = byId("bedrooms").options!(answers, "fr").find((o) => o.id === pick("bedrooms"));
    const areas = ((answers.areas as string[] | undefined) ?? []).filter((id) => id !== "conseil");

    const notes = [
      // client_leads has no "sous-location" type: saved as a long-term rental, the note says it is a sublet.
      ...(pick("project") === "souslocation" ? ["Projet : sous-location (exploitation type Airbnb)"] : []),
      ...flow.filter((q) => q.note && pick(q.id) && pick(q.id) !== "any").map((q) => `${q.note} : ${frLabel(q, pick(q.id)!)}`),
      ...(pick("budget") ? [`Budget : ${budget?.label.fr ?? pick("budget")}`] : []),
      ...(answers.datesFrom || answers.datesTo ? [`Dates : du ${answers.datesFrom || "?"} au ${answers.datesTo || "?"}${answers.datesFlexible ? " (flexibles)" : ""}`] : []),
      ...(((answers.areas as string[] | undefined) ?? []).includes("conseil") ? ["Quartier : à conseiller"] : []),
      ...(contact.message.trim() ? [`Message : ${contact.message.trim().slice(0, 900)}`] : []),
      `Langue : ${lang.toUpperCase()}`,
      `Réf : ${ref}`,
    ].join("\n");

    const payload = {
      name: contact.name.trim().slice(0, 120),
      phone: contact.phone.trim(),
      email: contact.email.trim() || null,
      source: "Site web",
      status: "nouveau",
      created_by: null,
      transaction_type: pick("project") === "achat" ? "vente" : pick("project") === "sejour" ? "location-courte-duree" : "location-longue-duree",
      property_types: pick("type") && pick("type") !== "any" ? [pick("type")] : [],
      budget_min: budget?.min ?? null,
      budget_max: budget?.max ?? null,
      preferred_areas: areas.map((id) => ZONES[id as ZoneId]?.label.fr ?? id),
      bedrooms_min: bedrooms?.min ?? null,
      furnishing: pick("furnished") === "furnished" || pick("furnished") === "unfurnished" ? pick("furnished") : "any",
      available_from: (answers.datesFrom as string | undefined) || null,
      client_profile: pick("household") ? frLabel(byId("household"), pick("household")!) : pick("group") ? `${frLabel(byId("group"), pick("group")!)}` : null,
      notes: notes.slice(0, 1500),
    };

    try {
      const { error } = await insertWithOrigin("client_leads", payload);
      if (error) {
        toast.error(UI.sendError[lang]);
      } else {
        setReference(ref);
        go(DONE_STEP, "forward");
      }
    } catch {
      toast.error(UI.sendError[lang]);
    } finally {
      setLoading(false);
    }
  };

  const crumbs = [
    { name: { fr: "Accueil", en: "Home", es: "Inicio" }[lang], path: lp("/") },
    { name: { fr: "Ma recherche", en: "My search", es: "Mi búsqueda" }[lang], path: lp("/demande") },
  ];
  const firstName = contact.name.trim().split(/\s+/)[0] ?? "";
  const whatsappText = {
    fr: `Bonjour, je viens d’envoyer ma recherche sur votre site (${reference}) : ${summary.map((s) => s.text).join(" · ")}.`,
    en: `Hello, I just sent my search on your website (${reference}): ${summary.map((s) => s.text).join(" · ")}.`,
    es: `Hola, acabo de enviar mi búsqueda en su web (${reference}): ${summary.map((s) => s.text).join(" · ")}.`,
  }[lang];

  return (
    <div className="request-page-v2 min-h-[100svh]">
      <SEOHead withBrand={false} title={UI.title[lang]} description={UI.description[lang]} schema={breadcrumbJsonLd(crumbs)} />

      <main className="mx-auto flex min-h-[100svh] w-full max-w-[640px] flex-col px-5 pb-10 sm:px-8">
        {/* En-tête : marque, progression, quitter */}
        <header className="sticky top-0 z-20 -mx-5 bg-[#f6f1e8]/95 px-5 pb-3 pt-4 backdrop-blur sm:-mx-8 sm:px-8">
          <div className="flex items-center justify-between gap-3">
            <Link to={lp("/")} className="font-serif-luxury whitespace-nowrap text-[23px] font-semibold tracking-tight text-[#211f1b] hover:text-[#a4573e]">
              Live In Marrakech
            </Link>
            <Link to={lp("/")} aria-label={UI.quit[lang]} className="grid h-11 w-11 place-items-center rounded-full text-[#4f4a43] hover:bg-[#ede5d8]">
              <X size={20} strokeWidth={1.6} aria-hidden="true" />
            </Link>
          </div>
          <div className="mt-3 h-1 overflow-hidden rounded-full bg-[#e3d9ca]" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress} aria-label={UI.h1[lang]}>
            <div className="h-full rounded-full bg-[#a4573e] transition-[width] duration-500 ease-out" style={{ width: `${Math.max(progress, 4)}%` }} />
          </div>
        </header>

        <Breadcrumbs crumbs={crumbs} className="mt-3 text-[#655f56]" />

        {/* Intro (première question seulement) */}
        {stepId === "project" && (
          <div className="rq-fade mt-6 flex flex-col gap-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#a4573e]">{UI.minute[lang]}</p>
            <h1 className="font-serif-luxury m-0 text-[40px] font-medium leading-[1.02] text-[#211f1b] sm:text-[52px]">{UI.h1[lang]}</h1>
          </div>
        )}

        {/* Réponses déjà données : un toucher pour revenir à la question */}
        {summary.length > 0 && stepId !== DONE_STEP && (
          <ul ref={summaryRef} aria-label={UI.yourSearch[lang]} className="scrollbar-hide -mx-5 mt-4 flex gap-1.5 overflow-x-auto px-5 pb-1 sm:-mx-8 sm:flex-wrap sm:px-8">
            {summary.map(({ q, text }) => (
              <li key={q.id} className="rq-pop shrink-0">
                <button type="button" onClick={() => go(q.id, "back")} className="max-w-[220px] truncate whitespace-nowrap rounded-full border border-[#e3d9ca] bg-white px-3 py-1.5 text-[12px] font-medium text-[#4f4a43] hover:border-[#a4573e] hover:text-[#a4573e]">
                  {text}
                </button>
              </li>
            ))}
          </ul>
        )}

        <div key={stepId} className={`flex flex-1 flex-col ${direction === "forward" ? "rq-in-forward" : "rq-in-back"}`}>
          {question && (
            <section aria-labelledby={`q-${question.id}`} className="mt-7 flex flex-col gap-5">
              <div className="flex flex-col gap-1.5">
                <p className="text-[12px] font-medium text-[#655f56]">{UI.step[lang].replace("{n}", String(index + 1)).replace("{total}", String(steps.length))}</p>
                {stepId === "project"
                  ? <h2 id={`q-${question.id}`} className="font-serif-luxury m-0 text-[26px] font-medium leading-tight text-[#211f1b]">{question.title[lang]}</h2>
                  : <h2 id={`q-${question.id}`} className="font-serif-luxury m-0 text-[34px] font-medium leading-[1.08] text-[#211f1b] sm:text-[40px]">{question.title[lang]}</h2>}
                {question.subtitle && <p className="m-0 text-[14px] leading-relaxed text-[#655f56]">{question.subtitle[lang]}</p>}
              </div>

              {question.kind === "dates" ? (
                <DatesStep
                  lang={lang}
                  value={answers}
                  onChange={(from, to, flexible) => setAnswers((prev) => ({ ...prev, datesFrom: from || undefined, datesTo: to || undefined, datesFlexible: flexible ? "1" : undefined }))}
                />
              ) : (
                <div role={question.kind === "multi" ? "group" : "radiogroup"} aria-labelledby={`q-${question.id}`} className={question.id === "bedrooms" ? "grid grid-cols-3 gap-2.5" : question.id === "areas" ? "flex flex-wrap gap-2" : "grid gap-2.5 sm:grid-cols-2"}>
                  {question.options!(answers, lang).map((option, i) => {
                    const value = answers[question.id];
                    const selected = Array.isArray(value) ? value.includes(option.id) : value === option.id;
                    const Icon = option.icon;
                    if (question.id === "areas") {
                      return (
                        <button key={option.id} type="button" role="checkbox" aria-checked={selected} onClick={() => choose(question, option)} style={{ animationDelay: `${i * 30}ms` }}
                          className={`rq-card-in flex min-h-11 items-center gap-1.5 rounded-full border px-4 text-[14px] font-medium transition-all duration-200 active:scale-[0.97] ${selected ? "border-[#a4573e] bg-[#a4573e] text-white" : "border-[#e3d9ca] bg-white text-[#211f1b] hover:border-[#a4573e]"}`}>
                          {selected ? <Check size={15} strokeWidth={2.2} aria-hidden="true" /> : Icon && <Icon size={15} strokeWidth={1.6} aria-hidden="true" className="text-[#a4573e]" />}
                          {option.label[lang]}
                        </button>
                      );
                    }
                    return (
                      <button key={option.id} type="button" role="radio" aria-checked={selected} onClick={() => choose(question, option)} style={{ animationDelay: `${i * 45}ms` }}
                        className={`rq-card-in group relative flex items-center gap-3.5 rounded-xl border bg-white text-left transition-all duration-200 active:scale-[0.98] ${question.id === "bedrooms" ? "min-h-[64px] justify-center px-2 text-center" : "min-h-[68px] px-4 py-3"} ${selected ? "border-[#a4573e] shadow-[0_0_0_1px_#a4573e,0_10px_24px_-14px_rgba(164,87,62,0.6)]" : "border-[#e3d9ca] hover:-translate-y-0.5 hover:border-[#cdb9a3] hover:shadow-[0_10px_24px_-18px_rgba(33,31,27,0.5)]"}`}>
                        {Icon && (
                          <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-full transition-colors duration-200 ${selected ? "bg-[#a4573e] text-white" : "bg-[#f6f1e8] text-[#a4573e] group-hover:bg-[#ede5d8]"}`}>
                            <Icon size={20} strokeWidth={1.5} aria-hidden="true" />
                          </span>
                        )}
                        <span className="flex min-w-0 flex-col">
                          <span className={`${question.id === "bedrooms" ? "font-serif-luxury text-[24px] lining-nums" : "text-[16px]"} font-semibold leading-snug text-[#211f1b]`}>{option.label[lang]}</span>
                          {option.hint && <span className="text-[13px] leading-snug text-[#655f56]">{option.hint[lang]}</span>}
                        </span>
                        {selected && question.id !== "bedrooms" && (
                          <span className="rq-check absolute right-3 top-3 grid h-6 w-6 place-items-center rounded-full bg-[#a4573e] text-white" aria-hidden="true">
                            <Check size={14} strokeWidth={2.6} />
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}

              {(question.kind !== "single" || answers[question.id]) && (
                <div className="flex flex-col gap-2 pt-1">
                  {(question.kind !== "single") && (
                    <button type="button" onClick={() => go(nextAfter(question.id, answers), "forward")} className="flex min-h-[54px] items-center justify-center gap-2 rounded-xl bg-[#211f1b] px-5 text-[15px] font-semibold text-white transition-colors hover:bg-[#a4573e]">
                      {((answers[question.id] as string[] | undefined)?.length || answers.datesFrom || answers.datesTo) ? UI.next[lang] : UI.skip[lang]}
                      <ArrowRight size={18} aria-hidden="true" />
                    </button>
                  )}
                  {question.kind === "single" && answers[question.id] && (
                    <button type="button" onClick={() => go(nextAfter(question.id, answers), "forward")} className="flex min-h-11 items-center justify-center gap-1.5 text-[14px] font-semibold text-[#a4573e]">
                      {UI.next[lang]}<ArrowRight size={16} aria-hidden="true" />
                    </button>
                  )}
                </div>
              )}
            </section>
          )}

          {stepId === CONTACT_STEP && (
            <form onSubmit={submit} noValidate className="mt-7 flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <p className="text-[12px] font-medium text-[#655f56]">{UI.step[lang].replace("{n}", String(steps.length)).replace("{total}", String(steps.length))}</p>
                <h2 className="font-serif-luxury m-0 text-[34px] font-medium leading-[1.08] text-[#211f1b] sm:text-[40px]">{UI.contactTitle[lang]}</h2>
                <p className="m-0 text-[14px] leading-relaxed text-[#655f56]">{UI.contactSub[lang]}</p>
              </div>
              <Field label={UI.name[lang]} error={errors.name}>
                <input autoComplete="name" value={contact.name} onChange={(e) => setContact({ ...contact, name: e.target.value })} className={inputClass(errors.name)} />
              </Field>
              <Field label={UI.phone[lang]} error={errors.phone}>
                <input type="tel" inputMode="tel" autoComplete="tel" placeholder="+33 6 12 34 56 78" value={contact.phone} onChange={(e) => setContact({ ...contact, phone: e.target.value })} className={inputClass(errors.phone)} />
              </Field>
              <Field label={UI.email[lang]}>
                <input type="email" inputMode="email" autoComplete="email" value={contact.email} onChange={(e) => setContact({ ...contact, email: e.target.value })} className={inputClass()} />
              </Field>
              <Field label={UI.message[lang]}>
                <textarea rows={3} maxLength={900} placeholder={UI.messagePlaceholder[lang]} value={contact.message} onChange={(e) => setContact({ ...contact, message: e.target.value })} className={`${inputClass()} min-h-[96px] py-3`} />
              </Field>
              {/* Champ piège pour les robots : invisible pour les visiteurs. */}
              <input tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" value={contact.website} onChange={(e) => setContact({ ...contact, website: e.target.value })} name="website" />
              <label className={`flex cursor-pointer items-start gap-3 rounded-xl border bg-white p-3.5 text-[13px] leading-snug text-[#4f4a43] ${errors.consent ? "border-[#b4432f]" : "border-[#e3d9ca]"}`}>
                <input type="checkbox" checked={contact.consent} onChange={(e) => setContact({ ...contact, consent: e.target.checked })} className="mt-0.5 h-5 w-5 shrink-0 accent-[#a4573e]" />
                <span>{UI.consent[lang]} <Link to={lp("/confidentialite")} className="underline underline-offset-2">{UI.privacy[lang]}</Link></span>
              </label>
              <button type="submit" disabled={loading} className="flex min-h-[56px] items-center justify-center gap-2 rounded-xl bg-[#a4573e] px-5 text-[16px] font-semibold text-white shadow-[0_14px_28px_-16px_rgba(164,87,62,0.9)] transition-colors hover:bg-[#8c4631] disabled:opacity-70">
                {loading ? <Loader2 size={20} className="animate-spin" aria-hidden="true" /> : <ArrowRight size={20} aria-hidden="true" />}
                {UI.submit[lang]}
              </button>
              <p className="m-0 flex items-center justify-center gap-1.5 text-[12px] text-[#655f56]"><ShieldCheck size={14} aria-hidden="true" />{UI.safe[lang]}</p>
            </form>
          )}

          {stepId === DONE_STEP && (
            <section className="mt-10 flex flex-col items-center gap-5 text-center" aria-live="polite">
              <span className="rq-success grid h-20 w-20 place-items-center rounded-full bg-[#a4573e] text-white shadow-[0_18px_36px_-16px_rgba(164,87,62,0.9)]">
                <Check size={38} strokeWidth={2.2} aria-hidden="true" />
              </span>
              <h2 className="font-serif-luxury m-0 text-[36px] font-medium leading-tight text-[#211f1b]">{UI.doneTitle[lang].replace(" {name}", firstName ? ` ${firstName}` : "")}</h2>
              <p className="m-0 max-w-[440px] text-[15px] leading-relaxed text-[#4f4a43]">{UI.doneText[lang]}</p>
              <p className="m-0 rounded-full border border-[#e3d9ca] bg-white px-4 py-1.5 text-[13px] text-[#4f4a43]">{UI.reference[lang]} : <strong className="font-semibold text-[#211f1b]">{reference}</strong></p>
              <div className="flex w-full flex-col gap-2.5 sm:w-auto">
                <a href={whatsappHref(AGENCY.phone, whatsappText)} target="_blank" rel="noreferrer" className="flex min-h-[54px] items-center justify-center gap-2 rounded-xl bg-[#25d366] px-6 text-[15px] font-semibold text-white">
                  <MessageCircle size={20} aria-hidden="true" />{UI.whatsapp[lang]}
                </a>
                <Link to={lp("/catalogue")} className="flex min-h-[50px] items-center justify-center rounded-xl border border-[#e3d9ca] bg-white px-6 text-[15px] font-semibold text-[#211f1b] hover:border-[#a4573e]">
                  {UI.catalogue[lang]}
                </Link>
              </div>
            </section>
          )}
        </div>

        {index > 0 && stepId !== DONE_STEP && (
          <button type="button" onClick={back} className="mt-8 flex min-h-11 items-center gap-1.5 self-start text-[14px] font-semibold text-[#4f4a43] hover:text-[#a4573e]">
            <ArrowLeft size={17} aria-hidden="true" />{UI.back[lang]}
          </button>
        )}
      </main>
    </div>
  );
}

const inputClass = (error?: boolean) =>
  `min-h-[52px] w-full rounded-xl border bg-white px-4 text-[16px] text-[#211f1b] outline-none transition-colors placeholder:text-[#a79d90] focus:border-[#a4573e] focus:ring-2 focus:ring-[#a4573e]/15 ${error ? "border-[#b4432f]" : "border-[#e3d9ca]"}`;

function Field({ label, error, children }: { label: string; error?: boolean; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className={`text-[13px] font-semibold ${error ? "text-[#b4432f]" : "text-[#4f4a43]"}`}>{label}</span>
      {children}
    </label>
  );
}

function DatesStep({ lang, value, onChange }: { lang: Lang; value: Answers; onChange: (from: string, to: string, flexible: boolean) => void }) {
  const [from, setFrom] = useState((value.datesFrom as string | undefined) ?? "");
  const [to, setTo] = useState((value.datesTo as string | undefined) ?? "");
  const [flexible, setFlexible] = useState(!!value.datesFlexible);
  const update = (f: string, t2: string, fl: boolean) => { setFrom(f); setTo(t2); setFlexible(fl); onChange(f, t2, fl); };
  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-2.5">
        <Field label={UI.arrival[lang]}><input type="date" value={from} onChange={(e) => update(e.target.value, to, flexible)} className={inputClass()} /></Field>
        <Field label={UI.departure[lang]}><input type="date" value={to} min={from || undefined} onChange={(e) => update(from, e.target.value, flexible)} className={inputClass()} /></Field>
      </div>
      <label className="flex min-h-11 cursor-pointer items-center gap-3 text-[14px] text-[#4f4a43]">
        <input type="checkbox" checked={flexible} onChange={(e) => update(from, to, e.target.checked)} className="h-5 w-5 accent-[#a4573e]" />
        {UI.flexible[lang]}
      </label>
    </div>
  );
}
