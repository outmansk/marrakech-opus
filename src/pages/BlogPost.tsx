import { useEffect } from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import SEOHead from "@/components/SEOHead";
import Breadcrumbs from "@/components/Breadcrumbs";
import { breadcrumbJsonLd } from "@/lib/breadcrumbs";
import ReactMarkdown, { type Components } from "react-markdown";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Calendar, Share2, ArrowRight } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import OptimizedImage from "@/components/ui/OptimizedImage";
import { articleQueryOptions } from "@/hooks/useArticles";
import { articleFaq, isThinArticle } from "@/content/blog";
import { useLocalizedText } from "@/hooks/useLocalizedText";
import { useLocalePath } from "@/hooks/useLocalePath";
import { BASE_URL, SITE_NAME } from "@/hooks/useSEO";
import { DEFAULT_LANG, localizePath, type Lang } from "@/i18n/routing";

const LANG_NAMES: Record<Lang, string> = { fr: "Français", en: "English", es: "Español" };

const BlogPost = () => {
  const { t } = useTranslation();
  const tL = useLocalizedText();
  const { lang, lp } = useLocalePath();
  const { slug } = useParams<{ slug: string }>();
  const { data, isLoading: loading } = useQuery(articleQueryOptions(slug));
  const article = data?.article ?? null;
  const similarArticles = data?.similar ?? [];

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

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
        <SEOHead title={tL("Article introuvable", "Article not found", "Artículo no encontrado")} description="" noindex />
        <Header />
        <h1 className="font-serif mb-4">{tL("Article introuvable", "Article not found", "Artículo no encontrado")}</h1>
        <Link to={lp("/blog")}><Button variant="outline">{tL("Retour au blog", "Back to the blog", "Volver al blog")}</Button></Link>
      </div>
    );
  }

  // Each article lives at one address, in its own language.
  const articleLang = article.lang ?? DEFAULT_LANG;
  if (articleLang !== lang) return <Navigate to={localizePath(`/blog/${article.slug}`, articleLang)} replace />;

  const translations = data?.translations ?? [];
  const articlePath = lp(`/blog/${article.slug}`);
  const alternates: Partial<Record<Lang, string>> = { [articleLang]: articlePath };
  for (const translation of translations) alternates[translation.lang] = localizePath(`/blog/${translation.slug}`, translation.lang);

  const toc = extractTOC(article.content);

  const MarkdownComponents: Components = {
    h2: ({ node: _node, children, ...props }) => {
      const id = String(children).toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
      return <h2 id={id} className="mt-16 mb-8 pb-4 border-b border-border" {...props}>{children}</h2>;
    },
    h3: ({ node: _node, children, ...props }) => {
      const id = String(children).toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
      return <h3 id={id} className="mt-12 mb-6" {...props}>{children}</h3>;
    },
    p: ({ node: _node, ...props }) => <p className="text-muted-foreground font-light leading-relaxed mb-6 text-lg" {...props} />,
    ul: ({ node: _node, ...props }) => <ul className="list-disc list-outside ml-6 text-muted-foreground font-light mb-8 space-y-3" {...props} />,
    ol: ({ node: _node, ...props }) => <ol className="list-decimal list-outside ml-6 text-muted-foreground font-light mb-8 space-y-3" {...props} />,
    strong: ({ node: _node, ...props }) => <strong className="text-foreground font-medium" {...props} />,
  };

  const crumbs = [
    { name: tL("Accueil", "Home", "Inicio"), path: lp("/") },
    { name: "Blog", path: lp("/blog") },
    { name: article.title, path: articlePath },
  ];
  // Covers stored on the site ("/blog/x.webp") need an absolute URL for social previews and JSON-LD.
  const coverUrl = article.image_url?.startsWith("/") ? `${BASE_URL}${article.image_url}` : article.image_url;
  const faq = articleFaq(article.content);
  const thin = isThinArticle(article.content);
  const updated = article.updated_at && article.updated_at.slice(0, 10) !== article.created_at.slice(0, 10)
    ? new Date(article.updated_at).toLocaleDateString(lang, { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" })
    : null;
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      "headline": article.meta_title || article.title,
      "description": article.meta_description || article.excerpt,
      ...(coverUrl && { "image": coverUrl }),
      "datePublished": article.created_at,
      "dateModified": article.updated_at,
      "inLanguage": articleLang,
      "mainEntityOfPage": `${BASE_URL}${articlePath}`,
      "author": { "@type": "Organization", "name": SITE_NAME, "url": BASE_URL },
      "publisher": { "@id": `${BASE_URL}/#business` },
    },
    breadcrumbJsonLd(crumbs),
    ...(faq.length ? [{
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "inLanguage": articleLang,
      "mainEntity": faq.map(({ q, a }) => ({ "@type": "Question", "name": q, "acceptedAnswer": { "@type": "Answer", "text": a } })),
    }] : []),
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title={article.meta_title || article.title}
        withBrand={false}
        description={article.meta_description || article.excerpt || ''}
        noindex={thin}
        image={coverUrl}
        schema={jsonLd}
        alternates={alternates}
        type="article"
      />

      <Header />

      <div className="pt-32 pb-16">
        <div className="container mx-auto px-6 max-w-4xl">
          <Breadcrumbs crumbs={crumbs} className="mb-8" />

          <div className="inline-block bg-secondary text-muted-foreground px-4 py-1.5 text-[10px] uppercase tracking-widest font-medium mb-6">
            {article.category.replace('-', ' ')}
          </div>

          <h1 className="mb-6">{article.title}</h1>

          <div className="flex flex-wrap items-center gap-6 text-muted-foreground font-light text-sm mb-12">
            <span className="flex items-center">
              <Calendar size={16} strokeWidth={1} className="mr-2" />
              {new Date(article.created_at).toLocaleDateString(lang, { timeZone: 'UTC' })}
            </span>
            {updated && <span>{tL("Dernière mise à jour :", "Last updated:", "Última actualización:")} <time dateTime={article.updated_at.slice(0, 10)}>{updated}</time></span>}
            <button className="flex items-center hover:text-foreground transition-colors" onClick={() => { navigator.clipboard.writeText(window.location.href); alert(tL("Lien copié !", "Link copied!", "¡Enlace copiado!")); }}>
              <Share2 size={16} strokeWidth={1} className="mr-2" /> {tL("Partager", "Share", "Compartir")}
            </button>
            {translations.map((translation) => (
              <Link key={translation.lang} to={localizePath(`/blog/${translation.slug}`, translation.lang)} hrefLang={translation.lang} className="hover:text-foreground transition-colors">
                {LANG_NAMES[translation.lang]}
              </Link>
            ))}
          </div>
        </div>

        {article.image_url && (
          <div className="container mx-auto px-6 max-w-5xl mb-16">
            <div className="aspect-[21/9] w-full overflow-hidden bg-muted">
              <OptimizedImage src={article.image_url} alt={article.title} size="hero" className="w-full h-full object-cover" wrapperClassName="w-full h-full" />
            </div>
          </div>
        )}
      </div>

      <div className="container mx-auto px-6 pb-24 grid grid-cols-1 lg:grid-cols-12 gap-16 max-w-5xl">
        <div className="lg:col-span-4 order-2 lg:order-1">
          <div className="sticky top-32">
            <p className="text-xs tracking-widest uppercase text-muted-foreground mb-6">{tL("Sommaire", "Contents", "Índice")}</p>
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
              <p className="font-serif text-2xl mb-4">{tL("Besoin d'un expert ?", "Need an expert?", "¿Necesita un experto?")}</p>
              <p className="text-muted-foreground text-sm font-light mb-8">{tL("Notre agence vous accompagne dans votre projet immobilier à Marrakech.", "Our agency supports your real estate project in Marrakech.", "Nuestra agencia le acompaña en su proyecto inmobiliario en Marrakech.")}</p>
              <Link to={lp("/catalogue")}>
                <Button variant="luxury" className="w-full">
                  {tL("Voir nos biens", "See our properties", "Ver nuestras propiedades")}
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
                <h2>{tL("Articles similaires", "Related articles", "Artículos relacionados")}</h2>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {similarArticles.map(sim => (
                <Link to={lp(`/blog/${sim.slug}`)} key={sim.id} className="group flex flex-col items-start hover-target h-full border border-border bg-background overflow-hidden">
                  <div className="relative w-full aspect-[4/3] overflow-hidden bg-muted">
                    <OptimizedImage src={sim.image_url} alt={sim.title} size="card" className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105" wrapperClassName="w-full h-full" />
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
