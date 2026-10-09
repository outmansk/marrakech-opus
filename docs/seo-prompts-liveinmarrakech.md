# Prompts SEO / GEO / AEO — Live In Marrakech (remplis)

Deux prompts prêts à coller. Le prompt 1 produit la recherche et les 3 fichiers ; le prompt 2 les applique dans le code.
Dossier de sortie commun : `C:\Users\outman\Desktop\PROJETS SK\marrakech-opus-main\docs\seo\`

---

## Prompt 1 — Recherche et plan (Claude in Chrome / Cowork, connecté à Google Ads)

```
You are a senior multilingual SEO strategist and keyword-research analyst.

WEBSITE: https://liveinmarrakech.com

BUSINESS: Real-estate agency in Marrakech, Morocco: villas, apartments, riads, houses and land for sale, long-term rentals (monthly, furnished or unfurnished), short stays and subletting, in Marrakech and its outskirts.

GOAL: More qualified leads — WhatsApp messages, visit requests and the "Describe your search" form (/demande) — from people who want to buy or rent long term in Marrakech.

PRIORITY PRODUCTS OR SERVICES:
1. Long-term rental (apartments, villas) in Marrakech
2. Sale (villas, apartments, riads, houses, land) in Marrakech
3. Short stays / holiday rentals (secondary)
4. Subletting (secondary)

AUDIENCES: expats and foreigners settling in Marrakech (French, British, Spanish, other Europeans), Moroccans living abroad (MRE) buying back home, Moroccan residents renting or buying, retirees and remote workers, tourists for short stays (secondary).

LANGUAGES AND MARKETS:
- French: France, Belgium, Switzerland, Canada (Quebec), Morocco
- English: United Kingdom, United States, Ireland, Morocco
- Spanish: Spain, Morocco

DELIVERABLES WANTED: a plan doc, a keyword workbook (.xlsx), and an implementation spec (.md) a coding agent can follow.

SAFETY RULES
- Research and read only. Do not create, enable, pause or edit any campaign, bid, budget, billing, audience, conversion or account setting. Do not spend money.
- Temporary Keyword Planner plans are fine. Export data as CSV.
- Stop and ask me if Google needs a login, CAPTCHA, 2FA, billing acceptance or any confirmation that changes the account.
- Never invent search volume, CPC, competition, trends or rankings. Write "Not available" when Google does not show a value.
- Google Ads competition and bids are advertiser metrics, not organic SEO difficulty. Never present them as the same thing.
- Keep observed data and your own conclusions clearly separate. Do not assume the highest-volume keyword is the best one.

KNOWN CONTEXT (verify, do not trust blindly)
- Canonical host: https://liveinmarrakech.com (no www). www redirects with 308. French at the root, English under /en, Spanish under /es.
- Sitemap: https://liveinmarrakech.com/sitemap.xml (pages pre-rendered as static HTML).
- Existing landing pages: /vente, /vente/{villas,appartements,riads,maisons,terrains}-marrakech, /location-longue-duree, /location-longue-duree/{appartements,villas}-marrakech (+ /en/for-sale/…, /en/long-term-rental/…, /es/venta/…, /es/alquiler-larga-duracion/…).
- Existing guides: buying in Morocco as a foreigner, best areas to live in Marrakech, moving to Marrakech, land title / melkia / off-plan (FR/EN/ES), plus 2 older French articles (subletting, land investment).
- Catalogue is small (about 11 properties, mostly villas; 2 apartments for rent; no land listed). Prices are in MAD, sometimes EUR. Property descriptions exist in French only.
- Google Search Console: Domain property "liveinmarrakech.com" verified in October 2026, so little data yet.

PHASE 1 — UNDERSTAND THE BUSINESS
- Check the domain resolves; note the canonical host (www or not) and any redirects.
- Read the sitemap and the main category and property pages. Record every offer with price, type, area/neighbourhood, bedrooms, surface, service (sale / long-term / short stay / sublet), furnished or not, how to contact or book a visit.
- Record existing landing pages, blog posts and localized pages, plus obvious content, localization, trust and conversion gaps (e.g. property descriptions only in French on /en and /es).
- Put anything uncertain in an "Inventory verification required" list. Never recommend keywords for things the site does not offer (e.g. no land listed right now, no commercial property).
- Show me the inventory and your planned Keyword Planner settings, then continue unless I object.

PHASE 2 — KEYWORD PLANNER
- Use Discover new keywords (seed keywords, max 10 per run) and Get search volume and forecasts.
- Network: Google only. Date range: the latest 12 months offered. One language per run; never mix languages.
- For each language, set its markets as locations and run 3 or more seed sets of 10, one per cluster:
  (a) long-term rental, (b) buying / for sale by property type, (c) neighbourhoods (Gueliz, Hivernage, Palmeraie, Medina, Agdal, Targa, route de l'Ourika, route de Fès), (d) expat / MRE / foreigner buying and moving questions.
  Write seeds as natives search, not word-for-word translations. Cover modifiers such as price/cost/loyer, cheap/pas cher/barato, furnished/meublé/amueblado, near/à côté de, best, agency/agence/inmobiliaria, "à l'année", "long term".
- Download every run as .csv ("Download keyword ideas"). Read the CSVs from my Downloads folder (C:\Users\outman\Downloads) rather than scraping the table.
- Record exact settings for every export (language, locations, network, dates, seeds, file name).

PHASE 3 — OTHER FIRST-PARTY DATA (if accessible without changing anything)
- Google Search Console (property liveinmarrakech.com): queries, clicks, impressions, CTR, position; positions 4–20; pages with impressions but weak CTR. Data may be very limited (property verified in October 2026).
- Google Ads Insights and search-terms report (probably no active campaigns); Google Trends for spelling and phrasing variants (Marrakech / Marrakesh, Gueliz / Guéliz, riad / ryad) — relative interest only.
- Report what was not accessible.

PHASE 4 — SITE TECHNICAL, GEO AND AEO AUDIT
- robots.txt (including AI crawlers such as GPTBot, OAI-SearchBot, PerplexityBot, ClaudeBot, Google-Extended), llms.txt, sitemap.
- On key pages (home, /catalogue, the landing pages above, 3 property pages, the 4 guides): title, H1, meta robots, canonical, hreflang, structured data types, FAQ blocks, review or rating data.
- Localized pages (/en, /es): leftover French text, noindex, duplicate URLs.

PHASE 5 — GOOGLE RESULTS CHECK
- For the 6–10 most promising keywords, search Google with country and language parameters (e.g. gl=fr&hl=fr, gl=gb&hl=en, gl=es&hl=es, gl=ma). Record who ranks (Avito, Mubawab, Sarouty and other portals, agencies, blogs, forums, maps), "People also ask" questions, and whether liveinmarrakech.com appears.
- Give an organic opportunity rating (High / Medium / Low) from that evidence; mark unchecked keywords "Not checked".

PHASE 6 — ANALYSIS
- Label each shortlisted keyword: intent (transactional, commercial comparison, local, informational, seasonal, branded, irrelevant) and buyer stage.
- Score 1–5: purchase/rental intent, inventory relevance, organic attainability, demand evidence, commercial value, content fit.
  Opportunity score = intent 30% + relevance 25% + attainability 20% + demand 15% + commercial value 10% (use an Excel formula).
- Priority: P1 now, P2 next, P3 supporting, Reject (not offered, misleading, unattainable).
- Cluster keywords by intent; one primary page per cluster per language; assign each keyword one action: optimize existing page, new landing page, supporting guide, FAQ section, or do not target. Map to the existing landing pages and guides first; propose a new page only when no existing page fits.

DELIVERABLES
1. Plan doc: executive summary; method and data limits; top 10 keywords per language with evidence; page map (URL, primary and supporting keywords, SEO title ≤60 chars, H1, meta ≤155 chars); GEO/AEO findings and actions; SERP and competitor gaps; content briefs for the top 5 commercial pages and top 5 guides; cannibalization report; 30-day action plan.
2. Workbook (.xlsx): Read me (settings and limits), Prioritized keywords (with score formula), Page to keyword map, Keyword master (deduplicated), Raw Google exports.
3. Implementation spec (.md) for a coding agent: ground rules, verified inventory and prices, page map with titles/H1s/meta, on-page rules, questions to answer, technical fixes, overlaps, order of work, and a list of facts that need my confirmation.

Save files to C:\Users\outman\Desktop\PROJETS SK\marrakech-opus-main\docs\seo\ as:
- seo-plan-liveinmarrakech.md (plan doc)
- keywords-liveinmarrakech.xlsx (workbook)
- seo-implementation-spec.md (implementation spec)
and verify every P1 keyword maps to something the site actually offers.

BROWSER TIPS (Google Ads)
- Before typing anything, confirm the text field has focus. Keystrokes that land on the page trigger Google Ads keyboard shortcuts.
- An account with no running ads shows volume ranges only (10–100, 100–1K, 1K–10K…) and the CSV stores them as midpoints (50, 500, 5000…). Monthly columns may be empty. Report ranges, never exact numbers.
- Check location and language after every change; they default oddly and dropdown clicks can land on the wrong option.
```

---

## Prompt 2 — Implémentation (Claude Code, ouvert dans ce dépôt)

```
You are working in the codebase of https://liveinmarrakech.com, a real-estate agency site that sells and rents villas, apartments, riads, houses and land in Marrakech, in French (root), English (/en) and Spanish (/es). Implement an SEO, GEO (being cited by AI assistants) and AEO (winning direct answers) plan that has already been researched, so the site gets more organic traffic and more qualified leads (WhatsApp, visit requests, the /demande form).

READ FIRST, before changing anything
1. docs/seo/seo-implementation-spec.md — the plan: page map with titles and H1s, on-page rules, technical findings, overlaps, order of work.
2. docs/seo/keywords-liveinmarrakech.xlsx — "Prioritized keywords" and "Page to keyword map" sheets.
3. The codebase. Where things live (see CLAUDE.md):
   - Properties and prices: Supabase table properties_v2 (single source of truth; prices prix_vente / prix_location_longue / prix_location_courte, devise MAD|EUR). Never hard-code a property price in copy.
   - Landing pages: src/content/landings.json (paths, labels) + src/content/landingCopy.{fr,en,es}.ts (titles, H1, answer, sections, FAQ), rendered by src/pages/ServiceLanding.tsx.
   - Blog: Markdown files in src/content/blog/*.md (frontmatter = title, meta_title, meta_description, excerpt, lang, translation_key, image_url) merged with Supabase articles in src/hooks/useArticles.ts.
   - Metadata, canonical, hreflang, JSON-LD: src/components/SEOHead.tsx + src/hooks/useSEO.ts; site-wide JSON-LD in index.html.
   - Language routing: src/i18n/routing.ts; UI strings src/i18n/locales/*.json and inline tL(fr, en, es).
   - Pre-render: src/entry-server.tsx + scripts/prerender.mjs; sitemap: scripts/generate-sitemap.cjs; robots.txt and llms.txt in public/; redirects in vercel.json.
4. CLAUDE.md, README.md, ARCHITECTURE.md (the last two are partly outdated; trust CLAUDE.md and the code).

Then list the skills, plugins, subagents and MCP tools available to you and use whichever fit (SEO or content skills, code review, testing, browser preview). Tell me which you will use and for what.

BEFORE YOU EDIT
Give me a short plan: what you found, which spec items are already done, what you will change, in what order, and which files. Flag conflicts between the spec and the code. Wait for my go-ahead.

RULES
- Facts come from the codebase's own data (properties_v2 for prices and listings). If a price, time or detail in the spec differs from the code or the database, stop and ask me.
- Never invent facts, market prices or legal rules. Legal and tax points stay general and refer to a notary. For items the spec marks CONFIRM, build the field or component, leave it hidden or empty, and give me one list of questions.
- No review or rating structured data unless real reviews are shown on that page.
- Write each language natively, not word for word. Keep each page's keywords in its own language.
- One primary page per keyword cluster; no thin pages for keyword variations.
- Keep existing URLs. For merges or redirects, read both pages first, use permanent redirects (vercel.json), and update canonical, hreflang, sitemap and internal links together.
- Keep FAQ text identical to FAQ structured data; keep prices identical across copy, metadata, structured data and llms.txt.
- Anything rendered must be identical on server and client (pre-render + hydration): no Date.now(), always timeZone: 'UTC' for dates.
- Work on a new git branch with small, single-purpose commits. Do not push, deploy or change production settings without asking.
- Do not touch analytics IDs, API keys, .env files, the Supabase schema/RLS, or the admin back-office (/manage-xk92p).

WORK
Follow the spec's order of work. Typically:
1. Titles, H1s, meta descriptions and two-sentence opening answers on the P1 pages in French.
2. The same in English and Spanish; localize calls to action and pre-filled WhatsApp messages.
3. A reusable trust/proof block above the first call to action, fed by data, hidden until confirmed.
4. New localized pages the spec lists (add them to landings.json / landingCopy or src/content/blog), with hreflang, sitemap and llms.txt entries.
5. Overlap fixes, redirects and technical fixes from the spec.
6. Question headings with 40–60 word answers, using the questions in the spec.
7. New or refreshed guides that link to the commercial pages.

VERIFY BEFORE YOU REPORT
- npm run typecheck, npm run lint, npm run test, npm run build (the build pre-renders every page; check the "pages pre-rendered" count), then preview the build and check the browser console for hydration warnings.
- For every changed page: one H1; title ≤ ~60 chars; meta ≤ ~155; self-canonical; correct hreflang set; valid JSON-LD; no text in the wrong language; internal links resolve; redirects return the right status.
- sitemap.xml, robots.txt and llms.txt match the pages.
- Show before and after for each page's title, H1 and meta.

REPORT
What changed (by page), what you verified and how, what you did not do and why, the CONFIRM questions for me, and what to check in Search Console after deploy.
```
