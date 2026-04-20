import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import ReactMarkdown from "react-markdown";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Calendar, Share2, ArrowRight } from "lucide-react";
import { supabase } from "@/lib/supabase";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import type { Article } from "@/types/article";

const BlogPost = () => {
  const { t } = useTranslation();
  const { slug } = useParams<{ slug: string }>();
  const [article, setArticle] = useState<Article | null>(null);
  const [similarArticles, setSimilarArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchArticle();
    window.scrollTo(0, 0);
  }, [slug]);

  const fetchArticle = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("articles")
      .select("*")
      .eq("slug", slug)
      .eq("est_publie", true)
      .single();

    if (data) {
      setArticle(data as Article);
      
      const { data: similar } = await supabase
        .from("articles")
        .select("*")
        .eq("category", data.category)
        .eq("est_publie", true)
        .neq("id", data.id)
        .limit(3);
        
      if (similar) setSimilarArticles(similar as Article[]);
    }
    setLoading(false);
  };

  const extractTOC = (content: string) => {
    const regex = /^(##|###)\s+(.+)$/gm;
    let match;
    const toc = [];
    while ((match = regex.exec(content)) !== null) {
      toc.push({
        level: match[1].length,
        text: match[2],
        id: match[2].toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')
      });
    }
    return toc;
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-32 pb-24">
        <Header />
        <div className="container mx-auto px-6">
          <div className="animate-pulse space-y-8 max-w-4xl mx-auto">
            <div className="h-6 w-32 bg-muted rounded" />
            <div className="h-16 w-3/4 bg-muted rounded" />
            <div className="h-[400px] w-full bg-muted rounded" />
            <div className="h-4 w-full bg-muted rounded" />
            <div className="h-4 w-full bg-muted rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center">
        <Header />
        <h1 className="font-serif mb-4">Article introuvable</h1>
        <Link to="/blog"><Button variant="outline">Retour au blog</Button></Link>
      </div>
    );
  }

  const toc = extractTOC(article.content);
  
  const MarkdownComponents = {
    h2: ({ node, ...props }: any) => {
      const id = props.children[0]?.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
      return <h2 id={id} className="mt-16 mb-8 pb-4 border-b border-border" {...props} />;
    },
    h3: ({ node, ...props }: any) => {
      const id = props.children[0]?.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
      return <h3 id={id} className="mt-12 mb-6" {...props} />;
    },
    p: ({ node, ...props }: any) => <p className="text-muted-foreground font-light leading-relaxed mb-6 text-lg" {...props} />,
    ul: ({ node, ...props }: any) => <ul className="list-disc list-outside ml-6 text-muted-foreground font-light mb-8 space-y-3" {...props} />,
    ol: ({ node, ...props }: any) => <ol className="list-decimal list-outside ml-6 text-muted-foreground font-light mb-8 space-y-3" {...props} />,
    strong: ({ node, ...props }: any) => <strong className="text-foreground font-medium" {...props} />,
  };

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": article.meta_title || article.title,
    "description": article.meta_description || article.excerpt,
    "image": article.image_url,
    "datePublished": article.created_at,
    "dateModified": article.updated_at,
    "author": {
      "@type": "Organization",
      "name": "Dar Prestige"
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{article.meta_title || article.title}</title>
        <meta name="description" content={article.meta_description || article.excerpt} />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>
      
      <Header />

      <div className="pt-32 pb-16">
        <div className="container mx-auto px-6 max-w-4xl">
          <Link to="/blog" className="inline-flex items-center text-xs tracking-widest uppercase font-medium text-muted-foreground hover:text-foreground transition-colors mb-8">
            <ArrowLeft size={16} strokeWidth={1.25} className="mr-2" /> Retour
          </Link>
          
          <div className="inline-block bg-secondary text-muted-foreground px-4 py-1.5 text-[10px] uppercase tracking-widest font-medium mb-6">
            {article.category.replace('-', ' ')}
          </div>
          
          <h1 className="mb-6">{article.title}</h1>
          
          <div className="flex items-center gap-6 text-muted-foreground font-light text-sm mb-12">
            <span className="flex items-center">
              <Calendar size={16} strokeWidth={1} className="mr-2" /> 
              {new Date(article.created_at).toLocaleDateString('fr-FR')}
            </span>
            <button className="flex items-center hover:text-foreground transition-colors" onClick={() => { navigator.clipboard.writeText(window.location.href); alert("Lien copié !"); }}>
              <Share2 size={16} strokeWidth={1} className="mr-2" /> Partager
            </button>
          </div>
        </div>
        
        {article.image_url && (
          <div className="container mx-auto px-6 max-w-5xl mb-16">
            <div className="aspect-[21/9] w-full overflow-hidden bg-muted">
              <img src={article.image_url} alt={article.title} className="w-full h-full object-cover" />
            </div>
          </div>
        )}
      </div>

      <div className="container mx-auto px-6 pb-24 grid grid-cols-1 lg:grid-cols-12 gap-16 max-w-5xl">
        <div className="lg:col-span-4 order-2 lg:order-1">
          <div className="sticky top-32">
            <p className="text-xs tracking-widest uppercase text-muted-foreground mb-6">Sommaire</p>
            <ul className="space-y-4 border-l border-border pl-6">
              {toc.map((item, index) => (
                <li key={index} className={`${item.level === 3 ? 'ml-4' : ''}`}>
                  <a href={`#${item.id}`} className="text-muted-foreground hover:text-foreground text-sm font-light transition-colors block">
                    {item.text}
                  </a>
                </li>
              ))}
            </ul>

            <div className="mt-16 bg-secondary p-8 text-center">
              <h3 className="font-serif text-2xl mb-4">Besoin d'un expert ?</h3>
              <p className="text-muted-foreground text-sm font-light mb-8">Notre agence vous accompagne dans votre projet immobilier à Marrakech.</p>
              <Link to="/catalogue">
                <Button variant="luxury" className="w-full">
                  Voir nos biens
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <div className="lg:col-span-8 order-1 lg:order-2">
          <article className="prose prose-p:text-muted-foreground prose-headings:font-serif prose-headings:text-foreground max-w-none">
            <ReactMarkdown components={MarkdownComponents}>
              {article.content}
            </ReactMarkdown>
          </article>
        </div>
      </div>

      {similarArticles.length > 0 && (
        <section className="bg-secondary py-24 md:py-32">
          <div className="container mx-auto px-6 max-w-5xl">
            <div className="flex items-end justify-between mb-16">
              <div>
                <h2>Articles similaires</h2>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {similarArticles.map(sim => (
                <Link to={`/blog/${sim.slug}`} key={sim.id} className="group flex flex-col items-start hover-target h-full border border-border bg-background overflow-hidden">
                  <div className="relative w-full aspect-[4/3] overflow-hidden bg-muted">
                    <img src={sim.image_url} alt={sim.title} className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105" />
                  </div>
                  <div className="p-6 flex flex-col flex-grow w-full">
                    <h3 className="font-serif text-lg mb-3 line-clamp-2 transition-colors duration-300">{sim.title}</h3>
                    <p className="text-muted-foreground font-light text-sm line-clamp-2 mb-6">{sim.excerpt}</p>
                    <div className="mt-auto flex items-center gap-2 text-xs tracking-widest uppercase font-sans font-medium text-muted-foreground group-hover:text-foreground transition-all duration-300">
                      {t('blog.lire_article')} <ArrowRight size={14} strokeWidth={1} className="transition-transform duration-300 group-hover:translate-x-1" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
};

export default BlogPost;
