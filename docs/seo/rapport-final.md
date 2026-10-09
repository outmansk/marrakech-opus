# Rapport final — mission SEO / GEO liveinmarrakech.com

Date : 9 octobre 2026. Les 6 phases sont en ligne sur la branche `main`, déployée par Vercel.
Contrôle en ligne (`npm run seo:check -- --report`) : **87/87 URL du sitemap en 200**. Chaque page a un seul H1, une canonical vers elle-même, des hreflang réciproques et n'est pas en noindex. **0 title de plus de 60 caractères, 0 meta de plus de 155.**

Le tableau complet des URL indexables (statut, title et nombre de caractères, meta, H1, canonical, hreflang, types JSON-LD, nombre de mots) est dans [`rapport-urls.md`](rapport-urls.md). Il est régénéré à chaque `npm run seo:check -- --report`.

---

## 1. Ce qui a été fait, phase par phase

### Phase 1 — Base technique
- `vercel.json` :
  - `cleanUrls` et `trailingSlash: false` ;
  - vraie 404 (`dist/404.html`) pour les URL inconnues ;
  - en-tête `X-Robots-Tag: noindex` sur l'admin ;
  - redirections 308 des 6 anciens articles commerciaux.
- `middleware.ts` : redirection 301 des anciennes URL `/bien/<uuid>` vers l'URL lisible, ou vers le catalogue si le bien n'existe plus.
- `scripts/prerender.mjs` et `src/entry-server.tsx` : chaque page publique est écrite en `<chemin>.html` (contenu présent sans JavaScript).
- `src/pages/NotFound.tsx` : page 404 utile, en noindex.
- `public/robots.txt` : le chemin de l'admin n'y figure plus.
- `scripts/seo-check.mjs` : contrôle automatique du site en ligne ou du build local.
- `scripts/generate-sitemap.cjs` :
  - sitemap avec hreflang et `lastmod` réels ;
  - `llms.txt` généré au build.

### Phase 2 — Fiches biens
- `src/lib/propertyI18n.ts` et `src/content/propertyTranslations.json` : titres et descriptions en anglais et en espagnol, avec des formules de title et de meta par langue.
- Un bien sans traduction dans une langue est en noindex dans cette langue et absent du sitemap pour elle.
- `PropertyDetail.tsx`, `PropertyCard.tsx` et `PropertyTags.tsx` : libellés traduits, surface habitable et terrain séparés, zone, badge meublé ou vide avec la caution.
- Admin :
  - `BienForm.tsx` : section Traductions, case « Traduction à relire », choix Meublé / Vide / Non renseigné ;
  - `useBiens.ts` : l'enregistrement fonctionne même avant la migration SQL.
- `supabase/schema.sql` : colonnes de traduction et `meuble`. **La migration reste à exécuter.**

### Phase 3 — Pages de recherche (type × service)
- `src/content/landings.json`, `landingCopy.{fr,en,es}.ts` et `ServiceLanding.tsx` : 9 pages × 3 langues.
- Titles de 60 caractères maximum, metas de 155 maximum.
- Faits calculés au build depuis les annonces : nombre de biens, fourchette de prix, quartiers, date de mise à jour.
- Une page sans bien disponible est en noindex et absente du sitemap et de `llms.txt`.

### Phase 4 — Location longue durée
- `src/content/rentalCopy.ts`, `zones.ts`, `propertyFacts.json` et `FurnishedBadge.tsx`.
- Les pages contiennent :
  - une introduction avec la fourchette de loyers calculée ;
  - un tableau des loyers par type et par zone ;
  - une section meublé ou vide ;
  - les zones (uniquement celles où un bien est disponible) ;
  - « comment louer » ;
  - une FAQ générée, également en JSON-LD FAQPage.
- Seules les règles confirmées sont utilisées :
  - bail d'un an minimum ;
  - caution de 2 mois en meublé, 1 mois en vide ;
  - passeport ou carte d'identité uniquement.

### Phase 5 — Blog
- `src/content/blog/*.md` : 12 guides (4 sujets × FR/EN/ES), écrits dans le code et non dans Supabase.
- Chaque guide a une FAQ (en JSON-LD FAQPage) et une date « Dernière mise à jour » visible.
- `src/content/blog.ts` : un article de moins de 300 mots est en noindex et exclu du sitemap.
- `public/blog/*.webp` : 4 images de couverture différentes.

### Phase 6 — Confiance, accessibilité, données structurées
- **Nouvelles pages**, en FR/EN/ES :
  - `/a-propos` ;
  - `/mentions-legales` (en noindex) ;
  - `/confidentialite`.
  - Elles reposent sur `src/content/agency.ts`, qui ne contient que des faits confirmés ; les champs vides sont masqués.
  - Les liens vers ces 3 pages sont dans le pied de page.
- **Fil d'Ariane visible + `BreadcrumbList`** sur toutes les pages : catalogue, bien, blog, article, contact, demande, pages de recherche et nouvelles pages (`Breadcrumbs.tsx`, `lib/breadcrumbs.ts`).
- **JSON-LD `RealEstateAgent`** (`index.html`) aligné sur le pied de page : nom, téléphone, e-mail, Gueliz, Marrakech.
  - J'ai retiré les horaires, les coordonnées GPS, le code postal et la fourchette de prix, qui n'étaient pas confirmés.
  - Il n'y a ni `aggregateRating` ni avis. Un commentaire marque l'emplacement où ajouter les vrais avis Google plus tard.
- **Images** :
  - `OptimizedImage` met toujours l'image dans le HTML pré-rendu, avec `width` et `height` ;
  - la première image est chargée tout de suite, les suivantes en différé (lazy) ;
  - le texte alternatif est dans la langue de la page ;
  - l'image principale mobile passe de 260 Ko à 77 Ko.
- **Accessibilité** :
  - noms accessibles sur les boutons de la galerie ;
  - hiérarchie des titres corrigée (pied de page, cartes du blog, contact, catalogue).
- **Formulaire `/demande`** : version espagnole native. Auparavant, `/es/demande` affichait un H1 en français.
- **Textes** : j'ai retiré les affirmations non confirmées :
  - « biens visités par l'agence » ;
  - « prix confirmé par le propriétaire » ;
  - « en français, en anglais ou en espagnol » ;
  - « Riad dans la Médina / villa à Amelkis » (page Contact) ;
  - « nos experts ».
- Le contrôle de la langue confirme qu'aucune phrase française ne reste sur les pages pré-rendues `/en` et `/es`.

---

## 2. URL en noindex ou redirigées

| URL | Traitement | Raison |
|---|---|---|
| `/vente/appartements-marrakech`, `/en/for-sale/apartments-marrakech`, `/es/venta/apartamentos-marrakech` | noindex, follow + hors sitemap | Aucun appartement à vendre disponible. La page redevient indexable automatiquement dès qu'un bien est publié, après redéploiement. |
| `/vente/terrains-marrakech`, `/en/for-sale/land-marrakech`, `/es/venta/terrenos-marrakech` | noindex, follow + hors sitemap | Aucun terrain disponible. |
| `/blog/sous-location-appartement-marrakech` (54 mots) | noindex + hors sitemap | Article Supabase trop court (moins de 300 mots). |
| `/blog/investir-terrain-marrakech-2026` (49 mots) | noindex + hors sitemap | Article Supabase trop court. |
| Versions `/en` et `/es` d'un bien sans traduction | noindex + hors sitemap pour la langue | Aujourd'hui, 11 biens sur 12 sont traduits. |
| `/mentions-legales` (3 langues) | noindex | Page légale, sans intérêt dans les résultats de recherche. |
| Toute URL inconnue | vraie 404, noindex | — |
| `/manage-xk92p/*` | `X-Robots-Tag: noindex, nofollow` | Back-office. |
| `/blog/location-appartement-longue-duree-marrakech` | 308 vers `/location-longue-duree/appartements-marrakech` | Article fusionné dans la page de recherche. |
| `/blog/location-villa-longue-duree-marrakech` | 308 vers `/location-longue-duree/villas-marrakech` | idem |
| `/blog/acheter-appartement-marrakech-2026` | 308 vers `/vente/appartements-marrakech` | idem |
| `/blog/villa-a-vendre-marrakech` | 308 vers `/vente/villas-marrakech` | idem |
| `/blog/riad-a-vendre-marrakech` | 308 vers `/vente/riads-marrakech` | idem |
| `/blog/terrain-a-vendre-marrakech` | 308 vers `/vente/terrains-marrakech` | idem |
| `/bien/<uuid>` (3 langues) | 301 vers `/bien/<slug>-<uuid>` ou vers le catalogue | Ancien format d'URL. |
| `www.liveinmarrakech.com/*` | 308 vers `liveinmarrakech.com` | Domaine principal sans www. |

---

## 3. Incohérences dans les données des annonces (non modifiées)

| Bien | Problème |
|---|---|
| **Villa elhaj** (`elhaj`) | La base indique **vente**. Vous avez confirmé une **location longue durée non meublée à 13 000 DH/mois** : à corriger en exécutant le SQL (voir section 7). |
| Charmante Villa Privée avec Piscine et Grand Jardin (DP-26-CH2SX) | Le texte contient des artefacts `[cite]` et une phrase tronquée. Les surfaces semblent inversées (1 500 / 150). |
| Charmant Appartement Moderne – Chrifia (REF-APP-CHRI-482) | Le texte mentionne « Twin Flame Immobilier ». |
| Villa de Prestige avec Vue sur les Montagnes (DP-26-Y32KM) | Le texte donne des loyers en euros, alors que les prix du site sont en MAD. |
| villa avec piscine himri (`himri`) | Statut « vendu-loué ». Les surfaces sont inversées par rapport au texte. Le texte dit « non meublée », mais le champ meublé n'est pas renseigné. |
| Villa Swigya (DP-26-A1VZZ) | `prix_location_longue` et `prix_location_courte` sont remplis alors que ces services ne sont pas cochés. |
| 6 biens sans quartier | DP-26-IJT6K, DP-26-Y32KM, DP-26-CH2SX, DP-26-E0KBE, REF-APP-AMBR-582, REF-RIA-VILL-841. Pour l'affichage, la zone est déduite du texte de l'annonce (`propertyFacts.json`). |
| **Villa Machmam** | Absente de la base. À créer : meublée, 16 500 DH/mois. |

## 4. Biens dont le statut meublé est vide (`meuble = null`)

Le statut n'est connu que pour 2 biens : l'Élégante Villa Contemporaine (meublée) et la Villa elhaj (vide). Il manque pour les 10 autres :
- DP-26-A1VZZ — Villa Swigya
- DP-26-IJT6K — Villa d'Architecte avec Piscine Miroir
- DP-26-Y32KM — Villa de Prestige Vue Montagnes
- DP-26-CH2SX — Charmante Villa Privée avec Piscine
- DP-26-FVCN7 — Demeure Traditionnelle à Ennakhil
- DP-26-E0KBE — Somptueuse Villa Contemporaine
- REF-APP-CHRI-482 — Appartement Chrifia
- REF-APP-AMBR-582 — Appartement Prestigia Ambre
- REF-RIA-VILL-841 — Riad Village Touristique
- himri — villa avec piscine himri (le texte dit « non meublée »)

---

## 5. TODO À CONFIRMER

Pour l'agence, à remplir dans `src/content/agency.ts`. Ces champs restent masqués tant qu'ils sont vides :
- [ ] Raison sociale, forme juridique et capital
- [ ] RC, ICE, IF
- [ ] Adresse postale exacte du bureau (et code postal)
- [ ] Directeur de la publication
- [ ] Année de création et histoire de l'agence (2–3 phrases, FR/EN/ES)
- [ ] Durée de conservation des données des formulaires
- [ ] Numéro de déclaration CNDP, s'il existe

À confirmer avant de les remettre dans le JSON-LD de `index.html` :
- [ ] Horaires d'ouverture
- [ ] Coordonnées GPS du bureau

Affirmations retirées des textes, que je peux remettre si elles sont vraies :
- [ ] Chaque bien est visité par l'agence avant publication
- [ ] Les prix sont confirmés par le propriétaire
- [ ] Langues parlées par l'équipe (FR / EN / ES ?)

Auteur des articles du blog :
- [ ] Nom et rôle à afficher. Aujourd'hui, l'auteur affiché est « Live In Marrakech » (organisation).

---

## 6. Ce que vous devez faire après le déploiement

1. **Supabase → SQL Editor** : exécuter la migration de `supabase/schema.sql` (colonnes `titre_en/_es`, `description_*_en/_es`, `traduction_a_relire`, `meuble`). Exécuter ensuite la correction de la Villa elhaj (location longue durée, 13 000 DH, non meublée). Le SQL complet est dans la section 7.
2. **Admin → Biens** :
   - créer la Villa Machmam ;
   - corriger les incohérences de la section 3 ;
   - renseigner le statut « Meublé / Vide » des 10 biens de la section 4 ;
   - renseigner les quartiers manquants.
3. **Admin → Biens → Traductions** : relire les traductions EN/ES proposées, puis décocher « Traduction à relire ».
4. **Vercel → Settings → Git → Deploy Hooks** : créer un hook. L'appeler depuis Supabase (Database Webhook sur `properties_v2` et `articles`) pour que tout nouveau bien soit pré-rendu et ajouté au sitemap sans redéploiement manuel.
5. **Google Search Console** :
   - renvoyer le sitemap ;
   - demander l'indexation de `/location-longue-duree`, `/vente`, `/a-propos` et des guides du blog.
6. **Google Business Profile** :
   - créer ou vérifier la fiche avec exactement le même nom, téléphone et quartier que le site ;
   - ensuite, collecter de vrais avis. Ils pourront être affichés et balisés plus tard.
7. **Bing Webmaster Tools** : importer le site depuis Search Console. Bing alimente aussi ChatGPT et Copilot.
8. Remplir `src/content/agency.ts` (section 5). Les pages À propos et Mentions légales afficheront les informations automatiquement au prochain déploiement.

## 7. SQL à exécuter

Le SQL de migration est la dernière section de `supabase/schema.sql` (bloc « Property translations (EN / ES) and furnished status », lignes 310 à la fin). Ensuite :

```sql
UPDATE public.properties_v2
SET services = ARRAY['location-longue-duree'],
    service = 'location-longue-duree',
    prix_location_longue = 13000,
    prix_vente = NULL,
    meuble = false
WHERE id::text LIKE '97560a47%';
NOTIFY pgrst, 'reload schema';
```
