import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, Check, ChevronRight, Home, KeyRound, LockKeyhole, MapPin, MessageCircle, Palmtree, ShieldCheck, Luggage } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { QUARTIERS } from "@/types/property";
import SEOHead from "@/components/SEOHead";
import Breadcrumbs from "@/components/Breadcrumbs";
import { breadcrumbJsonLd } from "@/lib/breadcrumbs";
import { useLocalePath } from "@/hooks/useLocalePath";
import { useLocalizedText } from "@/hooks/useLocalizedText";
import "./PropertyRequest.css";

type Language = "fr" | "ar" | "en" | "es";
type RequestForm = {
  intent: "location-longue-duree" | "location-courte-duree" | "vente";
  types: string[];
  budgetMin: string;
  budgetMax: string;
  areas: string;
  bedrooms: string;
  furnishing: "any" | "furnished" | "unfurnished";
  availableFrom: string;
  referenceLocation: string;
  distance: string;
  profession: string;
  profile: string;
  notes: string;
  name: string;
  phone: string;
  email: string;
  consent: boolean;
  website: string;
};

const emptyForm: RequestForm = {
  intent: "location-longue-duree", types: [], budgetMin: "", budgetMax: "", areas: "", bedrooms: "",
  furnishing: "any", availableFrom: "", referenceLocation: "", distance: "", profession: "", profile: "",
  notes: "", name: "", phone: "", email: "", consent: false, website: "",
};

const copy = {
  fr: {
    eyebrow: "Votre projet immobilier à Marrakech", title: "Parlons du bien qui vous correspond.",
    intro: "Quelques réponses suffisent pour vous proposer une sélection adaptée.",
    stay: "Séjourner", stayBudget: "Budget par nuit (MAD)", arrival: "Date d’arrivée souhaitée",
    idealArea: "Le quartier idéal", allAreas: "Tous les quartiers", start: "Commencer",
    chooseProject: "Choisissez votre projet pour continuer.", areaLocked: "Choisissez d’abord votre projet pour débloquer les quartiers.",
    details: "Précisons votre recherche", editProject: "Modifier mon projet", nameError: "Indiquez votre nom (2 caractères minimum).",
    privacy: "Vos informations restent confidentielles.", search: "Votre recherche", contact: "Pour vous répondre",
    intent: "Quel est votre projet ?", rent: "Louer longue durée", buy: "Acheter", type: "Type de bien",
    villa: "Villa", apartment: "Appartement", riad: "Riad", house: "Maison", other: "Autre / terrain",
    rentBudget: "Budget mensuel de location (MAD)", buyBudget: "Budget total d’achat (MAD)", min: "Minimum", max: "Maximum",
    areas: "Quartiers souhaités", areasHint: "Route de Fès, Targa, Guéliz…", bedrooms: "Chambres minimum",
    furnished: "Meublé ou non ?", either: "Les deux me conviennent", yes: "Meublé", no: "Non meublé",
    date: "Date d’installation souhaitée", distance: "Distance maximale (km)", reference: "Lieu important à proximité ?",
    referenceHint: "Travail, école, centre-ville…", next: "Continuer", back: "Retour", name: "Votre nom",
    phone: "Téléphone WhatsApp", email: "E-mail (facultatif)", profession: "Votre activité (facultatif)",
    profile: "Qui habitera le logement ? (facultatif)", profileHint: "Couple, famille, personne seule…",
    notes: "Un détail important à ajouter ?", notesHint: "Animaux, équipements, date flexible…",
    consent: "J’accepte d’être contacté(e) au sujet de ma recherche.", send: "Envoyer ma recherche", sending: "Envoi en cours…",
    success: "Merci, votre recherche est bien reçue.", successText: "Nous allons étudier vos critères et vous contacter avec les biens disponibles adaptés.",
    whatsapp: "Continuer sur WhatsApp", catalogue: "Voir les biens", error: "L’envoi n’a pas abouti. Réessayez ou écrivez-nous sur WhatsApp.",
    phoneError: "Ajoutez un numéro WhatsApp valide.", budgetError: "Le maximum doit être supérieur au minimum.",
    typesError: "Choisissez au moins un type de bien.", rationale: "Une sélection plus juste, dès le premier échange.",
    rationaleText: "Indiquez ce qui compte vraiment pour vous. Nous vous répondrons avec une recherche ciblée.",
  },
  ar: {
    eyebrow: "مشروعك العقاري في مراكش", title: "نبحث معك عن العقار المناسب.",
    intro: "أجب عن بعض الأسئلة لنفهم طلبك ونقترح عليك عقارات تناسب احتياجاتك.",
    stay: "إقامة قصيرة", stayBudget: "الميزانية لكل ليلة (درهم)", arrival: "تاريخ الوصول المطلوب",
    idealArea: "الحي المثالي", allAreas: "جميع الأحياء", start: "ابدأ",
    chooseProject: "اختر مشروعك للمتابعة.", areaLocked: "اختر مشروعك أولاً لعرض الأحياء.",
    details: "تفاصيل بحثك", editProject: "تعديل مشروعي", nameError: "أدخل اسماً من حرفين على الأقل.",
    privacy: "معلوماتك تبقى سرية.", search: "طلبك العقاري", contact: "معلومات التواصل",
    intent: "ما هو مشروعك؟", rent: "كراء طويل الأمد", buy: "شراء", type: "نوع العقار",
    villa: "فيلا", apartment: "شقة", riad: "رياض", house: "منزل", other: "نوع آخر / أرض",
    rentBudget: "الميزانية الشهرية للكراء (درهم)", buyBudget: "ميزانية الشراء الإجمالية (درهم)", min: "الحد الأدنى", max: "الحد الأقصى",
    areas: "الأحياء المفضلة", areasHint: "طريق فاس، تاركة، جليز…", bedrooms: "الحد الأدنى للغرف",
    furnished: "مفروش أم لا؟", either: "كلاهما مناسب", yes: "مفروش", no: "غير مفروش",
    date: "تاريخ الانتقال المطلوب", distance: "المسافة القصوى (كم)", reference: "مكان مهم قريب من السكن؟",
    referenceHint: "العمل، المدرسة، وسط المدينة…", next: "متابعة", back: "رجوع", name: "الاسم الكامل",
    phone: "رقم واتساب", email: "البريد الإلكتروني (اختياري)", profession: "المهنة (اختياري)",
    profile: "من سيقيم في العقار؟ (اختياري)", profileHint: "زوجان، أسرة، شخص واحد…",
    notes: "هل لديك تفاصيل إضافية؟", notesHint: "حيوانات، تجهيزات، مرونة في التاريخ…",
    consent: "أوافق على التواصل معي بخصوص طلبي العقاري.", send: "إرسال الطلب", sending: "جار الإرسال…",
    success: "شكرا، توصلنا بطلبك.", successText: "سنراجع معاييرك ونتواصل معك بالعقارات المتاحة التي تناسبك.",
    whatsapp: "التواصل عبر واتساب", catalogue: "تصفح العقارات", error: "تعذر إرسال الطلب. حاول مجددا أو راسلنا عبر واتساب.",
    phoneError: "أدخل رقم واتساب صحيحا.", budgetError: "يجب أن يكون الحد الأقصى أكبر من الحد الأدنى.",
    typesError: "اختر نوع عقار واحدا على الأقل.", rationale: "اختيار أدق من أول تواصل.",
    rationaleText: "أخبرنا بما يهمك فعلا، وسنرسل لك اختيارات مناسبة لطلبك.",
  },
  en: {
    eyebrow: "Your property search in Marrakech", title: "Let’s find a place that fits.",
    intro: "A few answers help us understand what you need and share a focused selection.",
    stay: "Short stay", stayBudget: "Nightly budget (MAD)", arrival: "Preferred arrival date",
    idealArea: "Your ideal neighbourhood", allAreas: "All neighbourhoods", start: "Get started",
    chooseProject: "Choose your project to continue.", areaLocked: "Choose your project first to unlock the neighbourhoods.",
    details: "Refine your search", editProject: "Edit my project", nameError: "Enter your name (at least 2 characters).",
    privacy: "Your information stays private.", search: "Your search", contact: "How to reach you",
    intent: "What are you looking for?", rent: "Long-term rental", buy: "To buy", type: "Property type",
    villa: "Villa", apartment: "Apartment", riad: "Riad", house: "House", other: "Other / land",
    rentBudget: "Monthly rent budget (MAD)", buyBudget: "Total purchase budget (MAD)", min: "Minimum", max: "Maximum",
    areas: "Preferred areas", areasHint: "Route de Fès, Targa, Guéliz…", bedrooms: "Minimum bedrooms",
    furnished: "Furnished?", either: "Either is fine", yes: "Furnished", no: "Unfurnished",
    date: "Preferred move-in date", distance: "Maximum distance (km)", reference: "A nearby place that matters?",
    referenceHint: "Work, school, city centre…", next: "Continue", back: "Back", name: "Your name",
    phone: "WhatsApp number", email: "Email (optional)", profession: "Your occupation (optional)",
    profile: "Who will live there? (optional)", profileHint: "Couple, family, one person…",
    notes: "Anything else we should know?", notesHint: "Pets, features, flexible dates…",
    consent: "I agree to be contacted about my property search.", send: "Send my search", sending: "Sending…",
    success: "Thanks, we received your request.", successText: "We’ll review your criteria and contact you with suitable available properties.",
    whatsapp: "Continue on WhatsApp", catalogue: "Browse properties", error: "We couldn’t send your request. Try again or message us on WhatsApp.",
    phoneError: "Enter a valid WhatsApp number.", budgetError: "The maximum budget must be above the minimum.",
    typesError: "Choose at least one property type.", rationale: "A more relevant selection from the first conversation.",
    rationaleText: "Tell us what matters most. We’ll focus on properties that fit your request.",
  },
  es: {
    eyebrow: "Su búsqueda inmobiliaria en Marrakech", title: "Encontremos el lugar que le encaja.",
    intro: "Con unas pocas respuestas entendemos lo que necesita y le enviamos una selección a medida.",
    stay: "Estancia corta", stayBudget: "Presupuesto por noche (MAD)", arrival: "Fecha de llegada deseada",
    idealArea: "Su barrio ideal", allAreas: "Todos los barrios", start: "Empezar",
    chooseProject: "Elija su proyecto para continuar.", areaLocked: "Elija primero su proyecto para ver los barrios.",
    details: "Afine su búsqueda", editProject: "Cambiar mi proyecto", nameError: "Indique su nombre (al menos 2 caracteres).",
    privacy: "Sus datos son confidenciales.", search: "Su búsqueda", contact: "Cómo contactarle",
    intent: "¿Qué busca?", rent: "Alquiler de larga duración", buy: "Comprar", type: "Tipo de inmueble",
    villa: "Villa", apartment: "Piso", riad: "Riad", house: "Casa", other: "Otro / terreno",
    rentBudget: "Presupuesto de alquiler mensual (MAD)", buyBudget: "Presupuesto total de compra (MAD)", min: "Mínimo", max: "Máximo",
    areas: "Zonas preferidas", areasHint: "Route de Fès, Targa, Guéliz…", bedrooms: "Dormitorios mínimos",
    furnished: "¿Amueblado?", either: "Me da igual", yes: "Amueblado", no: "Sin amueblar",
    date: "Fecha de entrada deseada", distance: "Distancia máxima (km)", reference: "¿Un lugar cercano importante?",
    referenceHint: "Trabajo, colegio, centro…", next: "Continuar", back: "Atrás", name: "Su nombre",
    phone: "Número de WhatsApp", email: "Correo electrónico (opcional)", profession: "Su profesión (opcional)",
    profile: "¿Quién vivirá allí? (opcional)", profileHint: "Pareja, familia, una persona…",
    notes: "¿Algo más que debamos saber?", notesHint: "Mascotas, equipamiento, fechas flexibles…",
    consent: "Acepto que me contacten sobre mi búsqueda inmobiliaria.", send: "Enviar mi búsqueda", sending: "Enviando…",
    success: "Gracias, hemos recibido su solicitud.", successText: "Revisaremos sus criterios y le contactaremos con los inmuebles disponibles que encajen.",
    whatsapp: "Continuar en WhatsApp", catalogue: "Ver los inmuebles", error: "No hemos podido enviar su solicitud. Inténtelo de nuevo o escríbanos por WhatsApp.",
    phoneError: "Indique un número de WhatsApp válido.", budgetError: "El presupuesto máximo debe ser superior al mínimo.",
    typesError: "Elija al menos un tipo de inmueble.", rationale: "Una selección más acertada desde la primera conversación.",
    rationaleText: "Díganos qué es lo más importante. Nos centraremos en los inmuebles que encajen con su solicitud.",
  },
} as const;

const propertyTypes = ["villa", "appartement", "riad", "maison", "other"] as const;

export default function PropertyRequest() {
  const { lang, lp } = useLocalePath();
  const tL = useLocalizedText();
  // The form has its own FR / AR / EN / ES copy; it opens in the language of the URL.
  const [language, setLanguage] = useState<Language>(lang);
  const [step, setStep] = useState<0 | 1 | 2>(0);
  const [projectChosen, setProjectChosen] = useState(false);
  const [projectError, setProjectError] = useState(false);
  const [form, setForm] = useState<RequestForm>(emptyForm);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const firstProjectRef = useRef<HTMLInputElement>(null);
  const t = copy[language];
  const rtl = language === "ar";
  const change = <K extends keyof RequestForm>(key: K, value: RequestForm[K]) => setForm((old) => ({ ...old, [key]: value }));
  const typeLabel = { villa: t.villa, appartement: t.apartment, riad: t.riad, maison: t.house, other: t.other };
  const projects = [
    { value: "vente", label: t.buy, icon: Home },
    { value: "location-longue-duree", label: t.rent, icon: KeyRound },
    { value: "location-courte-duree", label: t.stay, icon: Luggage },
  ] as const;
  const projectLabel = projects.find((project) => project.value === form.intent)?.label;

  useEffect(() => {
    if (step > 0) contentRef.current?.focus({ preventScroll: true });
  }, [step]);

  const goToStep = (value: 0 | 1 | 2) => {
    setStep(value);
    window.scrollTo({ top: 0, behavior: "instant" });
  };

  const startSearch = () => {
    if (!projectChosen) {
      setProjectError(true);
      firstProjectRef.current?.focus();
      return;
    }
    goToStep(1);
  };

  const nextStep = () => {
    if (!form.types.length) return void toast.error(t.typesError);
    if (form.budgetMin && form.budgetMax && Number(form.budgetMax) < Number(form.budgetMin)) return void toast.error(t.budgetError);
    goToStep(2);
  };

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (form.website || loading || step !== 2) return;
    if (form.name.trim().length < 2) return void toast.error(t.nameError);
    const digits = form.phone.replace(/\D/g, "");
    if (digits.length < 8 || digits.length > 15) return void toast.error(t.phoneError);
    setLoading(true);
    const payload = {
      name: form.name.trim(), phone: form.phone.trim(), email: form.email.trim() || null,
      source: "Site web", transaction_type: form.intent,
      property_types: form.types.map((type) => type === "other" ? "terrain" : type),
      budget_min: form.budgetMin ? Number(form.budgetMin) : null,
      budget_max: form.budgetMax ? Number(form.budgetMax) : null,
      preferred_areas: form.areas.split(",").map((area) => area.trim()).filter(Boolean).slice(0, 8),
      bedrooms_min: form.bedrooms ? Number(form.bedrooms) : null,
      furnishing: form.furnishing, available_from: form.availableFrom || null,
      reference_location: form.referenceLocation.trim() || null,
      max_distance_km: form.distance ? Number(form.distance) : null,
      profession: form.profession.trim() || null, client_profile: form.profile.trim() || null,
      notes: form.notes.trim() || null, status: "nouveau", created_by: null,
    };
    try {
      const { error } = await supabase.from("client_leads").insert(payload);
      if (error) return void toast.error(t.error);
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      toast.error(t.error);
    } finally {
      setLoading(false);
    }
  };

  const whatsappText = encodeURIComponent(language === "ar"
    ? `السلام عليكم، أرسلت طلب عقار عبر الموقع. مشروعي: ${projectLabel} في مراكش.`
    : language === "en"
      ? `Hello, I just submitted my property search. My project: ${projectLabel} in Marrakech.`
      : language === "es"
      ? `Hola, acabo de enviar mi búsqueda inmobiliaria. Mi proyecto: ${projectLabel} en Marrakech.`
      : `Bonjour, je viens d'envoyer ma recherche immobilière. Mon projet : ${projectLabel} à Marrakech.`);

  const crumbs = [
    { name: tL("Accueil", "Home", "Inicio"), path: lp("/") },
    { name: tL("Ma recherche", "My search", "Mi búsqueda"), path: lp("/demande") },
  ];

  return (
    <div className="request-page min-h-screen font-sans selection:bg-[#5d6647] selection:text-white" lang={language} dir={rtl ? "rtl" : "ltr"}>
      <SEOHead
        withBrand={false}
        title={tL("Décrire ma recherche immobilière à Marrakech", "Describe your property search in Marrakech", "Describa su búsqueda inmobiliaria en Marrakech")}
        description={tL(
          "Location longue durée, achat ou séjour : décrivez le bien que vous cherchez à Marrakech, notre agence vous propose une sélection sur mesure.",
          "Long-term rental, purchase or stay: describe the property you are looking for in Marrakech and our agency will send you a tailored selection.",
          "Alquiler de larga duración, compra o estancia: describa la propiedad que busca en Marrakech y nuestra agencia le enviará una selección a medida.",
        )}
        schema={breadcrumbJsonLd(crumbs)}
      />
      <Header />
      <main className={`request-layout ${step > 0 && !submitted ? "request-layout--details" : ""}`}>
        <section className="request-intro">
          <Breadcrumbs crumbs={crumbs} className="mb-5" />
          <div className="request-eyebrow">
            <Palmtree size={18} strokeWidth={1.7} aria-hidden="true" />
            {t.eyebrow}
          </div>
          <h1 className="request-title">
            {submitted ? t.success : t.title}
          </h1>
          <p className="request-description">
            {submitted ? t.successText : t.intro}
          </p>
        </section>

        <div className="request-content" ref={contentRef} tabIndex={-1}>
        {step === 0 && !submitted ? (
          <section aria-label={t.search}>
            <ol className="request-timeline">
              <li className="request-timeline-step">
                <span className="request-step-number request-step-number--active" aria-hidden="true">01</span>
                <div className="request-step-body">
                  <h2 id="project-heading" className="request-step-title">{t.search}</h2>
                  <fieldset className="request-projects" aria-labelledby="project-heading" aria-describedby={projectError ? "project-error" : undefined}>
                    {projects.map(({ value, label, icon: Icon }, index) => {
                      const selected = projectChosen && form.intent === value;
                      return (
                        <label key={value} className={`request-project ${selected ? "request-project--selected" : ""}`}>
                          <input
                            ref={index === 0 ? firstProjectRef : undefined}
                            type="radio" name="project" value={value} checked={selected}
                            onChange={() => {
                              setForm((old) => ({ ...old, intent: value, budgetMin: old.intent === value ? old.budgetMin : "", budgetMax: old.intent === value ? old.budgetMax : "" }));
                              setProjectChosen(true);
                              setProjectError(false);
                            }}
                            className="sr-only"
                          />
                          <Icon className="request-project-icon" size={25} strokeWidth={1.6} aria-hidden="true" />
                          <span>{label}</span>
                          {selected ? <Check className="request-project-chevron" size={18} aria-hidden="true" /> : <ChevronRight className="request-project-chevron" size={19} aria-hidden="true" />}
                        </label>
                      );
                    })}
                  </fieldset>
                  {projectError && <p id="project-error" role="alert" className="mt-3 text-sm text-[#a44d30]">{t.chooseProject}</p>}
                </div>
              </li>
              <li className={`request-timeline-step ${!projectChosen ? "request-timeline-step--locked" : ""}`}>
                <span className={`request-step-number ${projectChosen ? "request-step-number--active" : ""}`} aria-hidden="true">02</span>
                <div className="request-step-body">
                  <h2 className="request-step-title"><label htmlFor="request-area">{t.idealArea}</label></h2>
                  <div className="request-area">
                    <MapPin size={24} strokeWidth={1.6} aria-hidden="true" />
                    <select id="request-area" value={form.areas} disabled={!projectChosen} onChange={(event) => change("areas", event.target.value)} aria-describedby={!projectChosen ? "area-locked-hint" : undefined}>
                      <option value="">{projectChosen ? t.allAreas : ""}</option>
                      {form.areas && !QUARTIERS.includes(form.areas) && <option value={form.areas}>{form.areas}</option>}
                      {QUARTIERS.map((area) => <option key={area} value={area}>{area}</option>)}
                    </select>
                    {projectChosen ? <ChevronRight size={19} className="request-area-arrow" aria-hidden="true" /> : <LockKeyhole size={20} aria-hidden="true" />}
                  </div>
                  {!projectChosen && <span id="area-locked-hint" className="sr-only">{t.areaLocked}</span>}
                </div>
              </li>
            </ol>
            <button type="button" className="request-start" onClick={startSearch}>
              <span>{t.start}</span>
              {rtl ? <ArrowLeft size={24} aria-hidden="true" /> : <ArrowRight size={24} aria-hidden="true" />}
            </button>
            <p className="request-privacy"><ShieldCheck size={21} strokeWidth={1.6} aria-hidden="true" />{t.privacy}</p>
          </section>
        ) : submitted ? (
          <section className="rounded-3xl border border-[#e6e1d7]/50 bg-white/80 p-8 shadow-2xl backdrop-blur-xl sm:p-12 mt-4 lg:mt-0">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#edf0e5] text-[#5d6647] shadow-inner">
              <Check size={36} strokeWidth={2.5} />
            </div>
            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <a
                href={`https://wa.me/212605387041?text=${whatsappText}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-[3.5rem] flex-1 items-center justify-center gap-3 rounded-xl bg-[#5d6647] px-6 text-sm font-medium uppercase tracking-wider text-white shadow-lg transition-transform hover:-translate-y-0.5 hover:bg-[#4a5238] active:translate-y-0"
              >
                <MessageCircle size={18} />
                {t.whatsapp}
              </a>
              <Link
                to={lp("/catalogue")}
                className="inline-flex min-h-[3.5rem] flex-1 items-center justify-center gap-3 rounded-xl border border-[#d8d3c9] bg-white px-6 text-sm font-medium uppercase tracking-wider text-[#514f47] shadow-sm transition-colors hover:border-[#5d6647] hover:text-[#5d6647]"
              >
                <Home size={18} />
                {t.catalogue}
              </Link>
            </div>
          </section>
        ) : (
          <form
            onSubmit={submit}
            className="request-details rounded-3xl border border-[#e6e1d7] bg-white/90 p-5 sm:p-8"
          >
            <div className="mb-10 flex items-center gap-4">
              <div className="flex h-1.5 flex-1 gap-2">
                <span className="flex-1 rounded-full bg-[#5d6647]" />
                <span className="flex-1 rounded-full bg-[#5d6647] transition-all duration-500" />
                <span
                  className={`flex-1 rounded-full transition-all duration-500 ${
                    step === 2 ? "bg-[#5d6647]" : "bg-[#e6e2d9]"
                  }`}
                />
              </div>
              <span className="text-xs font-semibold uppercase tracking-widest text-[#737064]">
                {step + 1} / 3
              </span>
            </div>

            <h2 className="mb-8 font-serif text-3xl text-[#2a2924]">
              {step === 1 ? t.details : t.contact}
            </h2>

            {step === 1 ? (
              <div className="space-y-8">
                <div className="request-summary">
                  <span>{projectLabel}</span>
                  <button type="button" onClick={() => goToStep(0)}>{t.editProject}</button>
                </div>

                <fieldset>
                  <legend className="mb-3 text-sm font-medium text-[#495236]">
                    {t.type}
                  </legend>
                  <div className="flex flex-wrap gap-2.5">
                    {propertyTypes.map((type) => {
                      const selected = form.types.includes(type);
                      return (
                        <button
                          key={type}
                          type="button"
                          onClick={() =>
                            change(
                              "types",
                              selected
                                ? form.types.filter((item) => item !== type)
                                : [...form.types, type]
                            )
                          }
                          aria-pressed={selected}
                          className={`rounded-xl border px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
                            selected
                              ? "border-[#5d6647] bg-[#f0f2e9] text-[#495236] shadow-inner"
                              : "border-[#e6e1d7] bg-white text-[#6b685e] hover:border-[#c5c0b5]"
                          }`}
                        >
                          {typeLabel[type]}
                        </button>
                      );
                    })}
                  </div>
                </fieldset>

                <div>
                  <label className="mb-3 block text-sm font-medium text-[#495236]">
                    {form.intent === "vente" ? t.buyBudget : form.intent === "location-courte-duree" ? t.stayBudget : t.rentBudget}
                  </label>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Input
                      type="number"
                      min="0"
                      max="100000000"
                      value={form.budgetMin}
                      onChange={(e) => change("budgetMin", e.target.value)}
                      placeholder={t.min}
                      aria-label={t.min}
                      className="h-12 rounded-xl border-[#e6e1d7] bg-white/50 text-base focus:border-[#5d6647] focus:ring-[#5d6647]"
                    />
                    <Input
                      type="number"
                      min="0"
                      max="100000000"
                      value={form.budgetMax}
                      onChange={(e) => change("budgetMax", e.target.value)}
                      placeholder={t.max}
                      aria-label={t.max}
                      className="h-12 rounded-xl border-[#e6e1d7] bg-white/50 text-base focus:border-[#5d6647] focus:ring-[#5d6647]"
                    />
                  </div>
                </div>

                <label className="block text-sm font-medium text-[#495236]">
                  {t.areas}
                  <Input
                    value={form.areas}
                    onChange={(e) => change("areas", e.target.value)}
                    placeholder={t.areasHint}
                    className="mt-3 h-12 rounded-xl border-[#e6e1d7] bg-white/50 text-base focus:border-[#5d6647] focus:ring-[#5d6647]"
                  />
                </label>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <label className="space-y-3 text-sm font-medium text-[#495236]">
                    {t.bedrooms}
                    <Input
                      type="number"
                      min="0"
                      max="20"
                      value={form.bedrooms}
                      onChange={(e) => change("bedrooms", e.target.value)}
                      className="h-12 rounded-xl border-[#e6e1d7] bg-white/50 text-base focus:border-[#5d6647] focus:ring-[#5d6647]"
                    />
                  </label>
                  <label className="space-y-3 text-sm font-medium text-[#495236]">
                    {t.furnished}
                    <select
                      value={form.furnishing}
                      onChange={(e) =>
                        change("furnishing", e.target.value as RequestForm["furnishing"])
                      }
                      className="flex h-12 w-full rounded-xl border border-[#e6e1d7] bg-white/50 px-4 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus:border-[#5d6647] focus:outline-none focus:ring-2 focus:ring-[#5d6647] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="any">{t.either}</option>
                      <option value="furnished">{t.yes}</option>
                      <option value="unfurnished">{t.no}</option>
                    </select>
                  </label>
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <label className="space-y-3 text-sm font-medium text-[#495236]">
                    {form.intent === "location-courte-duree" ? t.arrival : t.date}
                    <Input
                      type="date"
                      value={form.availableFrom}
                      onChange={(e) => change("availableFrom", e.target.value)}
                      className="h-12 rounded-xl border-[#e6e1d7] bg-white/50 text-base focus:border-[#5d6647] focus:ring-[#5d6647]"
                    />
                  </label>
                  <label className="space-y-3 text-sm font-medium text-[#495236]">
                    {t.distance}
                    <Input
                      type="number"
                      min="0"
                      max="500"
                      value={form.distance}
                      onChange={(e) => change("distance", e.target.value)}
                      className="h-12 rounded-xl border-[#e6e1d7] bg-white/50 text-base focus:border-[#5d6647] focus:ring-[#5d6647]"
                    />
                  </label>
                </div>

                <label className="block text-sm font-medium text-[#495236]">
                  <span className="flex items-center gap-2">
                    {t.reference}
                  </span>
                  <span className="mt-1 block text-[11px] font-normal text-[#888477]">
                    {t.referenceHint}
                  </span>
                  <Input
                    maxLength={200}
                    value={form.referenceLocation}
                    onChange={(e) => change("referenceLocation", e.target.value)}
                    className="mt-3 h-12 rounded-xl border-[#e6e1d7] bg-white/50 text-base focus:border-[#5d6647] focus:ring-[#5d6647]"
                  />
                </label>

                <Button
                  type="button"
                  onClick={(event) => {
                    if (event.currentTarget.form?.reportValidity()) nextStep();
                  }}
                  className="mt-4 h-14 w-full gap-3 rounded-xl bg-[#5d6647] text-[15px] font-semibold tracking-wide hover:bg-[#4a5238] shadow-lg shadow-[#5d6647]/20 transition-all hover:shadow-xl"
                >
                  {t.next}
                  {rtl ? <ArrowLeft size={18} /> : <ArrowRight size={18} />}
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                <label className="block space-y-3 text-sm font-medium text-[#495236]">
                  {t.name}
                  <Input
                    required
                    minLength={2}
                    autoComplete="name"
                    maxLength={120}
                    value={form.name}
                    onChange={(e) => change("name", e.target.value)}
                    className="h-12 rounded-xl border-[#e6e1d7] bg-white/50 text-base focus:border-[#5d6647] focus:ring-[#5d6647]"
                  />
                </label>
                <label className="block space-y-3 text-sm font-medium text-[#495236]">
                  {t.phone}
                  <Input
                    required
                    type="tel"
                    autoComplete="tel"
                    maxLength={40}
                    placeholder="+212…"
                    value={form.phone}
                    onChange={(e) => change("phone", e.target.value)}
                    className="h-12 rounded-xl border-[#e6e1d7] bg-white/50 text-base focus:border-[#5d6647] focus:ring-[#5d6647]"
                  />
                </label>
                <label className="block space-y-3 text-sm font-medium text-[#495236]">
                  {t.email}
                  <Input
                    type="email"
                    autoComplete="email"
                    maxLength={254}
                    value={form.email}
                    onChange={(e) => change("email", e.target.value)}
                    className="h-12 rounded-xl border-[#e6e1d7] bg-white/50 text-base focus:border-[#5d6647] focus:ring-[#5d6647]"
                  />
                </label>
                <label className="block space-y-3 text-sm font-medium text-[#495236]">
                  {t.profession}
                  <Input
                    maxLength={120}
                    value={form.profession}
                    onChange={(e) => change("profession", e.target.value)}
                    className="h-12 rounded-xl border-[#e6e1d7] bg-white/50 text-base focus:border-[#5d6647] focus:ring-[#5d6647]"
                  />
                </label>
                <label className="block space-y-3 text-sm font-medium text-[#495236]">
                  {t.profile}
                  <Input
                    maxLength={250}
                    placeholder={t.profileHint}
                    value={form.profile}
                    onChange={(e) => change("profile", e.target.value)}
                    className="h-12 rounded-xl border-[#e6e1d7] bg-white/50 text-base focus:border-[#5d6647] focus:ring-[#5d6647] placeholder:text-[#a09e93]"
                  />
                </label>
                <label className="block space-y-3 text-sm font-medium text-[#495236]">
                  {t.notes}
                  <Textarea
                    maxLength={1500}
                    placeholder={t.notesHint}
                    value={form.notes}
                    onChange={(e) => change("notes", e.target.value)}
                    className="min-h-[120px] rounded-xl border-[#e6e1d7] bg-white/50 p-4 text-base focus:border-[#5d6647] focus:ring-[#5d6647] placeholder:text-[#a09e93]"
                  />
                </label>

                <input
                  aria-hidden="true"
                  tabIndex={-1}
                  autoComplete="off"
                  value={form.website}
                  onChange={(e) => change("website", e.target.value)}
                  className="pointer-events-none absolute h-px w-px opacity-0"
                />

                <label className="mt-8 flex cursor-pointer items-start gap-4 text-sm leading-6 text-[#625f55]">
                  <input
                    required
                    type="checkbox"
                    checked={form.consent}
                    onChange={(e) => change("consent", e.target.checked)}
                    className="mt-1 h-5 w-5 rounded border-[#c5c0b5] text-[#5d6647] focus:ring-[#5d6647]"
                  />
                  <span>{t.consent}</span>
                </label>

                <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => goToStep(1)}
                    className="h-14 w-full gap-2 rounded-xl border-[#d8d3c9] text-base hover:bg-[#f6f3ed] sm:w-auto sm:px-8"
                  >
                    {rtl ? <ArrowRight size={18} /> : <ArrowLeft size={18} />}
                    {t.back}
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="h-14 flex-1 gap-3 rounded-xl bg-[#5d6647] text-[15px] font-semibold tracking-wide hover:bg-[#4a5238] shadow-lg shadow-[#5d6647]/20 transition-all hover:shadow-xl"
                  >
                    {loading ? t.sending : t.send}
                    {!loading && <Check size={18} />}
                  </Button>
                </div>
              </div>
            )}
          </form>
        )}
        </div>
        <div className="request-languages" aria-label={tL("Langue du formulaire", "Form language", "Idioma del formulario")}>
          {(["fr", "en", "es", "ar"] as const).map((code) => (
            <button key={code} type="button" onClick={() => setLanguage(code)} aria-pressed={language === code} lang={code}>
              {code.toUpperCase()}
            </button>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
