import { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { EASE_LUXURY } from "@/components/motion/Animations";
import { useTranslation } from "react-i18next";

import slide1 from "@/assets/slide1_koutoubia.png";
import slide2 from "@/assets/slide2.jpg";
import slide4 from "@/assets/slide4.jpg";

/* ── Slide data ─────────────────────────────────────────────────────────────── */
const SLIDES = [
  {
    image: slide1,
    titleKey: "hero.slide1_title",
  },
  {
    image: slide2,
    titleKey: "hero.slide2_title",
  },
  {
    image: slide4,
    titleKey: "hero.slide4_title",
  },
];

const AUTOPLAY_MS = 6000;

const HeroSlideshow = () => {
  const { t, i18n } = useTranslation();
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const tL = (fr: string, en: string, es: string) => {
    const lang = i18n.language?.slice(0, 2) ?? 'fr';
    if (lang === 'en') return en;
    if (lang === 'es') return es;
    return fr;
  };

  /* Touch swipe support */
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const goTo = useCallback((index: number) => {
    setCurrent((index + SLIDES.length) % SLIDES.length);
  }, []);

  const goNext = useCallback(() => goTo(current + 1), [current, goTo]);
  const goPrev = useCallback(() => goTo(current - 1), [current, goTo]);

  /* Autoplay with pause */
  useEffect(() => {
    if (isPaused) return;
    intervalRef.current = setInterval(goNext, AUTOPLAY_MS);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [goNext, isPaused]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.changedTouches[0].screenX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    touchEndX.current = e.changedTouches[0].screenX;
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 50) {
      diff > 0 ? goNext() : goPrev();
    }
  };

  return (
    <section
      className="relative h-[92vh] md:h-[95vh] lg:h-[90vh] min-h-[640px] overflow-hidden bg-black"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* ── Background slides with crossfade ──────────────────────── */}
      {SLIDES.map((slide, i) => (
        <div
          key={i}
          className="absolute inset-0 ease-in-out"
          style={{ opacity: i === current ? 1 : 0, zIndex: i === current ? 10 : 0, transition: 'opacity 1200ms ease-in-out' }}
        >
          <img
            src={slide.image}
            alt=""
            className="absolute inset-0 w-full h-full object-cover scale-105"
            loading={i === 0 ? "eager" : "lazy"}
          />
          {/* Gradient overlay - elegant bottom vignette vignette */}
          <div
            className="absolute inset-0"
            style={{
              background: "linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.85) 100%)",
            }}
          />
        </div>
      ))}

      {/* ── Four Seasons inspired Grid layout ──────────────────────── */}
      <div className="absolute inset-0 z-20 container mx-auto px-6 md:px-12 flex flex-col pb-0 pt-24 md:py-24">
        {/* Top Spacer */}
        <div className="hidden md:block flex-1" />

        {/* Bottom Section: Left Column (Text) & Right Column (Floating Card) */}
        <div className="flex flex-col md:flex-row items-stretch md:items-end justify-between w-full flex-1 md:flex-none">
          {/* Left Column: Brand & Title */}
          <div className="text-left max-w-lg md:max-w-2xl text-white space-y-3 mt-auto md:mt-0 mb-12 md:mb-0">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: EASE_LUXURY }}
            >
              <p className="font-serif italic text-white/90 text-base md:text-xl tracking-[0.05em] mb-1 font-light">
                {tL("Collection Privée", "Private Collection", "Colección Privada")}
              </p>
              <h1 className="text-white font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extralight tracking-[0.25em] uppercase leading-none">
                MARRAKECH
              </h1>
              <p className="text-[10px] md:text-xs tracking-[0.35em] uppercase text-white/80 font-sans mt-3">
                {tL("1 BOULEVARD DE LA MENARA, MARRAKECH", "1 BOULEVARD DE LA MENARA, MARRAKECH", "1 BOULEVARD DE LA MENARA, MARRAKECH")}
              </p>
              <div className="w-16 h-[1px] bg-white/30 my-4" />
              <div className="text-[9px] md:text-[10px] tracking-[0.2em] uppercase text-white/70 font-sans flex flex-wrap gap-x-4 gap-y-1.5 items-center">
                <a href="tel:+212605387041" className="hover:text-white transition-colors underline decoration-white/20 underline-offset-4 font-medium">+212 6 05 38 70 41</a>
                <span>|</span>
                <span className="underline decoration-white/20 underline-offset-4">{tL("EMPLACEMENT EXCLUSIF", "EXCLUSIVE LOCATION", "UBICACIÓN EXCLUSIVA")}</span>
                <span>|</span>
                <Link to="/contact" className="hover:text-white transition-colors underline decoration-white/20 underline-offset-4 font-medium">{tL("NOUS CONTACTER", "CONTACT US", "CONTACTAR")}</Link>
              </div>
            </motion.div>
          </div>

          {/* Right Column: Floating Welcome Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3, ease: EASE_LUXURY }}
            className="w-full md:w-[400px] bg-white p-8 md:p-10 shadow-2xl relative z-30 text-left border border-white/10 mt-auto md:mt-0 mb-0 md:mb-0"
          >
            <h2 className="font-serif text-lg sm:text-xl md:text-2xl font-light text-[#0A0A0A] leading-relaxed mb-8">
              {tL("Bienvenue, votre prochaine destination vous attend.", "Welcome, your next destination awaits.", "Bienvenido, su próximo destino le espera.")}
            </h2>

            <div className="space-y-4">
              <Link
                to="/catalogue"
                className="bg-[#0A0A0A] text-white w-full py-4 text-[10px] tracking-[0.22em] uppercase font-sans font-medium 
                  hover:bg-[#0A0A0A]/90 transition-all duration-300 shadow-md inline-block text-center"
              >
                {tL("VOIR LE CATALOGUE", "VIEW CATALOGUE", "VER CATÁLOGO")}
              </Link>

              <button
                onClick={() => {
                  window.open(`https://wa.me/212605387041?text=${encodeURIComponent("Bonjour, je souhaite planifier une visite privée.")}`, '_blank');
                }}
                className="w-full border border-[#0A0A0A] text-[#0A0A0A] py-4 text-[10px] tracking-[0.22em] uppercase font-sans font-medium 
                  hover:bg-[#0A0A0A] hover:text-white transition-all duration-300 text-center"
              >
                {tL("CONTACTEZ-NOUS PAR CHAT", "CONTACT US VIA CHAT", "CONTÁCTENOS POR CHAT")}
              </button>
            </div>

            <div className="mt-6 text-center">
              <Link
                to="/contact"
                className="text-[9px] tracking-[0.2em] uppercase font-sans font-medium text-[#0A0A0A]/60 hover:text-[#0A0A0A] transition-colors border-b border-[#0A0A0A]/20 pb-0.5"
              >
                {tL("PLANIFIER UNE VISITE PRIVÉE", "PLAN A PRIVATE VISIT", "PLANIFICAR VISITA PRIVADA")}
              </Link>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── Bullets navigation (Bottom right) ──────────────────────── */}
      <div className="absolute bottom-8 right-12 z-20 hidden md:flex gap-3">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className={`w-2 h-2 rounded-full border border-white/40 transition-all duration-300 ${
              i === current ? "bg-white scale-110" : "bg-transparent hover:bg-white/40"
            }`}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>

      {/* ── Scroll indicator ──────────────────────────────────────── */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 hidden md:flex flex-col items-center gap-1">
        <span className="text-[8px] tracking-[0.25em] text-white/50 uppercase font-sans font-medium">
          {tL("FAITES DÉFILER POUR DÉCOUVRIR LA SUITE", "SCROLL TO DISCOVER MORE", "DESPLACE HACIA ABAJO PARA DESCUBRIR MÁS")}
        </span>
        <div className="w-[1px] h-6 bg-white/30 animate-pulse" />
      </div>

      {/* ── Arrow navigation (desktop only) ──────────────────────── */}
      <button
        onClick={goPrev}
        className="hidden md:flex absolute left-6 top-[40%] -translate-y-1/2 z-20
          w-12 h-12 items-center justify-center text-white/40 hover:text-white
          transition-colors duration-300"
        aria-label="Previous slide"
      >
        <ChevronLeft size={24} strokeWidth={1} />
      </button>
      <button
        onClick={goNext}
        className="hidden md:flex absolute right-6 top-[40%] -translate-y-1/2 z-20
          w-12 h-12 items-center justify-center text-white/40 hover:text-white
          transition-colors duration-300"
        aria-label="Next slide"
      >
        <ChevronRight size={24} strokeWidth={1} />
      </button>
    </section>
  );
};

export default HeroSlideshow;
