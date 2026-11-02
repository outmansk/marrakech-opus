import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

// Public-site animations, in CSS (classes in src/index.css). The pre-rendered HTML is always fully
// visible: nothing waits for JavaScript, and crawlers or slow phones never see a blank page.

export const EASE_LUXURY = [0.16, 1, 0.3, 1] as const; // ease-out expo

const reducedMotion = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// ─── Page Transition ─────────────────────────────────────────────────────────
// No fade on the first page (it is the pre-rendered HTML, shown as is); a short fade-in when the
// visitor then moves to another page. Server and first client render agree: no class.
let firstPageShown = false;

export const PageTransition = ({ children }: { children: ReactNode }) => {
  const [animate] = useState(() => firstPageShown);
  useEffect(() => {
    firstPageShown = true;
  }, []);
  return <div className={animate ? "anim-page-enter" : undefined}>{children}</div>;
};

// ─── Reveal on Scroll ────────────────────────────────────────────────────────
interface RevealProps {
  children: ReactNode;
  delay?: number;
  direction?: "up" | "down" | "left" | "right";
  duration?: number;
  className?: string;
  style?: CSSProperties;
  /** Kept for compatibility: a revealed block always stays visible. */
  once?: boolean;
}

const OFFSET = 28;
const directionOffset = {
  up: [0, OFFSET],
  down: [0, -OFFSET],
  left: [-OFFSET, 0],
  right: [OFFSET, 0],
} as const;

/**
 * Fades a block in when it scrolls into view. Rendered visible (server and hydration); only blocks
 * still below the screen after load are hidden, then shown by an IntersectionObserver.
 */
export const Reveal = ({ children, delay = 0, direction = "up", duration = 0.7, className = "", style }: RevealProps) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || reducedMotion() || typeof IntersectionObserver === "undefined") return;
    if (el.getBoundingClientRect().top < window.innerHeight) return; // already on screen: no animation

    const [x, y] = directionOffset[direction];
    el.style.setProperty("--reveal-x", `${x}px`);
    el.style.setProperty("--reveal-y", `${y}px`);
    el.style.transitionDuration = `${duration}s`;
    el.style.transitionDelay = `${delay}s`;
    el.classList.add("reveal-pending");

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        el.classList.remove("reveal-pending");
        observer.disconnect();
      },
      { rootMargin: "0px 0px -8% 0px" },
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
      el.classList.remove("reveal-pending");
    };
  }, [delay, direction, duration]);

  return (
    <div ref={ref} className={`reveal ${className}`} style={style}>
      {children}
    </div>
  );
};
