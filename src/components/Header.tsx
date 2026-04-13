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
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-out
        ${scrolled
          ? "bg-background/95 backdrop-blur-md border-b border-border/50 shadow-sm h-16"
          : "bg-transparent border-b border-white/10 h-20"
        }`}
    >
      <div className="container mx-auto px-6 md:px-12 flex items-center justify-between h-full">
        <div className="flex-1">
          <Link
            to="/"
            className={`font-serif text-2xl tracking-wide whitespace-nowrap transition-colors duration-500
              ${scrolled ? "text-foreground" : "text-white"}`}
          >
            Dar Prestige
          </Link>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-10 shrink-0">
          {[
            { to: "/",          label: "Accueil" },
            { to: "/catalogue", label: "Catalogue" },
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
            ${scrolled ? "text-foreground" : "text-white"}`}
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen
            ? <X size={24} strokeWidth={1.25} />
            : <Menu size={24} strokeWidth={1.25} />
          }
        </button>
      </div>

      {/* Mobile Nav */}
      {isMobileMenuOpen && (
        <nav className="md:hidden flex flex-col items-center gap-6 py-8 bg-background border-t border-border/50 animate-fade-in">
          {[
            { to: "/",          label: "Accueil" },
            { to: "/catalogue", label: "Catalogue" },
            { to: "/contact",   label: "Contact" },
          ].map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-sm tracking-widest uppercase font-sans font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              {label}
            </Link>
          ))}
          <div className="flex items-center gap-6 mt-4">
            <a href="tel:+212600000000" className="text-muted-foreground hover:text-foreground transition-colors p-2">
              <Phone size={20} strokeWidth={1.25} />
            </a>
            <a href="mailto:contact@darprestige.ma" className="text-muted-foreground hover:text-foreground transition-colors p-2">
              <Mail size={20} strokeWidth={1.25} />
            </a>
          </div>
        </nav>
      )}
    </header>
  );
};

export default Header;
