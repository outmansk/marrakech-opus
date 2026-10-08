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
// Search landing pages (villas à vendre…), one translated address per language.
const LANDINGS = require('../src/content/landings.json');
// Addresses that redirect elsewhere (old blog articles merged into landing pages) stay out of the sitemap.
const REDIRECTED = new Set((require('../vercel.json').redirects || []).map((r) => r.source));

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
  { loc: '/demande',   priority: '0.6', changefreq: 'monthly' },
  { loc: '/contact',   priority: '0.5', changefreq: 'monthly' },
];

// Same rules as src/i18n/routing.ts: French at the root, /en and /es for the others.
const LANGUAGES = ['fr', 'en', 'es'];
const localize = (loc, lang) => (lang === 'fr' ? loc : loc === '/' ? `/${lang}` : `/${lang}${loc}`);
const absolute = (loc) => `${SITE_URL}${loc === '/' ? '' : loc}`;

// Same as propertyPath() in src/lib/propertyUrl.ts.
const slugify = (text) =>
  String(text || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
function propertyPath(prop) {
  const slug = slugify(prop.titre).slice(0, 70).replace(/-$/, '');
  return `/bien/${slug ? `${slug}-` : ''}${prop.id}`;
}

// ── XML generation ─────────────────────────────────────────
function xmlEscape(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/** alternates: { fr: '/x', en: '/en/x', … } — every version of the page, itself included. */
function hreflangTags(alternates) {
  const langs = LANGUAGES.filter((lang) => alternates[lang]);
  if (langs.length < 2) return '';
  const tags = langs.map((lang) => `    <xhtml:link rel="alternate" hreflang="${lang}" href="${xmlEscape(absolute(alternates[lang]))}" />`);
  if (alternates.fr) tags.push(`    <xhtml:link rel="alternate" hreflang="x-default" href="${xmlEscape(absolute(alternates.fr))}" />`);
  return tags.join('\n') + '\n';
}

function urlEntry({ loc, alternates = {}, lastmod, changefreq, priority, images }) {
  const imgTags = (images || [])
    .map(
      (img) =>
        `    <image:image>\n      <image:loc>${xmlEscape(img.url)}</image:loc>\n      <image:title>${xmlEscape(img.title || '')}</image:title>\n    </image:image>\n`
    )
    .join('');

  return `  <url>
    <loc>${xmlEscape(absolute(loc))}</loc>
${hreflangTags(alternates)}    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
${imgTags}  </url>`;
}

/** One entry per language, each listing all the others. */
function allLanguages(loc, fields) {
  const alternates = Object.fromEntries(LANGUAGES.map((lang) => [lang, localize(loc, lang)]));
  return LANGUAGES.map((lang) => urlEntry({ ...fields, loc: alternates[lang], alternates }));
}

// ── Blog articles stored as Markdown files (src/content/blog, parsed like src/content/blog.ts) ──
function readFileArticles() {
  const dir = path.resolve(__dirname, '..', 'src', 'content', 'blog');
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter((name) => name.endsWith('.md'))
    .map((name) => {
      const raw = fs.readFileSync(path.join(dir, name), 'utf-8');
      const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
      const meta = {};
      for (const line of (match ? match[1] : '').split(/\r?\n/)) {
        const separator = line.indexOf(':');
        if (separator < 1) continue;
        const value = line.slice(separator + 1).trim();
        meta[line.slice(0, separator).trim()] = value.startsWith('"') ? JSON.parse(value) : value;
      }
      return { slug: meta.slug, lang: meta.lang || 'fr', translation_key: meta.translation_key || null, updated_at: meta.updated || meta.date, published: meta.published !== 'false' };
    })
    .filter((article) => article.slug && article.published);
}

// ── Main ───────────────────────────────────────────────────
async function main() {
  console.log('🗺️  Generating sitemap.xml...\n');
  const today = new Date().toISOString().split('T')[0];

  // Fetch dynamic data
  const dbArticles = await supabaseQuery('articles', 'slug,updated_at,lang,translation_key', '&est_publie=eq.true');
  // Articles written as Markdown files replace a database row with the same slug (as on the site).
  const fileArticles = readFileArticles();
  const fileSlugs = new Set(fileArticles.map((a) => a.slug));
  const articles = [...dbArticles.filter((a) => !fileSlugs.has(a.slug)), ...fileArticles];
  const properties = await supabaseQuery('properties_v2', 'id,titre,updated_at,photo_principale,photos', '&statut=eq.publie');

  console.log(`  📦  ${properties.length} propriétés publiées`);
  console.log(`  📝  ${articles.length} articles publiés\n`);

  const entries = [];

  // Static pages, in every language
  for (const page of STATIC_PAGES) {
    entries.push(...allLanguages(page.loc, { ...page, lastmod: today }));
  }

  // Search landing pages, each listing its translations
  for (const landing of LANDINGS) {
    const alternates = Object.fromEntries(LANGUAGES.map((lang) => [lang, localize(landing.paths[lang], lang)]));
    for (const lang of LANGUAGES) {
      entries.push(urlEntry({ loc: alternates[lang], alternates, lastmod: today, changefreq: 'weekly', priority: landing.type ? '0.8' : '0.9' }));
    }
  }

  // Property pages, in every language
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
    entries.push(...allLanguages(propertyPath(prop), { lastmod, changefreq: 'weekly', priority: '0.7', images }));
  }

  // Blog articles: one address each, linked to their translations
  const articleLoc = (article) => localize(`/blog/${article.slug}`, article.lang || 'fr');
  for (const article of articles.filter((a) => !REDIRECTED.has(articleLoc(a)))) {
    const lastmod = article.updated_at
      ? new Date(article.updated_at).toISOString().split('T')[0]
      : today;
    const siblings = article.translation_key
      ? articles.filter((other) => other.translation_key === article.translation_key)
      : [article];
    const alternates = Object.fromEntries(siblings.map((other) => [other.lang || 'fr', articleLoc(other)]));
    entries.push(urlEntry({ loc: articleLoc(article), alternates, lastmod, changefreq: 'monthly', priority: '0.6' }));
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
