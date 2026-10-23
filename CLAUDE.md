# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**Live In Marrakech** (repo name: *marrakech-opus*, live at https://liveinmarrakech.com) — a premium real-estate agency site in Marrakech (sale, long-term rental, short stays, sub-letting). It has two halves in one Vite SPA:
- a **public site** (catalogue, property detail, blog, contact, client request form), multilingual FR/EN/ES;
- a **hidden back-office** at `/manage-xk92p` used by 1–3 agency staff, often on mobile. Its UI is **French only** (formal "vous"); currency is mostly MAD.

The user communicates in French; reply in French.

## Commands

```bash
npm run dev               # Vite dev server on http://localhost:8080 (.claude/launch.json "dev")
npm run typecheck         # tsc -p tsconfig.app.json --noEmit
npm run lint              # eslint .
npm run test              # vitest run (jsdom, setup in src/test/setup.ts)
npx vitest run src/pages/PropertyRequest.test.tsx   # single test file
npx vitest run -t "name"  # single test by name
npm run build             # typecheck + sitemap + vite build + SSR bundle (dist-ssr) + pre-render
npm run generate:sitemap  # writes public/sitemap.xml from Supabase (warns, never fails, if env missing)
npm run prerender         # writes dist/**/*.html from dist-ssr/entry-server.js (needs Supabase env)
```

CI (`.github/workflows/quality.yml`, Node 20) runs typecheck → lint → test → build on every PR and push to `main`. Vercel deploys `main` automatically. Tests are matched by `src/**/*.{test,spec}.{ts,tsx}`; there are only a few (`src/lib/social/*.test.ts`, `AdminReseaux.test.tsx`, `PropertyRequest.test.tsx`).

Env (`.env`, see `.env.example`): `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_SUPABASE_PROJECT_ID`, `VITE_CLOUDINARY_CLOUD_NAME`, `VITE_CLOUDINARY_UPLOAD_PRESET`.

## Architecture

**No custom backend.** The React app talks directly to Supabase (Postgres + Auth) with the anon key; all security is enforced by **RLS** in Postgres.

### Pre-rendering (SEO / GEO)
- Public pages are rendered to static HTML at build time so crawlers and AI bots see content without JS: `src/entry-server.tsx` (bundled with `vite build --ssr`) lists every public URL × language from Supabase (`getPrerenderPaths`), prefetches the page's queries into a QueryClient, renders with `StaticRouter` + Helmet, and `scripts/prerender.mjs` writes `dist/<path>.html` with the head tags, the markup and `window.__RQ_STATE__` (dehydrated React Query cache).
- `src/main.tsx` hydrates that state and uses `hydrateRoot` when `#root` has markup, `createRoot` otherwise. **Anything rendered must be identical on server and client** (no `Date.now()`, locale/timezone-dependent formatting without `timeZone: 'UTC'`, `window` reads during render).
- Routes are shared by both sides in `src/AppRoutes.tsx`; public pages are passed in (lazy in `App.tsx`, eager in `entry-server.tsx`). Admin stays client-only.
- To add a pre-rendered page: route in `AppRoutes`, path in `getPrerenderPaths`, data in `prefetch()` using the same `queryOptions` factory the page uses (e.g. `propertiesQueryOptions` in `useBiens.ts`, `articleQueryOptions` in `useArticles.ts`).
- `vercel.json`: `cleanUrls` serves `/x` from `x.html`, `trailingSlash: false`. Only the admin and `/bien/*`, `/blog/*` (any language) rewrite to `/spa` (`dist/spa.html`, the empty shell) so content published since the last deploy still renders; **every other unknown URL gets `dist/404.html` with a real 404** (pre-rendered NotFound, `noindex`, `data-client-render` so the browser re-renders it in the URL's language). The admin gets `X-Robots-Tag: noindex`. New content is pre-rendered only after a redeploy. Without Supabase env (CI), pre-render is skipped with a warning.
- `middleware.ts` (Vercel Routing Middleware, root of the repo): 301 from old `/bien/<uuid>` (and `/en`, `/es`) to the readable property URL, or to the catalogue if the property no longer exists. Runs only on Vercel.
- `npm run seo:check` crawls the live sitemap (status 200, one H1, self-canonical, reciprocal hreflang, no noindex) and checks 404s, the old-UUID 301s and the trailing-slash redirect; `-- --dist` checks the local build's HTML only.

### Data layer
- Single Supabase client: `src/lib/supabase.ts` (`src/integrations/supabase/client.ts` just re-exports it). DB types in `src/integrations/supabase/types.ts`; domain types in `src/types/property.ts` and `src/types/article.ts`.
- **`supabase/schema.sql` is the single source of truth** for the database. It is applied manually in the Supabase SQL editor. When changing the schema, update this file (keep later sections idempotent with `IF NOT EXISTS` / `DROP POLICY IF EXISTS`), the TS types, and end with `NOTIFY pgrst, 'reload schema'`. `supabase/migrations/` only holds one-off idempotent scripts (with a `_down` rollback) whose content is also appended to `schema.sql`.
- Tables: `profiles` (role `user|admin`), `properties_v2` (the properties — "biens"), `articles` (blog, Markdown content), `visit_requests`, `contact_messages`, `client_leads` (CRM + public `/demande` form), `contacts` (owners/intermediaries/agencies… linked to a property via `bien_id`), `taches` (agenda: calls, visits, follow-ups, linked to contact/property/lead).
- RLS pattern: `public.is_admin()` gates `FOR ALL` admin policies; anon can `SELECT` published properties (`statut IN ('publie','vendu-loue')`) and articles (`est_publie`), and can only `INSERT` into visit_requests / contact_messages / client_leads under strict `WITH CHECK` constraints. Any new public insert path must keep validation in the policy.
- Data access goes through **TanStack Query hooks** in `src/hooks/` (`useBiens`, `useArticles`, `useAgenda`, `useAdminCounts`…). Mutations show `sonner` toasts with French messages and invalidate both their own key and `['admin-dashboard']`. Global QueryClient defaults in `src/App.tsx` (staleTime 5 min, no refetch on focus).
- Some admin code tolerates tables not yet created (`isMissingTable` in `src/lib/agenda.ts`).

### Domain vocabulary (French identifiers in DB and code)
- Property `type`: villa | appartement | riad | maison | terrain. `statut`: publie | brouillon | vendu-loue.
- `services` is a `TEXT[]` (multiple allowed: vente, location longue durée, courte durée, sous-location) with one price column per service (`prix_vente`, `prix_location_longue`, `prix_location_courte`); legacy `service`/`prix` columns still exist — use the helpers in `src/lib/propertyServices.ts` and `mainPrice`/`formatPrix` in `src/lib/labels.ts`.
- All French UI labels and status tones (success/warning/closed) live in `src/lib/labels.ts`; agenda/contact enums and date grouping in `src/lib/agenda.ts`; phone/WhatsApp link helpers in `src/lib/contact.ts`.
- Property references are generated client-side (`DP-YY-XXXXX` in `useBiens.ts`).

### Search landing pages (SEO)
- 9 pages: hubs `vente` / `location` + type pages (`vente-villas`, `location-appartements`…). Registry with translated paths and short labels: `src/content/landings.json` (also read by the sitemap script); texts per language in `src/content/landingCopy.{fr,en,es}.ts`, loaded per language through `landingCopyQueryOptions`. Rendered by `src/pages/ServiceLanding.tsx` from the catch-all routes `:section` / `:section/:slug` (falls back to the 404 page).
- Each page shows its listings plus facts computed from the catalogue (count, price range, areas, last update). **A landing page with no available listing is `noindex, follow` and left out of the sitemap and llms.txt** (`availableFor()` in `landings.ts`, mirrored in the sitemap script); links to it are hidden in "see also", hub cards and the catalogue. Landing titles have no brand suffix (`withBrand={false}`) and stay ≤ 60 chars, metas ≤ 155: check with `npm run seo:check -- --report`. Rule for the texts: no invented market figures, legal/tax points stay general and refer to the notary.
- Old commercial blog articles were merged into these pages: `vercel.json` `redirects` (308) — the sitemap and pre-render skip redirected sources.

### Long-term rental pages
- `/location-longue-duree` and its two sub-pages (and EN/ES) render extra blocks from `src/content/rentalCopy.ts`: intro with the computed rent range, rent table by type × area, "furnished or unfurnished", areas (only zones with an available listing, texts in `src/content/zones.ts`), "how to rent", and a generated FAQ (also the FAQPage JSON-LD). Confirmed rules: 1-year lease minimum, deposit 2 months furnished / 1 month unfurnished, agency fee always 1 month's rent, passport or ID card only.
- Area of a property: `zoneOf()`/`zoneLabel()` (quartier, else `src/content/propertyFacts.json`). Furnished status: `furnishedOf()` (DB `meuble`, else the confirmed facts file) → `FurnishedBadge`.
- Listing corrections confirmed by the agency but not yet in the database (service, price, texts…) go in `src/content/propertyOverrides.json`: `withOverrides()` (`src/lib/propertyOverrides.ts`, applied in `propertiesQueryOptions`/`propertyQueryOptions` and mirrored in the sitemap script) merges them over the row only while its `updated_at` is not newer than `dbUpdatedAt`, so saving the property in the admin hands control back to the database. Never override `titre` with a different slug: the property URL is built from the French title.
- Properties not yet in the database can be written in `src/content/fileProperties.json` (photos in `public/biens/<slug>/`): `withFileProperties()`/`fileProperty()` (`src/lib/fileProperties.ts`) add them to public queries (those filtering on `statut`; the admin does not see them), and `getPrerenderPaths`, the sitemap script and `middleware.ts` include them. Delete the entry once the property is created in the admin.
- Concluded deals (trust): `src/content/propertyDeals.json` (keyed by property id, property must be `vendu-loue`) holds an **anonymous** client profile per language + rent/price + month — never a client name without written consent (Moroccan law 09-08). `dealLine()` (`src/lib/propertyDeals.ts`) feeds the « Déjà loué » overlay on cards, the box on the property page and the home section `RecentDeals` (query `RECENT_DEALS_QUERY`, prefetched for `/`).
- Displayed property titles (H1, cards, JSON-LD) can be a richer headline from `src/content/propertyHeadlines.json` (name + what makes it different, per language; not the price/furnished/bedrooms already on the card). `propertyText()` uses it; the URL and WhatsApp messages keep the short `titre`.

### Images
Uploads go to **Cloudinary** (unsigned preset) via `src/lib/cloudinary.ts`, which also builds transformed URLs (size presets thumb/card/hero/full) and still accepts legacy Supabase Storage URLs. Render via `src/components/ui/OptimizedImage.tsx` (always outputs `src`/`srcSet` and width/height from the preset, so images are in the pre-rendered HTML; `priority` for the first/LCP image, lazy otherwise).

### Routing & auth
- **Language is in the URL**: French at the root, English under `/en`, Spanish under `/es` (`src/i18n/routing.ts`: `langFromPath`, `localizePath`, `languageSwitchPath`). i18next takes its language from the URL, never from the browser. Internal links must go through `lp()` from `useLocalePath()`; the language switchers are real `<Link>`s.
- Public pages (in each language tree): `/`, `/catalogue`, `/bien/:id`, `/blog`, `/blog/:slug`, `/contact`, `/demande`, `/a-propos`, `/mentions-legales` (noindex), `/confidentialite` (slugs are French in every language). The three info pages use `InfoPageLayout`; agency facts (NAP, legal IDs, story, retention…) come from `src/content/agency.ts`, where empty fields are "TODO À CONFIRMER" and stay hidden until filled.
- Property URLs: new properties get a short stored `properties_v2.slug` (`/bien/villa-golf-atlas`, generated once in `useCreateProperty`, never changed by later edits); older ones (slug NULL) keep `/bien/<slug>-<uuid>`. `propertyIdFromParam()` returns the UUID or the slug; `propertyQueryOptions` queries by `id` or `slug`. Legacy: `/bien/<slug>-<uuid>` (`propertyPath()` / `propertyIdFromParam()` in `src/lib/propertyUrl.ts`); old `/bien/<uuid>` links redirect client-side to the canonical one.
- Admin: `/manage-xk92p/login` (client-side lockout after failed attempts), and nested under `/manage-xk92p` → `ProtectedRoute` (session + `profiles.role === 'admin'`) → `AdminLayout`: `dashboard`, `biens`, `blog`, `visites`, `clients`, `documents`, `agenda`, `messages`, `reseaux` (+ `reseaux/journal`, `reseaux/groupes/:id`). Never add public links to the admin URL.
- `AdminDocuments` generates printable contracts/receipts (FR / AR / bilingual) from a form, client-side only.

### i18n & SEO (public site only)
- **Property texts per language**: `properties_v2.titre_en/_es`, `description_courte_en/_es`, `description_longue_en/_es` (edited in the admin, flag `traduction_a_relire`), else the proposed texts of `src/content/propertyTranslations.json` (keyed by property id). `src/lib/propertyI18n.ts` resolves them (`propertyText`) and holds the type/service/equipment/place labels and the property `<title>`/meta formulas. A property with no translation for a language renders French there with `noindex` and is left out of that language in the sitemap. `properties_v2.meuble` (nullable boolean) = furnished status.
- i18next with `src/i18n/locales/{fr,en,es}.json`, fallback `fr`. Some components use `useLocalizedText()` → `tL(fr, en, es)` for inline strings instead of JSON keys.
- Every public page renders `SEOHead` (title, description, single canonical, hreflang fr/en/es/x-default, `og:locale`, `<html lang>`, JSON-LD via Helmet). Use `alternates` when translations differ (blog), `canonicalPath`, `noindex` for 404s. Every page shows a visible breadcrumb (`components/Breadcrumbs.tsx`) and the matching `BreadcrumbList` from `breadcrumbJsonLd()` in `src/lib/breadcrumbs.ts`. Site-wide `RealEstateAgent` + `WebSite` JSON-LD lives in `index.html` and must stay consistent with the footer NAP: only confirmed facts (no hours, geo or postal code yet), never `aggregateRating`/reviews unless real reviews are shown on the page; `<!--app-head-->` there is the pre-render insertion point.
- Blog articles come from two sources merged in `useArticles.ts`: Supabase rows (edited in the admin) and **Markdown files in `src/content/blog/`** (frontmatter mirrors the table: slug, lang, translation_key, category, title, meta_title, meta_description, excerpt, date, published; parsed by `src/content/blog.ts`). A file wins over a row with the same slug. A `## Questions fréquentes` (or EN/ES equivalent) section with `### question` + answer becomes the article's FAQPage JSON-LD (`articleFaq()`); `updated:` in the frontmatter shows a visible "last updated" date and feeds dateModified. Articles under 300 words are noindex and left out of the sitemap/llms.txt (`isThinArticle()`). New articles are written as files; they appear after a deploy (pre-render + sitemap read them too). Each article has a `lang` (`fr|en|es`) and one URL in its own language; `translation_key` links translations (hreflang).
- `sitemap.xml` (per-language URLs with hreflang, available properties only, real `lastmod`) **and `llms.txt`** are generated at build by `scripts/generate-sitemap.cjs` (confirmed rental rules live there as constants); `supabase/functions/sitemap` is an older edge-function version, not used by `robots.txt`. `robots.txt` deliberately does not mention the admin path.

### Styling
- Tailwind + shadcn/ui primitives in `src/components/ui/` (alias `@/` → `src/`). Design tokens (HSL CSS variables) in `src/index.css` / `tailwind.config.ts`.
- Brand: warm cream background, olive primary, terracotta accent; headings Cormorant Garamond, UI Montserrat; small radii, thin borders, soft shadows, no bright "SaaS" colors.
- **Back-office** uses its own shared building blocks: class strings in `src/components/admin/styles.ts` (`btn.*`, `field.*` — 44 px touch targets, one icon per button) and components in `src/components/admin/ui.tsx` (`PageHeader`, `ActionMenu`, `ConfirmDialog`, `EmptyState`, `ErrorState`, `Chips`, `SelectField`) plus `StatusBadge`. Reuse them; admin is designed mobile-first (cards on mobile, tables on desktop). The full redesign brief is in `docs/prompt-claude-design-admin.md`.
- **Property page** (`src/pages/PropertyDetail.tsx`, design from Stitch "Marrakech Luxury Property Mobile Design"): blocks in `src/components/property/` — `PhotoGallery` (CSS scroll-snap carousel on mobile, mosaic on desktop, full-screen viewer), `PropertySections` (specs, reassurance, description split into titled cards by blank lines + short heading line, amenities with icons, area + travel times, confirmed rental terms with computed deposit), `SimilarProperties` (3 real cards, same service, type/area first; list prefetched for the pre-render). Helpers in `src/lib/propertyDetail.ts`. Only real data and confirmed facts — never the Stitch placeholder content (agent, "titre foncier vérifié", travel times, charges…). Desktop keeps the sticky "Réserver ou visiter" column; the price/WhatsApp/visit bar is mobile only.
- Public site animations: framer-motion, Lenis smooth scroll (`SmoothScroll`), `components/motion/Animations.tsx`.

## Social networks (admin `/manage-xk92p/reseaux`)
- Tracks where each property is posted (Facebook groups, Instagram, Marketplace…) and which posts bring clients. **Nothing is posted from the site and no social-network credentials are stored.**
- SQL: `supabase/migrations/20261013_reseaux_sociaux.sql` (idempotent, also appended to `schema.sql`), rollback `…_down.sql`, optional demo data `supabase/seed/reseaux_demo.sql` (`is_demo = true`). Tables `social_groups`, `social_publications` (short `code` → reference `FB-12`), `social_clicks`, `social_account_alerts`; optional origin columns (`origine_reseau/_groupe_id/_publication_id/_ref`, plus `bien_id`) on `client_leads`, `visit_requests`, `contact_messages`. `social_publications.bien_id` has no FK on purpose (file properties are not in `properties_v2`).
- Until that SQL is run, every admin page shows `SetupNotice` (tables missing) and public forms retry without the origin column — keep that tolerance.
- Data: `useSocialData()` (`src/hooks/useSocial.ts`) loads everything; all figures and alerts are pure functions in `src/lib/social/stats.ts` (tested in `stats.test.ts`, Casablanca time zone): approval rate, period KPIs vs previous period, per-day series, funnel, `groupStats` + `groupScore` (garder / surveiller / abandonner), duplicates (< 7 days), pace (> 5 posts/day or < 10 min apart), rented property still online, off-site properties, unused groups for a property. Formatting helpers in `src/lib/social/format.ts`.
- UI: pages `AdminReseaux` (overview + « À surveiller »), `AdminReseauxJournal` (filters via query string, one-click status, CSV export for Excel), `AdminReseauxGroupes` (list + `/:id` detail); shared pieces in `src/components/admin/social/` and `src/components/admin/charts.tsx` (`HBarChart`, `HBarPair`, `StatCard`, also used by the dashboard). Menu entry with a badge = posts pending for more than 3 days (`useAdminCounts.socialPending`). Property form has a « Réseaux sociaux » tab (`BienSocialPanel`); the property list a « Réseaux » column; client form an « Origine » section; visits and messages show `OriginTag`; dashboard gets a 7th card and two to-do alerts.
- Tracked links: `/bien/<slug>?src=fb&g=<group code>&p=<post code>`. `AttributionCapture` (public routes) stores the reference for 30 days and calls the `track_social_click` RPC once per session; public forms send it through `insertWithOrigin()` (`src/lib/social/attribution.ts`), a DB trigger resolves it to post/group/network; the property page adds ` [FB-12]` to its WhatsApp message (read in an effect to keep the pre-rendered HTML identical).
- External API: Edge Function `supabase/functions/social-api` (POST, header `x-api-key` = secret `SOCIAL_API_KEY`), actions `create` and `status`.

## Other notes
- `docs/import/*.csv` are seed data for owners/intermediaries and clients.
- `.agents/skills/` holds Supabase / Postgres best-practice references usable when touching the schema.
- `README.md` and `ARCHITECTURE.md` are partly outdated (they mention only FR/EN, Supabase Storage for photos and no pre-rendering); trust the code.


### Short property URL migration (18 October 2026)

See `docs/seo/urls-courtes.md`. Apply `20261018_short_property_urls.sql` before rebuilding/deploying. Stored slugs are permanent; the database trigger allocates them for admin and SQL imports and backfills missing ones. File properties resolve by id or slug. Middleware redirects both UUID-only and title+UUID URLs in FR/EN/ES, preserving query strings. The slug column is required for creating properties; do not silently strip it on save. Update the SQL reserved slug list when adding a new file property.
