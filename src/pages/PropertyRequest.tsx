import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, ArrowLeft, ArrowRight, Check, ShieldCheck, Loader2 } from "lucide-react";
import { insertWithOrigin } from "@/lib/social/attribution";
import { toast } from "sonner";
import SEOHead from "@/components/SEOHead";
import { breadcrumbJsonLd } from "@/lib/breadcrumbs";
import { useLocalePath } from "@/hooks/useLocalePath";
import { useLocalizedText } from "@/hooks/useLocalizedText";
import "./PropertyRequest.css";

type Language = "fr" | "en" | "es" | "ar";
type ProjectType = "achat" | "longue_duree" | "court_sejour";
type PropertyType = "villa" | "appartement" | "riad";
type BedroomCount = "1" | "2" | "3" | "4+" | "Indifférent";

interface FormState {
  projectType: ProjectType;
  propertyType: PropertyType;
  budgetValue: string;
  isBudgetUnknown: boolean;
  bedrooms: BedroomCount;
  district: string;
  stayArrival: string;
  stayDeparture: string;
  stayFlexibleDates: boolean;
  stayGuests: number;
  stayBudgetNight: string;
  selectedTags: string[];
  notes: string;
  name: string;
  phonePrefix: string;
  phone: string;
  email: string;
  consent: boolean;
  website: string; // Honeypot
}

const DISTRICT_OPTIONS = [
  "Conseillez-moi selon mon profil",
  "Hivernage (Calme, palace, prestige)",
  "Guéliz (Vie urbaine, commerces, contemporain)",
  "Palmeraie (Oasis, villas de maîtres)",
  "Route de l'Ourika (Atlas, grands espaces)",
  "Route d'Amizmiz & Golfs (Fairways, luxe)",
  "Médina / Riad (Patrimoine, authenticité)",
  "Targa & Victor Hugo (Familles, résidentiel)",
  "Agdal (Résidences récentes & piscines)",
];

const PRESTATIONS_CHIPS = [
  "Piscine privée chauffée",
  "Vue Montagnes de l'Atlas",
  "En bordure de Golf",
  "Grand parc sans vis-à-vis",
  "Gouvernante & Chef cuisinier",
  "Domaine privé sécurisé 24/7",
];

const PHONE_PREFIXES = [
  { code: "+212", label: "MA (+212)" },
  { code: "+33", label: "FR (+33)" },
  { code: "+32", label: "BE (+32)" },
  { code: "+41", label: "CH (+41)" },
  { code: "+44", label: "UK (+44)" },
  { code: "+1", label: "US (+1)" },
  { code: "+971", label: "AE (+971)" },
];

const copy = {
  fr: {
    pageTitle: "Décrire ma recherche immobilière à Marrakech",
    pageDesc: "Location longue durée, achat ou séjour : décrivez le bien que vous cherchez à Marrakech, notre agence vous propose une sélection sur mesure.",
    brandSub: "Immobilier d'Exception",
    prev: "Précédent",
    stepOf: "Étape {current} sur 3",
    breadcrumb1: "Accueil / Votre projet",
    breadcrumb2: "Projet / Vos critères",
    breadcrumb3: "Critères / Coordonnées",
    step1Tag: "Votre projet à Marrakech",
    step1TitlePrefix: "Parlons du bien qui ",
    step1TitleHighlight: "vous correspond",
    step1Intro: "Quelques réponses suffisent pour que notre équipe sélectionne les propriétés les plus exclusives adaptées à vos attentes.",
    step1Nature: "Nature de votre démarche",
    buyTitle: "Acheter",
    buyTag: "Acquisition",
    buyDesc: "Villa de maître, riad en médina ou appartement contemporain",
    rentTitle: "Louer à l'année",
    rentTag: "Bail > 1 an",
    rentDesc: "Résidence principale haut de gamme meublée ou vide",
    stayTitle: "Séjourner",
    stayTag: "Courte durée",
    stayDesc: "Vacances, villa privatisée avec services hôteliers",
    categoryTitle: "Catégorie de bien recherché",
    villaTitle: "Villa",
    villaDesc: "Jardin & Piscine",
    aptTitle: "Appartement",
    aptDesc: "Terrasse, Vue",
    riadTitle: "Riad",
    riadDesc: "Médina & Oasis",
    btnContinueCriteria: "Continuer vers les critères",
    confidentialHint: "Vos critères restent strictement confidentiels",
    step2ClassicTitle: "Vos critères de sélection",
    step2ClassicSubtitle: "Définissez le cadre de votre projet pour affiner notre recherche exclusive.",
    step2StayTitle: "Vos dates & séjour",
    step2StaySubtitle: "Précisez votre période idéale et la composition de votre groupe.",
    budgetEstimated: "Budget maximum estimé",
    budgetUnknownBtn: "Je ne sais pas encore",
    budgetSpecifyBtn: "Préciser un montant",
    budgetCurrencySuffixSale: "MAD",
    budgetCurrencySuffixRent: "MAD / mois",
    budgetCurrencySuffixStay: "MAD / nuit",
    budgetHelperSale: "Environ 550 000 € · Montant indicatif",
    budgetHelperRent: "Environ 2 300 € / mois · Charges incluses",
    bedroomsTitle: "Nombre de chambres souhaité",
    bedroomsAll: "Tous",
    districtsTitle: "Secteurs privilégiés",
    optional: "Facultatif",
    datesTitle: "Dates de votre séjour",
    flexibleDates: "Dates flexibles",
    arrival: "Arrivée",
    departure: "Départ",
    guestsTitle: "Nombre de voyageurs",
    guestsSubtitle: "Adultes et enfants",
    budgetNightTitle: "Budget par nuit estimé",
    accordionTitle: "Préférences & Prestations exclusives",
    notesLabel: "Notes particulières ou demandes sur-mesure",
    notesPlaceholder: "Ex: plain-pied impératif, exposition sud, suite parentale isolée...",
    btnValidateContact: "Valider et passer à mes coordonnées",
    btnEditType: "← Modifier le type de bien",
    step3Title: "Où devons-nous vous transmettre la sélection ?",
    step3Subtitle: "Un conseiller privé prendra contact directement via WhatsApp ou appel selon votre préférence.",
    currentSearch: "Votre recherche actuelle",
    edit: "Modifier",
    nameLabel: "Votre Prénom & Nom",
    namePlaceholder: "Ex: Alexandre de Montmirail",
    phoneLabel: "WhatsApp / Mobile privilégié",
    phonePlaceholder: "6 12 34 56 78",
    phoneHelper: "Privilégié pour l'envoi discret de fiches PDF & visites virtuelles.",
    emailLabel: "Adresse e-mail",
    consentLabel: "J'accepte d'être recontacté uniquement par Live In Marrakech dans le cadre de ce projet. Aucune prospection extérieure.",
    btnSubmit: "Transmettre ma recherche",
    btnSubmitting: "Envoi sécurisé en cours...",
    vipWhatsAppLabel: "Échange confidentiel direct avec un conseiller :",
    vipWhatsAppLink: "Ouvrir WhatsApp VIP",
    successTag: "Demande transmise avec succès",
    successTitle: "Merci",
    successSubtitle: "Notre directeur d'agence analyse vos critères dès maintenant. Une sélection confidentielle de biens off-market vous sera présentée.",
    recapTitle: "Récapitulatif",
    recapProject: "Projet",
    recapBudget: "Budget max",
    recapRoomsDistrict: "Chambres / Secteur",
    recapContact: "Contact",
    btnWhatsAppAccelerate: "Accélérer la réponse sur WhatsApp",
    btnNewSearch: "Nouvelle recherche immobilière",
    footerConfidential: "100% Confidentiel",
    footerOffMarket: "Biens Privés & Off-Market",
    footerLocation: "Guéliz, Marrakech",
    footerCopyright: "© 2026 Live In Marrakech Luxury Real Estate. Tous droits réservés.",
    nameError: "Veuillez indiquer au moins votre prénom pour que nous sachions à qui nous adresser.",
    phoneError: "Veuillez saisir un numéro de téléphone mobile ou WhatsApp valide.",
    sendError: "Une erreur est survenue lors de l'envoi. Veuillez réessayer ou nous contacter via WhatsApp.",
  },
  en: {
    pageTitle: "Describe your property search in Marrakech",
    pageDesc: "Long-term rental, purchase or stay: describe the property you are looking for in Marrakech and our agency will send you a tailored selection.",
    brandSub: "Luxury Real Estate",
    prev: "Back",
    stepOf: "Step {current} of 3",
    breadcrumb1: "Home / Your project",
    breadcrumb2: "Project / Your criteria",
    breadcrumb3: "Criteria / Contact details",
    step1Tag: "Your project in Marrakech",
    step1TitlePrefix: "Let's find the home that ",
    step1TitleHighlight: "truly fits you",
    step1Intro: "A few answers are all our team needs to select the most exclusive properties matching your expectations.",
    step1Nature: "Your property goal",
    buyTitle: "Buy",
    buyTag: "Acquisition",
    buyDesc: "Master villa, historic Medina riad or modern penthouse",
    rentTitle: "Long-term rental",
    rentTag: "1+ year lease",
    rentDesc: "High-end primary residence, furnished or unfurnished",
    stayTitle: "Short stay",
    stayTag: "Holiday rental",
    stayDesc: "Private luxury villa with bespoke hotel services",
    categoryTitle: "Property category",
    villaTitle: "Villa",
    villaDesc: "Garden & Pool",
    aptTitle: "Apartment",
    aptDesc: "Terrace, View",
    riadTitle: "Riad",
    riadDesc: "Medina & Oasis",
    btnContinueCriteria: "Continue to criteria",
    confidentialHint: "Your criteria remain strictly confidential",
    step2ClassicTitle: "Your selection criteria",
    step2ClassicSubtitle: "Define your requirements to help us curate an exclusive portfolio for you.",
    step2StayTitle: "Dates & guest details",
    step2StaySubtitle: "Specify your desired stay period and group composition.",
    budgetEstimated: "Estimated maximum budget",
    budgetUnknownBtn: "Undecided yet",
    budgetSpecifyBtn: "Specify an amount",
    budgetCurrencySuffixSale: "MAD",
    budgetCurrencySuffixRent: "MAD / month",
    budgetCurrencySuffixStay: "MAD / night",
    budgetHelperSale: "Approx. €550,000 · Indicative amount",
    budgetHelperRent: "Approx. €2,300 / month · Charges included",
    bedroomsTitle: "Desired number of bedrooms",
    bedroomsAll: "Any",
    districtsTitle: "Preferred neighbourhoods",
    optional: "Optional",
    datesTitle: "Your stay dates",
    flexibleDates: "Flexible dates",
    arrival: "Check-in",
    departure: "Check-out",
    guestsTitle: "Number of guests",
    guestsSubtitle: "Adults and children",
    budgetNightTitle: "Estimated nightly budget",
    accordionTitle: "Exclusive preferences & bespoke amenities",
    notesLabel: "Specific requirements or custom requests",
    notesPlaceholder: "E.g. single-story only, south-facing, isolated master suite...",
    btnValidateContact: "Continue to contact details",
    btnEditType: "← Change property type",
    step3Title: "Where should we send your curated selection?",
    step3Subtitle: "A private advisor will get in touch directly via WhatsApp or phone call at your convenience.",
    currentSearch: "Current request",
    edit: "Edit",
    nameLabel: "Your Full Name",
    namePlaceholder: "E.g. Alexandre de Montmirail",
    phoneLabel: "Preferred WhatsApp / Mobile number",
    phonePlaceholder: "6 12 34 56 78",
    phoneHelper: "Used for discreet delivery of PDF dossiers & virtual tours.",
    emailLabel: "Email address",
    consentLabel: "I agree to be contacted solely by Live In Marrakech regarding this request. No third-party marketing.",
    btnSubmit: "Submit my search request",
    btnSubmitting: "Secured transmission in progress...",
    vipWhatsAppLabel: "Direct confidential chat with an advisor:",
    vipWhatsAppLink: "Open VIP WhatsApp",
    successTag: "Request successfully sent",
    successTitle: "Thank you",
    successSubtitle: "Our agency director is reviewing your criteria now. A confidential selection of off-market properties will be prepared for you.",
    recapTitle: "Summary",
    recapProject: "Project",
    recapBudget: "Max budget",
    recapRoomsDistrict: "Bedrooms / Area",
    recapContact: "Contact",
    btnWhatsAppAccelerate: "Speed up response on WhatsApp",
    btnNewSearch: "Start a new property search",
    footerConfidential: "100% Confidential",
    footerOffMarket: "Private & Off-Market Listings",
    footerLocation: "Guéliz, Marrakech",
    footerCopyright: "© 2026 Live In Marrakech Luxury Real Estate. All rights reserved.",
    nameError: "Please enter your name so we know how to address you.",
    phoneError: "Please enter a valid phone or WhatsApp number.",
    sendError: "An error occurred while submitting. Please try again or reach out on WhatsApp.",
  },
  es: {
    pageTitle: "Describa su búsqueda inmobiliaria en Marrakech",
    pageDesc: "Alquiler de larga duración, compra o estancia: describa la propiedad que busca en Marrakech y nuestra agencia le enviará una selección a medida.",
    brandSub: "Inmobiliaria de Excepción",
    prev: "Atrás",
    stepOf: "Paso {current} de 3",
    breadcrumb1: "Inicio / Su proyecto",
    breadcrumb2: "Proyecto / Criterios",
    breadcrumb3: "Criterios / Contacto",
    step1Tag: "Su proyecto en Marrakech",
    step1TitlePrefix: "Encontremos el lugar que ",
    step1TitleHighlight: "mejor le encaja",
    step1Intro: "Unas pocas respuestas bastan para que nuestro equipo seleccione las propiedades más exclusivas adaptadas a sus deseos.",
    step1Nature: "Objetivo de su búsqueda",
    buyTitle: "Comprar",
    buyTag: "Adquisición",
    buyDesc: "Villa señorial, riad en la medina o ático contemporáneo",
    rentTitle: "Alquiler anual",
    rentTag: "Contrato > 1 año",
    rentDesc: "Residencia principal de alto standing amueblada o vacía",
    stayTitle: "Estancia corta",
    stayTag: "Vacaciones",
    stayDesc: "Villa privada con servicios hoteleros exclusivos",
    categoryTitle: "Categoría de propiedad",
    villaTitle: "Villa",
    villaDesc: "Jardín y Piscina",
    aptTitle: "Piso",
    aptDesc: "Terraza, Vistas",
    riadTitle: "Riad",
    riadDesc: "Medina y Oasis",
    btnContinueCriteria: "Continuar a criterios",
    confidentialHint: "Sus criterios permanecen estrictamente confidenciales",
    step2ClassicTitle: "Sus criterios de selección",
    step2ClassicSubtitle: "Defina el marco de su búsqueda para afinar nuestra selección exclusiva.",
    step2StayTitle: "Fechas y estancia",
    step2StaySubtitle: "Indique las fechas deseadas y el número de huéspedes.",
    budgetEstimated: "Presupuesto máximo estimado",
    budgetUnknownBtn: "Por definir",
    budgetSpecifyBtn: "Especificar importe",
    budgetCurrencySuffixSale: "MAD",
    budgetCurrencySuffixRent: "MAD / mes",
    budgetCurrencySuffixStay: "MAD / noche",
    budgetHelperSale: "Aprox. 550.000 € · Importe orientativo",
    budgetHelperRent: "Aprox. 2.300 € / mes · Gastos incluidos",
    bedroomsTitle: "Número de dormitorios deseado",
    bedroomsAll: "Cualquiera",
    districtsTitle: "Zonas preferidas",
    optional: "Opcional",
    datesTitle: "Fechas de su estancia",
    flexibleDates: "Fechas flexibles",
    arrival: "Llegada",
    departure: "Salida",
    guestsTitle: "Número de viajeros",
    guestsSubtitle: "Adultos y niños",
    budgetNightTitle: "Presupuesto estimado por noche",
    accordionTitle: "Preferencias y prestaciones exclusivas",
    notesLabel: "Notas particulares o peticiones especiales",
    notesPlaceholder: "Ej: planta baja indispensable, orientación sur, suite aislada...",
    btnValidateContact: "Continuar a mis datos",
    btnEditType: "← Cambiar tipo de inmueble",
    step3Title: "¿Dónde le enviamos la selección personalizada?",
    step3Subtitle: "Un asesor privado se pondrá en contacto por WhatsApp o llamada según su preferencia.",
    currentSearch: "Búsqueda actual",
    edit: "Modificar",
    nameLabel: "Nombre y Apellidos",
    namePlaceholder: "Ej: Alejandro de Montmirail",
    phoneLabel: "WhatsApp / Teléfono preferido",
    phonePlaceholder: "6 12 34 56 78",
    phoneHelper: "Usado para el envío confidencial de dossieres en PDF y visitas virtuales.",
    emailLabel: "Correo electrónico",
    consentLabel: "Acepto ser contactado únicamente por Live In Marrakech en relación con este proyecto.",
    btnSubmit: "Enviar mi búsqueda",
    btnSubmitting: "Envío seguro en curso...",
    vipWhatsAppLabel: "Contacto directo y confidencial con un asesor:",
    vipWhatsAppLink: "Abrir WhatsApp VIP",
    successTag: "Solicitud enviada con éxito",
    successTitle: "Gracias",
    successSubtitle: "Nuestro director de agencia está analizando sus criterios. Le presentaremos una selección confidencial de inmuebles fuera de mercado.",
    recapTitle: "Resumen",
    recapProject: "Proyecto",
    recapBudget: "Presupuesto máx.",
    recapRoomsDistrict: "Dormitorios / Zona",
    recapContact: "Contacto",
    btnWhatsAppAccelerate: "Acelerar respuesta por WhatsApp",
    btnNewSearch: "Nueva búsqueda inmobiliaria",
    footerConfidential: "100% Confidencial",
    footerOffMarket: "Propiedades Privadas & Off-Market",
    footerLocation: "Guéliz, Marrakech",
    footerCopyright: "© 2026 Live In Marrakech Luxury Real Estate. Todos los derechos reservados.",
    nameError: "Por favor, indique al menos su nombre.",
    phoneError: "Por favor, introduzca un número de teléfono o WhatsApp válido.",
    sendError: "Ha ocurrido un error al enviar. Inténtelo de nuevo o contáctenos por WhatsApp.",
  },
  ar: {
    pageTitle: "حدد بحثك العقاري في مراكش",
    pageDesc: "كراء طويل الأمد أو شراء أو إقامة : حدد مواصفات العقار الذي تبحث عنه في مراكش لنقدم لك خيارات حصرية.",
    brandSub: "عقارات استثنائية",
    prev: "السابق",
    stepOf: "المرحلة {current} من 3",
    breadcrumb1: "الرئيسية / مشروعك",
    breadcrumb2: "المشروع / المعايير",
    breadcrumb3: "المعايير / معلومات الاتصال",
    step1Tag: "مشروعك العقاري في مراكش",
    step1TitlePrefix: "لنبحث عن العقار الذي ",
    step1TitleHighlight: "يناسب تطلعاتك",
    step1Intro: "إجابات بسيطة تتيح لفريقنا اختيار أرقى العقارات التي تتوافق مع متطلباتك الخاصة.",
    step1Nature: "طبيعة طلبك العقاري",
    buyTitle: "شراء",
    buyTag: "تملك",
    buyDesc: "فيلا راقية، رياض عريق في المدينة أو شقة عصرية",
    rentTitle: "كراء سنوي",
    rentTag: "عقد > سنة",
    rentDesc: "سكن رئيسي فاخر، مفروش أو غير مفروش",
    stayTitle: "إقامة قصيرة",
    stayTag: "عطلات",
    stayDesc: "فيلا خاصة مع خدمات فندقية متكاملة",
    categoryTitle: "فئة العقار المطلوب",
    villaTitle: "فيلا",
    villaDesc: "حديقة ومسبح",
    aptTitle: "شقة",
    aptDesc: "شرفة وإطلالة",
    riadTitle: "رياض",
    riadDesc: "المدينة العتيقة",
    btnContinueCriteria: "المتابعة إلى المعايير",
    confidentialHint: "معلوماتك ومعاييرك تظل سرية تماماً",
    step2ClassicTitle: "معايير الاختيار",
    step2ClassicSubtitle: "حدد ملامح طلبك لنقدم لك أفضل الخيارات الحصرية.",
    step2StayTitle: "تفاصيل الإقامة والتواريخ",
    step2StaySubtitle: "حدد الفترة المفضلة وعدد الضيوف.",
    budgetEstimated: "الميزانية القصوى التقديرية",
    budgetUnknownBtn: "غير محدد بعد",
    budgetSpecifyBtn: "تحديد المبلغ",
    budgetCurrencySuffixSale: "درهم",
    budgetCurrencySuffixRent: "درهم / شهر",
    budgetCurrencySuffixStay: "درهم / ليلة",
    budgetHelperSale: "حوالي 550,000 يورو · مبلغ تقريبي",
    budgetHelperRent: "حوالي 2,300 يورو / شهر · شامل المصاريف",
    bedroomsTitle: "عدد الغرف المطلوب",
    bedroomsAll: "الكل",
    districtsTitle: "الأحياء المفضلة",
    optional: "اختياري",
    datesTitle: "تواريخ الإقامة",
    flexibleDates: "تواريخ مرنة",
    arrival: "الوصول",
    departure: "المغادرة",
    guestsTitle: "عدد النزلاء",
    guestsSubtitle: "بالغين وأطفال",
    budgetNightTitle: "الميزانية التقديرية لكل ليلة",
    accordionTitle: "تفضيلات وخدمات استثنائية",
    notesLabel: "ملاحظات أو طلبات خاصة",
    notesPlaceholder: "مثال: طابق أرضي، واجهة جنوبية، جناح رئيسي مستقل...",
    btnValidateContact: "تأكيد والانتقال للمعلومات",
    btnEditType: "← تعديل نوع العقار",
    step3Title: "أين ترغب في استلام الخيارات المقترحة؟",
    step3Subtitle: "سيتواصل معك مستشار خاص عبر واتساب أو الهاتف حسب رغبتك.",
    currentSearch: "طلبك الحالي",
    edit: "تعديل",
    nameLabel: "الاسم واللقب",
    namePlaceholder: "مثال: محمد بناني",
    phoneLabel: "رقم واتساب أو الهاتف",
    phonePlaceholder: "6 12 34 56 78",
    phoneHelper: "نستخدمه لإرسال ملفات العقارات والجولات الافتراضية بسرية.",
    emailLabel: "البريد الإلكتروني",
    consentLabel: "أوافق على التواصل معي حصرياً من طرف Live In Marrakech بشأن هذا الطلب.",
    btnSubmit: "إرسال طلبي العقاري",
    btnSubmitting: "جارٍ الإرسال بأمان...",
    vipWhatsAppLabel: "تواصل مباشر مع مستشار عبر واتساب:",
    vipWhatsAppLink: "فتح واتساب VIP",
    successTag: "تم إرسال الطلب بنجاح",
    successTitle: "شكراً لك",
    successSubtitle: "يقوم مدير وكالتنا بدراسة معاييرك الآن، وسيقترح عليك قريباً مجموعة حصرية من العقارات غير المعروضة للعموم.",
    recapTitle: "ملخص الطلب",
    recapProject: "المشروع",
    recapBudget: "الميزانية القصوى",
    recapRoomsDistrict: "الغرف / الحي",
    recapContact: "الاتصال",
    btnWhatsAppAccelerate: "تسريع الرد عبر واتساب",
    btnNewSearch: "بحث عقاري جديد",
    footerConfidential: "سرية تامة 100%",
    footerOffMarket: "عقارات حصرية وخاصة",
    footerLocation: "جليز، مراكش",
    footerCopyright: "© 2026 Live In Marrakech Luxury Real Estate. جميع الحقوق محفوظة.",
    nameError: "يرجى إدخال اسمك لنعرف كيف نخاطبك.",
    phoneError: "يرجى إدخال رقم هاتف أو واتساب صحيح.",
    sendError: "حدث خطأ أثناء الإرسال. يرجى المحاولة مرة أخرى أو مراسلتنا عبر واتساب.",
  },
} as const;

export default function PropertyRequest() {
  const { lang, lp } = useLocalePath();
  const tL = useLocalizedText();

  // Language state initialized from URL prefix
  const [language, setLanguage] = useState<Language>(lang);
  const t = copy[language];
  const rtl = language === "ar";

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [loading, setLoading] = useState(false);
  const [preferencesOpen, setPreferencesOpen] = useState(false);
  const [leadRef, setLeadRef] = useState<string>("884");

  const [errors, setErrors] = useState<{ name?: boolean; phone?: boolean }>({});

  const [form, setForm] = useState<FormState>({
    projectType: "achat",
    propertyType: "villa",
    budgetValue: "6 000 000",
    isBudgetUnknown: false,
    bedrooms: "3",
    district: DISTRICT_OPTIONS[0],
    stayArrival: "",
    stayDeparture: "",
    stayFlexibleDates: false,
    stayGuests: 4,
    stayBudgetNight: "4 500",
    selectedTags: [],
    notes: "",
    name: "",
    phonePrefix: "+33",
    phone: "",
    email: "",
    consent: true,
    website: "",
  });

  const updateForm = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSelectProjectType = (type: ProjectType) => {
    updateForm("projectType", type);
    if (type === "longue_duree") {
      updateForm("budgetValue", "25 000");
    } else if (type === "achat") {
      updateForm("budgetValue", "6 000 000");
    }
  };

  const togglePrestationTag = (tag: string) => {
    setForm((prev) => {
      const exists = prev.selectedTags.includes(tag);
      return {
        ...prev,
        selectedTags: exists
          ? prev.selectedTags.filter((t) => t !== tag)
          : [...prev.selectedTags, tag],
      };
    });
  };

  const toggleUnknownBudget = () => {
    if (form.isBudgetUnknown) {
      updateForm("isBudgetUnknown", false);
      updateForm("budgetValue", form.projectType === "longue_duree" ? "25 000" : "6 000 000");
    } else {
      updateForm("isBudgetUnknown", true);
      updateForm("budgetValue", "");
    }
  };

  const goToStep = (targetStep: 1 | 2 | 3 | 4) => {
    setStep(targetStep);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handlePrevStep = () => {
    if (step > 1) {
      goToStep((step - 1) as 1 | 2 | 3);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.website || loading) return;

    // Validation
    const nameValid = form.name.trim().length >= 2;
    const cleanDigits = form.phone.replace(/\D/g, "");
    const phoneValid = cleanDigits.length >= 6;

    setErrors({
      name: !nameValid,
      phone: !phoneValid,
    });

    if (!nameValid) {
      toast.error(t.nameError);
      return;
    }
    if (!phoneValid) {
      toast.error(t.phoneError);
      return;
    }

    setLoading(true);

    const generatedRef = String(Math.floor(100 + Math.random() * 900));
    setLeadRef(generatedRef);

    // Map intent to database transaction_type
    const dbIntent =
      form.projectType === "court_sejour"
        ? "location-courte-duree"
        : form.projectType === "longue_duree"
        ? "location-longue-duree"
        : "vente";

    // Build comprehensive notes field
    const notesParts: string[] = [];
    if (form.projectType === "court_sejour") {
      notesParts.push(`Séjour : ${form.stayGuests} voyageurs.`);
      if (form.stayArrival || form.stayDeparture) {
        notesParts.push(`Dates: ${form.stayArrival || "?"} au ${form.stayDeparture || "?"}${form.stayFlexibleDates ? " (dates flexibles)" : ""}`);
      }
      if (form.stayBudgetNight) {
        notesParts.push(`Budget nuit: ${form.stayBudgetNight} MAD`);
      }
    }
    if (form.district && form.district !== DISTRICT_OPTIONS[0]) {
      notesParts.push(`Secteur souhaité: ${form.district}`);
    }
    if (form.selectedTags.length > 0) {
      notesParts.push(`Prestations: ${form.selectedTags.join(", ")}`);
    }
    if (form.notes.trim()) {
      notesParts.push(`Demandes: ${form.notes.trim()}`);
    }
    notesParts.push(`Réf: LIM-${generatedRef}`);

    const numericBudget = form.budgetValue
      ? Number(form.budgetValue.replace(/\D/g, "")) || null
      : null;

    const payload = {
      name: form.name.trim(),
      phone: `${form.phonePrefix} ${form.phone.trim()}`,
      email: form.email.trim() || null,
      source: "Site web",
      transaction_type: dbIntent,
      property_types: [form.propertyType],
      budget_min: null,
      budget_max: numericBudget,
      preferred_areas: form.district && form.district !== DISTRICT_OPTIONS[0] ? [form.district.split(" ")[0]] : [],
      bedrooms_min: form.bedrooms === "Indifférent" ? null : form.bedrooms === "4+" ? 4 : Number(form.bedrooms) || null,
      furnishing: "any" as const,
      available_from: form.stayArrival || null,
      reference_location: null,
      max_distance_km: null,
      profession: null,
      client_profile: form.projectType === "court_sejour" ? `${form.stayGuests} personnes` : null,
      notes: notesParts.length ? notesParts.join(" | ") : null,
      status: "nouveau",
      created_by: null,
    };

    try {
      const { error } = await insertWithOrigin("client_leads", payload);
      if (error) {
        toast.error(t.sendError);
      } else {
        goToStep(4);
      }
    } catch {
      toast.error(t.sendError);
    } finally {
      setLoading(false);
    }
  };

  // Summary labels for Step 3
  const getProjectLabel = () => {
    if (form.projectType === "achat") return t.buyTitle;
    if (form.projectType === "longue_duree") return t.rentTitle;
    return t.stayTitle;
  };

  const getPropertyLabel = () => {
    if (form.propertyType === "villa") return t.villaTitle;
    if (form.propertyType === "appartement") return t.aptTitle;
    return t.riadTitle;
  };

  const getSummaryText = () => {
    const proj = getProjectLabel();
    const prop = getPropertyLabel();
    if (form.projectType === "court_sejour") {
      return `${proj} ${prop} · ${form.stayGuests} ${t.guestsTitle.toLowerCase()} · Marrakech`;
    }
    const bgt = form.isBudgetUnknown ? t.budgetUnknownBtn : `${form.budgetValue} MAD`;
    return `${proj} ${prop} · ${bgt} · ${form.bedrooms} ch.`;
  };

  const whatsappAccelerateMsg = encodeURIComponent(
    language === "ar"
      ? `السلام عليكم، أنا ${form.name.trim() || ""}. لقد أرسلت طلباً بخصوص ${getProjectLabel()} ${getPropertyLabel()} في مراكش (المرجع: LIM-${leadRef}).`
      : language === "en"
      ? `Hello Live In Marrakech, I am ${form.name.trim() || ""}. I just submitted an inquiry for: ${getProjectLabel()} ${getPropertyLabel()} in Marrakech (Ref: LIM-${leadRef}).`
      : language === "es"
      ? `Hola Live In Marrakech, soy ${form.name.trim() || ""}. Acabo de enviar una búsqueda para: ${getProjectLabel()} ${getPropertyLabel()} en Marrakech (Ref: LIM-${leadRef}).`
      : `Bonjour Live In Marrakech, je suis ${form.name.trim() || ""}. Je viens d'envoyer une recherche pour : ${getProjectLabel()} ${getPropertyLabel()} à Marrakech (Réf: LIM-${leadRef}).`
  );

  const crumbs = [
    { name: tL("Accueil", "Home", "Inicio"), path: lp("/") },
    { name: tL("Ma recherche", "My search", "Mi búsqueda"), path: lp("/demande") },
  ];

  return (
    <div className="request-page-v2 selection:bg-[#1A1A1A] selection:text-white flex flex-col justify-between" lang={language} dir={rtl ? "rtl" : "ltr"}>
      <SEOHead
        withBrand={false}
        title={t.pageTitle}
        description={t.pageDesc}
        schema={breadcrumbJsonLd(crumbs)}
      />

      {/* Main Luxury Container */}
      <main className="w-full max-w-lg mx-auto min-h-screen sm:min-h-[92vh] sm:my-6 bg-[#FFFFFF] sm:rounded-[28px] sm:shadow-2xl border-x sm:border border-[#E2DDD4] flex flex-col relative overflow-hidden">
        {/* Sticky Header with Stepper */}
        <header className="pt-6 sm:pt-6 pb-4 px-5 sm:px-8 border-b border-[#E2DDD4] bg-[#FFFFFF]/90 backdrop-blur-md sticky top-0 z-30">
          <div className="flex items-center justify-between">
            {/* Brand Logo & Tagline */}
            <Link to={lp("/")} aria-label="Live In Marrakech" className="inline-flex flex-col group focus:outline-none">
              <span className="font-serif-luxury text-[22px] tracking-tight font-semibold text-[#111111] group-hover:text-[#9A6C48] transition-colors">
                Live In Marrakech
              </span>
              <span className="text-[9px] tracking-[0.24em] uppercase text-[#73716E] -mt-1 font-medium">
                {t.brandSub}
              </span>
            </Link>

            {/* Language Switcher & Direct WhatsApp VIP Link */}
            <div className="flex items-center gap-2">
              <div className="bg-[#FAF8F5] p-0.5 rounded-full flex items-center border border-[#E2DDD4] text-[11px] font-semibold text-[#4A4A48]">
                {(["fr", "en", "es", "ar"] as const).map((code) => (
                  <button
                    key={code}
                    type="button"
                    onClick={() => setLanguage(code)}
                    className={`px-2 py-0.5 rounded-full transition-all ${
                      language === code
                        ? "bg-[#1A1A1A] text-white shadow-sm"
                        : "text-[#73716E] hover:text-[#1A1A1A]"
                    }`}
                  >
                    {code.toUpperCase()}
                  </button>
                ))}
              </div>

              {/* VIP WhatsApp instant direct button */}
              <a
                href="https://wa.me/212605387041?text=Bonjour,%20je%20souhaite%20des%20renseignements%20pour%20un%20bien%20à%20Marrakech"
                target="_blank"
                rel="noopener noreferrer"
                title="Conseiller WhatsApp direct"
                aria-label="WhatsApp VIP"
                className="w-8 h-8 rounded-full bg-[#EBF9F0] border border-[#C7EDD2] text-[#1EBE5D] flex items-center justify-center hover:bg-[#25D366] hover:text-white transition-all shadow-sm"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.976.532 1.943.924 3.15.924 3.182 0 5.767-2.587 5.767-5.766.001-3.187-2.575-5.766-5.768-5.766zm0 10.375c-1.07 0-1.936-.312-2.766-.807l-.2-.119-1.341.352.358-1.309-.131-.209c-.544-.867-.831-1.688-.83-2.526 0-2.54 2.067-4.607 4.61-4.607 2.541 0 4.609 2.067 4.609 4.607 0 2.542-2.068 4.611-4.61 4.611zm7.969-4.609c0 4.418-3.582 8-8 8-1.42 0-2.756-.372-3.921-1.02l-4.079 1.07 1.089-3.985c-.718-1.208-1.139-2.616-1.139-4.115 0-4.418 3.582-8 8-8s8 3.582 8 8z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Stepper Progress Bar & Breadcrumbs (Steps 1 to 3) */}
          {step < 4 && (
            <div className="mt-4 pt-3 border-t border-[#F2EEE8]">
              <div className="flex items-center justify-between text-xs mb-2">
                <div className="flex items-center gap-1.5 text-[#73716E]">
                  {step > 1 ? (
                    <button
                      type="button"
                      onClick={handlePrevStep}
                      className="inline-flex items-center gap-1 text-[#1A1A1A] hover:text-[#4A4A48] font-medium transition-colors"
                    >
                      {rtl ? <ArrowRight size={14} /> : <ArrowLeft size={14} />}
                      <span>{t.prev}</span>
                    </button>
                  ) : (
                    <span className="text-[12px] text-[#4A4A48] font-medium tracking-wide">
                      {t.breadcrumb1}
                    </span>
                  )}
                  {step > 1 && (
                    <span className="text-[12px] text-[#4A4A48] font-medium tracking-wide">
                      · {step === 2 ? t.breadcrumb2 : t.breadcrumb3}
                    </span>
                  )}
                </div>
                <span className="text-[11px] font-semibold text-[#1A1A1A] bg-[#FAF8F5] border border-[#E2DDD4] px-2.5 py-0.5 rounded-full">
                  {t.stepOf.replace("{current}", String(step))}
                </span>
              </div>
              <div className="w-full bg-[#EFECE5] h-1.5 rounded-full overflow-hidden flex">
                <div
                  className="bg-[#1A1A1A] h-full transition-all duration-300 ease-out rounded-full"
                  style={{
                    width: step === 1 ? "33.33%" : step === 2 ? "66.66%" : "100%",
                  }}
                />
              </div>
            </div>
          )}
        </header>

        {/* Content Section */}
        <div className="flex-1 p-5 sm:p-8 overflow-y-auto bg-[#FAF8F5] custom-scrollbar">
          {/* ========================================== */}
          {/* STEP 1: VOTRE PROJET                       */}
          {/* ========================================== */}
          {step === 1 && (
            <section className="space-y-6">
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFFFFF] text-[#4A4A48] border border-[#E2DDD4] text-[11px] font-semibold tracking-wider uppercase mb-3">
                  <svg className="w-3.5 h-3.5 text-[#1A1A1A]" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                    <path d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {t.step1Tag}
                </span>
                <h1 className="font-serif-luxury text-2xl sm:text-3xl text-[#111111] leading-snug font-medium">
                  {t.step1TitlePrefix}
                  <span className="italic font-serif-luxury text-[#9A6C48]">{t.step1TitleHighlight}</span>.
                </h1>
                <p className="text-sm text-[#4A4A48] mt-2 leading-relaxed">
                  {t.step1Intro}
                </p>
              </div>

              {/* 1.1 Type de Projet Selection */}
              <fieldset className="space-y-3">
                <legend className="text-xs uppercase font-bold tracking-wider text-[#73716E] flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-[#1A1A1A] text-white text-[10px] inline-flex items-center justify-center font-bold">1</span>
                  {t.step1Nature}
                </legend>
                <div className="grid grid-cols-1 gap-2.5">
                  {/* Option Acheter */}
                  <label
                    onClick={() => handleSelectProjectType("achat")}
                    className={`relative flex items-center p-3.5 sm:p-4 rounded-2xl border cursor-pointer transition-luxury shadow-sm ${
                      form.projectType === "achat"
                        ? "border-[#1A1A1A] bg-[#FFFFFF] shadow-md ring-1 ring-[#1A1A1A]"
                        : "border-[#E2DDD4] bg-[#FFFFFF] hover:border-[#1A1A1A]/40"
                    }`}
                  >
                    <input
                      type="radio"
                      name="project_type"
                      checked={form.projectType === "achat"}
                      onChange={() => handleSelectProjectType("achat")}
                      className="sr-only"
                    />
                    <div
                      className={`w-11 h-11 rounded-xl flex items-center justify-center mr-3.5 shrink-0 transition-colors ${
                        form.projectType === "achat" ? "bg-[#1A1A1A] text-white" : "bg-[#F5F3EE] text-[#4A4A48]"
                      }`}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                        <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-serif-luxury text-base font-semibold text-[#111111]">{t.buyTitle}</span>
                        <span className="text-xs text-[#111111] font-semibold bg-[#FAF8F5] border border-[#E2DDD4] px-2 py-0.5 rounded-full">{t.buyTag}</span>
                      </div>
                      <p className="text-xs text-[#4A4A48] mt-0.5">{t.buyDesc}</p>
                    </div>
                    <div
                      className={`ml-2 w-5 h-5 rounded-full border flex items-center justify-center text-xs transition-opacity ${
                        form.projectType === "achat"
                          ? "opacity-100 border-[#1A1A1A] bg-[#1A1A1A] text-white"
                          : "opacity-0 border-[#DCD6CC]"
                      }`}
                    >
                      ✓
                    </div>
                  </label>

                  {/* Option Louer Longue Durée */}
                  <label
                    onClick={() => handleSelectProjectType("longue_duree")}
                    className={`relative flex items-center p-3.5 sm:p-4 rounded-2xl border cursor-pointer transition-luxury shadow-sm ${
                      form.projectType === "longue_duree"
                        ? "border-[#1A1A1A] bg-[#FFFFFF] shadow-md ring-1 ring-[#1A1A1A]"
                        : "border-[#E2DDD4] bg-[#FFFFFF] hover:border-[#1A1A1A]/40"
                    }`}
                  >
                    <input
                      type="radio"
                      name="project_type"
                      checked={form.projectType === "longue_duree"}
                      onChange={() => handleSelectProjectType("longue_duree")}
                      className="sr-only"
                    />
                    <div
                      className={`w-11 h-11 rounded-xl flex items-center justify-center mr-3.5 shrink-0 transition-colors ${
                        form.projectType === "longue_duree" ? "bg-[#1A1A1A] text-white" : "bg-[#F5F3EE] text-[#4A4A48]"
                      }`}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                        <path d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-serif-luxury text-base font-semibold text-[#111111]">{t.rentTitle}</span>
                        <span className="text-xs text-[#73716E] bg-[#FAF8F5] px-2 py-0.5 rounded-full border border-[#E2DDD4]">{t.rentTag}</span>
                      </div>
                      <p className="text-xs text-[#4A4A48] mt-0.5">{t.rentDesc}</p>
                    </div>
                    <div
                      className={`ml-2 w-5 h-5 rounded-full border flex items-center justify-center text-xs transition-opacity ${
                        form.projectType === "longue_duree"
                          ? "opacity-100 border-[#1A1A1A] bg-[#1A1A1A] text-white"
                          : "opacity-0 border-[#DCD6CC]"
                      }`}
                    >
                      ✓
                    </div>
                  </label>

                  {/* Option Séjour & Vacances */}
                  <label
                    onClick={() => handleSelectProjectType("court_sejour")}
                    className={`relative flex items-center p-3.5 sm:p-4 rounded-2xl border cursor-pointer transition-luxury shadow-sm ${
                      form.projectType === "court_sejour"
                        ? "border-[#1A1A1A] bg-[#FFFFFF] shadow-md ring-1 ring-[#1A1A1A]"
                        : "border-[#E2DDD4] bg-[#FFFFFF] hover:border-[#1A1A1A]/40"
                    }`}
                  >
                    <input
                      type="radio"
                      name="project_type"
                      checked={form.projectType === "court_sejour"}
                      onChange={() => handleSelectProjectType("court_sejour")}
                      className="sr-only"
                    />
                    <div
                      className={`w-11 h-11 rounded-xl flex items-center justify-center mr-3.5 shrink-0 transition-colors ${
                        form.projectType === "court_sejour" ? "bg-[#1A1A1A] text-white" : "bg-[#F5F3EE] text-[#4A4A48]"
                      }`}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                        <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-serif-luxury text-base font-semibold text-[#111111]">{t.stayTitle}</span>
                        <span className="text-xs text-[#4A4A48] font-medium bg-[#FAF8F5] px-2 py-0.5 rounded-full border border-[#E2DDD4]">{t.stayTag}</span>
                      </div>
                      <p className="text-xs text-[#4A4A48] mt-0.5">{t.stayDesc}</p>
                    </div>
                    <div
                      className={`ml-2 w-5 h-5 rounded-full border flex items-center justify-center text-xs transition-opacity ${
                        form.projectType === "court_sejour"
                          ? "opacity-100 border-[#1A1A1A] bg-[#1A1A1A] text-white"
                          : "opacity-0 border-[#DCD6CC]"
                      }`}
                    >
                      ✓
                    </div>
                  </label>
                </div>
              </fieldset>

              {/* 1.2 Catégorie de Bien Selection */}
              <fieldset className="space-y-3 pt-2">
                <legend className="text-xs uppercase font-bold tracking-wider text-[#73716E] flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-[#FAF8F5] border border-[#E2DDD4] text-[#111111] text-[10px] inline-flex items-center justify-center font-bold">2</span>
                  {t.categoryTitle}
                </legend>
                <div className="grid grid-cols-3 gap-2.5">
                  {/* Villa */}
                  <label
                    onClick={() => updateForm("propertyType", "villa")}
                    className={`flex flex-col items-center justify-center p-3 rounded-2xl border cursor-pointer text-center transition-luxury ${
                      form.propertyType === "villa"
                        ? "border-[#1A1A1A] bg-[#FFFFFF] shadow-sm ring-1 ring-[#1A1A1A]"
                        : "border-[#E2DDD4] bg-[#FFFFFF] hover:border-[#1A1A1A]/40"
                    }`}
                  >
                    <input
                      type="radio"
                      name="property_type"
                      checked={form.propertyType === "villa"}
                      onChange={() => updateForm("propertyType", "villa")}
                      className="sr-only"
                    />
                    <div
                      className={`w-9 h-9 mb-1.5 flex items-center justify-center rounded-xl ${
                        form.propertyType === "villa" ? "bg-[#1A1A1A] text-white" : "bg-[#FAF8F5] text-[#4A4A48]"
                      }`}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24">
                        <path d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <span className="text-xs font-semibold text-[#111111]">{t.villaTitle}</span>
                    <span className="text-[10px] text-[#73716E] mt-0.5">{t.villaDesc}</span>
                  </label>

                  {/* Appartement */}
                  <label
                    onClick={() => updateForm("propertyType", "appartement")}
                    className={`flex flex-col items-center justify-center p-3 rounded-2xl border cursor-pointer text-center transition-luxury ${
                      form.propertyType === "appartement"
                        ? "border-[#1A1A1A] bg-[#FFFFFF] shadow-sm ring-1 ring-[#1A1A1A]"
                        : "border-[#E2DDD4] bg-[#FFFFFF] hover:border-[#1A1A1A]/40"
                    }`}
                  >
                    <input
                      type="radio"
                      name="property_type"
                      checked={form.propertyType === "appartement"}
                      onChange={() => updateForm("propertyType", "appartement")}
                      className="sr-only"
                    />
                    <div
                      className={`w-9 h-9 mb-1.5 flex items-center justify-center rounded-xl ${
                        form.propertyType === "appartement" ? "bg-[#1A1A1A] text-white" : "bg-[#FAF8F5] text-[#4A4A48]"
                      }`}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24">
                        <path d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6h1.5m-1.5 3h1.5m-1.5 3h1.5M9 21v-3.75a.75.75 0 01.75-.75h4.5a.75.75 0 01.75.75V21" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <span className="text-xs font-semibold text-[#111111]">{t.aptTitle}</span>
                    <span className="text-[10px] text-[#73716E] mt-0.5">{t.aptDesc}</span>
                  </label>

                  {/* Riad */}
                  <label
                    onClick={() => updateForm("propertyType", "riad")}
                    className={`flex flex-col items-center justify-center p-3 rounded-2xl border cursor-pointer text-center transition-luxury ${
                      form.propertyType === "riad"
                        ? "border-[#1A1A1A] bg-[#FFFFFF] shadow-sm ring-1 ring-[#1A1A1A]"
                        : "border-[#E2DDD4] bg-[#FFFFFF] hover:border-[#1A1A1A]/40"
                    }`}
                  >
                    <input
                      type="radio"
                      name="property_type"
                      checked={form.propertyType === "riad"}
                      onChange={() => updateForm("propertyType", "riad")}
                      className="sr-only"
                    />
                    <div
                      className={`w-9 h-9 mb-1.5 flex items-center justify-center rounded-xl ${
                        form.propertyType === "riad" ? "bg-[#1A1A1A] text-white" : "bg-[#FAF8F5] text-[#4A4A48]"
                      }`}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24">
                        <path d="M12 2.25L3 7.5v13.5h18V7.5L12 2.25zM12 7.5a4.5 4.5 0 00-4.5 4.5v7.5h9v-7.5A4.5 4.5 0 0012 7.5z" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <span className="text-xs font-semibold text-[#111111]">{t.riadTitle}</span>
                    <span className="text-[10px] text-[#73716E] mt-0.5">{t.riadDesc}</span>
                  </label>
                </div>
              </fieldset>

              {/* Continue CTA */}
              <div className="pt-4">
                <button
                  type="button"
                  onClick={() => goToStep(2)}
                  className="w-full h-13 py-3.5 px-6 rounded-2xl bg-[#1A1A1A] hover:bg-[#2D2D2D] active:scale-[0.99] text-white font-medium text-base shadow-lg shadow-black/15 flex items-center justify-center gap-2 transition-luxury"
                >
                  <span>{t.btnContinueCriteria}</span>
                  {rtl ? <ArrowLeft size={16} /> : <ArrowRight size={16} />}
                </button>
                <div className="flex items-center justify-center gap-1.5 text-xs text-[#73716E] mt-3">
                  <ShieldCheck size={14} className="text-[#4A4A48]" />
                  <span>{t.confidentialHint}</span>
                </div>
              </div>
            </section>
          )}

          {/* ========================================== */}
          {/* STEP 2: VOS CRITÈRES                       */}
          {/* ========================================== */}
          {step === 2 && (
            <section className="space-y-6">
              <div>
                <span className="text-xs uppercase font-bold tracking-wider text-[#73716E]">
                  {t.stepOf.replace("{current}", "2")}
                </span>
                <h2 className="font-serif-luxury text-2xl sm:text-3xl text-[#111111] leading-snug font-medium mt-0.5">
                  {form.projectType === "court_sejour" ? t.step2StayTitle : t.step2ClassicTitle}
                </h2>
                <p className="text-sm text-[#4A4A48] mt-1">
                  {form.projectType === "court_sejour" ? t.step2StaySubtitle : t.step2ClassicSubtitle}
                </p>
              </div>

              {/* Classic Group (Achat / Longue Durée) */}
              {form.projectType !== "court_sejour" ? (
                <div className="space-y-5">
                  {/* Budget Selector */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs uppercase font-bold tracking-wider text-[#73716E]">
                        {t.budgetEstimated}
                      </label>
                      <button
                        type="button"
                        onClick={toggleUnknownBudget}
                        className="text-xs text-[#111111] hover:underline font-semibold"
                      >
                        {form.isBudgetUnknown ? t.budgetSpecifyBtn : t.budgetUnknownBtn}
                      </button>
                    </div>

                    {/* Predefined Quick Pills */}
                    {!form.isBudgetUnknown && (
                      <div className="grid grid-cols-4 gap-1.5 text-xs">
                        {(form.projectType === "longue_duree"
                          ? ["15 000", "25 000", "45 000", "70 000+"]
                          : ["3 000 000", "6 000 000", "10 000 000", "15 000 000+"]
                        ).map((pillVal) => {
                          const active = form.budgetValue === pillVal;
                          const display =
                            form.projectType === "longue_duree"
                              ? pillVal.replace(" 000", "k MAD")
                              : pillVal.replace(" 000 000", "M MAD");
                          return (
                            <button
                              key={pillVal}
                              type="button"
                              onClick={() => updateForm("budgetValue", pillVal)}
                              className={`py-2 px-1 rounded-xl border text-center font-semibold transition-luxury ${
                                active
                                  ? "border-[#1A1A1A] bg-[#1A1A1A] text-white"
                                  : "border-[#E2DDD4] bg-[#FFFFFF] text-[#111111] hover:border-[#1A1A1A]"
                              }`}
                            >
                              {display}
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {/* Custom Budget Input */}
                    <div className="relative mt-2">
                      <input
                        type="text"
                        disabled={form.isBudgetUnknown}
                        value={form.isBudgetUnknown ? t.budgetUnknownBtn : form.budgetValue}
                        onChange={(e) => updateForm("budgetValue", e.target.value)}
                        placeholder="Ex: 5 500 000"
                        className={`w-full h-12 rounded-xl border border-[#DCD6CC] px-3.5 pr-24 text-[#111111] font-medium focus:border-[#1A1A1A] focus:ring-1 focus:ring-[#1A1A1A] transition-colors ${
                          form.isBudgetUnknown ? "bg-[#FAF8F5] opacity-60 cursor-not-allowed" : "bg-[#FFFFFF]"
                        }`}
                      />
                      <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-[#4A4A48] uppercase tracking-wider bg-[#FAF8F5] border border-[#E2DDD4] px-2 py-1 rounded-md">
                        {form.projectType === "longue_duree" ? t.budgetCurrencySuffixRent : t.budgetCurrencySuffixSale}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#73716E] italic">
                      {form.projectType === "longue_duree" ? t.budgetHelperRent : t.budgetHelperSale}
                    </p>
                  </div>

                  {/* Chambres Selector */}
                  <div className="space-y-2">
                    <label className="text-xs uppercase font-bold tracking-wider text-[#73716E]">
                      {t.bedroomsTitle}
                    </label>
                    <div className="grid grid-cols-5 gap-2">
                      {(["1", "2", "3", "4+", "Indifférent"] as const).map((count) => {
                        const active = form.bedrooms === count;
                        return (
                          <label
                            key={count}
                            onClick={() => updateForm("bedrooms", count)}
                            className={`flex items-center justify-center h-12 rounded-xl border cursor-pointer font-semibold text-sm transition-luxury ${
                              active
                                ? "border-[#1A1A1A] bg-[#1A1A1A] text-white"
                                : "border-[#E2DDD4] bg-[#FFFFFF] text-[#111111] hover:border-[#1A1A1A]"
                            }`}
                          >
                            <input
                              type="radio"
                              name="bedrooms"
                              checked={active}
                              onChange={() => updateForm("bedrooms", count)}
                              className="sr-only"
                            />
                            <span>{count === "Indifférent" ? t.bedroomsAll : count}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {/* Secteur Préférentiel */}
                  <div className="space-y-2">
                    <label className="text-xs uppercase font-bold tracking-wider text-[#73716E] flex items-center justify-between">
                      <span>{t.districtsTitle}</span>
                      <span className="text-[11px] font-normal text-[#73716E]">{t.optional}</span>
                    </label>
                    <select
                      value={form.district}
                      onChange={(e) => updateForm("district", e.target.value)}
                      className="w-full h-12 rounded-xl border border-[#DCD6CC] bg-[#FFFFFF] px-3.5 pr-8 text-[#111111] text-sm focus:border-[#1A1A1A] focus:ring-1 focus:ring-[#1A1A1A]"
                    >
                      {DISTRICT_OPTIONS.map((dist) => (
                        <option key={dist} value={dist}>
                          {dist}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              ) : (
                /* Stay Group (Séjourner) */
                <div className="space-y-5">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs uppercase font-bold tracking-wider text-[#73716E]">
                        {t.datesTitle}
                      </label>
                      <label className="flex items-center gap-1.5 text-xs text-[#4A4A48] cursor-pointer">
                        <input
                          type="checkbox"
                          checked={form.stayFlexibleDates}
                          onChange={(e) => updateForm("stayFlexibleDates", e.target.checked)}
                          className="rounded border-[#DCD6CC] text-[#1A1A1A] focus:ring-[#1A1A1A]"
                        />
                        <span>{t.flexibleDates}</span>
                      </label>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-[11px] text-[#73716E] block mb-1">{t.arrival}</span>
                        <input
                          type="date"
                          value={form.stayArrival}
                          onChange={(e) => updateForm("stayArrival", e.target.value)}
                          className="w-full h-11 rounded-xl border border-[#DCD6CC] bg-[#FFFFFF] px-3 text-xs text-[#111111]"
                        />
                      </div>
                      <div>
                        <span className="text-[11px] text-[#73716E] block mb-1">{t.departure}</span>
                        <input
                          type="date"
                          value={form.stayDeparture}
                          onChange={(e) => updateForm("stayDeparture", e.target.value)}
                          className="w-full h-11 rounded-xl border border-[#DCD6CC] bg-[#FFFFFF] px-3 text-xs text-[#111111]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Nombre de voyageurs */}
                  <div className="flex items-center justify-between p-3.5 rounded-xl border border-[#E2DDD4] bg-[#FFFFFF]">
                    <div>
                      <span className="text-sm font-semibold text-[#111111] block">{t.guestsTitle}</span>
                      <span className="text-xs text-[#4A4A48]">{t.guestsSubtitle}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => updateForm("stayGuests", Math.max(1, form.stayGuests - 1))}
                        className="w-8 h-8 rounded-full border border-[#DCD6CC] text-[#111111] flex items-center justify-center hover:bg-[#FAF8F5] font-bold"
                      >
                        -
                      </button>
                      <span className="w-6 text-center font-bold text-[#111111]">{form.stayGuests}</span>
                      <button
                        type="button"
                        onClick={() => updateForm("stayGuests", Math.min(30, form.stayGuests + 1))}
                        className="w-8 h-8 rounded-full border border-[#DCD6CC] text-[#111111] flex items-center justify-center hover:bg-[#FAF8F5] font-bold"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Budget par nuit */}
                  <div className="space-y-1.5">
                    <label className="text-xs uppercase font-bold tracking-wider text-[#73716E]">
                      {t.budgetNightTitle}
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={form.stayBudgetNight}
                        onChange={(e) => updateForm("stayBudgetNight", e.target.value)}
                        className="w-full h-11 rounded-xl border border-[#DCD6CC] bg-[#FFFFFF] px-3 pr-28 text-[#111111] font-medium"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-[#4A4A48] uppercase bg-[#FAF8F5] px-2 py-1 rounded border border-[#E2DDD4]">
                        {t.budgetCurrencySuffixStay}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Accordion: Prestations Exclusives */}
              <div className="border border-[#E2DDD4] rounded-2xl overflow-hidden bg-[#FFFFFF]">
                <button
                  type="button"
                  onClick={() => setPreferencesOpen(!preferencesOpen)}
                  className="w-full p-4 text-left flex items-center justify-between hover:bg-[#FAF8F5] transition-colors focus:outline-none"
                >
                  <span className="flex items-center gap-2 text-xs uppercase font-bold tracking-wider text-[#111111]">
                    <span className="text-[#9A6C48]">✦</span> {t.accordionTitle}
                  </span>
                  <ChevronDown
                    size={16}
                    className={`text-[#73716E] transition-transform duration-200 ${
                      preferencesOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {preferencesOpen && (
                  <div className="px-4 pb-4 space-y-3">
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {PRESTATIONS_CHIPS.map((chip) => {
                        const active = form.selectedTags.includes(chip);
                        return (
                          <button
                            key={chip}
                            type="button"
                            onClick={() => togglePrestationTag(chip)}
                            className={`px-3 py-1.5 rounded-full border text-xs transition-colors ${
                              active
                                ? "border-[#1A1A1A] bg-[#1A1A1A] text-white"
                                : "border-[#DCD6CC] bg-[#FAF8F5] text-[#111111] hover:border-[#1A1A1A]"
                            }`}
                          >
                            {chip}
                          </button>
                        );
                      })}
                    </div>
                    <div>
                      <label className="text-[11px] text-[#73716E] block mb-1">
                        {t.notesLabel}
                      </label>
                      <textarea
                        rows={2}
                        value={form.notes}
                        onChange={(e) => updateForm("notes", e.target.value)}
                        placeholder={t.notesPlaceholder}
                        className="w-full rounded-xl border border-[#DCD6CC] bg-[#FAF8F5] p-2.5 text-xs text-[#111111] focus:border-[#1A1A1A] focus:ring-1 focus:ring-[#1A1A1A]"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Navigation CTAs */}
              <div className="pt-2 space-y-2">
                <button
                  type="button"
                  onClick={() => goToStep(3)}
                  className="w-full h-13 py-3.5 px-6 rounded-2xl bg-[#1A1A1A] hover:bg-[#2D2D2D] active:scale-[0.99] text-white font-medium text-base shadow-lg shadow-black/15 flex items-center justify-center gap-2 transition-luxury"
                >
                  <span>{t.btnValidateContact}</span>
                  {rtl ? <ArrowLeft size={16} /> : <ArrowRight size={16} />}
                </button>
                <button
                  type="button"
                  onClick={() => goToStep(1)}
                  className="w-full py-2 text-xs text-[#73716E] hover:text-[#111111] text-center transition-colors"
                >
                  {t.btnEditType}
                </button>
              </div>
            </section>
          )}

          {/* ========================================== */}
          {/* STEP 3: COORDONNÉES & TRANSMISSION         */}
          {/* ========================================== */}
          {step === 3 && (
            <section className="space-y-5">
              <div>
                <span className="text-xs uppercase font-bold tracking-wider text-[#73716E]">
                  {t.stepOf.replace("{current}", "3")}
                </span>
                <h2 className="font-serif-luxury text-2xl sm:text-3xl text-[#111111] leading-snug font-medium mt-0.5">
                  {t.step3Title}
                </h2>
                <p className="text-sm text-[#4A4A48] mt-1 leading-relaxed">
                  {t.step3Subtitle}
                </p>
              </div>

              {/* Summary Brief Badge with Edit shortcut */}
              <div className="p-3.5 rounded-2xl bg-[#FFFFFF] border border-[#E2DDD4] flex items-center justify-between shadow-sm">
                <div className="space-y-0.5">
                  <span className="text-[10px] uppercase tracking-wider font-semibold text-[#73716E]">
                    {t.currentSearch}
                  </span>
                  <p className="text-xs font-semibold text-[#111111] truncate max-w-[240px] sm:max-w-xs">
                    {getSummaryText()}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => goToStep(2)}
                  className="text-xs font-semibold text-[#111111] hover:bg-[#FAF8F5] flex items-center gap-1 bg-[#FFFFFF] px-2.5 py-1 rounded-lg border border-[#DCD6CC] transition-colors"
                >
                  <span>{t.edit}</span>
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Honeypot anti-spam */}
                <input
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                  value={form.website}
                  onChange={(e) => updateForm("website", e.target.value)}
                  className="hidden"
                />

                {/* Prénom / Nom */}
                <div>
                  <label className="block text-xs uppercase font-bold tracking-wider text-[#73716E] mb-1">
                    {t.nameLabel} <span className="text-[#111111]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => {
                      updateForm("name", e.target.value);
                      if (errors.name) setErrors((prev) => ({ ...prev, name: false }));
                    }}
                    placeholder={t.namePlaceholder}
                    className={`w-full h-12 rounded-xl border bg-[#FFFFFF] px-3.5 text-[#111111] placeholder-[#73716E]/60 focus:border-[#1A1A1A] focus:ring-1 focus:ring-[#1A1A1A] transition-colors ${
                      errors.name ? "border-red-500 ring-1 ring-red-500" : "border-[#DCD6CC]"
                    }`}
                  />
                  {errors.name && (
                    <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                      <svg className="w-3 h-3 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path clipRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" fillRule="evenodd" />
                      </svg>
                      {t.nameError}
                    </p>
                  )}
                </div>

                {/* WhatsApp / Phone with country prefix */}
                <div>
                  <label className="block text-xs uppercase font-bold tracking-wider text-[#73716E] mb-1">
                    {t.phoneLabel} <span className="text-[#111111]">*</span>
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={form.phonePrefix}
                      onChange={(e) => updateForm("phonePrefix", e.target.value)}
                      className="w-28 h-12 rounded-xl border border-[#DCD6CC] bg-[#FFFFFF] px-2 text-xs font-medium text-[#111111] focus:border-[#1A1A1A] focus:ring-1 focus:ring-[#1A1A1A]"
                    >
                      {PHONE_PREFIXES.map(({ code, label }) => (
                        <option key={code} value={code}>
                          {label}
                        </option>
                      ))}
                    </select>
                    <input
                      type="tel"
                      required
                      value={form.phone}
                      onChange={(e) => {
                        updateForm("phone", e.target.value);
                        if (errors.phone) setErrors((prev) => ({ ...prev, phone: false }));
                      }}
                      placeholder={t.phonePlaceholder}
                      className={`flex-1 h-12 rounded-xl border bg-[#FFFFFF] px-3.5 text-[#111111] placeholder-[#73716E]/60 focus:border-[#1A1A1A] focus:ring-1 focus:ring-[#1A1A1A] transition-colors ${
                        errors.phone ? "border-red-500 ring-1 ring-red-500" : "border-[#DCD6CC]"
                      }`}
                    />
                  </div>
                  {errors.phone && (
                    <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                      <svg className="w-3 h-3 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path clipRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" fillRule="evenodd" />
                      </svg>
                      {t.phoneError}
                    </p>
                  )}
                  <span className="text-[11px] text-[#73716E] mt-1 block">
                    {t.phoneHelper}
                  </span>
                </div>

                {/* Email (Optional) */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs uppercase font-bold tracking-wider text-[#73716E]">
                      {t.emailLabel}
                    </label>
                    <span className="text-[11px] text-[#73716E]">{t.optional}</span>
                  </div>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => updateForm("email", e.target.value)}
                    placeholder="alexandre@domaine.com"
                    className="w-full h-12 rounded-xl border border-[#DCD6CC] bg-[#FFFFFF] px-3.5 text-[#111111] placeholder-[#73716E]/60 focus:border-[#1A1A1A] focus:ring-1 focus:ring-[#1A1A1A] transition-colors"
                  />
                </div>

                {/* Consent */}
                <div className="pt-1">
                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      required
                      checked={form.consent}
                      onChange={(e) => updateForm("consent", e.target.checked)}
                      className="mt-0.5 rounded border-[#DCD6CC] text-[#1A1A1A] focus:ring-[#1A1A1A]"
                    />
                    <span className="text-xs text-[#4A4A48] leading-tight">
                      {t.consentLabel}
                    </span>
                  </label>
                </div>

                {/* Submit CTA Button */}
                <div className="pt-3">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full h-14 rounded-2xl bg-[#1A1A1A] hover:bg-[#2D2D2D] active:scale-[0.99] text-white font-medium text-base shadow-lg shadow-black/20 flex items-center justify-center gap-2 transition-luxury disabled:opacity-75"
                  >
                    {loading ? (
                      <>
                        <Loader2 size={18} className="animate-spin text-white" />
                        <span>{t.btnSubmitting}</span>
                      </>
                    ) : (
                      <>
                        <span>{t.btnSubmit}</span>
                        {rtl ? <ArrowLeft size={16} /> : <ArrowRight size={16} />}
                      </>
                    )}
                  </button>

                  <div className="text-center mt-3">
                    <a
                      href="https://wa.me/212605387041?text=Bonjour,%20je%20préfère%20échanger%20directement%20avec%20un%20conseiller"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-[#4A4A48] hover:text-[#1A1A1A] transition-colors"
                    >
                      <span>{t.vipWhatsAppLabel}</span>
                      <span className="font-semibold underline text-[#111111]">{t.vipWhatsAppLink}</span>
                    </a>
                  </div>
                </div>
              </form>
            </section>
          )}

          {/* ========================================== */}
          {/* STEP 4: CONFIRMATION & SUCCÈS              */}
          {/* ========================================== */}
          {step === 4 && (
            <section className="space-y-6 text-center py-4">
              {/* Success Badge */}
              <div className="w-20 h-20 mx-auto rounded-full bg-[#EBF9F0] border-2 border-[#1EBE5D] flex items-center justify-center text-[#1EBE5D] animate-subtle-pulse shadow-sm">
                <Check size={38} strokeWidth={2.4} />
              </div>

              <div>
                <span className="text-xs uppercase font-bold tracking-widest text-[#4A4A48]">
                  {t.successTag}
                </span>
                <h2 className="font-serif-luxury text-2xl sm:text-3xl text-[#111111] mt-1">
                  {t.successTitle}{" "}
                  <span className="italic text-[#9A6C48]">
                    {form.name.trim().split(" ")[0] || ""}
                  </span>
                  .
                </h2>
                <p className="text-sm text-[#4A4A48] mt-2 max-w-sm mx-auto leading-relaxed">
                  {t.successSubtitle}
                </p>
              </div>

              {/* Recap Card */}
              <div className="bg-[#FFFFFF] rounded-2xl border border-[#E2DDD4] p-4 text-left shadow-md space-y-2.5 text-xs">
                <div className="border-b border-[#FAF8F5] pb-2 flex items-center justify-between">
                  <span className="font-bold uppercase tracking-wider text-[#73716E]">
                    {t.recapTitle}
                  </span>
                  <span className="bg-[#FAF8F5] text-[#111111] px-2 py-0.5 rounded font-mono text-[10px] border border-[#E2DDD4]">
                    REF: LIM-{leadRef}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[#111111]">
                  <div>
                    <span className="text-[#73716E] block text-[10px]">{t.recapProject}</span>
                    <span className="font-semibold">{getProjectLabel()} {getPropertyLabel()}</span>
                  </div>
                  <div>
                    <span className="text-[#73716E] block text-[10px]">{t.recapBudget}</span>
                    <span className="font-semibold">
                      {form.isBudgetUnknown ? t.budgetUnknownBtn : `${form.budgetValue} MAD`}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#73716E] block text-[10px]">{t.recapRoomsDistrict}</span>
                    <span className="font-semibold">
                      {form.projectType === "court_sejour"
                        ? `${form.stayGuests} ${t.guestsTitle.toLowerCase()}`
                        : `${form.bedrooms} ch.`}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#73716E] block text-[10px]">{t.recapContact}</span>
                    <span className="font-semibold">{form.phonePrefix} {form.phone}</span>
                  </div>
                </div>
              </div>

              {/* Direct Actions */}
              <div className="space-y-2.5 pt-2">
                <a
                  href={`https://wa.me/212605387041?text=${whatsappAccelerateMsg}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full h-13 py-3.5 px-4 rounded-2xl bg-[#25D366] hover:bg-[#1EBE5D] text-white font-medium text-sm shadow-md flex items-center justify-center gap-2 transition-luxury"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.976.532 1.943.924 3.15.924 3.182 0 5.767-2.587 5.767-5.766.001-3.187-2.575-5.766-5.768-5.766zm0 10.375c-1.07 0-1.936-.312-2.766-.807l-.2-.119-1.341.352.358-1.309-.131-.209c-.544-.867-.831-1.688-.83-2.526 0-2.54 2.067-4.607 4.61-4.607 2.541 0 4.609 2.067 4.609 4.607 0 2.542-2.068 4.611-4.61 4.611zm7.969-4.609c0 4.418-3.582 8-8 8-1.42 0-2.756-.372-3.921-1.02l-4.079 1.07 1.089-3.985c-.718-1.208-1.139-2.616-1.139-4.115 0-4.418 3.582-8 8-8s8 3.582 8 8z" />
                  </svg>
                  <span>{t.btnWhatsAppAccelerate}</span>
                </a>
                <button
                  type="button"
                  onClick={() => goToStep(1)}
                  className="w-full py-2.5 text-xs text-[#73716E] hover:text-[#111111] text-center transition-colors"
                >
                  {t.btnNewSearch}
                </button>
              </div>
            </section>
          )}
        </div>

        {/* Card Footer Trust */}
        <footer className="p-4 sm:px-8 border-t border-[#E2DDD4] bg-[#FFFFFF] text-center text-[#73716E] text-[11px] shrink-0">
          <div className="flex items-center justify-center gap-3 text-[#4A4A48] font-medium mb-1.5 flex-wrap">
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5 text-[#1A1A1A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
              </svg>
              {t.footerConfidential}
            </span>
            <span>•</span>
            <span>{t.footerOffMarket}</span>
            <span>•</span>
            <span>{t.footerLocation}</span>
          </div>
          <p className="text-[10px] text-[#73716E]/80">{t.footerCopyright}</p>
        </footer>
      </main>
    </div>
  );
}
