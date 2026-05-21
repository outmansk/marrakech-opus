import { useState, useEffect } from "react";

/**
 * Mobile-only splash screen (< 768px).
 * Shows once per session via sessionStorage.
 * Pure fade-in → hold → fade-out animation.
 */
const SplashScreen = ({ onComplete }: { onComplete: () => void }) => {
  const [phase, setPhase] = useState<"fade-in" | "hold" | "fade-out">("fade-in");

  useEffect(() => {
    // Phase 1 → fade-in 500ms
    const t1 = setTimeout(() => setPhase("hold"), 500);
    // Phase 2 → hold 1000ms then fade-out
    const t2 = setTimeout(() => setPhase("fade-out"), 1500);
    // Phase 3 → fade-out done after 500ms
    const t3 = setTimeout(() => onComplete(), 2000);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [onComplete]);

  const opacity =
    phase === "fade-in" ? "opacity-0" :
    phase === "hold" ? "opacity-100" :
    "opacity-0";

  return (
    <div
      className={`fixed inset-0 z-[200] flex items-center justify-center bg-white transition-opacity duration-500 ${opacity}`}
    >
      <h1
        className="font-serif text-3xl tracking-wide text-[#0A0A0A] select-none"
        style={{ fontWeight: 400 }}
      >
        Live In Marrakech
      </h1>
    </div>
  );
};

/**
 * Wrapper: only renders SplashScreen on mobile + once per session.
 */
export const SplashGuard = ({ children }: { children: React.ReactNode }) => {
  const [showSplash, setShowSplash] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const isMobile = window.innerWidth < 768;
    const alreadyShown = sessionStorage.getItem("splash_shown") === "true";

    if (isMobile && !alreadyShown) {
      setShowSplash(true);
    } else {
      setReady(true);
    }
  }, []);

  const handleComplete = () => {
    sessionStorage.setItem("splash_shown", "true");
    setShowSplash(false);
    setReady(true);
  };

  if (showSplash) {
    return <SplashScreen onComplete={handleComplete} />;
  }

  if (!ready) return null;

  return <>{children}</>;
};

export default SplashScreen;
