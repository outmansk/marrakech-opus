import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, FileText } from "lucide-react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/lib/supabase";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Helmet } from "react-helmet-async";
import type { Article } from "@/types/article";


const Blog = () => {
  const { t } = useTranslation();
  const [articles, setArticles] = useState<Article[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  const categories = [
    { id: 'all', label: 'Tous' },
    { id: 'location-longue-duree', label: t('services.location_longue') },
    { id: 'sous-location', label: t('services.sous_location') },
    { id: 'vente', label: t('services.vente') },
    { id: 'terrain', label: 'Terrain' },
  ];

  useEffect(() => {
    fetchArticles();
  }, [activeCategory]);

  const fetchArticles = async () => {
    setLoading(true);
    let query = supabase
      .from('articles')
      .select('*')
      .eq('est_publie', true)
      .order('created_at', { ascending: false });

    if (activeCategory !== 'all') {
      query = query.eq('category', activeCategory);
    }

    const { data } = await query;
    if (data) setArticles(data as Article[]);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Helmet>
        <title>Le Blog Immobilier Marrakech | Dar Prestige</title>
        <meta name="description" content="Actualités, conseils et analyses du marché immobilier à Marrakech : location, vente, investissement et sous-location." />
      </Helmet>
      
      <Header />

      <div className="pt-32 pb-24">
        <div className="container mx-auto px-6 md:px-12">
          <p className="text-xs tracking-widest uppercase text-muted-foreground mb-4">{t('nav.journal')}</p>
          <h1 className="mb-12">Blog Immobilier</h1>

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
              <p className="text-muted-foreground font-light text-lg">Aucun article publié.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
              {articles.map((article) => (
                <Link to={`/blog/${article.slug}`} key={article.id} className="group flex flex-col items-start hover-target h-full border border-border bg-card overflow-hidden">
                  <div className="relative w-full aspect-[4/3] overflow-hidden bg-muted">
                    <img
                      src={article.image_url || 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&q=80'}
                      alt={article.title}
                      className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    />
                    <div className="absolute top-4 left-4 bg-background/90 backdrop-blur-md px-3 py-1 text-[10px] uppercase tracking-widest font-medium text-foreground">
                      {categories.find(c => c.id === article.category)?.label}
                    </div>
                  </div>
                  
                  <div className="p-6 flex flex-col flex-grow w-full">
                     <p className="text-muted-foreground text-xs mb-3 font-light">
                      {new Date(article.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                    <h3 className="font-serif text-xl mb-3 line-clamp-2 transition-colors duration-300">
                      {article.title}
                    </h3>
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
