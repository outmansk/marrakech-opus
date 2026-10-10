/**
 * generate-sitemap.cjs
 * ─────────────────────────────────────────────────────────
 * Generates public/sitemap.xml (static pages, landing pages,
 * available properties and blog articles, in FR/EN/ES with
 * hreflang) and public/llms.txt from Supabase and the
 * Markdown articles of src/content/blog.
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
// Proposed EN/ES property texts (used by the site while the translated columns are empty).
const SUGGESTED_TRANSLATIONS = require('../src/content/propertyTranslations.json');
// Area of a property when its quartier is empty (same data as src/content/zones.ts).
const PROPERTY_FACTS = require('../src/content/propertyFacts.json');
const PROPERTY_OVERRIDES = require('../src/content/propertyOverrides.json');
// Properties written in the code before they exist in the database (src/lib/fileProperties.ts).
const FILE_PROPERTIES = require('../src/content/fileProperties.json').properties;
// Same rule as src/lib/propertyOverrides.ts: confirmed corrections apply until the row is edited in the admin.
const withOverrides = (p) => {
  const o = PROPERTY_OVERRIDES[p.id];
  if (!o || !p.updated_at || new Date(p.updated_at) > new Date(o.dbUpdatedAt)) return p;
  const fields = Object.fromEntries(Object.entries(o.fields).filter(([key]) => key in p));
  return { ...p, ...fields };
};
const ZONE_NAMES = { 'route-de-fes': 'Fez road', 'sidi-rahal': 'Sidi Rahal road', chrifia: 'Chrifia', golf: 'golf area (Prestigia)', palmeraie: 'Palmeraie (Ennakhil)', 'village-touristique': 'Village Touristique' };
const QUARTIER_ZONES = { 'Route de Fes': 'route-de-fes', Chrifia: 'chrifia', Palmeraie: 'palmeraie' };
const areaOf = (p) => ZONE_NAMES[QUARTIER_ZONES[(p.quartier || '').trim()] || PROPERTY_FACTS[p.id]?.zone] || (p.quartier || '').trim() || null;
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
  if (idOrUrl.startsWith('/')) return `${SITE_URL}${idOrUrl}`; // photo stored in public/
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
  { loc: '/a-propos',  priority: '0.5', changefreq: 'monthly' },
  { loc: '/confidentialite', priority: '0.2', changefreq: 'yearly' },
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
  if (langs.length === 0) return '';
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
${hreflangTags(alternates)}${lastmod ? `    <lastmod>${lastmod}</lastmod>
` : ''}    <changefreq>${changefreq}</changefreq>
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
      const content = raw.slice(match ? match[0].length : 0);
      return { slug: meta.slug, title: meta.title, lang: meta.lang || 'fr', translation_key: meta.translation_key || null, updated_at: meta.updated || meta.date, published: meta.published !== 'false', content };
    })
    .filter((article) => article.slug && article.published);
}

// ── Confirmed rental rules (from the owner, Oct 2026) — keep in sync with the site texts ──
const RENTAL_RULES = [
  'Long-term rental: 1-year lease minimum.',
  'Security deposit: 2 months of rent for a furnished home, 1 month for an unfurnished one.',
  'Documents required from the tenant: passport or national ID card only.',
];
const CONTACT = { phone: '+212 6 05 38 70 41', email: 'contact@liveinmarrakech.com' };
const TYPE_NAMES = { villa: 'villas', appartement: 'apartments', riad: 'riads', maison: 'houses', terrain: 'land' };
const SERVICE_NAMES = {
  vente: 'sale',
  'location-longue-duree': 'long-term rental',
  'location-courte-duree': 'short stays',
  'sous-location': 'subletting',
};

/** Available listings a landing page shows (same rule as availableFor() in src/content/landings.ts). */
const landingListings = (landing, properties) =>
  properties.filter((p) => (p.services || []).includes(landing.service) && (!landing.type || p.type === landing.type));

const day = (iso) => (iso ? new Date(iso).toISOString().split('T')[0] : undefined);
const latest = (dates) => dates.filter(Boolean).sort().pop();

/** llms.txt: a factual map of the public site for AI assistants, rebuilt from the data on every build. */
function buildLlmsTxt({ properties, articles, articleLoc }) {
  const types = [...new Set(properties.map((p) => p.type))].map((t) => TYPE_NAMES[t] || t);
  const services = [...new Set(properties.flatMap((p) => p.services || []))].map((s) => SERVICE_NAMES[s] || s);
  const areas = [...new Set(properties.map(areaOf).filter(Boolean))].sort();
  const link = (label, loc) => `- [${label}](${absolute(loc)})`;
  // Landing pages without stock are noindex on the site: not listed here either.
  const landingLinks = (lang) => LANDINGS.filter((l) => landingListings(l, properties).length > 0).map((l) => link(l.label[lang], localize(l.paths[lang], lang)));
  const guide = (a) => link(`${a.title} (${(a.lang || 'fr').toUpperCase()})`, articleLoc(a));

  return `# Live In Marrakech

> Live In Marrakech is a real-estate agency in Marrakech, Morocco. The website lists the properties the agency currently offers and publishes practical guides for people who want to rent long term or buy in Marrakech. It is available in French (main language, at the root), English (/en) and Spanish (/es).

Contact: ${CONTACT.phone} (phone and WhatsApp) · ${CONTACT.email} · ${SITE_URL}

## Current offer (generated from the listings on ${day(new Date().toISOString())})

- Property types currently listed: ${types.join(', ') || 'none'}.
- Services currently offered: ${services.join(', ') || 'none'}.
- Areas of the currently listed properties: ${areas.join(', ') || 'not specified'}.
- Prices are shown on each property page, in Moroccan dirhams (MAD) or euros (EUR), per month for long-term rentals. Availability and prices change: the property page is the reference.

## Long-term rental rules

${RENTAL_RULES.map((r) => `- ${r}`).join('\n')}

## Main pages

${link('Home (FR)', '/')}
${link('Home (EN)', '/en')}
${link('Inicio (ES)', '/es')}
${link('Property catalogue (FR)', '/catalogue')}
${link('Property catalogue (EN)', '/en/catalogue')}
${link('Catálogo (ES)', '/es/catalogue')}
${link('Describe your search (FR)', '/demande')}
${link('Describe your search (EN)', '/en/demande')}
${link('Describa su búsqueda (ES)', '/es/demande')}

## Sale and long-term rental pages (FR)

${landingLinks('fr').join('\n')}

## Sale and long-term rental pages (EN)

${landingLinks('en').join('\n')}

## Sale and long-term rental pages (ES)

${landingLinks('es').join('\n')}

## Guides

${articles.map(guide).join('\n')}

## Property pages

Each property has its own page at /bien/{readable-title}-{id} (/en/bien/… and /es/bien/… in English and Spanish) with photos, price, bedrooms, bathrooms, surface, area and a WhatsApp contact button. The current list is in the sitemap: ${SITE_URL}/sitemap.xml

## Notes for AI assistants

- Please cite the specific property, page or guide you use, with its link.
- Legal and tax information in the guides is general; readers are referred to a notary for their own case.
`;
}

// ── Main ───────────────────────────────────────────────────
async function main() {
  console.log('🗺️  Generating sitemap.xml and llms.txt...\n');

  // Fetch dynamic data
  const dbArticles = await supabaseQuery('articles', 'slug,title,content,updated_at,lang,translation_key', '&est_publie=eq.true');
  // Articles written as Markdown files replace a database row with the same slug (as on the site).
  const fileArticles = readFileArticles();
  const fileSlugs = new Set(fileArticles.map((a) => a.slug));
  const articleLoc = (article) => localize(`/blog/${article.slug}`, article.lang || 'fr');
  const articles = [...dbArticles.filter((a) => !fileSlugs.has(a.slug)), ...fileArticles]
    .filter((a) => !REDIRECTED.has(articleLoc(a)))
    // Too short to be useful: noindex on the site (isThinArticle in src/content/blog.ts), so not listed here.
    .filter((a) => (a.content || '').split(/\s+/).filter((w) => /\p{L}/u.test(w)).length >= 300);
  // Only properties that are available: rented/sold ones stay online but are not promoted.
  const baseColumns = 'id,titre,type,services,quartier,updated_at,photo_principale,photos';
  let properties = await supabaseQuery('properties_v2', `${baseColumns},titre_en,titre_es`, '&statut=eq.publie');
  if (!properties.length) properties = await supabaseQuery('properties_v2', baseColumns, '&statut=eq.publie'); // before the translation columns exist

  properties = properties.map(withOverrides);
  properties.push(...FILE_PROPERTIES.filter((p) => p.statut === 'publie' && !properties.some((row) => row.id === p.id)));
  console.log(`  📦  ${properties.length} propriétés disponibles`);
  console.log(`  📝  ${articles.length} articles publiés\n`);

  const propertiesLastmod = day(latest(properties.map((p) => p.updated_at)));
  const articlesLastmod = day(latest(articles.map((a) => a.updated_at)));
  const entries = [];

  // Static pages, in every language. lastmod = last change of the content they list (none for contact/demande).
  const staticLastmod = { '/': propertiesLastmod, '/catalogue': propertiesLastmod, '/blog': articlesLastmod };
  for (const page of STATIC_PAGES) {
    entries.push(...allLanguages(page.loc, { ...page, lastmod: staticLastmod[page.loc] }));
  }

  // Search landing pages, each listing its translations; lastmod = last change of the listings they show.
  for (const landing of LANDINGS) {
    const listed = landingListings(landing, properties);
    if (!listed.length) continue; // no stock → noindex on the site, so not in the sitemap
    const alternates = Object.fromEntries(LANGUAGES.map((lang) => [lang, localize(landing.paths[lang], lang)]));
    const lastmod = day(latest(listed.map((p) => p.updated_at)));
    for (const lang of LANGUAGES) {
      entries.push(urlEntry({ loc: alternates[lang], alternates, lastmod, changefreq: 'weekly', priority: landing.type ? '0.8' : '0.9' }));
    }
  }

  // Property pages, in every language
  for (const prop of properties) {
    const images = [prop.photo_principale, ...(prop.photos || [])]
      .filter(Boolean)
      .filter((id, i, all) => all.indexOf(id) === i)
      .slice(0, 3)
      .map((id) => ({ url: imageUrl(id), title: prop.titre || '' }))
      .filter((img) => img.url);
    // A language without a translation is noindex on the site, so it stays out of the sitemap too.
    const langs = LANGUAGES.filter((lang) => lang === 'fr' || prop[`titre_${lang}`] || SUGGESTED_TRANSLATIONS[prop.id]?.[lang]?.titre);
    const alternates = Object.fromEntries(langs.map((lang) => [lang, localize(propertyPath(prop), lang)]));
    for (const lang of langs) {
      entries.push(urlEntry({ loc: alternates[lang], alternates, lastmod: day(prop.updated_at), changefreq: 'weekly', priority: '0.7', images }));
    }
  }

  // Blog articles: one address each, linked to their translations
  for (const article of articles) {
    const siblings = article.translation_key
      ? articles.filter((other) => other.translation_key === article.translation_key)
      : [article];
    const alternates = Object.fromEntries(siblings.map((other) => [other.lang || 'fr', articleLoc(other)]));
    entries.push(urlEntry({ loc: articleLoc(article), alternates, lastmod: day(article.updated_at), changefreq: 'monthly', priority: '0.6' }));
  }

  // Assemble XML
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">

${entries.join('\n\n')}

</urlset>`;

  const publicDir = path.resolve(__dirname, '..', 'public');
  fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), xml, 'utf-8');
  fs.writeFileSync(path.join(publicDir, 'llms.txt'), buildLlmsTxt({ properties, articles, articleLoc }), 'utf-8');
  console.log('✅  public/sitemap.xml and public/llms.txt generated');
  console.log(`   Total URLs: ${entries.length}`);
}

main().catch((err) => {
  console.error('❌  Fatal error:', err);
  process.exit(1);
});
