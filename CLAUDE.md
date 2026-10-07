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
- `vercel.json`: `cleanUrls` serves `/x` from `x.html`; everything else rewrites to `/spa` (`dist/spa.html`, the empty shell) — admin and content published since the last deploy. New content is pre-rendered only after a redeploy. Without Supabase env (CI), pre-render is skipped with a warning.

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
- Each page shows its listings plus facts computed from the catalogue (count, price range, areas, last update). Rule for the texts: no invented market figures, legal/tax points stay general and refer to the notary.
- Old commercial blog articles were merged into these pages: `vercel.json` `redirects` (308) — the sitemap and pre-render skip redirected sources.

### Images
Uploads go to **Cloudinary** (unsigned preset) via `src/lib/cloudinary.ts`, which also builds transformed URLs (size presets thumb/card/hero/full) and still accepts legacy Supabase Storage URLs. Render via `src/components/ui/OptimizedImage.tsx`.

### Routing & auth
- **Language is in the URL**: French at the root, English under `/en`, Spanish under `/es` (`src/i18n/routing.ts`: `langFromPath`, `localizePath`, `languageSwitchPath`). i18next takes its language from the URL, never from the browser. Internal links must go through `lp()` from `useLocalePath()`; the language switchers are real `<Link>`s.
- Public pages (in each language tree): `/`, `/catalogue`, `/bien/:id`, `/blog`, `/blog/:slug`, `/contact`, `/demande`.
- Property URLs are `/bien/<slug>-<uuid>` (`propertyPath()` / `propertyIdFromParam()` in `src/lib/propertyUrl.ts`); old `/bien/<uuid>` links redirect client-side to the canonical one.
- Admin: `/manage-xk92p/login` (client-side lockout after failed attempts), and nested under `/manage-xk92p` → `ProtectedRoute` (session + `profiles.role === 'admin'`) → `AdminLayout`: `dashboard`, `biens`, `blog`, `visites`, `clients`, `documents`, `agenda`, `messages`. Never add public links to the admin URL.
- `AdminDocuments` generates printable contracts/receipts (FR / AR / bilingual) from a form, client-side only.

### i18n & SEO (public site only)
- i18next with `src/i18n/locales/{fr,en,es}.json`, fallback `fr`. Some components use `useLocalizedText()` → `tL(fr, en, es)` for inline strings instead of JSON keys. Property content (titles, descriptions) exists only in French.
- Every public page renders `SEOHead` (title, description, single canonical, hreflang fr/en/es/x-default, `og:locale`, `<html lang>`, JSON-LD via Helmet). Use `alternates` when translations differ (blog), `canonicalPath`, `noindex` for 404s. Site-wide `RealEstateAgent` + `WebSite` JSON-LD lives in `index.html`; `<!--app-head-->` there is the pre-render insertion point.
- Blog articles have a `lang` (`fr|en|es`) and optional `translation_key` linking translations; each article has one URL in its own language. Queries tolerate the columns being absent (pre-migration).
- `sitemap.xml` (per-language URLs with hreflang) is generated at build by `scripts/generate-sitemap.cjs`; `supabase/functions/sitemap` is an older edge-function version, not used by `robots.txt`. Static `public/robots.txt`, `llms.txt`, `humans.txt`.

### Styling
- Tailwind + shadcn/ui primitives in `src/components/ui/` (alias `@/` → `src/`). Design tokens (HSL CSS variables) in `src/index.css` / `tailwind.config.ts`.
- Brand: warm cream background, olive primary, terracotta accent; headings Cormorant Garamond, UI Montserrat; small radii, thin borders, soft shadows, no bright "SaaS" colors.
- **Back-office** uses its own shared building blocks: class strings in `src/components/admin/styles.ts` (`btn.*`, `field.*` — 44 px touch targets, one icon per button) and components in `src/components/admin/ui.tsx` (`PageHeader`, `ActionMenu`, `ConfirmDialog`, `EmptyState`, `ErrorState`, `Chips`, `SelectField`) plus `StatusBadge`. Reuse them; admin is designed mobile-first (cards on mobile, tables on desktop). The full redesign brief is in `docs/prompt-claude-design-admin.md`.
- Public site animations: framer-motion, Lenis smooth scroll (`SmoothScroll`), `components/motion/Animations.tsx`.

## Other notes
- `docs/import/*.csv` are seed data for owners/intermediaries and clients.
- `.agents/skills/` holds Supabase / Postgres best-practice references usable when touching the schema.
- `README.md` and `ARCHITECTURE.md` are partly outdated (they mention only FR/EN, Supabase Storage for photos and no pre-rendering); trust the code.
