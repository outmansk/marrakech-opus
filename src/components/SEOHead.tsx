import { Helmet } from 'react-helmet-async';
import { useSEO, SITE_NAME } from '@/hooks/useSEO';
import type { UseSEOParams } from '@/hooks/useSEO';

/**
 * Centralized SEO head component.
 * Renders <title>, meta description, canonical link, Open Graph and Twitter Card tags.
 * Also injects JSON-LD structured data when a `schema` prop is provided.
 */
const SEOHead = (props: UseSEOParams) => {
  const { fullTitle, description, canonicalUrl, ogImage, type } = useSEO(props);

  return (
    <Helmet>
      {/* Core */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonicalUrl} />

      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content="fr_MA" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
    </Helmet>
  );
};

export default SEOHead;
