# Scripts

## `generate-sitemap.cjs`

Génère `public/sitemap.xml` (pages statiques, biens publiés, articles publiés) depuis Supabase.
Il est lancé automatiquement par `npm run build` ; pour le lancer à la main :

```bash
npm run generate:sitemap
```

Variables lues (depuis l'environnement ou `.env`) : `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_CLOUDINARY_CLOUD_NAME`.
Sans les variables Supabase (ex. CI), le script affiche un avertissement et n'échoue pas.
