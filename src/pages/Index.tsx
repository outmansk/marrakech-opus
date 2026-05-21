import { Link } from "react-router-dom";
import { useState } from "react";
import { Search, Home, Key, BarChart3, ArrowRight } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HeroSlideshow from "@/components/HeroSlideshow";
import PropertiesCarousel from "@/components/PropertiesCarousel";
import slide5 from "@/assets/slide5.jpg";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { Reveal, PageTransition, EASE_LUXURY } from "@/components/motion/Animations";

const Index = () => {
  const { t, i18n } = useTranslation();
  const [searchType, setSearchType] = useState<"vente" | "location-courte-duree" | "location-longue-duree">("vente");

  const tL = (fr: string, en: string, es: string) => {
    const lang = i18n.language?.slice(0, 2) ?? 'fr';
    if (lang === 'en') return en;
    if (lang === 'es') return es;
    return fr;
  };

  return (
    <PageTransition>
      <div className="min-h-screen">
        <Helmet>
          <title>{tL("Live In Marrakech — L'Excellence Immobilière à Marrakech", "Live In Marrakech — Luxury Real Estate in Marrakech", "Live In Marrakech — Excelencia Inmobiliaria en Marrakech")}</title>
          <meta name="description" content={tL("Découvrez nos propriétés d'exception à Marrakech. Villas, riads, appartements en vente et location. Votre partenaire immobilier de confiance.", "Discover our exceptional properties in Marrakech. Villas, riads, apartments for sale and rent. Your trusted real estate partner.", "Descubra nuestras propiedades excepcionales en Marrakech. Villas, riads, apartamentos en venta y alquiler. Su socio inmobiliario de confianza.")} />
        </Helmet>

        <Header />

        {/* ═══════════════════════ SECTION 1 — Hero Slideshow ═══════════════════════ */}
        <HeroSlideshow />

        {/* ═══════════════════════ SECTION 2 — Four Seasons Style Search ═══════════════════════ */}
        <section className="bg-[#FAF8F3] py-16 relative z-20">
          <div className="container mx-auto px-6 md:px-12">
            
            {/* ── Luxury Search Interface ── */}
            <div className="max-w-3xl mx-auto">
              {/* Premium Segmented Service tabs with Framer Motion liquid animation */}
              <div className="bg-[#F5F0E8] border border-[#0A0A0A]/5 p-1 flex w-full max-w-lg mx-auto rounded-full mb-8 relative">
                {([
                  { key: "vente" as const, label: t("hero.acheter") },
                  { key: "location-courte-duree" as const, label: t("hero.louer_court") },
                  { key: "location-longue-duree" as const, label: t("hero.louer_long") },
                ]).map((tab) => {
                  const isActive = searchType === tab.key;
                  return (
                    <button
                      key={tab.key}
                      onClick={() => setSearchType(tab.key)}
                      className={`flex-1 py-3 text-[9px] sm:text-[10px] tracking-[0.18em] uppercase font-sans font-medium
                        transition-colors duration-300 relative z-10 text-center rounded-full whitespace-nowrap ${
                        isActive ? "text-white" : "text-[#0A0A0A]/60 hover:text-[#0A0A0A]"
                      }`}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="activeSearchTab"
                          className="absolute inset-0 bg-[#0A0A0A] rounded-full -z-10 shadow-sm"
                          transition={{ type: "spring", stiffness: 380, damping: 30 }}
                        />
                      )}
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              {/* Luxury Search input + button */}
              <div className="flex flex-col sm:flex-row gap-3 items-stretch max-w-2xl mx-auto w-full">
                <div className="flex-1 relative">
                  <Search size={16} strokeWidth={1.25} className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground/60" />
                  <input
                    type="text"
                    placeholder={tL("Rechercher par quartier, type...", "Search by neighborhood, type...", "Buscar por barrio, tipo...")}
                    className="w-full h-14 pl-12 pr-6 bg-white border border-[#0A0A0A]/5 shadow-sm rounded-full text-sm font-sans font-light
                      placeholder:text-muted-foreground/40 focus:outline-none focus:border-[#0A0A0A]/20 transition-all duration-300"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        window.location.href = `/catalogue?type=${searchType}`;
                      }
                    }}
                  />
                </div>
                <Link
                  to={`/catalogue?type=${searchType}`}
                  className="h-14 px-8 bg-[#0A0A0A] text-white flex items-center justify-center gap-2
                    text-[10px] tracking-[0.2em] uppercase font-sans font-medium rounded-full
                    hover:bg-[#0A0A0A]/90 transition-all duration-300 shadow-md hover:shadow-lg shrink-0 text-center"
                >
                  <span>{tL("Rechercher", "Search", "Buscar")}</span>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════ SECTION 3 — Properties Carousel ═══════════════════════ */}
        <PropertiesCarousel />

        {/* ═══════════════════════ SECTION 4 — L'Expérience Marrakech ═══════════════════════ */}
        <section className="bg-[#FAF8F3] py-20 md:py-28 overflow-hidden">
          <div className="container mx-auto px-6 md:px-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
              {/* Left — Image */}
              <Reveal direction="left">
                <div className="relative aspect-[4/5] overflow-hidden">
                  <img
                    src={slide5}
                    alt="L'expérience Marrakech"
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  {/* Decorative border */}
                  <div className="absolute inset-4 border border-white/30 pointer-events-none" />
                </div>
              </Reveal>

              {/* Right — Text */}
              <Reveal direction="right">
                <div className="space-y-8">
                  <div>
                    <p className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground mb-4 font-sans">
                      {tL("NOS SERVICES", "OUR SERVICES", "NUESTROS SERVICIOS")}
                    </p>
                    <h2 className="font-serif mb-4">
                      {t("homepage.services_titre")}
                    </h2>
                    <p className="text-muted-foreground font-light leading-relaxed max-w-md">
                      {tL(
                        "Bénéficiez d'un accompagnement personnalisé tout au long de votre projet immobilier à Marrakech. De l'acquisition à la gestion, nous assurons l'excellence à chaque étape.",
                        "Benefit from personalized support throughout your real estate project in Marrakech. From acquisition to management, we ensure excellence at every stage.",
                        "Benefíciese de un acompañamiento personalizado a lo largo de su proyecto inmobiliario en Marrakech. Desde la adquisición hasta la gestión, garantizamos la excelencia en cada etapa."
                      )}
                    </p>
                  </div>

                  {/* 3 service items */}
                  <div className="space-y-6">
                    {[
                      {
                        icon: Home,
                        title: t("homepage.service_vente_titre"),
                        desc: t("homepage.service_vente_desc"),
                        link: "/catalogue?type=vente",
                      },
                      {
                        icon: Key,
                        title: t("homepage.service_location_titre"),
                        desc: t("homepage.service_location_desc"),
                        link: "/catalogue?type=location-longue-duree",
                      },
                      {
                        icon: BarChart3,
                        title: t("homepage.service_gestion_titre"),
                        desc: t("homepage.service_gestion_desc"),
                        link: "/contact",
                      },
                    ].map((service, i) => (
                      <Link
                        key={i}
                        to={service.link}
                        className="group flex items-start gap-5 p-4 -mx-4 transition-colors duration-300 hover:bg-white/60 rounded-sm"
                      >
                        <div className="w-11 h-11 shrink-0 border border-[#0A0A0A]/15 flex items-center justify-center
                          group-hover:bg-[#0A0A0A] group-hover:text-white group-hover:border-[#0A0A0A] transition-all duration-400">
                          <service.icon size={18} strokeWidth={1.25} />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-serif text-lg mb-1">{service.title}</h4>
                          <p className="text-muted-foreground text-sm font-light leading-relaxed">{service.desc}</p>
                        </div>
                        <ArrowRight
                          size={16}
                          strokeWidth={1.25}
                          className="mt-1 text-muted-foreground/40 group-hover:text-[#0A0A0A] group-hover:translate-x-1 transition-all duration-300 shrink-0"
                        />
                      </Link>
                    ))}
                  </div>

                  {/* CTA */}
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.3, ease: EASE_LUXURY }}
                  >
                    <Link
                      to="/contact"
                      className="inline-block border border-[#0A0A0A] text-[#0A0A0A] px-10 py-3.5
                        text-[10px] tracking-[0.25em] uppercase font-sans font-medium
                        hover:bg-[#0A0A0A] hover:text-white transition-all duration-300"
                    >
                      {t("contact.nous_contacter")}
                    </Link>
                  </motion.div>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        {/* ═══════════════════════ SECTION 5 — Footer ═══════════════════════ */}
        <Footer />
      </div>
    </PageTransition>
  );
};

export default Index;
