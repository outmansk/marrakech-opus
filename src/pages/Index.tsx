import { Link } from "react-router-dom";
import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { ArrowRight, Search, Home, Key, BarChart3, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PropertyCard from "@/components/PropertyCard";
import { supabase } from "@/lib/supabase";
import type { Bien } from "@/types/property";
import type { Article } from "@/types/article";
import { useTranslation } from "react-i18next";
import LazyImage from "@/components/LazyImage";
import { useCounter } from "@/hooks/useScrollReveal";
import GalleryCarousel from "@/components/GalleryCarousel";
import Testimonials from "@/components/Testimonials";
import { motion, AnimatePresence } from "framer-motion";
import { Reveal, StaggerContainer, staggerItemVariants, PageTransition, SplitText, EASE_LUXURY } from "@/components/motion/Animations";
import { useInView } from "react-intersection-observer";
import slide1 from "@/assets/slide1.jpg";
import slide2 from "@/assets/slide2.jpg";
import slide3 from "@/assets/slide3.jpg";
import slide4 from "@/assets/slide4.jpg";
import slide5 from "@/assets/slide5.jpg";

const DISPLAY_MS = 5000;
const FADE_MS    = 2000;

/* ── Stat Counter Component ── */
const StatItem = ({ value, label, suffix = "", delay = 0 }: { value: number; label: string; suffix?: string; delay?: number }) => {
  const [triggered, setTriggered] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const counterRef = useCounter(value, 2200, triggered);

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setTimeout(() => setTriggered(true), delay); obs.unobserve(el); } },
      { threshold: 0.3 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [delay]);

  return (
    <div ref={wrapperRef} className="text-center group">
      <div className="text-4xl md:text-5xl font-serif font-light text-foreground mb-2 tabular-nums">
        <span ref={counterRef}>0</span>{suffix}
      </div>
      <p className="text-[10px] tracking-[0.3em] uppercase font-sans text-muted-foreground">{label}</p>
    </div>
  );
};

const Index = () => {
  const { t } = useTranslation();
  const [featured, setFeatured] = useState<Bien[]>([]);
  const [latestArticles, setLatestArticles] = useState<Article[]>([]);
  const [searchType, setSearchType] = useState<"vente" | "location-courte-duree" | "location-longue-duree">("vente");
  const [activeIndex, setActiveIndex] = useState(0);
  const [scrollY, setScrollY] = useState(0);

  const heroSlides = useMemo(() => [
    { image: slide1, title: t("hero.slide1_title"), subtitle: t("hero.slide1_subtitle") },
    { image: slide2, title: t("hero.slide2_title"), subtitle: t("hero.slide2_subtitle") },
    { image: slide3, title: t("hero.slide3_title"), subtitle: t("hero.slide3_subtitle") },
    { image: slide4, title: t("hero.slide4_title"), subtitle: t("hero.slide4_subtitle") },
    { image: slide5, title: t("hero.slide5_title"), subtitle: t("hero.slide5_subtitle") }
  ], [t]);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % heroSlides.length);
    }, DISPLAY_MS + FADE_MS);
    return () => clearInterval(interval);
  }, [heroSlides.length]);

  useEffect(() => {
    const fetchData = async () => {
      const { data: propsData } = await supabase
        .from("properties_v2")
        .select("*")
        .eq("statut", "publie")
        .order("created_at", { ascending: false })
        .limit(6);
      if (propsData) setFeatured(propsData as Bien[]);

      const { data: artsData } = await supabase
        .from("articles")
        .select("*")
        .eq("est_publie", true)
        .order("created_at", { ascending: false })
        .limit(3);
      if (artsData) setLatestArticles(artsData as Article[]);
    };
    fetchData();
  }, []);

  const scrollToContent = useCallback(() => {
    window.scrollTo({ top: window.innerHeight - 80, behavior: "smooth" });
  }, []);

  return (
    <PageTransition>
    <div className="min-h-screen">
      <Header />

      {/* ═══════════════════════ HERO — Immersive Full-Screen ═══════════════════════ */}
      <section className="relative h-screen overflow-hidden bg-black">
        {/* Background slides with Ken Burns */}
        {heroSlides.map((slide, i) => (
          <div
            key={i}
            className={`absolute inset-0 transition-opacity duration-[2000ms] ease-in-out
              ${i === activeIndex ? "opacity-100 z-10" : "opacity-0 z-0"}`}
          >
            <div
              className="absolute inset-0 h-[120%] -top-[10%]"
              style={{ transform: `translateY(${scrollY * 0.35}px)` }}
            >
              <div
                className={`absolute inset-0 transition-transform duration-[14000ms] ease-out
                  ${i === activeIndex ? "scale-[1.15]" : "scale-100"}`}
              >
                <img
                  src={slide.image}
                  alt={slide.title}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            {/* Multi-layer gradient for depth */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/20 to-black/70 z-10" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/30 z-10" />
          </div>
        ))}

        {/* Floating ambient orbs */}
        <div className="absolute inset-0 z-[11] pointer-events-none overflow-hidden">
          <div className="floating-orb absolute top-[15%] left-[10%] w-64 h-64 rounded-full bg-amber-500/[0.04] blur-3xl" />
          <div className="floating-orb absolute bottom-[20%] right-[15%] w-80 h-80 rounded-full bg-white/[0.03] blur-3xl" style={{ animationDelay: "-7s" }} />
        </div>

        {/* Hero content */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 z-20 pointer-events-none"
          style={{ transform: `translateY(${scrollY * 0.15}px)` }}
        >
          {/* Overline */}
          <motion.div
            className="overflow-hidden mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: EASE_LUXURY }}
          >
            <p className="text-white/50 text-[10px] md:text-xs tracking-[0.5em] uppercase font-sans font-light">
              Live In Marrakech
            </p>
          </motion.div>

          {/* Main title — split text letter-by-letter */}
          <div className="max-w-5xl overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.h1
                key={`title-${activeIndex}`}
                className="text-white mb-6 font-serif text-4xl md:text-6xl lg:text-7xl leading-[1.1] font-light tracking-[0.02em] drop-shadow-2xl"
                initial={{ opacity: 0, y: 60 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ duration: 0.9, ease: EASE_LUXURY }}
              >
                {heroSlides[activeIndex].title}
              </motion.h1>
            </AnimatePresence>
          </div>

          {/* Decorative line */}
          <motion.div
            className="w-16 h-[1px] bg-gradient-to-r from-transparent via-white/60 to-transparent my-6"
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            transition={{ duration: 1, delay: 0.6, ease: EASE_LUXURY }}
          />

          {/* Subtitle */}
          <div className="max-w-2xl overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.p
                key={`sub-${activeIndex}`}
                className="text-white/70 font-sans font-light tracking-[0.15em] uppercase text-[10px] md:text-xs leading-relaxed"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.8, delay: 0.2, ease: EASE_LUXURY }}
              >
                {heroSlides[activeIndex].subtitle}
              </motion.p>
            </AnimatePresence>
          </div>
        </div>

        {/* Slide indicators */}
        <div className="absolute bottom-[200px] md:bottom-[220px] left-1/2 -translate-x-1/2 z-20 flex gap-3">
          {heroSlides.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              className={`h-[2px] transition-all duration-500 ${i === activeIndex ? "w-12 bg-white" : "w-6 bg-white/30 hover:bg-white/50"}`}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>

        {/* Search bar — glassmorphism redesigned */}
        <div className="absolute inset-x-0 bottom-8 md:bottom-16 flex justify-center px-4 md:px-6 z-20">
          <div
            className="glass-card p-5 md:p-7 w-full max-w-3xl shadow-2xl
              animate-fade-in"
            style={{ animationDelay: "1.2s" }}
          >
            {/* Service tabs */}
            <div className="flex justify-center gap-1 mb-5">
              {(["vente", "location-courte-duree", "location-longue-duree"] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setSearchType(type)}
                  className={`px-5 py-2.5 text-[10px] md:text-[11px] tracking-[0.2em] uppercase font-sans font-light transition-all duration-300 rounded-sm
                    ${searchType === type
                      ? "bg-white/15 text-white border border-white/20"
                      : "text-white/45 hover:text-white/70 border border-transparent"
                    }`}
                >
                  {type === "vente" ? t("hero.acheter") : type === "location-courte-duree" ? t("hero.louer_court") : t("hero.louer_long")}
                </button>
              ))}
            </div>

            {/* Search button */}
            <Link to={`/catalogue?type=${searchType}`} className="block">
              <Button
                variant="outline"
                size="lg"
                className="w-full h-14 gap-3 text-[10px] md:text-xs tracking-[0.2em] uppercase
                  bg-white/[0.08] hover:bg-white hover:text-black
                  border-white/15 text-white/90
                  transition-all duration-500 rounded-none shadow-none"
              >
                <Search size={16} strokeWidth={1.25} />
                {t("hero.lancer_recherche")}
              </Button>
            </Link>
          </div>
        </div>

        {/* Scroll hint */}
        <button
          onClick={scrollToContent}
          className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 text-white/30 hover:text-white/60 transition-colors pointer-events-auto hidden md:block"
          aria-label="Scroll down"
        >
          <ChevronDown size={20} strokeWidth={1} className="animate-bounce" />
        </button>
      </section>

      {/* ═══════════════════════ SERVICES ═══════════════════════ */}
      <section className="py-20 md:py-28 bg-secondary/50 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="floating-orb absolute top-[30%] left-[5%] w-72 h-72 rounded-full bg-amber-200/20 blur-[80px]" style={{ animationDelay: "-12s" }} />
        </div>

        <div className="container mx-auto px-6 md:px-12">
          <Reveal className="text-center mb-16 md:mb-20">
            <p className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground mb-4 font-sans">{t("homepage.services_sous_titre")}</p>
            <h2 className="max-w-2xl mx-auto">{t("homepage.services_titre")}</h2>
          </Reveal>

          {/* Desktop Layout: Grid */}
          <StaggerContainer className="hidden md:grid grid-cols-3 gap-8 md:gap-10" stagger={0.15}>
            {[
              { icon: Home, title: t("homepage.service_vente_titre"), desc: t("homepage.service_vente_desc"), link: "/catalogue?type=vente" },
              { icon: Key, title: t("homepage.service_location_titre"), desc: t("homepage.service_location_desc"), link: "/catalogue?type=location-longue-duree" },
              { icon: BarChart3, title: t("homepage.service_gestion_titre"), desc: t("homepage.service_gestion_desc"), link: "/contact" },
            ].map((service, i) => (
              <motion.div key={i} variants={staggerItemVariants}>
              <Link
                to={service.link}
                className="group relative bg-background border border-border/60 p-8 md:p-10 transition-all duration-500
                  hover:border-foreground/20 hover:shadow-xl hover:shadow-black/[0.03] hover:-translate-y-1 h-full flex flex-col"
              >
                <div className="w-12 h-12 rounded-full border border-border/60 flex items-center justify-center mb-6
                  group-hover:border-foreground/30 group-hover:bg-foreground group-hover:text-background transition-all duration-500">
                  <service.icon size={20} strokeWidth={1.25} />
                </div>
                <h3 className="text-xl md:text-2xl font-serif mb-3">{service.title}</h3>
                <p className="text-muted-foreground font-light text-sm leading-relaxed mb-6 flex-grow">{service.desc}</p>
                <span className="inline-flex items-center gap-2 text-[10px] tracking-[0.2em] uppercase font-sans font-medium text-muted-foreground group-hover:text-foreground transition-colors mt-auto pt-4">
                  {t("homepage.decouvrir")}
                  <ArrowRight size={14} strokeWidth={1.25} className="transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
              </motion.div>
            ))}
          </StaggerContainer>
        </div>

        {/* Mobile Layout: Infinite Marquee */}
        <div className="md:hidden w-full overflow-hidden relative mt-8 z-10">
          <div className="absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-secondary/50 to-transparent z-10 pointer-events-none" />
          <div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-secondary/50 to-transparent z-10 pointer-events-none" />
          
          <div className="flex w-max animate-marquee py-4">
            {[
              { icon: Home, title: t("homepage.service_vente_titre"), desc: t("homepage.service_vente_desc"), link: "/catalogue?type=vente" },
              { icon: Key, title: t("homepage.service_location_titre"), desc: t("homepage.service_location_desc"), link: "/catalogue?type=location-longue-duree" },
              { icon: BarChart3, title: t("homepage.service_gestion_titre"), desc: t("homepage.service_gestion_desc"), link: "/contact" },
              // Duplicate for infinite loop
              { icon: Home, title: t("homepage.service_vente_titre"), desc: t("homepage.service_vente_desc"), link: "/catalogue?type=vente" },
              { icon: Key, title: t("homepage.service_location_titre"), desc: t("homepage.service_location_desc"), link: "/catalogue?type=location-longue-duree" },
              { icon: BarChart3, title: t("homepage.service_gestion_titre"), desc: t("homepage.service_gestion_desc"), link: "/contact" },
            ].map((service, i) => (
              <div key={i} className="w-[85vw] sm:w-[60vw] shrink-0 mx-3 h-full">
                <Link
                  to={service.link}
                  className="group relative bg-background border border-border/60 p-8 transition-all duration-500
                    hover:border-foreground/20 hover:shadow-xl hover:shadow-black/[0.03] block h-full flex flex-col"
                >
                  <div className="w-12 h-12 rounded-full border border-border/60 flex items-center justify-center mb-6
                    group-hover:border-foreground/30 group-hover:bg-foreground group-hover:text-background transition-all duration-500">
                    <service.icon size={20} strokeWidth={1.25} />
                  </div>
                  <h3 className="text-xl font-serif mb-3">{service.title}</h3>
                  <p className="text-muted-foreground font-light text-sm leading-relaxed mb-6 flex-grow">{service.desc}</p>
                  <span className="inline-flex items-center gap-2 text-[10px] tracking-[0.2em] uppercase font-sans font-medium text-muted-foreground group-hover:text-foreground transition-colors mt-auto pt-4">
                    {t("homepage.decouvrir")}
                    <ArrowRight size={14} strokeWidth={1.25} className="transition-transform group-hover:translate-x-1" />
                  </span>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════ STATS BAR ═══════════════════════ */}
      <section className="py-16 md:py-20 bg-background relative border-b border-border/40">
        <div className="absolute inset-0 pointer-events-none">
          <div className="floating-orb absolute -top-20 right-[20%] w-96 h-96 rounded-full bg-amber-100/30 blur-[100px]" style={{ animationDelay: "-5s" }} />
        </div>
        <div className="container mx-auto px-6 md:px-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            <StatItem value={150} suffix="+" label={t("homepage.stats_biens")} delay={0} />
            <StatItem value={500} suffix="+" label={t("homepage.stats_clients")} delay={150} />
            <StatItem value={12} label={t("homepage.stats_quartiers")} delay={300} />
            <StatItem value={8} label={t("homepage.stats_annees")} delay={450} />
          </div>
        </div>
      </section>

      {/* ═══════════════════════ FEATURED PROPERTIES ═══════════════════════ */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-6 md:px-12">
          <Reveal className="flex items-end justify-between mb-16">
            <div>
              <p className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground mb-4 font-sans">{t("biens.exclusivites")}</p>
              <h2>{t("biens.residences_investissements")}</h2>
            </div>
            <Link to="/catalogue" className="hidden md:flex items-center gap-2 text-xs tracking-widest uppercase text-muted-foreground hover:text-foreground transition-colors font-sans group">
              {t("biens.voir_tout")}
              <ArrowRight size={16} strokeWidth={1.25} className="transition-transform group-hover:translate-x-1" />
            </Link>
          </Reveal>

          {featured.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
              {featured.map((property, i) => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  revealDelay={i * 120}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-muted-foreground font-light">{t("biens.aucun_bien")}</p>
              <p className="text-muted-foreground font-light mt-2 text-sm">
                {t("biens.ajouter_via_admin")}
              </p>
            </div>
          )}

          <div className="text-center mt-16 md:hidden">
            <Link to="/catalogue">
              <Button variant="luxury-ghost" size="lg">
                {t("biens.voir_catalogue")}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════════ CAROUSEL GALERIE ═══════════════════════ */}
      <GalleryCarousel />

      {/* ═══════════════════════ TEMOIGNAGES 3D ═══════════════════════ */}
      <Testimonials />

      {/* ═══════════════════════ BLOG ═══════════════════════ */}
      {latestArticles.length > 0 && (
        <section className="py-20 md:py-28">
          <div className="container mx-auto px-6 md:px-12">
            <div className="flex items-end justify-between mb-16">
              <div>
                <p className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground mb-4 font-sans">{t("blog.actualites")}</p>
                <h2>{t("blog.derniers_articles")}</h2>
              </div>
              <Link to="/blog" className="hidden md:flex items-center gap-2 text-xs tracking-widest uppercase text-muted-foreground hover:text-foreground transition-colors font-sans group">
                {t("blog.voir_tout")}
                <ArrowRight size={16} strokeWidth={1.25} className="transition-transform group-hover:translate-x-1" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
              {latestArticles.map((article) => (
                <Link
                  to={`/blog/${article.slug}`}
                  key={article.id}
                  className="group flex flex-col items-start h-full border border-border bg-card overflow-hidden
                    hover:shadow-xl hover:shadow-black/[0.04] transition-all duration-500 hover:-translate-y-1"
                >
                  <div className="relative w-full aspect-[4/3] overflow-hidden bg-muted img-zoom">
                    <LazyImage src={article.image_url} alt={article.title} className="w-full h-full object-cover" wrapperClassName="w-full h-full" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  </div>
                  <div className="p-6 flex flex-col flex-grow w-full">
                    <h3 className="font-serif text-lg mb-3 line-clamp-2 transition-colors duration-300">{article.title}</h3>
                    <p className="text-muted-foreground font-light text-sm line-clamp-3 mb-6">{article.excerpt}</p>
                    <div className="mt-auto flex items-center gap-2 text-[10px] tracking-[0.2em] uppercase font-sans font-medium text-muted-foreground group-hover:text-foreground transition-all duration-300">
                      {t("blog.lire_article")} <ArrowRight size={14} strokeWidth={1} className="transition-transform duration-300 group-hover:translate-x-1" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            <div className="text-center mt-12 md:hidden">
              <Link to="/blog">
                <Button variant="luxury-ghost" size="lg">
                  {t("blog.visiter_blog")}
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ═══════════════════════ CTA ═══════════════════════ */}
      <section className="relative py-28 md:py-36 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-foreground" />
        <div className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }}
        />

        <Reveal className="container mx-auto px-6 md:px-12 text-center relative z-10">
          <p className="text-[10px] tracking-[0.4em] uppercase text-primary-foreground/40 font-sans mb-6">Live In Marrakech</p>
          <h2 className="text-primary-foreground mb-6 max-w-3xl mx-auto">{t("contact.cta_titre")}</h2>
          <div className="w-12 h-[1px] bg-primary-foreground/20 mx-auto my-8" />
          <p className="text-primary-foreground/50 font-light text-lg max-w-xl mx-auto mb-12 leading-relaxed">
            {t("contact.cta_texte")}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/catalogue">
              <Button variant="luxury" size="lg" className="h-14 px-12 tracking-widest">
                {t("contact.decouvrir_biens")}
              </Button>
            </Link>
            <a href="https://wa.me/212605387041" target="_blank" rel="noopener noreferrer">
              <Button variant="luxury-ghost" size="lg" className="h-14 px-12 tracking-widest border-primary-foreground/20 text-primary-foreground/70 hover:text-primary-foreground hover:border-primary-foreground/40">
                {t("contact.nous_contacter")}
              </Button>
            </a>
          </div>
        </Reveal>
      </section>

      <Footer />
    </div>
    </PageTransition>
  );
};

export default Index;
