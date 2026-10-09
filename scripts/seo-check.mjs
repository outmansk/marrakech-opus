/**
 * seo-check.mjs — crawls the sitemap and checks indexing basics.
 *
 *   npm run seo:check                         → the live site (https://liveinmarrakech.com)
 *   npm run seo:check -- --base https://…      → another deployment
 *   npm run seo:check -- --report              → also writes docs/seo/rapport-urls.md (one row per URL)
 *   npm run seo:check -- --dist                → the local build (dist/), HTML checks only:
 *                                               status codes and redirects need Vercel (vercel.json, middleware.ts)
 *
 * For every sitemap URL: status 200, exactly one <h1>, canonical = the URL itself, no noindex,
 * hreflang present and reciprocal. Plus: 5 made-up URLs must answer 404, 2 old /bien/<uuid>
 * URLs must answer 301 to the readable address, and a trailing slash must redirect.
 * Exit code 1 when something fails.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SITE = 'https://liveinmarrakech.com';
const args = process.argv.slice(2);
const distMode = args.includes('--dist');
const reportMode = args.includes('--report');
const base = (args[args.indexOf('--base') + 1] && args.includes('--base') ? args[args.indexOf('--base') + 1] : SITE).replace(/\/$/, '');

const failures = [];
const fail = (url, message) => failures.push(`${url} — ${message}`);

// ── Fetching (HTTP or dist/) ───────────────────────────────
async function get(url) {
  if (distMode) {
    const pathname = new URL(url).pathname;
    const file = pathname === '/' ? path.join(root, 'dist', 'index.html') : path.join(root, 'dist', `${pathname}.html`);
    return fs.existsSync(file) ? { status: 200, html: fs.readFileSync(file, 'utf-8') } : { status: 404, html: '' };
  }
  const response = await fetch(url.replace(SITE, base), { redirect: 'manual', headers: { 'User-Agent': 'LiveInMarrakech-SEO-check' } });
  return { status: response.status, location: response.headers.get('location'), html: response.status === 200 ? await response.text() : '' };
}

async function inBatches(items, size, worker) {
  const results = [];
  for (let i = 0; i < items.length; i += size) results.push(...(await Promise.all(items.slice(i, i + size).map(worker))));
  return results;
}

// ── HTML parsing (enough for our own pre-rendered pages) ───
const attr = (tag, name) => tag.match(new RegExp(`${name}="([^"]*)"`, 'i'))?.[1];
function inspect(html) {
  const head = html.slice(0, html.indexOf('</head>') + 1 || undefined);
  const links = [...head.matchAll(/<link\b[^>]*>/gi)].map((m) => m[0]);
  const robots = [...head.matchAll(/<meta\b[^>]*name="robots"[^>]*>/gi)].map((m) => attr(m[0], 'content') || '');
  const decode = (v) => v.replace(/&amp;/g, '&').replace(/&#x27;/g, "'").replace(/&quot;/g, '"');
  const body = html.slice(Math.max(0, html.indexOf('<div id="root"')))
    .replace(/<script[\s\S]*?<\/script>|<header[\s\S]*?<\/header>|<footer[\s\S]*?<\/footer>/gi, ' ');
  const jsonLdTypes = [...html.matchAll(/<script[^>]*application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi)].map((m) => {
    try {
      const data = JSON.parse(m[1]);
      return data['@type'] || (data['@graph'] ? 'graph' : '?');
    } catch {
      return 'INVALIDE';
    }
  });
  return {
    title: decode(head.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1] ?? ''),
    description: decode(head.match(/<meta[^>]*name="description"[^>]*content="([^"]*)"/i)?.[1] ?? ''),
    h1Text: decode((html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1] ?? '').replace(/<[^>]+>/g, '').trim()),
    jsonLd: jsonLdTypes,
    words: body.replace(/<[^>]+>/g, ' ').split(/\s+/).filter((w) => /\p{L}/u.test(w)).length,
    h1: (html.match(/<h1[\s>]/gi) || []).length,
    canonical: links.filter((l) => /rel="canonical"/i.test(l)).map((l) => attr(l, 'href')),
    hreflang: Object.fromEntries(links.filter((l) => /rel="alternate"/i.test(l) && /hreflang=/i.test(l)).map((l) => [attr(l, 'hreflang'), attr(l, 'href')])),
    noindex: robots.some((r) => /noindex/i.test(r)),
  };
}

// ── 1. Sitemap URLs ────────────────────────────────────────
const sitemap = distMode
  ? fs.readFileSync(path.join(root, 'dist', 'sitemap.xml'), 'utf-8')
  : await (await fetch(`${base}/sitemap.xml`)).text();
const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].replace(/&amp;/g, '&'));
console.log(`🔎  ${urls.length} URL dans le sitemap (${distMode ? 'dist/' : base})\n`);

const pages = new Map();
await inBatches(urls, 6, async (url) => {
  const { status, html } = await get(url);
  if (status !== 200) return fail(url, `statut ${status}`);
  const page = inspect(html);
  pages.set(url, page);
  if (page.h1 !== 1) fail(url, `${page.h1} balise(s) H1`);
  if (page.canonical.length !== 1) fail(url, `${page.canonical.length} canonical`);
  else if (page.canonical[0] !== url) fail(url, `canonical = ${page.canonical[0]}`);
  if (page.noindex) fail(url, 'noindex alors que la page est dans le sitemap');
  if (!Object.keys(page.hreflang).length) fail(url, 'aucun hreflang');
  else if (!Object.values(page.hreflang).includes(url)) fail(url, 'hreflang ne contient pas la page elle-même');
});

// Reciprocity: if A points to B, B must point back to A.
for (const [url, page] of pages) {
  for (const [lang, target] of Object.entries(page.hreflang)) {
    if (lang === 'x-default' || target === url) continue;
    const other = pages.get(target);
    if (!other) fail(url, `hreflang ${lang} → ${target} absent du sitemap`);
    else if (!Object.values(other.hreflang).includes(url)) fail(url, `hreflang ${lang} → ${target} non réciproque`);
  }
}

// ── 2. Status codes (live only) ────────────────────────────
if (!distMode) {
  const bogus = ['/xyz-404', '/fr', '/en/vente', '/es/nada-que-ver', '/catalogue/inexistant'];
  for (const p of bogus) {
    const { status } = await get(SITE + p);
    if (status !== 404) fail(SITE + p, `attendu 404, reçu ${status}`);
  }

  const propertyUrls = urls.filter((u) => /\/bien\/.+-[0-9a-f-]{36}$/.test(u)).slice(0, 2);
  for (const url of propertyUrls) {
    const uuid = url.slice(-36);
    const old = url.replace(/\/bien\/.+$/, `/bien/${uuid}`);
    const { status, location } = await get(old);
    const target = location && new URL(location, SITE).href.replace(base, SITE);
    if (status !== 301) fail(old, `attendu 301, reçu ${status}`);
    else if (target !== url) fail(old, `301 vers ${target}, attendu ${url}`);
  }

  const slash = await get(`${SITE}/vente/`);
  if (![301, 308].includes(slash.status)) fail(`${SITE}/vente/`, `slash final : attendu 301/308, reçu ${slash.status}`);
}

// ── Table (--report) ───────────────────────────────────────
if (reportMode) {
  const cell = (v) => String(v).replace(/\|/g, '/');
  const rows = urls.map((url) => {
    const p = pages.get(url);
    if (!p) return `| ${url} | erreur | | | | | | | | |`;
    const hreflangOk = !failures.some((f) => f.startsWith(url) && f.includes('hreflang'));
    const invalidJsonLd = p.jsonLd.includes('INVALIDE');
    return `| ${url.replace(SITE, '') || '/'} | 200 | ${cell(p.title)} | ${p.title.length} | ${p.description.length} | ${cell(p.h1Text)} | ${p.canonical[0] === url ? 'oui' : 'NON'} | ${hreflangOk ? 'oui' : 'NON'} | ${p.jsonLd.join(', ')}${invalidJsonLd ? ' ⚠️' : ''} | ${p.words} |`;
  });
  const header = '| URL | Statut | Title | Car. | Meta car. | H1 | Canonical | hreflang | JSON-LD | Mots |\n|---|---|---|---|---|---|---|---|---|---|';
  const md = `# Tableau des URL indexables\n\nGénéré par \`npm run seo:check -- --report\` le ${new Date().toISOString().slice(0, 10)} (${distMode ? 'build local' : base}).\n\n${header}\n${rows.join('\n')}\n`;
  fs.mkdirSync(path.join(root, 'docs', 'seo'), { recursive: true });
  fs.writeFileSync(path.join(root, 'docs', 'seo', 'rapport-urls.md'), md);
  const long = [...pages].filter(([, p]) => p.title.length > 60 || p.description.length > 155);
  console.log(`📝  docs/seo/rapport-urls.md écrit — ${long.length} page(s) avec title > 60 ou meta > 155`);
  for (const [url, p] of long) console.log(`   ${p.title.length}/${p.description.length}  ${url}`);
}

// ── Report ─────────────────────────────────────────────────
console.log(`✅  ${pages.size}/${urls.length} pages lues`);
if (failures.length) {
  console.log(`\n❌  ${failures.length} problème(s) :`);
  for (const f of failures) console.log(`  - ${f}`);
  process.exit(1);
}
console.log('✅  Aucun problème détecté.');
