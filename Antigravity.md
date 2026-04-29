# Aperçu du projet

**Live In Marrakech** (anciennement *Marrakech Opus*) est une plateforme immobilière premium web moderne (Real Estate Management). Le projet comprend un site vitrine public pour les clients (recherche de biens à la vente, location longue durée, et location courte durée/sous-location) et un panel d'administration hautement sécurisé pour la gestion du contenu. Il met l'accent sur l'esthétique luxueuse, les performances d'affichage et l'internationalisation.

# Architecture

Le projet suit une architecture Jamstack / Single Page Application (SPA) serverless, sans backend Node.js traditionnel, reposant sur un Backend-as-a-Service (BaaS).

Structure des dossiers principaux :
*   `src/components/` : Composants React réutilisables.
    *   `src/components/admin/` : Composants exclusifs au Dashboard Admin (Tables, Forms).
    *   `src/components/ui/` : Composants primitifs générés via shadcn/ui.
*   `src/hooks/` : Custom hooks (ex: `useAuth` pour la session).
*   `src/i18n/` : Configuration et traductions (FR / EN).
*   `src/lib/` : Utilitaires partagés (ex: instance Supabase, helpers Cloudinary, utilitaires Tailwind).
*   `src/pages/` : Vues majeures mappées par le Routeur.
    *   `src/pages/admin/` : Pages du panel d'administration.
*   `supabase/` : Fichiers liés à la base de données (migrations SQL, seeders).
*   `scripts/` : Utilitaires divers (scripts Node.js pour le seeding ou les migrations).

# Stack technique

*   **Frontend Core** : React 18, TypeScript, Vite
*   **Styling & UI** : Tailwind CSS v3, shadcn/ui (Radix UI), Lucide React (icônes)
*   **Routing & State** : React Router v6, TanStack Query (React Query)
*   **Formulaires & Validation** : React Hook Form, Zod, DOMPurify (sanitisation)
*   **Backend & BDD** : Supabase (PostgreSQL, Supabase Auth, Row Level Security)
*   **Stockage de médias** : Supabase Storage / Cloudinary (pour l'optimisation des images)
*   **Internationalisation** : i18next, react-i18next
*   **Hébergement & CI/CD** : Vercel

# Fonctionnalités

*   **Catalogue Public** : Listing des propriétés filtrable par transaction (vente, location). Architecture à deux niveaux (carte simplifiée super rapide, et page de détails riche avec galerie).
*   **Détails de Propriété** : Informations complètes, carrousel photo optimisé, SEO / JSON-LD pour le référencement local.
*   **Blog SEO** : Rédaction et affichage d'articles en Markdown.
*   **Demandes de Visites** : Formulaires de contact client couplés à WhatsApp.
*   **Multilingue** : Interface disponible en Français et Anglais.
*   **Panel Administrateur Sécurisé** : Gestion (CRUD) des propriétés, du blog et des visites avec contrôle d'accès strict (RBAC).

# Règles et contraintes

*   **Sécurité ("Zero Trust")** : 
    *   Row Level Security (RLS) active sur PostgreSQL. Seuls les rôles `admin` définis dans la table `profiles` peuvent effectuer des mutations.
    *   Obfuscation des routes : le panel admin est caché sur la route `/manage-xk92p` et ne doit pas être exposé publiquement.
    *   Sanitisation systématique des inputs utilisateur via `DOMPurify` combiné à `Zod`.
    *   Rate-limiting implémenté sur les requêtes frontend.
*   **Style & Performance UI** :
    *   Design esthétique et premium avec typographie moderne et palettes de couleurs soignées. Éviter les placeholders bruts.
    *   Performances CSS exigées : utilisation de `contain: layout` et limitation des reflows/repaints.
    *   Images systématiquement optimisées (composant `OptimizedImage`, lazy-loading ciblé).
*   **Typage & Code** :
    *   Usage strict de TypeScript pour typer toutes les requêtes (ex: schéma de la DB via `types/property`).
    *   Logique orientée Hooks (Custom hooks pour la séparation des préoccupations).

# Directives d'exécution

1.  **Modifications UI/UX** : Toute nouvelle interface doit utiliser les variables Tailwind existantes et maintenir le niveau "premium". Utiliser les composants `shadcn/ui` existants avant d'en créer de nouveaux.
2.  **Gestion de Base de données** : Ne pas modifier le schéma directement sans une migration Supabase valide dans `supabase/migrations/`.
3.  **Performances Frontend** : Maintenir un LCP (Largest Contentful Paint) très bas (chargement instantané). Ne pas réintroduire de Javascript lourd sur le catalogue principal.
4.  **Sécurité Admin** : Ne jamais intégrer de liens dynamiques ou publics pointant vers les routes `/manage-xk92p`.

# Notes

*   **Migration Cloudinary** : Le projet a récemment migré la gestion de ses images vers Cloudinary pour de meilleures performances (optimisation au format WebP, srcset automatique, composants dédiés `OptimizedImage`). Le fichier `ARCHITECTURE.md` mentionne Supabase Storage qui sert probablement d'upload initial, mais la diffusion est gérée via Cloudinary.
*   **Structure JSONB** : La table `properties_v2` s'appuie beaucoup sur des champs JSONB (`services`, `equipements`, `proximites`) pour une grande souplesse. Tenir compte de la structure JSON dans les requêtes de filtrage.
