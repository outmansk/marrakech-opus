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

CI (`.github/workflows/quality.yml`, Node 20) runs typecheck → lint → test → build on every PR and push to `main`. Vercel deploys `main` automatically. Tests are matched by `src/**/*.{test,spec}.{ts,tsx}`; there are very few.

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
- **`supabase/schema.sql` is the single source of truth** for the database (no migrations folder). It is applied manually in the Supabase SQL editor. When changing the schema, update this file (keep later sections idempotent with `IF NOT EXISTS` / `DROP POLICY IF EXISTS`), the TS types, and end with `NOTIFY pgrst, 'reload schema'`.
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
- `/location-longue-duree` and its two sub-pages (and EN/ES) render extra blocks from `src/content/rentalCopy.ts`: intro with the computed rent range, rent table by type × area, "furnished or unfurnished", areas (only zones with an available listing, texts in `src/content/zones.ts`), "how to rent", and a generated FAQ (also the FAQPage JSON-LD). Confirmed rules: 1-year lease minimum, deposit 2 months furnished / 1 month unfurnished, passport or ID card only.
- Area of a property: `zoneOf()`/`zoneLabel()` (quartier, else `src/content/propertyFacts.json`). Furnished status: `furnishedOf()` (DB `meuble`, else the confirmed facts file) → `FurnishedBadge`.
- Listing corrections confirmed by the agency but not yet in the database (service, price, texts…) go in `src/content/propertyOverrides.json`: `withOverrides()` (`src/lib/propertyOverrides.ts`, applied in `propertiesQueryOptions`/`propertyQueryOptions` and mirrored in the sitemap script) merges them over the row only while its `updated_at` is not newer than `dbUpdatedAt`, so saving the property in the admin hands control back to the database. Never override `titre` with a different slug: the property URL is built from the French title.
- Properties not yet in the database can be written in `src/content/fileProperties.json` (photos in `public/biens/<slug>/`): `withFileProperties()`/`fileProperty()` (`src/lib/fileProperties.ts`) add them to public queries (those filtering on `statut`; the admin does not see them), and `getPrerenderPaths`, the sitemap script and `middleware.ts` include them. Delete the entry once the property is created in the admin.

### Images
Uploads go to **Cloudinary** (unsigned preset) via `src/lib/cloudinary.ts`, which also builds transformed URLs (size presets thumb/card/hero/full) and still accepts legacy Supabase Storage URLs. Render via `src/components/ui/OptimizedImage.tsx` (always outputs `src`/`srcSet` and width/height from the preset, so images are in the pre-rendered HTML; `priority` for the first/LCP image, lazy otherwise).

### Routing & auth
- **Language is in the URL**: French at the root, English under `/en`, Spanish under `/es` (`src/i18n/routing.ts`: `langFromPath`, `localizePath`, `languageSwitchPath`). i18next takes its language from the URL, never from the browser. Internal links must go through `lp()` from `useLocalePath()`; the language switchers are real `<Link>`s.
- Public pages (in each language tree): `/`, `/catalogue`, `/bien/:id`, `/blog`, `/blog/:slug`, `/contact`, `/demande`, `/a-propos`, `/mentions-legales` (noindex), `/confidentialite` (slugs are French in every language). The three info pages use `InfoPageLayout`; agency facts (NAP, legal IDs, story, retention…) come from `src/content/agency.ts`, where empty fields are "TODO À CONFIRMER" and stay hidden until filled.
- Property URLs are `/bien/<slug>-<uuid>` (`propertyPath()` / `propertyIdFromParam()` in `src/lib/propertyUrl.ts`); old `/bien/<uuid>` links redirect client-side to the canonical one.
- Admin: `/manage-xk92p/login` (client-side lockout after failed attempts), and nested under `/manage-xk92p` → `ProtectedRoute` (session + `profiles.role === 'admin'`) → `AdminLayout`: `dashboard`, `biens`, `blog`, `visites`, `clients`, `documents`, `agenda`, `messages`. Never add public links to the admin URL.
- `AdminDocuments` generates printable contracts/receipts (FR / AR / bilingual) from a form, client-side only.

### i18n & SEO (public site only)
- **Property texts per language**: `properties_v2.titre_en/_es`, `description_courte_en/_es`, `description_longue_en/_es` (edited in the admin, flag `traduction_a_relire`), else the proposed texts of `src/content/propertyTranslations.json` (keyed by property id). `src/lib/propertyI18n.ts` resolves them (`propertyText`) and holds the type/service/equipment/place labels and the property `<title>`/meta formulas. A property with no translation for a language renders French there with `noindex` and is left out of that language in the sitemap. `properties_v2.meuble` (nullable boolean) = furnished status.
- i18next with `src/i18n/locales/{fr,en,es}.json`, fallback `fr`. Some components use `useLocalizedText()` → `tL(fr, en, es)` for inline strings instead of JSON keys. Property content (titles, descriptions) exists only in French.
- Every public page renders `SEOHead` (title, description, single canonical, hreflang fr/en/es/x-default, `og:locale`, `<html lang>`, JSON-LD via Helmet). Use `alternates` when translations differ (blog), `canonicalPath`, `noindex` for 404s. Every page shows a visible breadcrumb (`components/Breadcrumbs.tsx`) and the matching `BreadcrumbList` from `breadcrumbJsonLd()` in `src/lib/breadcrumbs.ts`. Site-wide `RealEstateAgent` + `WebSite` JSON-LD lives in `index.html` and must stay consistent with the footer NAP: only confirmed facts (no hours, geo or postal code yet), never `aggregateRating`/reviews unless real reviews are shown on the page; `<!--app-head-->` there is the pre-render insertion point.
- Blog articles come from two sources merged in `useArticles.ts`: Supabase rows (edited in the admin) and **Markdown files in `src/content/blog/`** (frontmatter mirrors the table: slug, lang, translation_key, category, title, meta_title, meta_description, excerpt, date, published; parsed by `src/content/blog.ts`). A file wins over a row with the same slug. A `## Questions fréquentes` (or EN/ES equivalent) section with `### question` + answer becomes the article's FAQPage JSON-LD (`articleFaq()`); `updated:` in the frontmatter shows a visible "last updated" date and feeds dateModified. Articles under 300 words are noindex and left out of the sitemap/llms.txt (`isThinArticle()`). New articles are written as files; they appear after a deploy (pre-render + sitemap read them too). Each article has a `lang` (`fr|en|es`) and one URL in its own language; `translation_key` links translations (hreflang).
- `sitemap.xml` (per-language URLs with hreflang, available properties only, real `lastmod`) **and `llms.txt`** are generated at build by `scripts/generate-sitemap.cjs` (confirmed rental rules live there as constants); `supabase/functions/sitemap` is an older edge-function version, not used by `robots.txt`. `robots.txt` deliberately does not mention the admin path.

### Styling
- Tailwind + shadcn/ui primitives in `src/components/ui/` (alias `@/` → `src/`). Design tokens (HSL CSS variables) in `src/index.css` / `tailwind.config.ts`.
- Brand: warm cream background, olive primary, terracotta accent; headings Cormorant Garamond, UI Montserrat; small radii, thin borders, soft shadows, no bright "SaaS" colors.
- **Back-office** uses its own shared building blocks: class strings in `src/components/admin/styles.ts` (`btn.*`, `field.*` — 44 px touch targets, one icon per button) and components in `src/components/admin/ui.tsx` (`PageHeader`, `ActionMenu`, `ConfirmDialog`, `EmptyState`, `ErrorState`, `Chips`, `SelectField`) plus `StatusBadge`. Reuse them; admin is designed mobile-first (cards on mobile, tables on desktop). The full redesign brief is in `docs/prompt-claude-design-admin.md`.
- Public site animations: framer-motion, Lenis smooth scroll (`SmoothScroll`), `components/motion/Animations.tsx`.

## Other notes
- `docs/import/*.csv` are seed data for owners/intermediaries and clients.
- `.agents/skills/` holds Supabase / Postgres best-practice references usable when touching the schema.
- `README.md` and `ARCHITECTURE.md` are partly outdated (they mention only FR/EN, Supabase Storage for photos and no pre-rendering); trust the code.
