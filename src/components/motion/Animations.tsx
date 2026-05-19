import { motion, type Variants } from "framer-motion";
import { useInView } from "react-intersection-observer";
import type { ReactNode, CSSProperties } from "react";

// ─── Easing Presets ──────────────────────────────────────────────────────────
export const EASE_LUXURY = [0.16, 1, 0.3, 1] as const;          // ease-out expo
export const EASE_SMOOTH = [0.25, 0.1, 0.25, 1] as const;       // smooth
export const EASE_CINEMATIC = [0.76, 0, 0.24, 1] as const;       // cinematic

// ─── Page Transition ─────────────────────────────────────────────────────────
const pageVariants: Variants = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE_LUXURY } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.3, ease: "easeIn" } },
};

export const PageTransition = ({ children }: { children: ReactNode }) => (
  <motion.div
    initial="initial"
    animate="animate"
    exit="exit"
    variants={pageVariants}
  >
    {children}
  </motion.div>
);

// ─── Reveal on Scroll ────────────────────────────────────────────────────────
interface RevealProps {
  children: ReactNode;
  delay?: number;
  direction?: "up" | "down" | "left" | "right";
  duration?: number;
  className?: string;
  style?: CSSProperties;
  once?: boolean;
}

const directionMap = {
  up:    { y: 50, x: 0 },
  down:  { y: -50, x: 0 },
  left:  { y: 0, x: -50 },
  right: { y: 0, x: 50 },
};

export const Reveal = ({
  children,
  delay = 0,
  direction = "up",
  duration = 0.8,
  className = "",
  style,
  once = true,
}: RevealProps) => {
  const { ref, inView } = useInView({ triggerOnce: once, threshold: 0.15, rootMargin: "-40px" });
  const d = directionMap[direction];

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: d.y, x: d.x }}
      animate={inView ? { opacity: 1, y: 0, x: 0 } : { opacity: 0, y: d.y, x: d.x }}
      transition={{ duration, delay, ease: EASE_LUXURY }}
      className={className}
      style={style}
    >
      {children}
    </motion.div>
  );
};

// ─── Stagger Container ──────────────────────────────────────────────────────
interface StaggerContainerProps {
  children: ReactNode;
  stagger?: number;
  delay?: number;
  className?: string;
  style?: CSSProperties;
}

const staggerContainerVariants: Variants = {
  hidden: {},
  visible: (custom: { stagger: number; delay: number }) => ({
    transition: {
      staggerChildren: custom.stagger,
      delayChildren: custom.delay,
    },
  }),
};

export const staggerItemVariants: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: EASE_LUXURY },
  },
};

export const StaggerContainer = ({
  children,
  stagger = 0.15,
  delay = 0,
  className = "",
  style,
}: StaggerContainerProps) => {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      custom={{ stagger, delay }}
      variants={staggerContainerVariants}
      className={className}
      style={style}
    >
      {children}
    </motion.div>
  );
};

// ─── Scale Reveal ────────────────────────────────────────────────────────────
export const ScaleReveal = ({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) => {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.15 });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.92 }}
      animate={inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.92 }}
      transition={{ duration: 0.9, delay, ease: EASE_LUXURY }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// ─── Text Split Animation ────────────────────────────────────────────────────
export const SplitText = ({
  text,
  className = "",
  delay = 0,
}: {
  text: string;
  className?: string;
  delay?: number;
}) => {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.3 });

  const container: Variants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.04,
        delayChildren: delay,
      },
    },
  };

  const child: Variants = {
    hidden: { y: 80, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.9, ease: EASE_LUXURY },
    },
  };

  return (
    <motion.span
      ref={ref}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      variants={container}
      className={`inline-flex flex-wrap ${className}`}
      aria-label={text}
    >
      {text.split("").map((char, i) => (
        <motion.span
          key={i}
          variants={child}
          className="inline-block"
          style={{ whiteSpace: char === " " ? "pre" : undefined }}
        >
          {char === " " ? "\u00A0" : char}
        </motion.span>
      ))}
    </motion.span>
  );
};
