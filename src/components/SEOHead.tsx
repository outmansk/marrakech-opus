import { Helmet } from 'react-helmet-async';
import { useSEO, SITE_NAME } from '@/hooks/useSEO';
import type { UseSEOParams } from '@/hooks/useSEO';
import { LANGS, OG_LOCALES } from '@/i18n/routing';

// "<" must not appear raw inside an inline <script>.
const toJsonLd = (schema: unknown) => JSON.stringify(schema).replace(/</g, '\\u003c');

/**
 * Centralized SEO head component.
 * Renders <title>, meta description, canonical, hreflang alternates, Open Graph and Twitter Card tags,
 * plus JSON-LD structured data. Everything goes through Helmet so the build-time pre-render
 * writes it into the static HTML that crawlers read.
 */
const SEOHead = (props: UseSEOParams) => {
  const { fullTitle, description, canonicalUrl, ogImage, type, lang, alternates } = useSEO(props);
  const schemas = props.schema ? (Array.isArray(props.schema) ? props.schema : [props.schema]) : [];

  return (
    <Helmet>
      <html lang={lang} />

      {/* Core */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {props.noindex && <meta name="robots" content="noindex, follow" />}
      {!props.noindex && <link rel="canonical" href={canonicalUrl} />}
      {!props.noindex && alternates.map(({ lang: hreflang, href }) => (
        <link key={hreflang} rel="alternate" hrefLang={hreflang} href={href} />
      ))}

      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content={OG_LOCALES[lang]} />
      {LANGS.filter((l) => l !== lang).map((l) => (
        <meta key={l} property="og:locale:alternate" content={OG_LOCALES[l]} />
      ))}

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      {schemas.map((schema, index) => (
        <script key={index} type="application/ld+json">{toJsonLd(schema)}</script>
      ))}
    </Helmet>
  );
};

export default SEOHead;
