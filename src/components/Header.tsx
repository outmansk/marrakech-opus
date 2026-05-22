import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { MapPin, Phone, Mail, Menu, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence, useScroll, useTransform, useMotionValueEvent } from "framer-motion";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { EASE_LUXURY } from "@/components/motion/Animations";

const Header = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    setScrolled(latest > 60);
  });

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const bgOpacity = useTransform(scrollY, [0, 80], [0, 1]);
  const blurAmount = useTransform(scrollY, [0, 80], [0, 20]);
  const borderOpacity = useTransform(scrollY, [0, 80], [0.1, 0.5]);
  const headerHeight = useTransform(scrollY, [0, 80], [64, 52]);

  const navLinks = [
    { to: "/",          label: t("nav.accueil") },
    { to: "/catalogue", label: t("nav.catalogue") },
    { to: "/blog",      label: t("nav.blog") },
    { to: "/contact",   label: t("nav.contact") },
  ];

  // Determine if a nav link is active
  const isActive = (to: string) => {
    if (to === "/") return location.pathname === "/";
    return location.pathname.startsWith(to);
  };

  return (
    <>
      <motion.header
        className="fixed top-0 left-0 right-0 z-[70]"
        style={{
          height: isMobileMenuOpen ? 56 : headerHeight,
        }}
      >
        {/* Animated background (separate layer for performance) */}
        <motion.div
          className="absolute inset-0 border-b shadow-sm"
          style={{
            backgroundColor: `hsl(40 20% 98% / ${isMobileMenuOpen ? 1 : bgOpacity.get()})`,
            backdropFilter: `blur(${isMobileMenuOpen ? 20 : blurAmount.get()}px)`,
            WebkitBackdropFilter: `blur(${isMobileMenuOpen ? 20 : blurAmount.get()}px)`,
            borderColor: `hsl(30 15% 88% / ${isMobileMenuOpen ? 0.5 : borderOpacity.get()})`,
          }}
        />

        <div className="container mx-auto px-6 md:px-12 flex items-center justify-between h-full relative z-10">
          {/* Logo with fade + slide entrance */}
          <motion.div
            className="flex-1"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE_LUXURY }}
          >
            <Link
              to="/"
              className={`font-serif text-lg md:text-xl tracking-wide whitespace-nowrap transition-colors duration-500
                ${(scrolled || isMobileMenuOpen) ? "text-foreground" : "text-white"}`}
            >
              Live In Marrakech
            </Link>
          </motion.div>

          {/* Desktop Nav with staggered entrance + active indicator */}
          <nav className="hidden md:flex items-center gap-8 shrink-0">
            {navLinks.map(({ to, label }, i) => (
              <motion.div
                key={to}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 * (i + 1), ease: EASE_LUXURY }}
                className="relative"
              >
                <Link
                  to={to}
                  className={`text-xs tracking-widest uppercase font-sans font-medium transition-colors duration-500
                    ${scrolled
                      ? "text-muted-foreground hover:text-foreground"
                      : "text-white/80 hover:text-white"
                    }`}
                >
                  {label}
                </Link>
                {/* Active link underline with layoutId animation */}
                {isActive(to) && (
                  <motion.div
                    layoutId="activeLink"
                    className="absolute -bottom-1.5 left-0 right-0 h-[1.5px]"
                    style={{
                      background: scrolled
                      ? "hsl(var(--foreground))"
                      : "rgba(255, 255, 255, 0.7)",
                    }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </motion.div>
            ))}
          </nav>

          {/* Desktop contact icons + Language Switcher */}
          <motion.div
            className="hidden md:flex flex-1 justify-end items-center gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <LanguageSwitcher variant={scrolled ? "dark" : "light"} />
            <a
              href="tel:+212605387041"
              className={`transition-colors duration-500
                ${scrolled ? "text-muted-foreground hover:text-foreground" : "text-white/80 hover:text-white"}`}
            >
              <Phone size={18} strokeWidth={1.25} />
            </a>
            <a
              href="mailto:contact@liveinmarrakech.com"
              className={`transition-colors duration-500
                ${scrolled ? "text-muted-foreground hover:text-foreground" : "text-white/80 hover:text-white"}`}
            >
              <Mail size={18} strokeWidth={1.25} />
            </a>
          </motion.div>

          {/* Mobile Menu Toggle */}
          <button
            className={`md:hidden ml-auto p-2 transition-colors duration-500
              ${(scrolled || isMobileMenuOpen) ? "text-foreground" : "text-white"}`}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Menu"
          >
            <AnimatePresence mode="wait">
              {isMobileMenuOpen ? (
                <motion.div
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <X size={24} strokeWidth={1.25} />
                </motion.div>
              ) : (
                <motion.div
                  key="menu"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Menu size={24} strokeWidth={1.25} />
                </motion.div>
              )}
            </AnimatePresence>
          </button>
        </div>
      </motion.header>

      {/* Mobile Nav Overlay — AnimatePresence slide-in from right */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            className="fixed inset-0 z-[60] bg-[#fafaf9] md:hidden"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.5, ease: EASE_LUXURY }}
          >
            <div className="flex flex-col h-full px-10 pt-32 pb-16">
              <nav className="flex flex-col gap-8">
                {navLinks.map(({ to, label }, i) => (
                  <motion.div
                    key={to}
                    initial={{ opacity: 0, x: 40 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 + i * 0.1, ease: EASE_LUXURY }}
                  >
                    <Link
                      to={to}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="text-2xl tracking-[0.2em] uppercase font-serif block"
                    >
                      {label}
                    </Link>
                  </motion.div>
                ))}
              </nav>

              <div className="mt-auto space-y-12">
                <motion.div
                  className="h-px bg-border/40"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.8, delay: 0.5, ease: EASE_LUXURY }}
                  style={{ transformOrigin: "left" }}
                />

                {/* Language Switcher mobile */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.6, ease: EASE_LUXURY }}
                >
                  <p className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground mb-3">Langue</p>
                  <LanguageSwitcher variant="dark" />
                </motion.div>

                <motion.div
                  className="flex flex-col gap-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.7, ease: EASE_LUXURY }}
                >
                  <p className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground">{t("nav.nous_contacter")}</p>
                  <div className="flex flex-col gap-4">
                    <a href="tel:+212605387041" className="font-sans text-lg tracking-wider hover:text-accent transition-colors">
                      +212 6 05 38 70 41
                    </a>
                    <a href="mailto:contact@liveinmarrakech.com" className="font-sans text-lg tracking-wider hover:text-accent transition-colors">
                      contact@liveinmarrakech.com
                    </a>
                  </div>
                </motion.div>

                <motion.div
                  className="flex gap-6"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.9, ease: EASE_LUXURY }}
                >
                  <div className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-muted-foreground">
                    <MapPin size={18} strokeWidth={1} />
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground mb-1">Marrakech, Maroc</p>
                    <p className="text-sm font-light uppercase tracking-widest text-foreground/80">Hivernage & Palmeraie</p>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Header;
