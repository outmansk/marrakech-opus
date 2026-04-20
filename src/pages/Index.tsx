import { Link } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";
import { ArrowRight, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PropertyCard from "@/components/PropertyCard";
import { supabase } from "@/lib/supabase";
import type { Bien } from "@/types/property";
import type { Article } from "@/types/article";
import { useTranslation } from "react-i18next";

import slide1 from "@/assets/slide1.jpg";
import slide2 from "@/assets/slide2.jpg";
import slide3 from "@/assets/slide3.jpg";
import slide4 from "@/assets/slide4.jpg";
import slide5 from "@/assets/slide5.jpg";

const DISPLAY_MS = 5000;
const FADE_MS    = 2000;

const Index = () => {
  const { t } = useTranslation();
  const [featured, setFeatured] = useState<Bien[]>([]);
  const [latestArticles, setLatestArticles] = useState<Article[]>([]);
  const [searchType, setSearchType] = useState<"vente" | "location-courte-duree" | "location-longue-duree">("vente");
  const [activeIndex, setActiveIndex] = useState(0);

  const heroSlides = useMemo(() => [
    { image: slide1, title: t("hero.slide1_title"), subtitle: t("hero.slide1_subtitle") },
    { image: slide2, title: t("hero.slide2_title"), subtitle: t("hero.slide2_subtitle") },
    { image: slide3, title: t("hero.slide3_title"), subtitle: t("hero.slide3_subtitle") },
    { image: slide4, title: t("hero.slide4_title"), subtitle: t("hero.slide4_subtitle") },
    { image: slide5, title: t("hero.slide5_title"), subtitle: t("hero.slide5_subtitle") }
  ], [t]);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % heroSlides.length);
    }, DISPLAY_MS + FADE_MS);
    return () => clearInterval(interval);
  }, [heroSlides.length]);

  useEffect(() => {
    const fetchData = async () => {
      // Biens
      const { data: propsData } = await supabase
        .from("properties_v2")
        .select("*")
        .eq("statut", "publie")
        .order("created_at", { ascending: false })
        .limit(6);
      if (propsData) setFeatured(propsData as Bien[]);

      // Articles
      const { data: artsData } = await supabase
        .from("articles")
        .select("*")
        .eq("est_publie", true)
        .order("created_at", { ascending: false })
        .limit(3);
      if (artsData) setLatestArticles(artsData as Article[]);
    };
    fetchData();
  }, []);

  return (
    <div className="min-h-screen">
      <Header />

      <section className="relative h-screen overflow-hidden bg-black">
        {heroSlides.map((slide, i) => (
          <div 
            key={i}
            className={`absolute inset-0 transition-opacity duration-[2000ms] ease-in-out
              ${i === activeIndex ? "opacity-100 z-10" : "opacity-0 z-0"}`}
          >
            <div 
              className={`absolute inset-0 transition-transform duration-[12000ms] ease-out
                ${i === activeIndex ? "scale-110" : "scale-100"}`}
            >
              <img
                src={slide.image}
                alt={slide.title}
                className="w-full h-full object-cover grayscale-[15%]"
              />
            </div>
            {/* Dégradé plus profond pour faire ressortir le texte et le glassmorphism */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/80 z-10" />
          </div>
        ))}

        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 z-20 pointer-events-none mt-[-5vh]">
          <div className="max-w-5xl overflow-hidden">
            <h1
              key={`title-${activeIndex}`}
              className="text-white mb-6 font-serif text-4xl md:text-6xl lg:text-7xl leading-[1.15] font-light tracking-[0.02em] animate-in fade-in slide-in-from-bottom-12 duration-[1500ms] ease-out fill-mode-forwards drop-shadow-2xl"
            >
              {heroSlides[activeIndex].title}
            </h1>
          </div>
          
          <div 
            className="w-12 h-[1px] bg-white/50 my-6 animate-in fade-in zoom-in duration-[1500ms] delay-[400ms] ease-out fill-mode-forwards" 
            key={`line-${activeIndex}`}
          />
          
          <div className="max-w-2xl overflow-hidden">
            <p
              key={`sub-${activeIndex}`}
              className="text-white/80 font-sans font-light tracking-[0.2em] uppercase text-[10px] md:text-xs animate-in fade-in slide-in-from-bottom-8 duration-[1500ms] delay-[600ms] ease-out fill-mode-forwards"
            >
              {heroSlides[activeIndex].subtitle}
            </p>
          </div>
        </div>

        <div className="absolute inset-x-0 bottom-10 md:bottom-20 flex justify-center px-4 md:px-6 z-20">
          <div 
            className="bg-black/30 backdrop-blur-md border border-white/15 p-6 md:p-8 flex flex-col items-center gap-6 w-full max-w-4xl shadow-2xl animate-fade-in" 
            style={{ animationDelay: "1s" }}
          >
            <div className="flex flex-row overflow-x-auto scrollbar-hide gap-8 justify-center border-b border-white/10 pb-4 w-full px-2">
              {(["vente", "location-courte-duree", "location-longue-duree"] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setSearchType(type)}
                  className={`text-[10px] md:text-xs tracking-[0.25em] uppercase font-sans font-light transition-all whitespace-nowrap pb-2 -mb-[18px] border-b-[2px]
                    ${searchType === type ? "text-white border-white" : "text-white/50 border-transparent hover:text-white/80"}`}
                >
                  {type === "vente" ? t("hero.acheter") : type === "location-courte-duree" ? t("hero.louer_court") : t("hero.louer_long")}
                </button>
              ))}
            </div>
            <Link to={`/catalogue?type=${searchType}`} className="w-full mt-2">
              <Button 
                variant="outline" 
                size="lg" 
                className="w-full h-14 md:h-16 gap-3 text-[10px] md:text-xs tracking-widest uppercase bg-white/5 hover:bg-white hover:text-black border-white/20 text-white transition-all duration-500 rounded-none shadow-none"
              >
                <Search size={16} strokeWidth={1} />
                {t("hero.lancer_recherche")}
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
              <p className="text-xs tracking-widest uppercase text-muted-foreground mb-4">{t("biens.exclusivites")}</p>
              <h2>{t("biens.residences_investissements")}</h2>
            </div>
            <Link to="/catalogue" className="hidden md:flex items-center gap-2 text-xs tracking-widest uppercase text-muted-foreground hover:text-foreground transition-colors font-sans">
              {t("biens.voir_tout")}
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
              <p className="text-muted-foreground font-light">{t("biens.aucun_bien")}</p>
              <p className="text-muted-foreground font-light mt-2 text-sm">
                {t("biens.ajouter_via_admin")}
              </p>
            </div>
          )}

          <div className="text-center mt-16 md:hidden">
            <Link to="/catalogue">
              <Button variant="luxury-ghost" size="lg">
                {t("biens.voir_catalogue")}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Latest Articles */}
      {latestArticles.length > 0 && (
        <section className="py-24 md:py-32">
          <div className="container mx-auto px-6 md:px-12">
            <div className="flex items-end justify-between mb-16">
              <div>
                <p className="text-xs tracking-widest uppercase text-muted-foreground mb-4">{t("blog.actualites")}</p>
                <h2>{t("blog.derniers_articles")}</h2>
              </div>
              <Link to="/blog" className="hidden md:flex items-center gap-2 text-xs tracking-widest uppercase text-muted-foreground hover:text-foreground transition-colors font-sans">
                {t("blog.voir_tout")}
                <ArrowRight size={16} strokeWidth={1.25} />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
              {latestArticles.map((article) => (
                <Link to={`/blog/${article.slug}`} key={article.id} className="group flex flex-col items-start hover-target h-full border border-border bg-card overflow-hidden">
                  <div className="relative w-full aspect-[4/3] overflow-hidden bg-muted">
                    <img src={article.image_url} alt={article.title} className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105" />
                  </div>
                  <div className="p-6 flex flex-col flex-grow w-full">
                    <h3 className="font-serif text-lg mb-3 line-clamp-2 transition-colors duration-300">{article.title}</h3>
                    <p className="text-muted-foreground font-light text-sm line-clamp-3 mb-6">{article.excerpt}</p>
                    <div className="mt-auto flex items-center gap-2 text-xs tracking-widest uppercase font-sans font-medium text-muted-foreground group-hover:text-foreground transition-all duration-300">
                      {t("blog.lire_article")} <ArrowRight size={14} strokeWidth={1} className="transition-transform duration-300 group-hover:translate-x-1" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            <div className="text-center mt-12 md:hidden">
              <Link to="/blog">
                <Button variant="luxury-ghost" size="lg">
                  {t("blog.visiter_blog")}
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="bg-secondary py-24 md:py-32">
        <div className="container mx-auto px-6 md:px-12 text-center">
          <h2 className="mb-6">{t("contact.cta_titre")}</h2>
          <p className="text-muted-foreground font-light text-lg max-w-xl mx-auto mb-10">
            {t("contact.cta_texte")}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/catalogue">
              <Button variant="luxury" size="lg" className="h-12 px-10">
                {t("contact.decouvrir_biens")}
              </Button>
            </Link>
            <a href="https://wa.me/212600000000" target="_blank" rel="noopener noreferrer">
              <Button variant="luxury-ghost" size="lg" className="h-12 px-10">
                {t("contact.nous_contacter")}
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
