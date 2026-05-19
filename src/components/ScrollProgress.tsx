import { motion, useScroll, useSpring } from "framer-motion";

/**
 * Thin gold progress bar fixed at the top of the viewport.
 * Tracks total page scroll progress.
 */
const ScrollProgress = () => {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-[2px] z-[100] origin-left"
      style={{
        scaleX,
        background: "linear-gradient(90deg, #C9A84C, #D4AF89, #C17F50)",
      }}
    />
  );
};

export default ScrollProgress;
