# Marrakech Opus — Plateforme Immobilière

Plateforme immobilière premium pour la vente, la location longue durée et la sous-location de biens à Marrakech.

Le site est accessible à : [https://liveinmarrakech.com](https://liveinmarrakech.com)

## Stack Technique

| Couche | Technologie |
|--------|-------------|
| Frontend | React 18 + TypeScript + Vite |
| UI | Tailwind CSS + shadcn/ui |
| Backend | Supabase (PostgreSQL + Auth + Storage) |
| i18n | i18next (🇫🇷 Français / 🇬🇧 English) |
| Déploiement | Vercel |

## Démarrage Rapide

### Prérequis
- Node.js ≥ 18
- Un projet Supabase actif

### Installation

```bash
git clone https://github.com/<your-org>/marrakech-opus.git
cd marrakech-opus
npm install
```

### Variables d'Environnement

Copier `.env.example` vers `.env` et renseigner les valeurs :

```bash
cp .env.example .env
```

| Variable | Description |
|----------|-------------|
| `VITE_SUPABASE_URL` | URL du projet Supabase |
| `VITE_SUPABASE_ANON_KEY` | Clé publique Supabase |

### Lancer en Développement

```bash
npm run dev
```

### Build de Production

```bash
npm run build
```

---

## Structure du Projet

```
marrakech-opus/
├── scripts/                  # Utilitaires Node.js (seeding, SQL generation)
├── supabase/
│   ├── migrations/           # Migrations SQL (ordonnées par timestamp)
│   ├── seeds/                # Données de départ SQL
│   └── tools/                # Requêtes de diagnostic/vérification
└── src/
    ├── components/           # Composants React réutilisables
    │   ├── admin/            # Interface d'administration
    │   └── ui/               # Composants shadcn/ui
    ├── hooks/                # Hooks React personnalisés
    ├── i18n/                 # Configuration et traductions
    ├── integrations/         # Client Supabase auto-généré
    ├── lib/                  # Utilitaires partagés
    ├── pages/                # Pages de l'application
    │   └── admin/            # Pages du panel admin
    └── types/                # Types TypeScript globaux
```

---

## Base de Données

Les migrations Supabase se trouvent dans `supabase/migrations/` et sont ordonnées chronologiquement.

### Appliquer les Migrations

Via la CLI Supabase :
```bash
supabase db push
```

Ou via le script utilitaire :
```bash
node scripts/apply_sql.cjs
```

### Seeding de Données

```bash
# Propriétés de démonstration
# (appliquer le fichier SQL directement dans Supabase Studio)
psql -f supabase/seeds/seed_properties.sql

# Articles de blog
node scripts/seed_blog.js
```

---

## Panel Administrateur (SECRET)

L'accès à l'administration est masqué pour des raisons de sécurité. Il n'y a aucun lien public vers cette section.

| Section | URL | Description |
|---------|-----|-------------|
| Dashboard | `/manage-xk92p` | Statistiques globales |
| Biens | `/manage-xk92p/biens` | Gestion des propriétés |
| Blog | `/manage-xk92p/blog` | Gestion des articles |
| Visites | `/manage-xk92p/visites` | Demandes de visite |

⚠️ L'accès est protégé par un système de rôles (RBAC) en base de données. Seuls les utilisateurs avec le rôle `admin` dans la table `profiles` peuvent accéder à ces routes et modifier les données (Row Level Security).

---

## Fonctionnalités Principales

- 🏠 **Catalogue** : Filtrage par type de transaction (vente / location longue / sous-location)
- 📸 **Galerie photos** : Upload direct vers Supabase Storage
- 📰 **Blog SEO** : Articles multilingues avec métadonnées
- 📅 **Demandes de visite** : Formulaire client avec gestion admin
- 🌍 **Multilingue** : Français / Anglais
- 📱 **Mobile-first** : Responsive design complet

---

## Tests

```bash
npm run test          # Exécution unique
npm run test:watch    # Mode watch
```

---

## Déploiement

Le projet est déployé automatiquement sur **Vercel** à chaque push sur `main`.

Les variables d'environnement doivent être configurées dans le dashboard Vercel.

---

## Licence

Propriétaire — Tous droits réservés.
