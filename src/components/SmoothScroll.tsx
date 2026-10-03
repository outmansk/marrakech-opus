import { useEffect, useRef } from "react";
import Lenis from "@studio-freight/lenis";

/**
 * Initialises Lenis smooth scroll globally.
 * Renders nothing — just hooks into the RAF loop.
 * - Skips mobile (< 1024px) where it adds overhead with no benefit
 * - Respects prefers-reduced-motion.
 * - Properly cancels RAF on cleanup.
 */
const SmoothScroll = () => {
  const lenisRef = useRef<Lenis | null>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    // Skip on mobile — smooth scroll adds CPU load with minimal visual gain
    if (window.innerWidth < 1024) return;

    // Skip if user prefers reduced motion
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    const lenis = new Lenis({
      lerp: 0.1,
      duration: 1.2,
      smoothWheel: true,
    });

    lenisRef.current = lenis;

    const raf = (time: number) => {
      lenis.raf(time);
      rafRef.current = requestAnimationFrame(raf);
    };
    rafRef.current = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafRef.current);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  return null;
};

export default SmoothScroll;

