import { useState } from "react";
import { Link } from "react-router-dom";
import { MapPin, Phone, Mail, Menu, X } from "lucide-react";

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
      <div className="container mx-auto px-6 md:px-12 flex items-center justify-between h-20">
        <div className="flex-1">
          <Link to="/" className="font-serif text-2xl tracking-wide text-foreground whitespace-nowrap">
            Dar Prestige
          </Link>
        </div>
        
        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-10 shrink-0">
          <Link to="/" className="text-xs tracking-widest uppercase font-sans font-medium text-muted-foreground hover:text-foreground transition-colors">
            Accueil
          </Link>
          <Link to="/catalogue" className="text-xs tracking-widest uppercase font-sans font-medium text-muted-foreground hover:text-foreground transition-colors">
            Catalogue
          </Link>
          <Link to="/contact" className="text-xs tracking-widest uppercase font-sans font-medium text-muted-foreground hover:text-foreground transition-colors">
            Contact
          </Link>
        </nav>

        <div className="hidden md:flex flex-1 justify-end items-center gap-4">
          <a href="tel:+212600000000" className="text-muted-foreground hover:text-foreground transition-colors">
            <Phone size={18} strokeWidth={1.25} />
          </a>
          <a href="mailto:contact@darprestige.ma" className="text-muted-foreground hover:text-foreground transition-colors">
            <Mail size={18} strokeWidth={1.25} />
          </a>
        </div>

        {/* Mobile Menu Toggle */}
        <button 
          className="md:hidden text-foreground ml-auto p-2" 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={24} strokeWidth={1.25} /> : <Menu size={24} strokeWidth={1.25} />}
        </button>
      </div>

      {/* Mobile Nav */}
      {isMobileMenuOpen && (
        <nav className="md:hidden flex flex-col items-center gap-6 py-8 bg-background border-t border-border/50 animate-fade-in">
          <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="text-sm tracking-widest uppercase font-sans font-medium text-muted-foreground hover:text-foreground transition-colors">
            Accueil
          </Link>
          <Link to="/catalogue" onClick={() => setIsMobileMenuOpen(false)} className="text-sm tracking-widest uppercase font-sans font-medium text-muted-foreground hover:text-foreground transition-colors">
            Catalogue
          </Link>
          <Link to="/contact" onClick={() => setIsMobileMenuOpen(false)} className="text-sm tracking-widest uppercase font-sans font-medium text-muted-foreground hover:text-foreground transition-colors">
            Contact
          </Link>
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
