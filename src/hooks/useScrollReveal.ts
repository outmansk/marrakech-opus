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
