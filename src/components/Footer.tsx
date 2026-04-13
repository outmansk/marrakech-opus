import { MapPin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-foreground text-primary-foreground py-20">
      <div className="container mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
          <div>
            <h3 className="text-2xl mb-6">Dar Prestige</h3>
            <p className="text-primary-foreground/60 font-light leading-relaxed">
              L'excellence immobiliere a Marrakech. Vente, location courte et longue duree de biens d'exception.
            </p>
          </div>
          <div>
            <p className="text-xs tracking-widest uppercase mb-6 text-primary-foreground/40">Navigation</p>
            <div className="flex flex-col gap-3">
              <a href="/" className="text-primary-foreground/60 hover:text-primary-foreground transition-colors font-light">Accueil</a>
              <a href="/catalogue" className="text-primary-foreground/60 hover:text-primary-foreground transition-colors font-light">Catalogue</a>
              <a href="/contact" className="text-primary-foreground/60 hover:text-primary-foreground transition-colors font-light">Contact</a>
            </div>
          </div>
          <div>
            <p className="text-xs tracking-widest uppercase mb-6 text-primary-foreground/40">Contact</p>
            <div className="flex flex-col gap-3 text-primary-foreground/60 font-light">
              <div className="flex items-center gap-3">
                <MapPin size={16} strokeWidth={1.25} />
                <span>Gueliz, Marrakech, Maroc</span>
              </div>
              <p>+212 6 00 00 00 00</p>
              <p>contact@darprestige.ma</p>
            </div>
          </div>
        </div>
        <div className="border-t border-primary-foreground/10 mt-16 pt-8 text-center text-primary-foreground/30 text-sm font-light">
          Dar Prestige. Tous droits reserves.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
