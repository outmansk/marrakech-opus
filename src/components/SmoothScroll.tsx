import { useEffect, useRef } from "react";
import { useLocation, useNavigationType } from "react-router-dom";
import Lenis from "@studio-freight/lenis";

/**
 * Initialises Lenis smooth scroll globally.
 * Renders nothing — just hooks into the RAF loop.
 * - Skips mobile (< 1024px) where it adds overhead with no benefit
 * - Respects prefers-reduced-motion.
 * - Properly cancels RAF on cleanup.
 * Also opens every new page at the top (a link clicked low on the catalogue used to open the
 * property page scrolled down); the browser's back/forward keeps its position.
 */
const SmoothScroll = () => {
  const lenisRef = useRef<Lenis | null>(null);
  const rafRef = useRef<number>(0);
  const { pathname, hash } = useLocation();
  const navigationType = useNavigationType();

  useEffect(() => {
    if (navigationType === "POP" || hash) return;
    lenisRef.current?.scrollTo(0, { immediate: true });
    window.scrollTo(0, 0);
  }, [pathname, hash, navigationType]);

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

