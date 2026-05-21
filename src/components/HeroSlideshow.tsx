import { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { EASE_LUXURY } from "@/components/motion/Animations";
import { useTranslation } from "react-i18next";

/* ── Slide data ─────────────────────────────────────────────────────────────── */
const SLIDES = [
  {
    image: "https://images.unsplash.com/photo-1539020140153-e479b8c22e70?w=1920&q=80&auto=format",
    titleKey: "hero.slide1_title",
  },
  {
    image: "https://images.unsplash.com/photo-1590073242678-70ee3fc28f8e?w=1920&q=80&auto=format",
    titleKey: "hero.slide2_title",
  },
  {
    image: "https://images.unsplash.com/photo-1548013146-72479768bada?w=1920&q=80&auto=format",
    titleKey: "hero.slide3_title",
  },
  {
    image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1920&q=80&auto=format",
    titleKey: "hero.slide4_title",
  },
];

const AUTOPLAY_MS = 6000;

const HeroSlideshow = () => {
  const { t } = useTranslation();
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

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
      className="relative h-screen overflow-hidden bg-black"
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
          style={{ opacity: i === current ? 1 : 0, zIndex: i === current ? 10 : 0, transition: 'opacity 800ms ease-in-out' }}
        >
          <img
            src={slide.image}
            alt=""
            className="absolute inset-0 w-full h-full object-cover scale-105"
            loading={i === 0 ? "eager" : "lazy"}
          />
          {/* Gradient overlay */}
          <div
            className="absolute inset-0"
            style={{
              background: "linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.5) 100%)",
            }}
          />
        </div>
      ))}

      {/* ── Centered text content ─────────────────────────────────── */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 z-20">
        {/* Surtitre */}
        <motion.p
          className="text-white/60 text-[10px] md:text-xs tracking-[0.3em] uppercase font-sans font-light mb-6"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: EASE_LUXURY }}
        >
          LIVE IN MARRAKECH
        </motion.p>

        {/* Main title */}
        <div className="max-w-4xl overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.h1
              key={`hero-title-${current}`}
              className="text-white font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-[1.1] font-light tracking-[0.02em]"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.8, ease: EASE_LUXURY }}
            >
              {t(SLIDES[current].titleKey)}
            </motion.h1>
          </AnimatePresence>
        </div>

        {/* CTA button */}
        <motion.div
          className="mt-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5, ease: EASE_LUXURY }}
        >
          <Link
            to="/catalogue"
            className="inline-block border border-white/60 text-white px-8 py-3.5
              text-[10px] md:text-xs tracking-[0.25em] uppercase font-sans font-light
              hover:bg-white hover:text-[#0A0A0A] transition-all duration-300"
          >
            {t("contact.decouvrir_biens")}
          </Link>
        </motion.div>
      </div>

      {/* ── Bullets navigation ────────────────────────────────────── */}
      <div className="absolute bottom-24 md:bottom-12 left-1/2 -translate-x-1/2 z-20 flex gap-3">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className={`w-2.5 h-2.5 rounded-full border border-white/50 transition-all duration-300 ${
              i === current ? "bg-white scale-110" : "bg-transparent hover:bg-white/40"
            }`}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>

      {/* ── Arrow navigation (desktop only) ──────────────────────── */}
      <button
        onClick={goPrev}
        className="hidden md:flex absolute left-6 top-1/2 -translate-y-1/2 z-20
          w-12 h-12 items-center justify-center text-white/50 hover:text-white
          transition-colors duration-300"
        aria-label="Previous slide"
      >
        <ChevronLeft size={28} strokeWidth={1} />
      </button>
      <button
        onClick={goNext}
        className="hidden md:flex absolute right-6 top-1/2 -translate-y-1/2 z-20
          w-12 h-12 items-center justify-center text-white/50 hover:text-white
          transition-colors duration-300"
        aria-label="Next slide"
      >
        <ChevronRight size={28} strokeWidth={1} />
      </button>
    </section>
  );
};

export default HeroSlideshow;
