import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, Check, Home, MessageCircle, ShieldCheck, Sparkles } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

type Language = "fr" | "ar" | "en";
type RequestForm = {
  intent: "location-longue-duree" | "vente";
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
    intro: "Quelques réponses suffisent pour comprendre votre recherche et vous proposer une sélection adaptée.",
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
} as const;

const propertyTypes = ["villa", "appartement", "riad", "maison", "other"] as const;

export default function PropertyRequest() {
  const [language, setLanguage] = useState<Language>("fr");
  const [step, setStep] = useState<1 | 2>(1);
  const [form, setForm] = useState<RequestForm>(emptyForm);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const t = copy[language];
  const rtl = language === "ar";
  const change = <K extends keyof RequestForm>(key: K, value: RequestForm[K]) => setForm((old) => ({ ...old, [key]: value }));
  const typeLabel = { villa: t.villa, appartement: t.apartment, riad: t.riad, maison: t.house, other: t.other };

  const nextStep = () => {
    if (!form.types.length) return void toast.error(t.typesError);
    if (form.budgetMin && form.budgetMax && Number(form.budgetMax) < Number(form.budgetMin)) return void toast.error(t.budgetError);
    setStep(2);
  };

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (form.website) return;
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
    ? `السلام عليكم، أرسلت طلب عقار عبر الموقع. أبحث عن ${form.intent === "vente" ? "شراء" : "كراء طويل الأمد"} في مراكش.`
    : `Bonjour, je viens d'envoyer ma recherche immobilière. Je cherche ${form.intent === "vente" ? "à acheter" : "une location longue durée"} à Marrakech.`);

  return (
    <div className="min-h-screen bg-[#f6f3ed] text-[#292720] font-sans selection:bg-[#5d6647] selection:text-white" dir={rtl ? "rtl" : "ltr"}>
      <Header />
      <main className="mx-auto grid min-h-[calc(100vh-80px)] max-w-[1280px] items-start gap-12 px-5 pb-20 pt-28 md:px-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20 lg:pt-36">
        <section className="max-w-lg sticky top-32">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#7a8060]/20 bg-white/60 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#5d6647] shadow-sm backdrop-blur-sm">
            <Sparkles size={14} />
            {t.eyebrow}
          </div>
          <h1 className="font-serif text-[2.5rem] leading-[1.1] tracking-tight sm:text-5xl lg:text-[64px] text-[#2a2924]">
            {submitted ? t.success : t.title}
          </h1>
          <p className="mt-6 max-w-md text-base leading-relaxed text-[#6a675d] sm:text-lg">
            {submitted ? t.successText : t.intro}
          </p>
          {!submitted && (
            <div className="mt-10 space-y-6">
              <p className="flex items-center gap-3 text-sm font-medium text-[#777367]">
                <ShieldCheck size={18} className="text-[#69704f]" />
                {t.privacy}
              </p>
              <div className="border-t border-[#d8d3c9]/60 pt-6">
                <p className="font-serif text-2xl text-[#3d3b35]">{t.rationale}</p>
                <p className="mt-3 text-base leading-relaxed text-[#777367]">
                  {t.rationaleText}
                </p>
              </div>
            </div>
          )}
          <div className="mt-10 flex gap-3" aria-label="Language">
            {(["fr", "ar", "en"] as const).map((code) => (
              <button
                key={code}
                type="button"
                onClick={() => setLanguage(code)}
                className={`flex h-10 w-12 items-center justify-center rounded-full text-[11px] font-semibold uppercase tracking-wider transition-all duration-300 ${
                  language === code
                    ? "bg-[#5d6647] text-white shadow-md"
                    : "border border-[#d8d3c9] text-[#706d63] hover:border-[#5d6647] hover:text-[#5d6647] bg-white/50"
                }`}
              >
                {code}
              </button>
            ))}
          </div>
        </section>

        {submitted ? (
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
                to="/catalogue"
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
            className="rounded-3xl border border-[#e6e1d7]/50 bg-white/90 p-6 shadow-2xl shadow-[#5d6647]/5 backdrop-blur-xl sm:p-10 mt-4 lg:mt-0"
          >
            <div className="mb-10 flex items-center gap-4">
              <div className="flex h-1.5 flex-1 gap-2">
                <span className="flex-1 rounded-full bg-[#5d6647] transition-all duration-500" />
                <span
                  className={`flex-1 rounded-full transition-all duration-500 ${
                    step === 2 ? "bg-[#5d6647]" : "bg-[#e6e2d9]"
                  }`}
                />
              </div>
              <span className="text-xs font-semibold uppercase tracking-widest text-[#737064]">
                {step} / 2
              </span>
            </div>

            <h2 className="mb-8 font-serif text-3xl text-[#2a2924]">
              {step === 1 ? t.search : t.contact}
            </h2>

            {step === 1 ? (
              <div className="space-y-8">
                <fieldset>
                  <legend className="mb-3 text-sm font-medium text-[#495236]">
                    {t.intent}
                  </legend>
                  <div className="flex flex-col gap-3 sm:flex-row">
                    {([
                      ["location-longue-duree", t.rent],
                      ["vente", t.buy],
                    ] as const).map(([value, label]) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => change("intent", value)}
                        aria-pressed={form.intent === value}
                        className={`flex min-h-[3.25rem] flex-1 items-center justify-center rounded-xl border px-5 text-sm font-medium transition-all duration-200 ${
                          form.intent === value
                            ? "border-[#5d6647] bg-[#f0f2e9] text-[#495236] shadow-inner"
                            : "border-[#e6e1d7] bg-white text-[#6b685e] hover:border-[#c5c0b5]"
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </fieldset>

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
                    {form.intent === "vente" ? t.buyBudget : t.rentBudget}
                  </label>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Input
                      type="number"
                      min="0"
                      value={form.budgetMin}
                      onChange={(e) => change("budgetMin", e.target.value)}
                      placeholder={t.min}
                      aria-label={t.min}
                      className="h-12 rounded-xl border-[#e6e1d7] bg-white/50 text-base focus:border-[#5d6647] focus:ring-[#5d6647]"
                    />
                    <Input
                      type="number"
                      min="0"
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
                    {t.date}
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
                    value={form.referenceLocation}
                    onChange={(e) => change("referenceLocation", e.target.value)}
                    className="mt-3 h-12 rounded-xl border-[#e6e1d7] bg-white/50 text-base focus:border-[#5d6647] focus:ring-[#5d6647]"
                  />
                </label>

                <Button
                  type="button"
                  onClick={nextStep}
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
                    onClick={() => setStep(1)}
                    className="h-14 w-full gap-2 rounded-xl border-[#d8d3c9] text-base hover:bg-[#f6f3ed] sm:w-auto sm:px-8"
                  >
                    <ArrowLeft size={18} />
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
      </main>
      <Footer />
    </div>
  );
}
