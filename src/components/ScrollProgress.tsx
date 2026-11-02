import { useEffect, useRef } from "react";

/**
 * Thin gold progress bar fixed at the top of the viewport. Tracks total page scroll progress with
 * one transform per animation frame (no layout work, no animation library).
 */
const ScrollProgress = () => {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const progress = max > 0 ? Math.min(1, window.scrollY / max) : 0;
      if (barRef.current) barRef.current.style.transform = `scaleX(${progress})`;
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div
      ref={barRef}
      aria-hidden="true"
      className="pointer-events-none fixed left-0 right-0 top-0 z-[100] h-[2px] origin-left will-change-transform"
      style={{ transform: "scaleX(0)", background: "linear-gradient(90deg, #C9A84C, #D4AF89, #C17F50)" }}
    />
  );
};

export default ScrollProgress;
