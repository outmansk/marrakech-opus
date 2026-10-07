import { type FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, ChevronDown, MapPin, MessageCircle } from "lucide-react";
import { motion } from "framer-motion";
import heroImage from "@/assets/hero-marrakech.webp";
import mobileHeroImage from "@/assets/hero-marrakech-mobile-v2.webp";
import { QUARTIERS, type BienService } from "@/types/property";
import { useLocalizedText } from "@/hooks/useLocalizedText";

type Intent = Extract<BienService, "vente" | "location-longue-duree" | "location-courte-duree">;

const WHATSAPP_URL = "https://wa.me/212605387041?text=Bonjour%2C%20je%20souhaite%20%C3%AAtre%20conseill%C3%A9%20pour%20un%20bien%20%C3%A0%20Marrakech.";

const HeroSlideshow = () => {
  const navigate = useNavigate();
  const tL = useLocalizedText();
  const [intent, setIntent] = useState<Intent>("vente");
  const [quartier, setQuartier] = useState("all");

  const tabs: Array<{ value: Intent; label: string; shortLabel: string }> = [
    { value: "vente", label: tL("Acheter", "Buy", "Comprar"), shortLabel: tL("Acheter", "Buy", "Comprar") },
    { value: "location-longue-duree", label: tL("Louer longue durée", "Long-term rent", "Alquiler anual"), shortLabel: tL("Louer", "Rent", "Alquilar") },
    { value: "location-courte-duree", label: tL("Séjourner", "Stay", "Estancia"), shortLabel: tL("Séjourner", "Stay", "Estancia") },
  ];

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const params = new URLSearchParams({ type: intent });
    if (quartier !== "all") params.set("quartier", quartier);
    navigate(`/catalogue?${params.toString()}`);
  };

  const quartierOptions = (
    <>
      <option value="all">{tL("Tous les quartiers", "All neighborhoods", "Todos los barrios")}</option>
      {QUARTIERS.map((item) => <option key={item} value={item}>{item}</option>)}
    </>
  );
  const formLabel = tL("Recherche de propriétés", "Property search", "Búsqueda de propiedades");
  const projectLabel = tL("Projet", "Project", "Proyecto");
  const submitLabel = tL("Voir les propriétés", "View properties", "Ver propiedades");

  return (
    <section className="bg-[#fbf8f2]">
      <div className="relative h-[640px] overflow-hidden bg-[#2a211b] text-[#fbf8f2] lg:h-[880px]">
        <motion.picture initial={{ opacity: 0, scale: 1.03 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.9 }} className="absolute inset-0 block">
          <source media="(min-width: 1024px)" srcSet={heroImage} />
          <img
            src={mobileHeroImage}
            alt={tL("Villa de prestige avec piscine à Marrakech au coucher du soleil", "Luxury villa with pool in Marrakech at sunset", "Villa de lujo con piscina en Marrakech al atardecer")}
            {...{ fetchpriority: "high" }} // React 18 ne reconnaît que l’attribut HTML en minuscules
            className="h-full w-full object-cover object-[58%_50%] lg:object-[50%_60%]"
          />
        </motion.picture>
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(20,16,12,0.6)_0%,rgba(20,16,12,0)_26%,rgba(20,16,12,0.2)_50%,rgba(20,16,12,0.85)_100%)] lg:bg-[linear-gradient(180deg,rgba(20,16,12,0.55)_0%,rgba(20,16,12,0.05)_30%,rgba(20,16,12,0.15)_55%,rgba(20,16,12,0.78)_100%)]" />

        <div className="absolute inset-x-0 bottom-[74px] z-[2] lg:bottom-16">
          <div className="mx-auto flex max-w-[1312px] flex-col gap-4 px-5 lg:gap-10 lg:px-16">
            <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.7 }} className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between lg:gap-16">
              <div className="flex max-w-[820px] flex-col gap-4 lg:gap-[22px]">
                <p className="flex items-center gap-3 text-[11px] font-medium uppercase leading-[1.4] tracking-[0.2em] text-[#f0c9b8] lg:gap-3.5 lg:text-xs lg:leading-none lg:tracking-[0.28em]">
                  <span aria-hidden="true" className="h-px w-7 flex-none bg-[#f0c9b8] lg:w-10" />
                  <span>
                    {tL("Immobilier d’exception", "Exceptional real estate", "Inmuebles excepcionales")}
                    <span className="hidden lg:inline"> {tL("à Marrakech", "in Marrakech", "en Marrakech")}</span>
                  </span>
                </p>
                <h1 className="text-[58px] font-normal leading-[0.92] tracking-[-0.03em] text-[#fbf8f2] lg:text-[104px]">
                  {tL("Trouvez votre adresse", "Find your place", "Encuentre su hogar")}{" "}
                  <em className="italic text-[#f0c9b8]">{tL("à Marrakech", "in Marrakech", "en Marrakech")}</em>
                </h1>
              </div>
              <p className="max-w-[330px] text-[15px] leading-[1.6] text-[#fbf8f2]/90 lg:mb-2.5 lg:text-base lg:leading-[1.7] lg:text-[#fbf8f2]/[0.88]">
                {tL(
                  "Achat, location à l’année ou séjour — nous trouvons le bien qui vous correspond.",
                  "Purchase, long-term rental or stay — we find the property that fits you.",
                  "Compra, alquiler anual o estancia: encontramos la propiedad que le corresponde."
                )}
              </p>
            </motion.div>

            {/* Desktop: horizontal search bar */}
            <motion.form
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.7 }}
              onSubmit={submit}
              aria-label={formLabel}
              className="hidden items-stretch bg-[#fbf8f2] text-[#211f1b] shadow-[0_40px_80px_-40px_rgba(0,0,0,0.6)] lg:flex"
            >
              <div role="group" aria-label={projectLabel} className="flex gap-1 border-r border-[#e3d9ca] p-2">
                {tabs.map((tab) => (
                  <button
                    type="button"
                    key={tab.value}
                    onClick={() => setIntent(tab.value)}
                    aria-pressed={intent === tab.value}
                    className={`min-h-[60px] whitespace-nowrap px-[26px] text-xs font-medium uppercase leading-none tracking-[0.16em] transition-colors duration-200 ${intent === tab.value ? "bg-[#211f1b] text-[#fbf8f2]" : "bg-transparent text-[#211f1b] hover:bg-[#ede5d8]"}`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
              <label className="relative flex flex-1 cursor-pointer items-center gap-3.5 px-[26px]">
                <MapPin size={20} strokeWidth={1.5} aria-hidden="true" className="flex-none text-[#a4573e]" />
                <span className="flex flex-1 flex-col gap-1.5">
                  <span className="text-[10px] font-medium uppercase leading-none tracking-[0.2em] text-[#655f56]">{tL("Quartier", "Neighborhood", "Barrio")}</span>
                  <select value={quartier} onChange={(event) => setQuartier(event.target.value)} className="w-full cursor-pointer appearance-none border-0 bg-transparent p-0 pr-8 text-[17px] leading-[1.2] text-[#211f1b] outline-none">
                    {quartierOptions}
                  </select>
                </span>
                <ChevronDown size={18} strokeWidth={1.5} aria-hidden="true" className="pointer-events-none absolute right-[26px] text-[#655f56]" />
              </label>
              <button className="flex items-center gap-3.5 bg-[#a4573e] px-10 text-xs font-semibold uppercase leading-none tracking-[0.2em] text-white transition-colors duration-200 hover:bg-[#8f4732]">
                {submitLabel}
                <ArrowRight size={18} strokeWidth={1.5} aria-hidden="true" />
              </button>
            </motion.form>
          </div>
        </div>
      </div>

      {/* Mobile: search card overlapping the photo */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className="relative z-[3] mx-4 -mt-11 border border-[#e6ddd0] bg-[#fffdf9] shadow-[0_30px_50px_-36px_rgba(33,31,27,0.55)] lg:hidden"
      >
        <form onSubmit={submit} aria-label={formLabel} className="flex flex-col gap-3 p-4">
          <div role="group" aria-label={projectLabel} className="grid grid-cols-3 gap-1 bg-[#f3ede3] p-1">
            {tabs.map((tab) => (
              <button
                type="button"
                key={tab.value}
                onClick={() => setIntent(tab.value)}
                aria-pressed={intent === tab.value}
                className={`min-h-12 px-1 text-xs font-medium leading-[1.15] transition-colors duration-200 ${intent === tab.value ? "bg-[#211f1b] text-[#fbf8f2]" : "bg-transparent text-[#211f1b]"}`}
              >
                {tab.shortLabel}
              </button>
            ))}
          </div>
          <label className="relative flex min-h-[60px] items-center gap-3 border border-[#d9cebd] bg-[#fbf8f2] px-3.5">
            <MapPin size={20} strokeWidth={1.5} aria-hidden="true" className="flex-none text-[#a4573e]" />
            <span className="flex min-w-0 flex-1 flex-col gap-[5px]">
              <span className="text-[10px] font-medium uppercase leading-none tracking-[0.18em] text-[#655f56]">{tL("Quartier", "Neighborhood", "Barrio")}</span>
              <select value={quartier} onChange={(event) => setQuartier(event.target.value)} className="w-full appearance-none border-0 bg-transparent p-0 pr-7 text-base leading-[1.2] text-[#211f1b] outline-none">
                {quartierOptions}
              </select>
            </span>
            <ChevronDown size={18} strokeWidth={1.5} aria-hidden="true" className="pointer-events-none absolute right-3.5 text-[#655f56]" />
          </label>
          <button className="flex min-h-14 items-center justify-center gap-3 bg-[#a4573e] text-xs font-semibold uppercase leading-none tracking-[0.18em] text-white transition-colors duration-200 hover:bg-[#8f4732] active:bg-[#8f4732]">
            {submitLabel}
            <ArrowRight size={18} strokeWidth={1.5} aria-hidden="true" />
          </button>
        </form>
        <a href={WHATSAPP_URL} target="_blank" rel="noreferrer" className="flex min-h-[52px] items-center justify-center gap-2.5 border-t border-[#ece4d8] font-serif text-xl font-medium italic leading-none text-[#5f6746]">
          <MessageCircle size={18} strokeWidth={1.4} aria-hidden="true" />
          {tL("Parler à un conseiller", "Talk to an advisor", "Hablar con un asesor")}
        </a>
      </motion.div>
    </section>
  );
};

export default HeroSlideshow;
