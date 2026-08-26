import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Mail, Menu, MessageCircle, Phone, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "@/components/LanguageSwitcher";

const Header = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  useEffect(() => setOpen(false), [location.pathname]);

  const links = [
    { to: "/", label: t("nav.accueil") },
    { to: "/catalogue", label: t("nav.catalogue") },
    { to: "/blog", label: t("nav.blog") },
    { to: "/contact", label: t("nav.contact") },
  ];

  const active = (to: string) => to === "/" ? location.pathname === "/" : location.pathname.startsWith(to);

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-[70] h-16 border-b border-[#2b2722]/10 bg-[#f6f1e8]/95 backdrop-blur-xl">
        <div className="mx-auto flex h-full max-w-[1440px] items-center justify-between px-5 md:px-10">
          <Link to="/" className="font-serif text-[22px] tracking-[-0.02em] text-[#211f1b] md:text-[26px]">
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

          <button
            type="button"
            className="grid h-11 w-11 place-items-center text-[#211f1b] lg:hidden"
            onClick={() => setOpen((value) => !value)}
            aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
            aria-expanded={open}
          >
            {open ? <X size={23} strokeWidth={1.4} /> : <Menu size={23} strokeWidth={1.4} />}
          </button>
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
