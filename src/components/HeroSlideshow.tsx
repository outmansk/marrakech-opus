import { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { EASE_LUXURY } from "@/components/motion/Animations";
import { useTranslation } from "react-i18next";

import slide1 from "@/assets/slide1.jpg";
import slide2 from "@/assets/slide2.jpg";
import slide3 from "@/assets/slide3.jpg";
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
    image: slide3,
    titleKey: "hero.slide3_title",
  },
  {
    image: slide4,
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
      className="relative h-[80vh] min-h-[580px] overflow-hidden bg-black"
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
              background: "linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.4) 60%, rgba(0,0,0,0.75) 100%)",
            }}
          />
        </div>
      ))}

      {/* ── Centered text content - Four Seasons inspired ─────────── */}
      <div className="absolute inset-0 flex flex-col items-center justify-end text-center px-6 pb-20 md:pb-24 z-20">
        {/* Calligraphic Subtitle */}
        <motion.p
          className="font-serif italic text-white/90 text-lg sm:text-xl md:text-2xl tracking-[0.05em] mb-2 font-light"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: EASE_LUXURY }}
        >
          Live In Marrakech
        </motion.p>

        {/* Spaced Elegant Serif Title */}
        <div className="max-w-4xl overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.h1
              key={`hero-title-${current}`}
              className="text-white font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl leading-[1.2] font-light tracking-[0.28em] uppercase"
              initial={{ opacity: 0, y: 35 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.8, ease: EASE_LUXURY }}
            >
              Collection Privée
            </motion.h1>
          </AnimatePresence>
        </div>
      </div>

      {/* ── Bullets navigation ────────────────────────────────────── */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-3">
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

      {/* ── Arrow navigation (desktop only) ──────────────────────── */}
      <button
        onClick={goPrev}
        className="hidden md:flex absolute left-6 top-1/2 -translate-y-1/2 z-20
          w-12 h-12 items-center justify-center text-white/40 hover:text-white
          transition-colors duration-300"
        aria-label="Previous slide"
      >
        <ChevronLeft size={24} strokeWidth={1} />
      </button>
      <button
        onClick={goNext}
        className="hidden md:flex absolute right-6 top-1/2 -translate-y-1/2 z-20
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
