import { MapPin } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className="bg-foreground text-primary-foreground py-20">
      <div className="container mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-16 text-center md:text-left">
          <div>
            <h3 className="text-2xl mb-6">Dar Prestige</h3>
            <p className="text-primary-foreground/60 font-light leading-relaxed max-w-sm mx-auto md:mx-0">
              {t('footer.description')}
            </p>
          </div>
          <div>
            <p className="text-xs tracking-widest uppercase mb-6 text-primary-foreground/40">{t('footer.navigation')}</p>
            <div className="flex flex-col gap-3">
              <Link to="/" className="text-primary-foreground/60 hover:text-primary-foreground transition-colors font-light">{t('nav.accueil')}</Link>
              <Link to="/catalogue" className="text-primary-foreground/60 hover:text-primary-foreground transition-colors font-light">{t('nav.catalogue')}</Link>
              <Link to="/blog" className="text-primary-foreground/60 hover:text-primary-foreground transition-colors font-light">{t('nav.journal')}</Link>
              <Link to="/contact" className="text-primary-foreground/60 hover:text-primary-foreground transition-colors font-light">{t('nav.contact')}</Link>
            </div>
          </div>
          <div>
            <p className="text-xs tracking-widest uppercase mb-6 text-primary-foreground/40">{t('footer.contact')}</p>
            <div className="flex flex-col gap-3 text-primary-foreground/60 font-light items-center md:items-start">
              <div className="flex items-center gap-3">
                <MapPin size={16} strokeWidth={1.25} />
                <span>{t('footer.adresse')}</span>
              </div>
              <p>+212 6 00 00 00 00</p>
              <p>contact@darprestige.ma</p>
            </div>
          </div>
        </div>
        <div className="border-t border-primary-foreground/10 mt-16 pt-8 text-center text-primary-foreground/30 text-xs tracking-[0.2em] font-light uppercase">
          &copy; {new Date().getFullYear()} Dar Prestige. {t('footer.droits')}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
