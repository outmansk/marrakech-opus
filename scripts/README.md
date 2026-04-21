# Scripts Utilitaires

Ce dossier contient des scripts Node.js pour la maintenance et le seeding de la base de données.

> ⚠️ Ces scripts nécessitent les variables d'environnement Supabase dans `.env` à la racine du projet.

---

## Scripts Disponibles

### `apply_sql.cjs`
Applique un fichier SQL arbitraire sur la base Supabase via l'API REST.

```bash
node scripts/apply_sql.cjs
```

---

### `generate_sql.cjs`
Génère des fichiers SQL d'insertion à partir de données structurées (propriétés, articles).

```bash
node scripts/generate_sql.cjs
```

---

### `insert.cjs`
Insère directement des données en base via le client Supabase JS.

```bash
node scripts/insert.cjs
```

---

### `seed_articles.cjs`
Insère les articles de blog initiaux dans la table `articles`.

```bash
node scripts/seed_articles.cjs
```

---

### `seed_blog.js`
Version ES Module du seeder d'articles — utilisé pour les mises à jour ultérieures.

```bash
node scripts/seed_blog.js
```
