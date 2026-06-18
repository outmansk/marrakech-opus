import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const BASE_URL = 'https://liveinmarrakech.com';

// Static pages with their change frequency and priority
const STATIC_PAGES: Array<{ path: string; changefreq: string; priority: string }> = [
  { path: '/', changefreq: 'weekly', priority: '1.0' },
  { path: '/catalogue', changefreq: 'daily', priority: '0.9' },
  { path: '/blog', changefreq: 'weekly', priority: '0.8' },
  { path: '/contact', changefreq: 'monthly', priority: '0.6' },
];

Deno.serve(async () => {
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch published properties
    const { data: properties, error: propError } = await supabase
      .from('properties_v2')
      .select('id, updated_at')
      .eq('statut', 'publie')
      .order('updated_at', { ascending: false });

    if (propError) {
      console.error('Error fetching properties:', propError.message);
    }

    // Fetch published articles
    const { data: articles, error: artError } = await supabase
      .from('articles')
      .select('slug, updated_at')
      .eq('est_publie', true)
      .order('updated_at', { ascending: false });

    if (artError) {
      console.error('Error fetching articles:', artError.message);
    }

    // Build XML
    const today = new Date().toISOString().split('T')[0];

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;

    // Static pages
    for (const page of STATIC_PAGES) {
      xml += `  <url>
    <loc>${BASE_URL}${page.path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>
`;
    }

    // Property pages
    if (properties) {
      for (const prop of properties) {
        const lastmod = prop.updated_at
          ? new Date(prop.updated_at).toISOString().split('T')[0]
          : today;
        xml += `  <url>
    <loc>${BASE_URL}/bien/${prop.id}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
`;
      }
    }

    // Blog article pages
    if (articles) {
      for (const article of articles) {
        const lastmod = article.updated_at
          ? new Date(article.updated_at).toISOString().split('T')[0]
          : today;
        xml += `  <url>
    <loc>${BASE_URL}/blog/${article.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
`;
      }
    }

    xml += `</urlset>`;

    return new Response(xml, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    });
  } catch (err) {
    console.error('Sitemap generation error:', err);
    return new Response('Internal Server Error', { status: 500 });
  }
});
