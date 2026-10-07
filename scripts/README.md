# Scripts

## `generate-sitemap.cjs`

Génère `public/sitemap.xml` (pages statiques, biens publiés, articles publiés) depuis Supabase.
Il est lancé automatiquement par `npm run build` ; pour le lancer à la main :

```bash
npm run generate:sitemap
```

Variables lues (depuis l'environnement ou `.env`) : `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_CLOUDINARY_CLOUD_NAME`.
Sans les variables Supabase (ex. CI), le script affiche un avertissement et n'échoue pas.

## `prerender.mjs`

Écrit une page HTML statique pour chaque page publique (FR, EN, ES) : `dist/catalogue.html`, `dist/en/bien/….html`, etc.
Google et les robots IA lisent ainsi le contenu, les balises et les données structurées sans exécuter de JavaScript.
Il est lancé automatiquement par `npm run build` (après `vite build` et `npm run build:ssr`).

- `dist/spa.html` est la coquille vide servie pour le back-office et pour les biens/articles publiés depuis le dernier déploiement.
- **Pour qu'un nouveau bien ou article soit pré-rendu et ajouté au sitemap, il faut redéployer** (Vercel → Deploy Hook, ou un nouveau push).
- Sans les variables Supabase, le script affiche un avertissement et n'échoue pas.
