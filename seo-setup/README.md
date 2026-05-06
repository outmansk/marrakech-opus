# 🚀 Guide d'Intégration SEO — Live In Marrakech

> Solution SEO/LLM complète pour le site **liveinmarrakech.com**
> Dernière mise à jour : 2026-05-06

---

## 📁 Contenu du dossier `seo-setup/`

| Fichier | Description | Destination |
|---------|-------------|-------------|
| `robots.txt` | Règles crawlers (Google, IA, sociaux) | `public/robots.txt` |
| `sitemap.xml` | Sitemap statique (base) | `public/sitemap.xml` |
| `llms.txt` | Instructions pour modèles IA | `public/llms.txt` |
| `humans.txt` | Infos team & stack technique | `public/humans.txt` |
| `vercel.json` | Headers optimisés & cache | `./vercel.json` (racine) |
| `meta-tags.html` | Code meta/OG à intégrer dans `<head>` | `index.html` |
| `structured-data.jsonld` | JSON-LD (LocalBusiness, RealEstateAgent) | `index.html` |
| `property-schema-template.jsonld` | Template JSON-LD par propriété | Composant React |
| `.github/workflows/seo-deploy.yml` | CI/CD GitHub Actions | `.github/workflows/` |

---

## 📋 Étape 1 — Copier les fichiers statiques

```bash
# Depuis la racine du projet
cp seo-setup/robots.txt public/robots.txt
cp seo-setup/llms.txt public/llms.txt
cp seo-setup/humans.txt public/humans.txt
cp seo-setup/sitemap.xml public/sitemap.xml
```

## 📋 Étape 2 — Remplacer `vercel.json`

```bash
cp seo-setup/vercel.json ./vercel.json
```

> ⚠️ **Important** : Le nouveau `vercel.json` contient des headers de cache optimisés.
> Vérifie que le rewrite SPA `/(.*) → /index.html` est toujours présent.

## 📋 Étape 3 — Mettre à jour `index.html`

Remplace le contenu du `<head>` dans `index.html` par le code de `seo-setup/meta-tags.html`.

**Points clés à vérifier :**
- ✅ `og:image` pointe vers une image 1200×630px réelle (pas Unsplash)
- ✅ `@LiveInMarrakech` est le bon handle Twitter
- ✅ Le numéro de téléphone dans le JSON-LD est correct
- ✅ L'adresse dans le JSON-LD est complète

### JSON-LD — Injecter dans `index.html`

Remplace le bloc `<script type="application/ld+json">` existant par le contenu de `structured-data.jsonld` :

```html
<script type="application/ld+json">
  <!-- Coller ici le contenu de structured-data.jsonld -->
</script>
```

## 📋 Étape 4 — Générer l'image OG (1200×630px)

Crée une image de partage social :
- Dimensions : **1200 × 630 px**
- Contenu : Logo + "Live In Marrakech" + Photo villa/riad
- Formats : JPG (< 300 KB)
- Déployer dans `public/og-image.jpg`

## 📋 Étape 5 — Générer le sitemap dynamique

```bash
node scripts/generate-sitemap.cjs
```

Ce script :
1. Se connecte à Supabase (via `.env`)
2. Récupère toutes les propriétés publiées (`properties_v2`)
3. Récupère tous les articles publiés (`articles`)
4. Génère `public/sitemap.xml` avec hreflang + image tags

## 📋 Étape 6 — GitHub Actions (Optionnel)

```bash
# Copier le workflow
mkdir -p .github/workflows
cp seo-setup/.github/workflows/seo-deploy.yml .github/workflows/

# Ajouter les secrets dans GitHub → Settings → Secrets
# - VITE_SUPABASE_URL
# - VITE_SUPABASE_ANON_KEY
# - VITE_CLOUDINARY_CLOUD_NAME
# - VITE_CLOUDINARY_UPLOAD_PRESET
```

## 📋 Étape 7 — JSON-LD dynamique pour les propriétés

Dans `src/pages/PropertyDetail.tsx`, ajouter le script JSON-LD dynamique via `react-helmet-async` :

```tsx
import { Helmet } from 'react-helmet-async';

// Dans le composant, après avoir récupéré `property` :
<Helmet>
  <script type="application/ld+json">
    {JSON.stringify({
      "@context": "https://schema.org",
      "@type": "RealEstateListing",
      "name": property.titre,
      "description": property.description,
      "url": `https://liveinmarrakech.com/bien/${property.id}`,
      "datePosted": property.created_at,
      "image": property.images || [],
      "offers": {
        "@type": "Offer",
        "priceCurrency": "MAD",
        "price": property.prix,
        "seller": {
          "@type": "RealEstateAgent",
          "name": "Live In Marrakech",
          "url": "https://liveinmarrakech.com"
        }
      },
      "numberOfBedrooms": property.chambres,
      "floorSize": {
        "@type": "QuantitativeValue",
        "value": property.surface,
        "unitCode": "MTK"
      }
    })}
  </script>
</Helmet>
```

---

## 🔍 Guide de Validation

### 1. Google Search Console

1. Aller sur [search.google.com/search-console](https://search.google.com/search-console)
2. Ajouter la propriété `liveinmarrakech.com`
3. **Sitemaps** → Soumettre `https://liveinmarrakech.com/sitemap.xml`
4. **Inspection d'URL** → Tester la page d'accueil
5. Vérifier que toutes les pages sont indexées

### 2. Tests de validation

| Outil | URL | Quoi tester |
|-------|-----|-------------|
| [Rich Results Test](https://search.google.com/test/rich-results) | Page d'accueil | JSON-LD LocalBusiness |
| [Schema Validator](https://validator.schema.org/) | Coller le JSON-LD | Validité du schéma |
| [Facebook Debugger](https://developers.facebook.com/tools/debug/) | URL du site | Open Graph preview |
| [Twitter Card Validator](https://cards-dev.twitter.com/validator) | URL du site | Twitter Card preview |
| [XML Sitemap Validator](https://www.xml-sitemaps.com/validate-xml-sitemap.html) | sitemap.xml | Structure XML |

### 3. Lighthouse Audit

```bash
# Via Chrome DevTools
# F12 → Lighthouse → Categories: SEO, Performance, Best Practices
# Score cible : SEO ≥ 95, Performance ≥ 80
```

### 4. Test des crawlers IA

```bash
# Tester que robots.txt est accessible
curl -I https://liveinmarrakech.com/robots.txt

# Tester que llms.txt est accessible
curl -I https://liveinmarrakech.com/llms.txt

# Tester le sitemap
curl -s https://liveinmarrakech.com/sitemap.xml | head -20
```

### 5. Vérifier les headers (après déploiement Vercel)

```bash
# Vérifier Cache-Control sur assets
curl -I https://liveinmarrakech.com/assets/index-XXXXX.js
# Attendu: Cache-Control: public, max-age=31536000, immutable

# Vérifier les security headers
curl -I https://liveinmarrakech.com/
# Attendu: X-Content-Type-Options: nosniff
# Attendu: X-Frame-Options: SAMEORIGIN
# Attendu: Strict-Transport-Security: max-age=63072000
```

---

## ✅ Checklist Pré-Merge

- [ ] `public/robots.txt` — Fichier à jour, admin panel bloqué
- [ ] `public/sitemap.xml` — Généré, XML valide, URLs correctes
- [ ] `public/llms.txt` — Accessible, informations à jour
- [ ] `public/humans.txt` — Stack technique correcte
- [ ] `vercel.json` — Headers de cache et sécurité configurés
- [ ] `index.html` — Meta tags OG/Twitter à jour
- [ ] `index.html` — JSON-LD LocalBusiness + RealEstateAgent
- [ ] `index.html` — Canonical + hreflang (FR, EN, ES)
- [ ] `og-image.jpg` — Image 1200×630px dans `public/`
- [ ] `PropertyDetail.tsx` — JSON-LD dynamique par propriété
- [ ] `scripts/generate-sitemap.cjs` — Fonctionne avec Supabase
- [ ] GitHub Secrets — SUPABASE_URL et ANON_KEY configurés
- [ ] Lighthouse SEO score ≥ 95
- [ ] Rich Results Test — Pas d'erreurs
- [ ] Facebook Debugger — Preview correct
- [ ] XML Sitemap soumis à Google Search Console

---

## 🎯 Données à personnaliser

Avant le merge, remplace ces valeurs par les données réelles :

| Placeholder | Fichier(s) | Valeur à mettre |
|-------------|-----------|-----------------|
| `+212-XXX-XXXXXX` | structured-data.jsonld | Numéro de téléphone réel |
| `Avenue Mohammed V` | structured-data.jsonld | Adresse réelle de l'agence |
| `@LiveInMarrakech` | index.html, meta-tags.html | Handle Twitter réel |
| `og-image.jpg` | index.html | Vraie image OG 1200×630 |
| Liens sociaux `sameAs` | structured-data.jsonld | URLs Facebook/Instagram/LinkedIn réelles |
| `contact@liveinmarrakech.com` | llms.txt, structured-data.jsonld | Email de contact réel |
