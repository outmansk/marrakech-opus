import { useEffect, useRef } from "react";
import Lenis from "@studio-freight/lenis";

/**
 * Initialises Lenis smooth scroll globally.
 * Renders nothing — just hooks into the RAF loop.
 * Respects prefers-reduced-motion.
 */
const SmoothScroll = () => {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    // Skip if user prefers reduced motion
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    const lenis = new Lenis({
      lerp: 0.08,
      duration: 1.4,
      easing: (t: number) => {
        // cubic-bezier(0.25, 0.1, 0.25, 1) approximation
        return t < 0.5
          ? 4 * t * t * t
          : 1 - Math.pow(-2 * t + 2, 3) / 2;
      },
      smoothWheel: true,
    });

    lenisRef.current = lenis;

    const raf = (time: number) => {
      lenis.raf(time);
      requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  return null;
};

export default SmoothScroll;
