# App Architecture : Live In Marrakech (Marrakech Opus)

Ce document présente l'architecture technique globale du projet **Live In Marrakech** (anciennement *Marrakech Opus*), une application web moderne de type "Real Estate Management" incluant un site vitrine public et un panel administrateur sécurisé.

---

## 1. Stack Technique Globale (Tech Stack)

Le projet repose sur une architecture **Jamstack / SPA (Single Page Application)** serverless, utilisant les technologies les plus modernes de l'écosystème JavaScript/TypeScript :

### 🔹 Frontend (Client-Side)
- **Framework** : React 18
- **Build Tool / Bundler** : Vite (avec SWC pour des compilations ultra-rapides)
- **Langage** : TypeScript (Typage strict des données de l'API)
- **Styling** : Tailwind CSS v3
- **Composants UI** : shadcn/ui (basé sur Radix UI pour l'accessibilité), Lucide React (Icônes)
- **Routing** : React Router v6
- **Gestion d'état serveur** : TanStack Query (React Query)
- **Formulaires & Validation** : React Hook Form + Zod
- **Animations** : CSS natif & Tailwind utilities (approches "zero-dependency" pour les animations CSS)

### 🔹 Backend & Database (BaaS)
- **Fournisseur BaaS** : Supabase
- **Base de données** : PostgreSQL
- **Authentification** : Supabase Auth (JWT)
- **Stockage de fichiers** : Supabase Storage (Buckets S3-compatible pour les images de propriétés)
- **Sécurité** : Row Level Security (RLS) directement intégrée à PostgreSQL

### 🔹 Infrastructure & DevOps
- **Hébergement Frontend** : Vercel (Edge Network public CDN)
- **CI/CD** : Déploiement automatique depuis le dépôt GitHub (`origin/main`)
- **DNS** : Gestion de domaine personnalisée via Namecheap (cname.vercel-dns.com)

---

## 2. Modèle de Sécurité et Rôles (RBAC)

Le système de sécurité est construit sur le principe du "Zero Trust" à la fois sur le frontend et le backend :

- **Supabase Row Level Security (RLS)** :
  - La base de données PostgreSQL est verrouillée via l'activation de `ENABLE ROW LEVEL SECURITY` sur toutes les tables (`profiles`, `properties_v2`, `articles`...).
  - Les utilisateurs publics/anonymes peuvent uniquement faire des requêtes `SELECT` sur les enregistrements marqués comme `publie`. Aucune modification ou suppression n'est possible.
- **Role-Based Access Control (RBAC)** :
  - Une table dédiée `public.profiles` (liée à `auth.users` via trigger) gère le rôle unique de l'utilisateur (`user` ou `admin`).
  - Les requêtes `INSERT`, `UPDATE`, et `DELETE` sur les biens ou les articles sont strictement limitées par une règle RLS limitant l'accès aux IDs dont le rôle dans `profiles` est égal à `admin`.
- **Obfuscation des Routes ("Security through Obscurity" combinée à l'auth forte)** :
  - Le panel admin ne se trouve pas sur `/admin` mais sur une URL spécifique (`/manage-xk92p`) pour prévenir l'exposition aux scanners de vulnérabilités et attaques par force brute opportunistes.
- **Rate-Limiting Client** :
  - Implémentation du côté client d'un blocage de brute-force (Verrouillage de 15 minutes après 5 essais infructueux lors du login).

---

## 3. Structure de Données (PostgreSQL Schema)

*Voici les principales entités métier de la base PostgreSQL :*

*   `properties_v2` (Les biens immobiliers)
    *   **Transactions supportées** : Vente, Location Moyenne/Longue Durée, Location Courte Durée (Airbnb type).
    *   **Description JSON** : Support pour les prestations (`services` JSONB array), équipements (`equipements` JSONB array) et proximités (`proximites` JSONB pour lieux & temps de trajet).
*   `articles` (Le Blog)
    *   Rédaction de contenu SEO avec formatage Markdown (sauvegardé en texte brut et rendu dynamiquement côté React).
*   `profiles` (Les utilisateurs & RBAC)
    *   Lié par un trigger SQL lors de la création d'un contexte Authentifié (`auth.uid()`).
*   `visit_requests` (CRM basique)
    *   Formulaires complétés par les clients, rattachés à une propriété.

---

## 4. Architecture de l'Application React (Arborescence)

```text
src/
├── components/          # Composants réutilisables
│   ├── admin/           # Composants exclusifs au Dashboard Admin (Tables, Forms)
│   ├── ui/              # Composants primitifs (shadcn/ui - Boutons, Inputs, Toasts)
│   ├── Header.tsx       # Composant de navigation publique
│   └── PropertyCard.tsx # Composant carte de présentation d'un bien
│
├── hooks/               # Custom React Hooks
│   ├── useAuth.tsx      # Gestion de session Supabase
│   └── useToast.tsx     # Gestion des notifications UI
│
├── lib/                 # Librairies et Singletons
│   ├── supabase.ts      # Instanciation du client Supabase
│   └── utils.ts         # Utilitaires de classes conditionnelles 
│
├── pages/               # Vues majeures du Routeur (Container Components)
│   ├── Index.tsx        # Homepage (Hero dynamique, sections)
│   ├── Catalogue.tsx    # Listes avec filtrage contextuel
│   ├── PropertyDetail.tsx   
│   ├── Blog.tsx         
│   └── admin/           # Pages pour les sous-routes d'administration
│
└── App.tsx              # Point central de l'architecture de navigation (React Router)
```

---

## 5. Flux de travail administrateur (CRUD Lifecycle)

1. L'administrateur se connecte sur `/manage-xk92p/login`.
2. Il est redirigé vers `/manage-xk92p/dashboard`. Le composant `<ProtectedRoute>` intercepte la demande, lit le token JWT local (`supabase.auth.getSession`), puis interroge la table `profiles` pour s'assurer que le rôle est `'admin'`.
3. Depuis ce panel, l'administrateur peut faire des requêtes vers `properties_v2` :
   - Upload d'images géré via Supabase Storage. Le Bucket S3 retourne des URLs CDN publiques.
   - Les formulaires (gérés avec `react-hook-form` & validation `Zod`) formatent les métadonnées en objets JSON insérés dans la BDD.
   - Dès la création ou l'update d'un bien, React Query ou les abonnements effectuent un patch côté UI.

---

## Principales forces de cette architecture à communiquer :
1. **Zéro Serveur à Gérer (Serverless/BaaS)** : Pas d'infrastructure back-end (Node.js/Express) coûteuse à maintenir manuellement, Supabase génère automatiquement une API RESTful/GraphQL au-dessus du schéma PostgreSQL.
2. **Performances très hautes (Edge Network)** : Vercel sert l'application React globalement avec une latence quasi nulle.
3. **Sécurité PostgreSQL Intégrée (RLS)** : Même si un utilisateur malveillant découvre l'URL publique de l'API ou l'Anon Key Supabase (située dans le frontend), la base de données refusera physiquement toute mutation car le rôle de l'utilisateur n'est pas identifié comme `admin` dans la base PostgreSQL native.
4. **Prêt à l'échelle (Scalable)**: Supporte facilement les flux de locations et de blogs avec des structures JSONB extensibles.
