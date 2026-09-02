import { type FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, MapPin, MessageCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import heroImage from "@/assets/hero-marrakech.jpg";
import mobileHeroImage from "@/assets/hero-marrakech-mobile-v2.webp";
import { QUARTIERS, type BienService } from "@/types/property";
import { useLocalizedText } from "@/hooks/useLocalizedText";

type Intent = Extract<BienService, "vente" | "location-longue-duree" | "location-courte-duree">;

const HeroSlideshow = () => {
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const tL = useLocalizedText();
  const [intent, setIntent] = useState<Intent>("vente");
  const [quartier, setQuartier] = useState("all");
  const language = i18n.language?.slice(0, 2) ?? "fr";

  const tabs: Array<{ value: Intent; label: string }> = [
    { value: "vente", label: tL("Acheter", "Buy", "Comprar") },
    { value: "location-longue-duree", label: tL("Louer longue durée", "Long-term rent", "Alquiler anual") },
    { value: "location-courte-duree", label: tL("Séjourner", "Stay", "Estancia") },
  ];

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const params = new URLSearchParams({ type: intent });
    if (quartier !== "all") params.set("quartier", quartier);
    navigate(`/catalogue?${params.toString()}`);
  };

  return (
    <>
      <section className="relative bg-[#f6f1e8] lg:hidden">
        <div className="relative h-[452px] overflow-hidden">
          <motion.img
            initial={{ opacity: 0, scale: 1.03 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9 }}
            src={mobileHeroImage}
            alt="Villa de prestige avec piscine à Marrakech au coucher du soleil"
            className="h-full w-full object-cover object-[50%_52%]"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/75" />
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.7 }} className="absolute inset-x-0 bottom-8 px-5 text-white">
            <p className="text-[9px] font-medium uppercase tracking-[0.22em] text-[#e7b39f]">
              {tL("Immobilier d’exception à Marrakech", "Exceptional real estate in Marrakech", "Inmuebles excepcionales en Marrakech")}
            </p>
            <h1 className="mt-3 max-w-[310px] text-[49px] leading-[0.88] tracking-[-0.035em] text-white">
              {language === "fr" ? <>Votre adresse<br />à Marrakech</> : language === "es" ? <>Su hogar<br />en Marrakech</> : <>Your place<br />in Marrakech</>}
            </h1>
          </motion.div>
        </div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.6 }} className="relative z-10 -mt-4 rounded-t-[20px] bg-[#f6f1e8] px-5 pb-5 pt-[14px]">
          <p className="text-[15px] leading-6 text-[#4f4a43]">
            {tL("Acheter, louer ou séjourner — simplement.", "Buy, rent or stay — simply.", "Comprar, alquilar o alojarse — fácilmente.")}
          </p>

          <form onSubmit={submit} className="mt-4" aria-label="Recherche de propriétés">
            <div className="grid grid-cols-3 border-b border-[#2b2722]/15">
              {tabs.map((tab) => (
                <button
                  type="button"
                  key={tab.value}
                  onClick={() => setIntent(tab.value)}
                  aria-pressed={intent === tab.value}
                  className={`relative flex min-h-[48px] items-center justify-center px-1.5 pb-2 text-center text-[8.5px] font-medium uppercase leading-[1.18] tracking-[0.11em] outline-none transition-colors duration-300 focus-visible:bg-[#a94f32]/5 focus-visible:ring-0 focus-visible:ring-offset-0 ${intent === tab.value ? "text-[#a94f32]" : "text-[#393631] hover:text-[#746d63]"}`}
                >
                  <span className="max-w-[94px]">{tab.label}</span>
                  {intent === tab.value && (
                    <motion.span
                      layoutId="mobile-search-intent"
                      className="absolute bottom-[-1px] left-1/2 h-[2px] w-[58%] -translate-x-1/2 rounded-full bg-[#a94f32]"
                      transition={{ type: "spring", stiffness: 420, damping: 34 }}
                    />
                  )}
                </button>
              ))}
            </div>

            <label className="relative mt-4 flex min-h-[66px] items-center rounded-[14px] border border-[#2b2722]/10 bg-white/60 px-4 transition-colors focus-within:border-[#a94f32]/45 focus-within:bg-white/80">
              <MapPin size={21} strokeWidth={1.45} className="mr-3.5 shrink-0 text-[#a94f32]" />
              <span className="pointer-events-none absolute left-[52px] top-2.5 text-[10px] font-medium tracking-[0.02em] text-[#8a8379]">
                {tL("Quartier", "Neighborhood", "Barrio")}
              </span>
              <select value={quartier} onChange={(event) => setQuartier(event.target.value)} className="h-[66px] w-full appearance-none bg-transparent pb-1 pr-8 pt-5 text-[16px] text-[#2f2c28] outline-none">
                <option value="all">{tL("Tous les quartiers", "All neighborhoods", "Todos los barrios")}</option>
                {QUARTIERS.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
              <ChevronDown size={18} strokeWidth={1.45} className="pointer-events-none absolute right-4 text-[#45413b]" />
            </label>

            <button className="mt-3 min-h-[48px] w-full rounded-[12px] bg-[#ae4f31] px-5 text-[10px] font-semibold uppercase tracking-[0.18em] text-white shadow-[0_8px_22px_rgba(139,62,38,0.14)] transition-all duration-200 hover:bg-[#9c452c] active:translate-y-px active:bg-[#8f4029]">
              {tL("Découvrir les biens", "Discover properties", "Descubrir propiedades")}
            </button>
          </form>

          <a href="https://wa.me/212605387041?text=Bonjour%2C%20je%20souhaite%20%C3%AAtre%20conseill%C3%A9%20pour%20un%20bien%20%C3%A0%20Marrakech." target="_blank" rel="noreferrer" className="mt-3 inline-flex min-h-11 items-center gap-2 border-b border-[#5f6746]/40 font-serif text-[20px] text-[#5f6746]">
            <MessageCircle size={19} strokeWidth={1.35} /> {tL("Parler à un conseiller", "Talk to an advisor", "Hablar con un asesor")}
          </a>
        </motion.div>
      </section>

      <section className="hidden bg-[#f6f1e8] pt-16 lg:block">
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
          <img src={heroImage} alt="Villa de prestige avec piscine à Marrakech" fetchPriority="high" className="h-full w-full object-cover" />
        </motion.div>
      </div>
      </section>
    </>
  );
};

export default HeroSlideshow;
