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

  return <div className="min-h-screen bg-[#f6f3ed] text-[#292720]" dir={rtl ? "rtl" : "ltr"}>
    <Header />
    <main className="mx-auto grid min-h-[calc(100vh-80px)] max-w-[1280px] items-center gap-12 px-5 pb-16 pt-28 md:px-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16 lg:pt-32">
      <section className="max-w-lg">
        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#7a8060]/20 bg-white/70 px-3 py-2 text-[10px] font-medium uppercase tracking-[0.16em] text-[#656d4d]"><Sparkles size={13} />{t.eyebrow}</div>
        <h1 className="font-serif text-4xl leading-[1.04] tracking-[-0.03em] sm:text-5xl lg:text-[58px]">{submitted ? t.success : t.title}</h1>
        <p className="mt-5 max-w-md text-sm leading-7 text-[#6a675d] sm:text-base">{submitted ? t.successText : t.intro}</p>
        {!submitted && <div className="mt-8 space-y-4"><p className="flex items-center gap-2 text-xs text-[#777367]"><ShieldCheck size={15} className="text-[#69704f]" />{t.privacy}</p><div className="border-t border-[#d8d3c9] pt-5"><p className="font-serif text-xl">{t.rationale}</p><p className="mt-2 text-sm leading-6 text-[#777367]">{t.rationaleText}</p></div></div>}
        <div className="mt-8 flex gap-2" aria-label="Language">{(["fr", "ar", "en"] as const).map((code) => <button key={code} type="button" onClick={() => setLanguage(code)} className={`rounded-full px-3 py-1.5 text-[10px] font-medium uppercase tracking-wider ${language === code ? "bg-[#5d6647] text-white" : "border border-[#d8d3c9] text-[#706d63] hover:bg-white"}`}>{code}</button>)}</div>
      </section>

      {submitted ? <section className="rounded-2xl border border-[#e6e1d7] bg-white p-6 shadow-xl sm:p-9">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#edf0e5] text-[#5d6647]"><Check size={26} /></div>
        <div className="mt-6 grid gap-3 sm:grid-cols-2"><a href={`https://wa.me/212605387041?text=${whatsappText}`} target="_blank" rel="noreferrer" className="inline-flex min-h-12 items-center justify-center gap-2 bg-[#5d6647] px-5 text-xs font-medium uppercase tracking-wider text-white"><MessageCircle size={16} />{t.whatsapp}</a><Link to="/catalogue" className="inline-flex min-h-12 items-center justify-center gap-2 border border-[#d8d3c9] px-5 text-xs font-medium uppercase tracking-wider text-[#514f47]"><Home size={16} />{t.catalogue}</Link></div>
      </section> : <form onSubmit={submit} className="rounded-2xl border border-[#e6e1d7] bg-white p-5 shadow-xl sm:p-8">
        <div className="mb-7 flex items-center gap-3"><div className="flex h-2 flex-1 gap-1"><span className="flex-1 rounded-full bg-[#65704b]" /><span className={`flex-1 rounded-full ${step === 2 ? "bg-[#65704b]" : "bg-[#e6e2d9]"}`} /></div><span className="text-[10px] font-medium uppercase tracking-wider text-[#737064]">{step} / 2</span></div>
        <h2 className="font-serif text-2xl">{step === 1 ? t.search : t.contact}</h2>
        {step === 1 ? <div className="mt-5 space-y-5">
          <fieldset><legend className="mb-2 text-xs font-medium">{t.intent}</legend><div className="grid grid-cols-2 gap-2">{([["location-longue-duree", t.rent], ["vente", t.buy]] as const).map(([value, label]) => <button key={value} type="button" onClick={() => change("intent", value)} aria-pressed={form.intent === value} className={`min-h-11 border px-3 text-xs ${form.intent === value ? "border-[#65704b] bg-[#f0f2e9] text-[#495236]" : "border-[#e6e1d7]"}`}>{label}</button>)}</div></fieldset>
          <fieldset><legend className="mb-2 text-xs font-medium">{t.type}</legend><div className="flex flex-wrap gap-2">{propertyTypes.map((type) => { const selected = form.types.includes(type); return <button key={type} type="button" onClick={() => change("types", selected ? form.types.filter((item) => item !== type) : [...form.types, type])} aria-pressed={selected} className={`rounded-full border px-3 py-2 text-xs ${selected ? "border-[#65704b] bg-[#f0f2e9] text-[#495236]" : "border-[#e6e1d7]"}`}>{typeLabel[type]}</button>; })}</div></fieldset>
          <div><label className="mb-2 block text-xs font-medium">{form.intent === "vente" ? t.buyBudget : t.rentBudget}</label><div className="grid grid-cols-2 gap-2"><Input type="number" min="0" value={form.budgetMin} onChange={(e) => change("budgetMin", e.target.value)} placeholder={t.min} aria-label={t.min} /><Input type="number" min="0" value={form.budgetMax} onChange={(e) => change("budgetMax", e.target.value)} placeholder={t.max} aria-label={t.max} /></div></div>
          <label className="block text-xs font-medium">{t.areas}<Input value={form.areas} onChange={(e) => change("areas", e.target.value)} placeholder={t.areasHint} className="mt-2" /></label>
          <div className="grid grid-cols-2 gap-3"><label className="space-y-2 text-xs font-medium">{t.bedrooms}<Input type="number" min="0" value={form.bedrooms} onChange={(e) => change("bedrooms", e.target.value)} /></label><label className="space-y-2 text-xs font-medium">{t.furnished}<select value={form.furnishing} onChange={(e) => change("furnishing", e.target.value as RequestForm["furnishing"])} className="h-10 w-full rounded-md border bg-white px-3 text-xs"><option value="any">{t.either}</option><option value="furnished">{t.yes}</option><option value="unfurnished">{t.no}</option></select></label></div>
          <div className="grid grid-cols-2 gap-3"><label className="space-y-2 text-xs font-medium">{t.date}<Input type="date" value={form.availableFrom} onChange={(e) => change("availableFrom", e.target.value)} /></label><label className="space-y-2 text-xs font-medium">{t.distance}<Input type="number" min="0" value={form.distance} onChange={(e) => change("distance", e.target.value)} /></label></div>
          <label className="block text-xs font-medium">{t.reference}<span className="mt-1 block text-[10px] font-normal text-[#888477]">{t.referenceHint}</span><Input value={form.referenceLocation} onChange={(e) => change("referenceLocation", e.target.value)} className="mt-2" /></label>
          <Button type="button" onClick={nextStep} className="h-12 w-full gap-2 bg-[#5d6647]">{t.next}{rtl ? <ArrowLeft size={16} /> : <ArrowRight size={16} />}</Button>
        </div> : <div className="mt-5 space-y-4">
          <label className="block space-y-2 text-xs font-medium">{t.name}<Input required maxLength={120} value={form.name} onChange={(e) => change("name", e.target.value)} /></label>
          <label className="block space-y-2 text-xs font-medium">{t.phone}<Input required type="tel" maxLength={40} placeholder="+212…" value={form.phone} onChange={(e) => change("phone", e.target.value)} /></label>
          <label className="block space-y-2 text-xs font-medium">{t.email}<Input type="email" maxLength={254} value={form.email} onChange={(e) => change("email", e.target.value)} /></label>
          <label className="block space-y-2 text-xs font-medium">{t.profession}<Input maxLength={120} value={form.profession} onChange={(e) => change("profession", e.target.value)} /></label>
          <label className="block space-y-2 text-xs font-medium">{t.profile}<Input maxLength={250} placeholder={t.profileHint} value={form.profile} onChange={(e) => change("profile", e.target.value)} /></label>
          <label className="block space-y-2 text-xs font-medium">{t.notes}<Textarea maxLength={1500} placeholder={t.notesHint} value={form.notes} onChange={(e) => change("notes", e.target.value)} /></label>
          <input aria-hidden="true" tabIndex={-1} autoComplete="off" value={form.website} onChange={(e) => change("website", e.target.value)} className="pointer-events-none absolute h-px w-px opacity-0" />
          <label className="flex cursor-pointer items-start gap-2.5 text-xs leading-5 text-[#625f55]"><input required type="checkbox" checked={form.consent} onChange={(e) => change("consent", e.target.checked)} className="mt-1 accent-[#5d6647]" /><span>{t.consent}</span></label>
          <div className="flex gap-2 pt-2"><Button type="button" variant="outline" onClick={() => setStep(1)} className="h-12 gap-2"><ArrowLeft size={15} />{t.back}</Button><Button type="submit" disabled={loading} className="h-12 flex-1 gap-2 bg-[#5d6647]">{loading ? t.sending : t.send}{!loading && <Check size={16} />}</Button></div>
        </div>}
      </form>}
    </main>
    <Footer />
  </div>;
}
