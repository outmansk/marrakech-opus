import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { ArrowRight, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PropertyCard from "@/components/PropertyCard";
import { supabase } from "@/lib/supabase";
import type { Property } from "@/types/property";
import heroImage from "@/assets/hero-marrakech.jpg";

const heroSlides = [
  {
    image: "https://images.unsplash.com/photo-1539020140153-e479b8c22e70?q=80&w=2000",
    title: "Découvrez les plus beaux riads",
    subtitle: "Des demeures d'exception au cœur de la Médina de Marrakech."
  },
  {
    image: "https://images.unsplash.com/photo-1597843786411-a8904dfd8da0?q=80&w=2000",
    title: "Une oasis avec piscine privée",
    subtitle: "L'excellence immobilière alliant fraîcheur et sérénité."
  },
  {
    image: "https://images.unsplash.com/photo-1572120360610-d971b9d7767c?q=80&w=2000",
    title: "Jardins luxuriants et havres de paix",
    subtitle: "Profitez de la nature et du soleil marocain depuis chez vous."
  },
  {
    image: "https://images.unsplash.com/photo-1552086438-e62a0572e9dd?q=80&w=2000",
    title: "Vue imprenable sur la Médina",
    subtitle: "Terrasses panoramiques offrant des couchers de soleil uniques."
  },
  {
    image: "https://images.unsplash.com/photo-1558229875-d14dc6cbd7cb?q=80&w=2000",
    title: "Salons marocains de luxe",
    subtitle: "Des intérieurs somptueux respectant la tradition de l'artisanat."
  }
];

const Index = () => {
  const [featured, setFeatured] = useState<Property[]>([]);
  const [searchType, setSearchType] = useState<"vente" | "location_courte" | "location_longue">("vente");
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
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

      {/* Hero Slider */}
      <section className="relative h-screen overflow-hidden bg-black">
        {heroSlides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-[1500ms] ease-in-out ${
              currentSlide === index ? "opacity-100 z-10" : "opacity-0 z-0"
            }`}
          >
            {/* Image with Ken Burns effect */}
            <div
              className={`absolute inset-0 transition-transform duration-[10000ms] ease-out ${
                currentSlide === index ? "scale-110" : "scale-100"
              }`}
            >
              <img
                src={slide.image}
                alt={slide.title}
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Elegant dark gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-background via-foreground/30 to-foreground/50" />
            
            {/* Slide Text */}
            <div className="absolute inset-x-0 top-[40%] -translate-y-1/2 flex flex-col items-center justify-center text-center px-6">
              <h1
                className={`text-primary-foreground mb-6 max-w-4xl font-serif transition-all duration-1000 delay-300 transform ${
                  currentSlide === index ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                }`}
              >
                {slide.title}
              </h1>
              <p
                className={`text-primary-foreground/90 font-light text-lg md:text-xl max-w-2xl transition-all duration-1000 delay-500 transform ${
                  currentSlide === index ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                }`}
              >
                {slide.subtitle}
              </p>
            </div>
          </div>
        ))}

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
              {featured.map((property) => (
                <PropertyCard key={property.id} property={property} />
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
