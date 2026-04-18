import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { MapPin, Phone, Mail, Menu, X } from "lucide-react";

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  // Animation #6 — Transparent au-dessus du hero, opaque après scroll
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-[70] transition-all duration-500 ease-out
          ${(scrolled || isMobileMenuOpen)
            ? "bg-background border-b border-border/50 shadow-sm h-16"
            : "bg-transparent border-b border-white/10 h-20"
          }`}
      >
        <div className="container mx-auto px-6 md:px-12 flex items-center justify-between h-full">
          <div className="flex-1">
            <Link
              to="/"
              className={`font-serif text-2xl tracking-wide whitespace-nowrap transition-colors duration-500
                ${(scrolled || isMobileMenuOpen) ? "text-foreground" : "text-white"}`}
            >
              Dar Prestige
            </Link>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-10 shrink-0">
            {[
              { to: "/",          label: "Accueil" },
              { to: "/catalogue", label: "Catalogue" },
              { to: "/blog",      label: "Blog" },
              { to: "/contact",   label: "Contact" },
            ].map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className={`text-xs tracking-widest uppercase font-sans font-medium transition-colors duration-500
                  ${scrolled
                    ? "text-muted-foreground hover:text-foreground"
                    : "text-white/80 hover:text-white"
                  }`}
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* Icônes contact */}
          <div className="hidden md:flex flex-1 justify-end items-center gap-4">
            <a
              href="tel:+212600000000"
              className={`transition-colors duration-500
                ${scrolled ? "text-muted-foreground hover:text-foreground" : "text-white/80 hover:text-white"}`}
            >
              <Phone size={18} strokeWidth={1.25} />
            </a>
            <a
              href="mailto:contact@darprestige.ma"
              className={`transition-colors duration-500
                ${scrolled ? "text-muted-foreground hover:text-foreground" : "text-white/80 hover:text-white"}`}
            >
              <Mail size={18} strokeWidth={1.25} />
            </a>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className={`md:hidden ml-auto p-2 transition-colors duration-500
              ${(scrolled || isMobileMenuOpen) ? "text-foreground" : "text-white"}`}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen
              ? <X size={24} strokeWidth={1.25} />
              : <Menu size={24} strokeWidth={1.25} />
            }
          </button>
        </div>
      </header>

      {/* Mobile Nav Overlay - Moved outside header for better layering */}
      <div 
        className={`fixed inset-0 z-[60] bg-[#fafaf9] transition-all duration-700 ease-in-out md:hidden
          ${isMobileMenuOpen ? "opacity-100 translate-x-0" : "opacity-0 translate-x-full pointer-events-none"}`}
      >
        <div className="flex flex-col h-full px-10 pt-32 pb-16">
          <nav className="flex flex-col gap-8">
            {[
              { to: "/",          label: "Accueil" },
              { to: "/catalogue", label: "Catalogue" },
              { to: "/blog",      label: "Journal / Blog" },
              { to: "/contact",   label: "Contact" },
            ].map(({ to, label }, i) => (
              <Link
                key={to}
                to={to}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`text-2xl tracking-[0.2em] uppercase font-serif transition-all duration-700
                  ${isMobileMenuOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                {label}
              </Link>
            ))}
          </nav>

          <div className="mt-auto space-y-12">
            <div className={`h-px bg-border/40 transition-all duration-1000 delay-500
              ${isMobileMenuOpen ? "w-full" : "w-0"}`} 
            />
            
            <div className={`flex flex-col gap-6 transition-all duration-700 delay-700
              ${isMobileMenuOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
              <p className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground">Nous contacter</p>
              <div className="flex flex-col gap-4">
                <a href="tel:+212600000000" className="font-sans text-lg tracking-wider hover:text-accent transition-colors">
                  +212 6 00 00 00 00
                </a>
                <a href="mailto:contact@darprestige.ma" className="font-sans text-lg tracking-wider hover:text-accent transition-colors">
                  contact@darprestige.ma
                </a>
              </div>
            </div>

            <div className={`flex gap-6 transition-all duration-700 delay-900
              ${isMobileMenuOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
              <div className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-muted-foreground">
                <MapPin size={18} strokeWidth={1} />
              </div>
              <div className="flex-1">
                <p className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground mb-1">Marrakech, Maroc</p>
                <p className="text-sm font-light uppercase tracking-widest text-foreground/80">Hivernage & Palmeraie</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Header;
