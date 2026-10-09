import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, FileText } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import Breadcrumbs from "@/components/Breadcrumbs";
import { breadcrumbJsonLd } from "@/lib/breadcrumbs";
import { publishedArticlesQueryOptions } from "@/hooks/useArticles";
import { useLocalizedText } from "@/hooks/useLocalizedText";
import { useLocalePath } from "@/hooks/useLocalePath";
import { BASE_URL } from "@/hooks/useSEO";


const Blog = () => {
  const { t } = useTranslation();
  const tL = useLocalizedText();
  const { lang, lp } = useLocalePath();
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const { data: allArticles = [], isLoading: loading } = useQuery(publishedArticlesQueryOptions(lang));
  const articles = useMemo(
    () => activeCategory === 'all' ? allArticles : allArticles.filter((article) => article.category === activeCategory),
    [allArticles, activeCategory],
  );

  const categories = [
    { id: 'all', label: tL('Tous', 'All', 'Todos') },
    { id: 'location-longue-duree', label: t('services.location_longue') },
    { id: 'sous-location', label: t('services.sous_location') },
    { id: 'vente', label: t('services.vente') },
    { id: 'terrain', label: tL('Terrain', 'Land', 'Terreno') },
  ];

  const pageTitle = tL("Blog immobilier Marrakech : guides pour louer et acheter", "Marrakech real estate blog: guides to rent and buy", "Blog inmobiliario Marrakech: guías para alquilar y comprar");
  const crumbs = [{ name: tL("Accueil", "Home", "Inicio"), path: lp("/") }, { name: "Blog", path: lp("/blog") }];
  const schema = breadcrumbJsonLd(crumbs);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEOHead
        title={pageTitle}
        withBrand={false}
        description={tL(
          "Actualités, conseils et analyses du marché immobilier à Marrakech : location, vente, investissement et sous-location.",
          "News, advice and analysis of the Marrakech property market: renting, buying, investing and subletting.",
          "Noticias, consejos y análisis del mercado inmobiliario de Marrakech: alquiler, compra, inversión y subarriendo.",
        )}
        schema={schema}
      />
      
      <Header />

      <div className="pt-32 pb-24">
        <div className="container mx-auto px-6 md:px-12">
          <Breadcrumbs crumbs={crumbs} className="mb-8" />
          <p className="text-xs tracking-widest uppercase text-muted-foreground mb-4">{t('nav.journal')}</p>
          <h1 className="mb-12">{tL("Blog immobilier", "Real estate blog", "Blog inmobiliario")}</h1>

          {/* Filters */}
          <div className="flex gap-1 mb-16 border-b border-border overflow-x-auto pb-px scrollbar-hide w-full max-w-full">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-6 py-3 text-xs tracking-widest uppercase font-sans font-medium transition-colors border-b-2 -mb-px whitespace-nowrap ${
                  activeCategory === cat.id
                    ? "border-foreground text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-[4/3] bg-muted" />
                  <div className="pt-5 space-y-3">
                    <div className="h-3 w-24 bg-muted rounded" />
                    <div className="h-5 w-48 bg-muted rounded" />
                    <div className="h-4 w-32 bg-muted rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : articles.length === 0 ? (
            <div className="text-center py-20">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground font-light text-lg">{tL("Aucun article publié.", "No articles published yet.", "Todavía no hay artículos publicados.")}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
              {articles.map((article) => (
                <Link to={lp(`/blog/${article.slug}`)} key={article.id} className="group flex flex-col items-start hover-target h-full border border-border bg-card overflow-hidden">
                  <div className="relative w-full aspect-[4/3] overflow-hidden bg-muted">
                    {article.image_url ? (
                      <img
                        src={article.image_url}
                        alt={article.title}
                        loading="lazy"
                        decoding="async"
                        width={800}
                        height={600}
                        className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                      />
                    ) : (
                      // No stock photo: a plain block keeps every card distinct.
                      <div aria-hidden="true" className="flex h-full w-full items-end bg-[#ede5d8] p-6">
                        <span className="font-serif text-[64px] italic leading-none text-[#a4573e]/25">{article.title.charAt(0)}</span>
                      </div>
                    )}
                    <div className="absolute top-4 left-4 bg-background/90 backdrop-blur-md px-3 py-1 text-[10px] uppercase tracking-widest font-medium text-foreground">
                      {categories.find(c => c.id === article.category)?.label}
                    </div>
                  </div>
                  
                  <div className="p-6 flex flex-col flex-grow w-full">
                     <p className="text-muted-foreground text-xs mb-3 font-light">
                      {new Date(article.created_at).toLocaleDateString(lang, { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })}
                    </p>
                    <h2 className="font-serif text-xl mb-3 line-clamp-2 transition-colors duration-300">
                      {article.title}
                    </h2>
                    <p className="text-muted-foreground font-light text-sm line-clamp-3 mb-6">
                      {article.excerpt}
                    </p>
                    
                    <div className="mt-auto flex items-center gap-2 text-xs tracking-widest uppercase font-sans font-medium text-muted-foreground group-hover:text-foreground transition-all duration-300">
                      {t('blog.lire_article')}
                      <ArrowRight size={14} strokeWidth={1} className="transition-transform duration-300 group-hover:translate-x-1" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Blog;
