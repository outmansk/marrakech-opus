/**
 * prerender.mjs
 * ─────────────────────────────────────────────────────────
 * Writes a static HTML file for every public page (in FR, EN and ES),
 * with its content, meta tags, hreflang and JSON-LD, so that Google and
 * AI crawlers (GPTBot, ClaudeBot, PerplexityBot…) read the real page
 * without running JavaScript. The browser then hydrates that HTML.
 *
 * Runs at the end of `npm run build`, after:
 *   vite build                                          → dist/
 *   vite build --ssr src/entry-server.tsx --outDir dist-ssr
 *
 * Each page is written as <path>.html (Vercel `cleanUrls` serves it without
 * the extension). dist/spa.html is the empty app shell: Vercel serves it for the
 * admin and for /bien/… and /blog/… addresses with no pre-rendered file (content
 * published since the last deploy). Any other unknown address gets dist/404.html
 * with a 404 status. Rebuild the site to pre-render new content.
 * ─────────────────────────────────────────────────────────
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { loadEnv } from 'vite';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
const template = fs.readFileSync(path.join(dist, 'index.html'), 'utf-8');

// The shell must exist even when nothing is pre-rendered (vercel.json rewrites to it).
fs.writeFileSync(path.join(dist, 'spa.html'), template.replace('<!--app-head-->', ''));

const env = { ...loadEnv('production', root, 'VITE_'), ...process.env };
if (!env.VITE_SUPABASE_URL || !env.VITE_SUPABASE_ANON_KEY) {
  // Not fatal: CI builds run without Supabase credentials.
  console.warn('⚠️  VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY missing — pages not pre-rendered.');
  fs.writeFileSync(path.join(dist, 'index.html'), template.replace('<!--app-head-->', ''));
  process.exit(0);
}

const { render, getPrerenderPaths } = await import(pathToFileURL(path.join(root, 'dist-ssr', 'entry-server.js')).href);

function fill(page) {
  return template
    .replace(/<html[^>]*>/, `<html ${page.htmlAttributes || 'lang="fr"'}>`)
    // Helmet provides the page's own title.
    .replace(/<title>[\s\S]*?<\/title>/, '')
    .replace('<!--app-head-->', page.head)
    .replace(
      '<div id="root"></div>',
      `<div id="root">${page.html}</div>\n    <script>window.__RQ_STATE__=${page.state}</script>`,
    );
}

console.log('🧱  Pre-rendering pages...');
// Addresses redirected by vercel.json (old articles merged into landing pages) are not rendered.
const redirected = new Set((JSON.parse(fs.readFileSync(path.join(root, 'vercel.json'), 'utf-8')).redirects || []).map((r) => r.source));
const paths = (await getPrerenderPaths()).filter((url) => !redirected.has(url));
let failed = 0;

for (const url of paths) {
  try {
    const page = await render(url);
    // /en/catalogue → dist/en/catalogue.html, served at /en/catalogue by Vercel `cleanUrls` (and by vite preview).
    const file = url === '/' ? path.join(dist, 'index.html') : `${path.join(dist, ...url.split('/').filter(Boolean))}.html`;
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, fill(page));
  } catch (err) {
    failed += 1;
    console.error(`  ❌  ${url}: ${err instanceof Error ? err.message : err}`);
  }
}

// dist/404.html: served by Vercel with a real 404 status for every unknown address (see vercel.json).
// French markup for crawlers; the browser re-renders it in the language of the requested URL.
try {
  const page = await render('/404');
  fs.writeFileSync(path.join(dist, '404.html'), fill(page).replace('<div id="root">', '<div id="root" data-client-render>'));
} catch (err) {
  console.error(`  ❌  404 page: ${err instanceof Error ? err.message : err}`);
}

if (!paths.includes('/')) fs.writeFileSync(path.join(dist, 'index.html'), template.replace('<!--app-head-->', ''));

console.log(`✅  ${paths.length - failed}/${paths.length} pages pre-rendered.`);
// A page that fails to render still works as a client-side page (spa.html); do not block the deploy.
process.exit(0);
