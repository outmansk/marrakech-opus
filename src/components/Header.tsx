import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Mail, Menu, MessageCircle, Phone, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "@/components/LanguageSwitcher";

const Header = () => {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => setOpen(false), [location.pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 28);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    { to: "/", label: t("nav.accueil") },
    { to: "/catalogue", label: t("nav.catalogue") },
    { to: "/blog", label: t("nav.blog") },
    { to: "/contact", label: t("nav.contact") },
  ];

  const active = (to: string) => to === "/" ? location.pathname === "/" : location.pathname.startsWith(to);
  const currentLanguage = i18n.language?.slice(0, 2) ?? "fr";
  const nextLanguage = currentLanguage === "fr" ? "en" : currentLanguage === "en" ? "es" : "fr";
  const overHomeHero = location.pathname === "/" && !scrolled && !open;

  return (
    <>
      <header className={`fixed inset-x-0 top-0 z-[70] h-16 transition-colors duration-300 lg:border-b lg:border-[#2b2722]/10 lg:bg-[#f6f1e8]/95 lg:backdrop-blur-xl ${overHomeHero ? "border-transparent bg-transparent" : "border-b border-[#2b2722]/10 bg-[#f6f1e8]/95 backdrop-blur-xl"}`}>
        <div className="mx-auto flex h-full max-w-[1440px] items-center justify-between px-5 md:px-10">
          <Link to="/" className={`font-serif text-[22px] tracking-[-0.02em] transition-colors md:text-[26px] lg:text-[#211f1b] ${overHomeHero ? "text-white" : "text-[#211f1b]"}`}>
            Live In Marrakech
          </Link>

          <nav className="hidden items-center gap-8 lg:flex" aria-label="Navigation principale">
            {links.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className={`relative py-2 text-[10px] font-medium uppercase tracking-[0.2em] transition-colors duration-200 ${active(to) ? "text-[#a4573e]" : "text-[#5c574f] hover:text-[#211f1b]"}`}
              >
                {label}
                {active(to) && <span className="absolute inset-x-0 -bottom-1 h-px bg-[#a4573e]" />}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-4 lg:flex">
            <LanguageSwitcher variant="dark" />
            <span className="h-5 w-px bg-[#2b2722]/15" />
            <a href="tel:+212605387041" aria-label="Téléphoner" className="text-[#5c574f] transition-colors hover:text-[#a4573e]">
              <Phone size={17} strokeWidth={1.4} />
            </a>
            <a href="mailto:contact@liveinmarrakech.com" aria-label="Envoyer un e-mail" className="text-[#5c574f] transition-colors hover:text-[#a4573e]">
              <Mail size={17} strokeWidth={1.4} />
            </a>
          </div>

          <div className="flex items-center gap-1 lg:hidden">
            <button
              type="button"
              onClick={() => i18n.changeLanguage(nextLanguage)}
              className={`grid min-h-11 min-w-11 place-items-center text-[13px] font-medium uppercase tracking-[0.16em] transition-colors ${overHomeHero ? "text-white" : "text-[#211f1b]"}`}
              aria-label={`Changer la langue, langue actuelle ${currentLanguage.toUpperCase()}`}
            >
              {currentLanguage.toUpperCase()}
            </button>
            <button
              type="button"
              className={`grid h-11 w-11 place-items-center transition-colors ${overHomeHero ? "text-white" : "text-[#211f1b]"}`}
              onClick={() => setOpen((value) => !value)}
              aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
              aria-expanded={open}
            >
              {open ? <X size={25} strokeWidth={1.25} /> : <Menu size={25} strokeWidth={1.25} />}
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[60] bg-[#f6f1e8] px-6 pb-8 pt-28 lg:hidden"
          >
            <nav className="space-y-2">
              {links.map(({ to, label }, index) => (
                <motion.div key={to} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
                  <Link to={to} className={`block border-b border-[#2b2722]/10 py-4 font-serif text-3xl ${active(to) ? "text-[#a4573e]" : "text-[#211f1b]"}`}>
                    {label}
                  </Link>
                </motion.div>
              ))}
            </nav>
            <div className="mt-10 flex items-center justify-between">
              <LanguageSwitcher variant="dark" />
              <a href="https://wa.me/212605387041" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 bg-[#5f6746] px-5 py-3 text-[10px] font-medium uppercase tracking-[0.16em] text-white">
                <MessageCircle size={16} /> WhatsApp
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Header;
