/**
 * generate-sitemap.cjs
 * ─────────────────────────────────────────────────────────
 * Generates a complete sitemap.xml from static pages +
 * dynamic properties & blog articles from Supabase.
 *
 * Usage:
 *   node scripts/generate-sitemap.cjs
 *
 * Requires:
 *   VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env
 * ─────────────────────────────────────────────────────────
 */

const fs = require('fs');
const path = require('path');

// ── Load .env (process env wins, e.g. on Vercel) ───────────
function loadEnv() {
  const vars = {};
  const envPath = path.resolve(__dirname, '..', '.env');
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf-8');
    for (const line of content.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const [key, ...rest] = trimmed.split('=');
      vars[key.trim()] = rest.join('=').trim().replace(/^(["'])(.*)\1$/, '$2');
    }
  }
  return { ...vars, ...process.env };
}

const env = loadEnv();
const SUPABASE_URL = env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = env.VITE_SUPABASE_ANON_KEY;
const SITE_URL = 'https://liveinmarrakech.com';
const CLOUD_NAME = env.VITE_CLOUDINARY_CLOUD_NAME;

// Photos are stored as Cloudinary public_ids (legacy rows may hold full URLs).
function imageUrl(idOrUrl) {
  if (/^https?:\/\//.test(idOrUrl)) return idOrUrl;
  return CLOUD_NAME ? `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${idOrUrl}` : null;
}

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  // Not fatal: CI builds run without Supabase credentials.
  console.warn('⚠️  VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY missing — sitemap not generated.');
  process.exit(0);
}

// ── Supabase REST fetch ────────────────────────────────────
async function supabaseQuery(table, select = '*', filters = '') {
  const url = `${SUPABASE_URL}/rest/v1/${table}?select=${select}${filters}`;
  const res = await fetch(url, {
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    },
  });
  if (!res.ok) {
    console.error(`❌  Supabase query failed for ${table}: ${res.status}`);
    return [];
  }
  return res.json();
}

// ── Static pages ───────────────────────────────────────────
const STATIC_PAGES = [
  { loc: '/',          priority: '1.0', changefreq: 'daily' },
  { loc: '/catalogue', priority: '0.9', changefreq: 'daily' },
  { loc: '/blog',      priority: '0.8', changefreq: 'weekly' },
];

const LANGUAGES = ['fr', 'en', 'es'];

// ── XML generation ─────────────────────────────────────────
function xmlEscape(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function hreflangTags(loc) {
  return LANGUAGES.map(
    (lang) =>
      `    <xhtml:link rel="alternate" hreflang="${lang}" href="${SITE_URL}${loc}" />`
  ).join('\n');
}

function urlEntry({ loc, lastmod, changefreq, priority, images }) {
  const imgTags = (images || [])
    .map(
      (img) =>
        `    <image:image>\n      <image:loc>${xmlEscape(img.url)}</image:loc>\n      <image:title>${xmlEscape(img.title || '')}</image:title>\n    </image:image>`
    )
    .join('\n');

  return `  <url>
    <loc>${SITE_URL}${loc}</loc>
${hreflangTags(loc)}
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
${imgTags}
  </url>`;
}

// ── Main ───────────────────────────────────────────────────
async function main() {
  console.log('🗺️  Generating sitemap.xml...\n');
  const today = new Date().toISOString().split('T')[0];

  // Fetch dynamic data
  const [properties, articles] = await Promise.all([
    supabaseQuery('properties_v2', 'id,titre,updated_at,photo_principale,photos', '&statut=eq.publie'),
    supabaseQuery('articles', 'slug,updated_at', '&est_publie=eq.true'),
  ]);

  console.log(`  📦  ${properties.length} propriétés publiées`);
  console.log(`  📝  ${articles.length} articles publiés\n`);

  // Build URL entries
  const entries = [];

  // Static pages
  for (const page of STATIC_PAGES) {
    entries.push(urlEntry({ ...page, lastmod: today }));
  }

  // Property pages
  for (const prop of properties) {
    const lastmod = prop.updated_at
      ? new Date(prop.updated_at).toISOString().split('T')[0]
      : today;
    const images = [prop.photo_principale, ...(prop.photos || [])]
      .filter(Boolean)
      .filter((id, i, all) => all.indexOf(id) === i)
      .slice(0, 3)
      .map((id) => ({ url: imageUrl(id), title: prop.titre || '' }))
      .filter((img) => img.url);
    entries.push(
      urlEntry({
        loc: `/bien/${prop.id}`,
        lastmod,
        changefreq: 'weekly',
        priority: '0.7',
        images,
      })
    );
  }

  // Blog articles
  for (const article of articles) {
    const lastmod = article.updated_at
      ? new Date(article.updated_at).toISOString().split('T')[0]
      : today;
    entries.push(
      urlEntry({
        loc: `/blog/${article.slug}`,
        lastmod,
        changefreq: 'monthly',
        priority: '0.6',
      })
    );
  }

  // Assemble XML
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">

${entries.join('\n\n')}

</urlset>`;

  // Write to public/
  const outputPath = path.resolve(__dirname, '..', 'public', 'sitemap.xml');
  fs.writeFileSync(outputPath, xml, 'utf-8');
  console.log(`✅  sitemap.xml generated → ${outputPath}`);
  console.log(`   Total URLs: ${entries.length}`);
}

main().catch((err) => {
  console.error('❌  Fatal error:', err);
  process.exit(1);
});
