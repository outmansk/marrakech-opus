import { useEffect, useRef } from "react";

/**
 * Ajoute la classe `visibleClass` à l'élément quand il entre dans le viewport.
 * Utilise IntersectionObserver — zéro librairie, performant sur mobile.
 */
export function useScrollReveal<T extends HTMLElement>(
  visibleClass = "is-visible",
  options: IntersectionObserverInit = { threshold: 0.15 }
) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        el.classList.add(visibleClass);
        observer.unobserve(el); // une seule fois
      }
    }, options);

    observer.observe(el);
    return () => observer.disconnect();
  }, [visibleClass, options]);

  return ref;
}

/**
 * Animated counter — counts from 0 to target with easing.
 */
export function useCounter(target: number, duration = 2000, trigger = false) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!trigger || !ref.current) return;

    const startTime = performance.now();

    const step = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(eased * target);

      if (ref.current) {
        ref.current.textContent = current.toLocaleString("fr-FR");
      }

      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };

    requestAnimationFrame(step);
  }, [target, duration, trigger]);

  return ref;
}

