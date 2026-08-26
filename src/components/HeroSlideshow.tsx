import { type FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, MapPin, MessageCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import heroImage from "@/assets/hero-marrakech.jpg";
import { QUARTIERS, type BienService } from "@/types/property";

type Intent = Extract<BienService, "vente" | "location-longue-duree" | "location-courte-duree">;

const HeroSlideshow = () => {
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const [intent, setIntent] = useState<Intent>("vente");
  const [quartier, setQuartier] = useState("all");

  const tL = (fr: string, en: string, es: string) => {
    const language = i18n.language?.slice(0, 2) ?? "fr";
    return language === "en" ? en : language === "es" ? es : fr;
  };

  const tabs: Array<{ value: Intent; label: string }> = [
    { value: "vente", label: tL("Acheter", "Buy", "Comprar") },
    { value: "location-longue-duree", label: tL("Louer à l’année", "Long-term rent", "Alquiler anual") },
    { value: "location-courte-duree", label: tL("Séjourner", "Stay", "Estancia") },
  ];

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const params = new URLSearchParams({ type: intent });
    if (quartier !== "all") params.set("quartier", quartier);
    navigate(`/catalogue?${params.toString()}`);
  };

  return (
    <section className="bg-[#f6f1e8] pt-16">
      <div className="mx-auto grid max-w-[1440px] lg:min-h-[470px] lg:grid-cols-[43%_57%]">
        <div className="order-2 flex items-center px-5 py-9 sm:px-8 md:px-12 lg:order-1 lg:items-start lg:px-12 lg:pb-0 lg:pt-14 xl:px-16">
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65 }} className="w-full max-w-[510px]">
            <p className="mb-4 text-[9px] font-medium uppercase tracking-[0.24em] text-[#a4573e] sm:text-[10px] lg:hidden">
              {tL("Immobilier d’exception à Marrakech", "Exceptional real estate in Marrakech", "Inmuebles excepcionales en Marrakech")}
            </p>
            <h1 className="max-w-[510px] text-[44px] leading-[0.95] tracking-[-0.035em] text-[#211f1b] sm:text-[50px] lg:text-[50px] xl:text-[54px]">
              {tL("Trouvez votre adresse à Marrakech", "Find your place in Marrakech", "Encuentre su hogar en Marrakech")}
            </h1>
            <p className="mt-5 max-w-[470px] text-[14px] leading-6 text-[#655f56] sm:text-[15px] sm:leading-7">
              {tL(
                "Achat, location à l’année ou séjour — nous trouvons le bien qui vous correspond.",
                "Purchase, long-term rental or stay — we find the property that fits you.",
                "Compra, alquiler anual o estancia: encontramos la propiedad que le corresponde."
              )}
            </p>

            <form onSubmit={submit} className="mt-6" aria-label="Recherche de propriétés">
              <div className="grid grid-cols-3 border-b border-[#2b2722]/20">
                {tabs.map((tab) => (
                  <button type="button" key={tab.value} onClick={() => setIntent(tab.value)} className={`relative min-h-11 px-2 text-[9px] font-medium uppercase tracking-[0.12em] transition-colors duration-200 sm:text-[10px] ${intent === tab.value ? "text-[#211f1b]" : "text-[#777065] hover:text-[#211f1b]"}`}>
                    {tab.label}
                    {intent === tab.value && <span className="absolute inset-x-0 bottom-[-1px] h-[2px] bg-[#a4573e]" />}
                  </button>
                ))}
              </div>

              <label className="relative mt-4 flex h-[52px] items-center border border-[#2b2722]/15 bg-white/65 px-4">
                <MapPin size={17} strokeWidth={1.4} className="mr-3 shrink-0 text-[#a4573e]" />
                <span className="sr-only">Quartier</span>
                <select value={quartier} onChange={(event) => setQuartier(event.target.value)} className="h-full w-full appearance-none bg-transparent pr-8 text-sm text-[#413d37] outline-none">
                  <option value="all">{tL("Tous les quartiers", "All neighborhoods", "Todos los barrios")}</option>
                  {QUARTIERS.map((item) => <option key={item} value={item}>{item}</option>)}
                </select>
                <ChevronDown size={16} strokeWidth={1.3} className="pointer-events-none absolute right-4 text-[#777065]" />
              </label>

              <button className="mt-3 h-[52px] w-full bg-[#a4573e] px-6 text-[10px] font-semibold uppercase tracking-[0.19em] text-white transition-colors duration-200 hover:bg-[#8f4732]">
                {tL("Voir les propriétés", "View properties", "Ver propiedades")}
              </button>
            </form>

            <a href="https://wa.me/212605387041?text=Bonjour%2C%20je%20souhaite%20%C3%AAtre%20conseill%C3%A9%20pour%20un%20bien%20%C3%A0%20Marrakech." target="_blank" rel="noreferrer" className="mt-5 inline-flex items-center gap-2 border-b border-[#5f6746]/35 pb-1 text-[10px] font-medium uppercase tracking-[0.16em] text-[#5f6746] transition-colors hover:text-[#41482f]">
              <MessageCircle size={15} strokeWidth={1.4} /> {tL("Parler à un conseiller", "Talk to an advisor", "Hablar con un asesor")}
            </a>
          </motion.div>
        </div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }} className="order-1 h-[285px] overflow-hidden sm:h-[380px] lg:order-2 lg:h-auto lg:min-h-[470px] lg:[clip-path:polygon(10%_0,100%_0,100%_100%,0_100%)]">
          <img src={heroImage} alt="Villa de prestige avec piscine à Marrakech" className="h-full w-full object-cover" />
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSlideshow;
