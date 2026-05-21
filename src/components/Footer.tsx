import { MapPin, Phone, Mail, Instagram, Facebook } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

const Footer = () => {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language;

  return (
    <footer className="bg-[#0A0A0A] text-white">
      {/* ── Main footer grid ────────────────────────────────────────── */}
      <div className="container mx-auto px-6 md:px-12 py-20 md:py-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-16">

          {/* Colonne 1 — Brand + tagline + socials */}
          <div className="space-y-6">
            <div>
              <h3 className="font-serif text-2xl text-white mb-3">Live In Marrakech</h3>
              <div className="w-8 h-[1px] bg-white/20" />
            </div>
            <p className="text-white/50 font-light leading-relaxed text-sm max-w-xs">
              {t("footer.description")}
            </p>
            {/* Social icons */}
            <div className="flex gap-4">
              <a
                href="https://www.instagram.com/liveinmarrakech"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 border border-white/15 flex items-center justify-center text-white/40
                  hover:border-white/50 hover:text-white transition-all duration-300"
                aria-label="Instagram"
              >
                <Instagram size={16} strokeWidth={1.25} />
              </a>
              <a
                href="https://www.facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 border border-white/15 flex items-center justify-center text-white/40
                  hover:border-white/50 hover:text-white transition-all duration-300"
                aria-label="Facebook"
              >
                <Facebook size={16} strokeWidth={1.25} />
              </a>
              <a
                href="https://wa.me/212605387041"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 border border-white/15 flex items-center justify-center text-white/40
                  hover:border-white/50 hover:text-white transition-all duration-300"
                aria-label="WhatsApp"
              >
                {/* WhatsApp SVG */}
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Colonne 2 — Navigation */}
          <div>
            <p className="text-[10px] tracking-[0.3em] uppercase text-white/30 mb-6 font-sans">
              {t("footer.navigation")}
            </p>
            {/* Separator */}
            <div className="w-full h-[1px] bg-white/8 mb-6" />
            <nav className="flex flex-col gap-3">
              {[
                { to: "/", label: t("nav.accueil") },
                { to: "/catalogue", label: t("nav.catalogue") },
                { to: "/catalogue?type=vente", label: t("services.vente") },
                { to: "/catalogue?type=location-longue-duree", label: t("services.location_longue") },
                { to: "/blog", label: t("nav.blog") },
                { to: "/contact", label: t("nav.contact") },
              ].map(({ to, label }) => (
                <Link
                  key={to}
                  to={to}
                  className="text-white/50 hover:text-white transition-colors duration-300 font-light text-sm
                    inline-flex items-center gap-2 group"
                >
                  <span className="w-0 h-[1px] bg-white/40 group-hover:w-4 transition-all duration-300" />
                  {label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Colonne 3 — Contact */}
          <div>
            <p className="text-[10px] tracking-[0.3em] uppercase text-white/30 mb-6 font-sans">
              {t("footer.contact")}
            </p>
            <div className="w-full h-[1px] bg-white/8 mb-6" />
            <div className="flex flex-col gap-5 text-white/50 font-light text-sm">
              <div className="flex items-start gap-3">
                <MapPin size={16} strokeWidth={1.25} className="mt-0.5 shrink-0 text-white/30" />
                <span>{t("footer.adresse")}</span>
              </div>
              <a
                href="tel:+212605387041"
                className="flex items-center gap-3 hover:text-white transition-colors duration-300"
              >
                <Phone size={16} strokeWidth={1.25} className="shrink-0 text-white/30" />
                +212 6 05 38 70 41
              </a>
              <a
                href="mailto:contact@liveinmarrakech.com"
                className="flex items-center gap-3 hover:text-white transition-colors duration-300"
              >
                <Mail size={16} strokeWidth={1.25} className="shrink-0 text-white/30" />
                contact@liveinmarrakech.com
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom bar ─────────────────────────────────────────────── */}
      <div className="border-t border-white/8">
        <div className="container mx-auto px-6 md:px-12 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-white/25 text-[10px] tracking-[0.2em] uppercase font-sans font-light">
            © {new Date().getFullYear()} Live In Marrakech. {t("footer.droits")}
          </p>
          {/* Language links */}
          <div className="flex items-center gap-4">
            {(["fr", "en", "es"] as const).map((lang, i) => (
              <span key={lang} className="flex items-center gap-4">
                <button
                  onClick={() => i18n.changeLanguage(lang)}
                  className={`text-[10px] tracking-[0.2em] uppercase font-sans font-light transition-colors duration-300 ${
                    currentLang === lang ? "text-white" : "text-white/25 hover:text-white/60"
                  }`}
                >
                  {lang.toUpperCase()}
                </button>
                {i < 2 && <span className="text-white/15 text-xs">|</span>}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
