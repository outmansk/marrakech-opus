# URL courtes des annonces

Les annonces ont un slug enregistré et permanent, sans UUID dans l'adresse publique.
Apple Garden : `/bien/villa-apple-garden` (si aucun slug n'était déjà attribué).
Les nouvelles annonces reçoivent un slug même lors d'un import SQL. Les doublons
reçoivent un suffixe `-2`, `-3`, etc. Les titres peuvent changer sans changer l'URL.
Les sept annonces en fichiers possèdent aussi un slug et sont réservées dans le SQL.

## Mise en production

1. Appliquer `supabase/migrations/20261018_short_property_urls.sql` dans le SQL Editor
   Supabase avec le compte propriétaire. Le script préserve les slugs existants et
   remplit les slugs manquants, tous statuts confondus, sans changer `updated_at`. Aucun bien n'est supprimé.
2. Vérifier `SELECT id, titre, slug FROM public.properties_v2 ORDER BY created_at DESC;`.
3. Exécuter `npm run build` avec la base migrée : sitemap, HTML, canonical, hreflang,
   Open Graph et JSON-LD utilisent les nouvelles adresses.
4. Déployer le code et ce build ensemble sur Vercel. Les anciens liens restent
   utilisables pendant la transition ; les anciens fichiers statiques disparaissent
   au rebuild. Un rebuild seul avant migration ne raccourcit pas les annonces en base.
5. Vérifier les deux formats historiques par langue (FR/EN/ES), avec suivi : une seule
   redirection HTTP 301 vers la nouvelle adresse, paramètres conservés, puis HTTP 200.
   Vérifier le canonical et la présence des nouvelles URL dans `/sitemap.xml`.

Le middleware ne consulte Supabase que pour les anciennes URL contenant un UUID.
Les URL courtes existantes ne changent pas. Si le service est indisponible, le
navigateur peut encore charger l'ancienne URL et rediriger en conservant le suivi.
Les anciennes URL des biens supprimés ne sont pas redirigées vers le catalogue.

## Vérification locale

`npm run typecheck`, `npm test`, `npm run lint`, `npm run build`,
`npm run seo:check -- --dist`.
Les tests du middleware utilisent des réponses Supabase simulées et ne prouvent pas
les redirections de l'hébergement Vercel. Les checks HTTP réels restent nécessaires.

## Retour arrière

`20261018_short_property_urls_down.sql` enlève l'attribution automatique en conservant
les slugs existants. L'ancienne version de l'application savait déjà les utiliser.
Ne pas effacer les slugs après publication : cela casserait les liens courts partagés.
