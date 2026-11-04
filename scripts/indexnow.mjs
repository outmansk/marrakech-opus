#!/usr/bin/env node
/**
 * Tells Bing (and the other IndexNow engines: Yandex, Seznam, Naver…) which pages changed, so they
 * are re-crawled within hours instead of weeks. ChatGPT search and Copilot answer from Bing's index.
 *
 * Reads the LIVE sitemap, so run it after a deploy (the GitHub workflow indexnow.yml does it on every
 * production deployment). By default it sends the pages whose <lastmod> is from the last 2 days.
 *
 *   node scripts/indexnow.mjs            # pages changed in the last 2 days
 *   node scripts/indexnow.mjs --all      # every page of the sitemap (after adding new pages)
 *   node scripts/indexnow.mjs --days 7   # pages changed in the last 7 days
 *   node scripts/indexnow.mjs --dry-run  # list the pages without sending anything
 *
 * The key is public by design: Bing checks that https://liveinmarrakech.com/<key>.txt contains it.
 */

const SITE = 'https://liveinmarrakech.com';
const KEY = 'f13dcfc8991d2e6ac38b08f616e4e1d0'; // same as public/<KEY>.txt
const ENDPOINT = 'https://api.indexnow.org/indexnow';

const args = process.argv.slice(2);
const all = args.includes('--all');
const dryRun = args.includes('--dry-run');
const daysArg = args.indexOf('--days');
const days = daysArg >= 0 ? Number(args[daysArg + 1]) : 2;

const response = await fetch(`${SITE}/sitemap.xml`);
if (!response.ok) throw new Error(`sitemap.xml: HTTP ${response.status}`);
const xml = await response.text();

const since = new Date(Date.now() - days * 86_400_000).toISOString().slice(0, 10);
const urls = [...xml.matchAll(/<url>([\s\S]*?)<\/url>/g)]
  .map(([, entry]) => ({ loc: entry.match(/<loc>([^<]+)<\/loc>/)?.[1], lastmod: entry.match(/<lastmod>([^<]+)<\/lastmod>/)?.[1] }))
  .filter(({ loc, lastmod }) => loc && (all || (lastmod && lastmod >= since)))
  .map(({ loc }) => loc);

console.log(`🔔  IndexNow : ${urls.length} page(s) ${all ? '(tout le sitemap)' : `modifiée(s) depuis le ${since}`}`);
if (!urls.length || dryRun) {
  urls.forEach((url) => console.log(`   ${url}`));
} else {
  // One request accepts up to 10 000 URLs.
  const result = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({ host: new URL(SITE).host, key: KEY, keyLocation: `${SITE}/${KEY}.txt`, urlList: urls }),
  });
  // 200 = received, 202 = received, key check pending. 4xx = wrong key, host or URL.
  console.log(`   Réponse ${result.status} ${result.statusText}`);
  if (result.status >= 400) {
    console.error(await result.text());
    process.exitCode = 1;
  }
}
