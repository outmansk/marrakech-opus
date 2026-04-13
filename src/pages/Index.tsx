import { Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PropertyCard from "@/components/PropertyCard";
import { supabase } from "@/lib/supabase";
import type { Property } from "@/types/property";
import slide1 from "@/assets/slide1.png";
import slide2 from "@/assets/slide2.png";
import slide3 from "@/assets/slide3.png";
import slide4 from "@/assets/slide4.png";
import slide5 from "@/assets/slide5.png";

const heroSlides = [
  {
    image: slide1,
    title: "Villas d'exception avec jardins et piscines",
    subtitle: "Une oasis de verdure et de fraîcheur pour votre confort absolu."
  },
  {
    image: slide2,
    title: "Votre nouvelle vie en famille commence ici",
    subtitle: "Location longue durée dans des cadres idylliques pour petits et grands."
  },
  {
    image: slide3,
    title: "Design contemporain dans la Palmeraie",
    subtitle: "Une architecture moderne se mêlant parfaitement au paysage millénaire."
  },
  {
    image: slide4,
    title: "Des soirées magiques au bord de l'eau",
    subtitle: "Profitez de la douceur des nuits de Marrakech dans un cadre raffiné."
  },
  {
    image: slide5,
    title: "Jardins secrets et havres de paix",
    subtitle: "Le luxe du calme et de l'intimité au cœur de domaines luxuriants."
  }
];

// Durée d'affichage par photo et durée du fondu — modifiable ici
const DISPLAY_MS = 6000; // ms d'affichage complet avant le fondu
const FADE_MS    = 1500; // ms de crossfade

const Index = () => {
  const [featured, setFeatured] = useState<Property[]>([]);
  const [searchType, setSearchType] = useState<"vente" | "location_courte" | "location_longue">("vente");

  // Deux couches empilées : bottom toujours visible, top fadeIn puis swap
  const [bottomSlide, setBottomSlide] = useState(0);
  const [topSlide,    setTopSlide]    = useState(1);
  const [topVisible,  setTopVisible]  = useState(false);
  const currentRef = useRef(0); // index de la photo visible (bottom)

  useEffect(() => {
    let swapTimer: ReturnType<typeof setTimeout>;

    const advance = () => {
      // 1. Fade in la prochaine photo (top layer)
      setTopVisible(true);

      // 2. Après le fondu : promouvoir top → bottom, charger la suivante
      swapTimer = setTimeout(() => {
        const newCurrent = (currentRef.current + 1) % heroSlides.length;
        const newNext    = (newCurrent    + 1) % heroSlides.length;
        currentRef.current = newCurrent;
        setBottomSlide(newCurrent);
        setTopSlide(newNext);
        setTopVisible(false);
      }, FADE_MS + 50);
    };

    // Même délai pour chaque photo, dès la première
    const interval = setInterval(advance, DISPLAY_MS);

    return () => {
      clearInterval(interval);
      clearTimeout(swapTimer);
    };
  }, []);

  useEffect(() => {
    const fetchFeatured = async () => {
      const { data } = await supabase
        .from("properties")
        .select("*")
        .eq("is_available", true)
        .order("created_at", { ascending: false })
        .limit(6);
      if (data) setFeatured(data as Property[]);
    };
    fetchFeatured();
  }, []);

  return (
    <div className="min-h-screen">
      <Header />

      {/* Hero Slider — two-layer crossfade with Ken Burns effect */}
      <section className="relative h-screen overflow-hidden">
        {/* Bottom layer: always fully visible (outgoing photo) */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 scale-110 transition-transform duration-[10000ms] linear" style={{ transform: 'scale(1.15)' }}>
            <img
              src={heroSlides[bottomSlide].image}
              alt={heroSlides[bottomSlide].title}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-black/40" />
        </div>

        {/* Top layer: fades in (incoming photo), then becomes bottom */}
        <div
          className="absolute inset-0 z-10"
          style={{
            opacity: topVisible ? 1 : 0,
            transition: `opacity ${FADE_MS}ms ease-in-out`,
          }}
        >
          <div 
            className="absolute inset-0 transition-transform duration-[10000ms] linear" 
            style={{ transform: topVisible ? 'scale(1.15)' : 'scale(1)' }}
          >
            <img
              src={heroSlides[topSlide].image}
              alt={heroSlides[topSlide].title}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-black/40" />
        </div>

        {/* Slide text — always shows the active (bottom) slide's text */}
        <div className="absolute inset-x-0 top-[40%] -translate-y-1/2 flex flex-col items-center justify-center text-center px-6 z-20">
          <h1
            key={bottomSlide}
            className="text-primary-foreground mb-6 max-w-4xl font-serif animate-fade-in"
          >
            {heroSlides[bottomSlide].title}
          </h1>
          <p
            key={`sub-${bottomSlide}`}
            className="text-primary-foreground/90 font-light text-lg md:text-xl max-w-2xl animate-fade-in"
            style={{ animationDelay: "200ms" }}
          >
            {heroSlides[bottomSlide].subtitle}
          </p>
        </div>


        {/* Search bar positioned absolutely at the bottom */}
        <div className="absolute inset-x-0 bottom-24 md:bottom-32 flex justify-center px-6 z-20">
          <div className="bg-background/95 backdrop-blur-sm p-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-1 w-full max-w-3xl rounded-none sm:rounded-sm shadow-2xl animate-fade-in" style={{ animationDelay: "1s" }}>
            <div className="flex flex-col sm:flex-row gap-1 flex-1">
              {(["vente", "location_courte", "location_longue"] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setSearchType(type)}
                  className={`px-4 sm:px-6 py-3 text-xs tracking-widest uppercase font-sans font-medium transition-colors flex-1 ${
                    searchType === type
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {type === "vente" ? "Acheter" : type === "location_courte" ? "Louer court" : "Louer long"}
                </button>
              ))}
            </div>
            <Link to={`/catalogue?type=${searchType}`} className="w-full sm:w-auto">
              <Button variant="luxury" size="lg" className="w-full h-12 gap-2 sm:ml-2">
                <Search size={16} strokeWidth={1.25} />
                Rechercher
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured */}
      <section className="py-24 md:py-32">
        <div className="container mx-auto px-6 md:px-12">
          <div className="flex items-end justify-between mb-16">
            <div>
              <p className="text-xs tracking-widest uppercase text-muted-foreground mb-4">Selection</p>
              <h2>Biens d'exception</h2>
            </div>
            <Link to="/catalogue" className="hidden md:flex items-center gap-2 text-xs tracking-widest uppercase text-muted-foreground hover:text-foreground transition-colors font-sans">
              Voir tout
              <ArrowRight size={16} strokeWidth={1.25} />
            </Link>
          </div>

          {featured.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
              {featured.map((property, i) => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  revealDelay={i * 120}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-muted-foreground font-light">Aucun bien disponible pour le moment.</p>
              <p className="text-muted-foreground font-light mt-2 text-sm">
                Ajoutez des biens via le panneau d'administration.
              </p>
            </div>
          )}

          <div className="text-center mt-16 md:hidden">
            <Link to="/catalogue">
              <Button variant="luxury-ghost" size="lg">
                Voir tout le catalogue
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-secondary py-24 md:py-32">
        <div className="container mx-auto px-6 md:px-12 text-center">
          <h2 className="mb-6">Un projet immobilier a Marrakech ?</h2>
          <p className="text-muted-foreground font-light text-lg max-w-xl mx-auto mb-10">
            Notre equipe vous accompagne dans la recherche du bien ideal, de la premiere visite a la signature.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/catalogue">
              <Button variant="luxury" size="lg" className="h-12 px-10">
                Decouvrir nos biens
              </Button>
            </Link>
            <a href="https://wa.me/212600000000" target="_blank" rel="noopener noreferrer">
              <Button variant="luxury-ghost" size="lg" className="h-12 px-10">
                Nous contacter
              </Button>
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
