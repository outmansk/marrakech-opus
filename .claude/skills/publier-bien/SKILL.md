---
name: publier-bien
description: Publier ou mettre à jour une annonce de bien (villa, appartement, riad, maison, terrain) sur liveinmarrakech.com à partir du chemin d'un dossier local (photos + fichier descriptif, souvent le texte brut de l'annonce Facebook/WhatsApp) et/ou d'infos données dans le chat. Claude réécrit un meilleur descriptif FR/EN/ES pour le site, envoie les photos sur Cloudinary et donne le code SQL à coller dans Supabase (aussi enregistré dans le dossier). Couvre aussi : changer les photos ou compléter une annonce existante, mettre un bien en tête du catalogue, marquer un bien loué / vendu. À utiliser dès que l'utilisateur donne un chemin de dossier de bien, dit « publier cette annonce », « ajouter un bien », « mettre cette villa dans mon catalogue », « donne-moi le SQL », « change les photos », ou « mets-le parmi les premiers ».
---

# Publier un bien sur le site

Répondre en français. L'utilisateur veut que ce soit fait **vite et avec peu de tokens** : il envoie le chemin d'un dossier (photos + descriptif court, souvent son texte Facebook/WhatsApp) et attend **un code SQL prêt à coller**. Ne pas regarder les photos une par une, ne pas lancer de build, de navigateur ni de commit pour un simple bien. Ne pas lui demander de passer par l'admin.

Scripts (chemins depuis la racine du projet ; `upload-photos.mjs` lit `.env` à la racine : si on est dans un worktree sans `.env`, lancer les scripts depuis le dépôt principal) :
- `.claude/skills/publier-bien/contact-sheet.cjs` : planche numérotée des photos (une seule image à lire).
- `.claude/skills/publier-bien/upload-photos.mjs` : envoie les photos sur Cloudinary (preset de l'admin, dossier `properties`), affiche `photos` et `photo_principale`.
- `.claude/skills/publier-bien/make-sql.mjs` : JSON du bien → SQL `INSERT … ON CONFLICT (id) DO UPDATE` (ré-exécutable : crée ou met à jour).
- `.claude/skills/publier-bien/convert-photos.cjs` : WebP locaux pour la méthode « fichier » (secours).

`sharp` (seulement pour la planche) : `npm i --no-save --prefix "<scratchpad>/img" sharp` puis `SHARP_DIR="<scratchpad>/img/node_modules"`. L'installation peut prendre plusieurs minutes : la lancer en arrière-plan et rédiger les textes pendant ce temps.

## Déroulé (nouveau bien)

1. **Lire le dossier** : lister les fichiers et lire le descriptif (`des.txt`, `description.txt`, `*.md`… ou le texte du chat). Le chat prime sur le fichier quand ils se contredisent (ex. « dernier prix »).
2. **Bloquant seulement** : vente ou location, et le prix. Sans eux, demander ; pour tout le reste, décider et le signaler à la fin. Si le dossier n'a aucun descriptif, demander les infos en une seule liste.
3. **Ordre des photos** — **la 1re photo est toujours la plus belle vue de la piscine** (villa ; à défaut la façade ; salon/patio pour un appartement ou riad), c'est elle qui fait cliquer sur Facebook. Fichiers déjà numérotés (`01-…`) → garder l'ordre, sauf mettre en premier la photo la plus forte d'après son nom (piscine/façade pour une villa ; salon/patio pour un appartement ou riad). Sinon générer la planche et lire cette seule image : la plus forte d'abord, puis extérieur, séjour, cuisine, chambres, salles de bain ; écarter les doublons. Photos HEIC : demander un export JPEG. Photos visiblement retouchées par IA : le signaler une fois ; si l'utilisateur confirme, continuer.
4. **Envoyer** : `node .claude/skills/publier-bien/upload-photos.mjs "<photo>" …` (dans l'ordre choisi ; on peut réordonner les identifiants ensuite sans renvoyer).
5. **Réécrire l'annonce** en un meilleur descriptif pour le site (voir « Textes ») et écrire le JSON du bien dans le scratchpad (outil Write, pas de heredoc), puis `node .claude/skills/publier-bien/make-sql.mjs <bien.json> <scratchpad>/bien.sql`.
6. **Livrer le SQL** :
   - enregistrer une copie à coller dans le dossier du bien : `<dossier>/annonce.sql` (sortie de `make-sql.mjs`, prête à coller) ;
   - donner ce même SQL dans un bloc ```sql avec la consigne « Supabase → SQL Editor → coller → Run » ;
   - résumé de l'annonce en 2 à 3 lignes + points à confirmer (numérotés, courts).
7. **Après « c'est fait »** : vérifier en base (voir « Vérifier en base ») et confirmer en une phrase. « Success. No rows returned » est normal pour un UPDATE / INSERT.

## Mettre à jour une annonce existante

L'utilisateur dit « déjà en ligne », « change les photos », « ajoute ces infos ».
- Retrouver l'`id` : `grep -ril "<nom>" src/content supabase/seed`, sinon une requête REST (voir plus bas) avec `titre=ilike.*<nom>*`.
- Donner un **`UPDATE … WHERE id = '<id>'`** limité aux colonnes changées (+ `updated_at = now()`), pas un INSERT complet. Repartir des textes existants (seed ou base) et n'y changer que ce qui est dit.
- Si une 2e correction arrive avant que le SQL soit lancé : redonner un seul SQL complet qui remplace le précédent.
- Si la vérification montre que la base n'a pas pris le SQL : l'admin avait probablement la fiche ouverte et l'a ré-enregistrée → demander de fermer la fiche sans enregistrer et de relancer.

## Mettre un bien en tête du catalogue

- SQL seul (immédiat) : `UPDATE public.properties_v2 SET created_at = now() WHERE id = '<id>';` (le catalogue trie par date, du plus récent au plus ancien). Un bien publié ensuite repassera devant : relancer le même SQL.
- Les biens de `src/content/propertyFeatured.json` (`ids`, dans l'ordre) passent devant tous les autres dans le catalogue et le carrousel de l'accueil ; le SQL ne peut pas les dépasser. Pour y ajouter un bien : modifier le fichier, commit + `git push origin HEAD:main` (visible après le déploiement Vercel).

## Vérifier en base

Lecture publique avec la clé anon du `.env` du dépôt principal (aucune écriture) :
```bash
set -a; . ./.env; set +a; curl -s "$VITE_SUPABASE_URL/rest/v1/properties_v2?id=eq.<id>&select=titre,statut,chambres,salles_de_bain,prix_location_longue,photo_principale,updated_at" -H "apikey: $VITE_SUPABASE_ANON_KEY" -H "Authorization: Bearer $VITE_SUPABASE_ANON_KEY"
```
Ne pas faire cette vérification avant la livraison du SQL si l'utilisateur est pressé (il préfère le SQL d'abord).

## Textes

Le descriptif de l'utilisateur est un brouillon (fautes, abréviations, « route Des » = route de Fès, « ch » = chambres, « dh » = DH). En faire un texte clair et vendeur, **sans rien inventer** : seulement ce qui est dit ou clairement visible sur les noms de photos.

- `slug` : adresse courte et **permanente**, nom + secteur (`villa-agdal-marrakech`, `villa-talaja-route-de-fes`), minuscules sans accents, ≤ 40 caractères. Nom tiré du nom du dossier quand il n'y en a pas d'autre. Le fixer dans le JSON (le trigger le garde ; s'il est déjà pris, il ajoute `-2`).
- `titre` (+ `titre_en`, `titre_es`) : **titre long et vendeur qui remplit la fiche**, 70 à 110 caractères : nom + secteur, puis les 2 ou 3 atouts qui distinguent le bien (« Villa Agdal au centre de Marrakech : piscine avec jacuzzi, hammam beldi et terrasse avec barbecue »). Pas le prix, ni « meublée », ni le nombre de chambres (déjà sur la carte). Grâce au `slug` fixé, le titre peut être modifié plus tard sans casser l'adresse.
- `description_courte` (≈ 200 car.) : type, atout principal, emplacement + distance, pièces, prix.
- `description_longue` : une phrase d'accroche (type, état meublé, emplacement, surface du terrain, loyer), puis des blocs séparés par une ligne vide ; chaque bloc commence par un titre court sur sa propre ligne puis des puces « • » : « La villa » / « La maison », « Le bungalow » (dépendances), « L'extérieur », « Emplacement » ou « Accès », « Au total » (si plusieurs bâtiments), « Version meublée » (si autre prix), « Frais d'entrée », « Conditions », puis « Visite sur place ou en vidéo sur WhatsApp. »
- Traductions EN/ES fidèles dans `titre_en/_es`, `description_courte_en/_es`, `description_longue_en/_es` (montants : 14,500 MAD / 14.500 MAD), `traduction_a_relire: false`.
- Pas d'emojis, pas de « 🔥 », pas de chiffres de marché, pas de « titre foncier vérifié » ni de distances non données.

### Champs du JSON

`id` (UUID : `node -e 'console.log(require("crypto").randomUUID())'`), `titre`, `type` villa | appartement | riad | maison | terrain, `services` (vente, location-longue-duree, location-courte-duree, sous-location), `service` = le premier, `prix_vente` / `prix_location_longue` / `prix_location_courte` / `prix` (loyer mensuel de **sous-location**), `devise` MAD, `surface_habitable`, `surface_terrain` (« 1000 m² » de terrain → `surface_terrain` ; ne pas les inverser), `chambres` (total, dépendances comprises), `salles_de_bain` (null si inconnu), `quartier`, `meuble` true/false/null, textes ci-dessus, `equipements`, `proximites` ([{"time": "18 km", "place": "Marrakech"}] seulement si l'annonce les donne), `photos`, `photo_principale`, `statut` "publie", `reference` `DP-26-XXXXX` (lettres du nom, unique). `slug` (voir ci-dessus, obligatoire pour un nouveau bien).

- `quartier` : une valeur de `QUARTIER_TO_ZONE` dans `src/content/zones.ts` (Route de Fes, Chrifia, Palmeraie, Medina, Route d'Essaouira, Gueliz). Le lieu-dit précis (Godran, Talaja…) va dans le texte. Autre secteur (golfs, Sidi Rahal, Ourika…) : nom réel et `"<id>": { "zone": "golf" }` dans `src/content/propertyFacts.json` (commit + push). Quartier vraiment nouveau : ajouter la zone dans `zones.ts` (`ZoneId`, `ZONES`, `QUARTIER_TO_ZONE`, `ZONE_IN`) et `scripts/generate-sitemap.cjs` (`ZONE_NAMES`, `QUARTIER_ZONES`).
- `equipements` : uniquement des libellés connus de `src/lib/propertyI18n.ts` (Piscine, Jardin, Climatisation, Cuisine équipée, Cheminée, Parking, Terrasse, Ascenseur, Gardiennage 24/7, Meublé…), seulement ce qui est dit ou clairement visible.
- Semi-meublé : `meuble: null`, « Semi-meublée » dans le texte, demander la caution (1 ou 2 mois).
- Ne plus utiliser `src/content/propertyHeadlines.json` pour un nouveau bien : le titre long va directement dans le SQL (aucun commit, aucun déploiement). Ce fichier reste pour les anciens biens sans `slug`.

### Règles confirmées (ne pas les contredire)

- Location longue durée : bail 1 an minimum ; **caution 2 mois si meublé, 1 mois si non meublé** ; **frais d'agence : toujours 1 mois de loyer** (dans « Frais d'entrée » avec le montant) ; document : passeport ou carte d'identité. Caution différente exigée par le propriétaire : confirmer, puis `"caution_mois": 2` dans l'entrée du bien de `src/content/propertyFacts.json`.
- Vente : honoraires seulement s'ils sont donnés (ex. 3 %). Points juridiques généraux, renvoyer au notaire.

## Méthode de secours : bien « fichier » (sans Supabase)

Si l'utilisateur ne peut pas lancer le SQL : `convert-photos.cjs <slug> "<src>=<nom>" …` → `public/biens/<slug>/`, entrée dans `src/content/fileProperties.json` (mêmes champs), titre affiché dans `src/content/propertyHeadlines.json`, traductions dans `src/content/propertyTranslations.json`, puis `npm run build` (vérifier `dist/bien/<slug>-<id>.html`), commit des seuls fichiers du bien (**jamais `.agents/mcp_config.json`, `.env*`, `CLAUDE.md` modifié par d'autres**) et `git push origin main`. Le bien n'est pas visible dans l'admin.

## Marquer un bien loué ou vendu

- SQL : `UPDATE public.properties_v2 SET statut = 'vendu-loue' WHERE id = '…';` (bien fichier : `"statut": "vendu-loue"` dans `fileProperties.json`).
- Ajouter dans `src/content/propertyDeals.json` : `"<id>": { "profil": { "fr": "un couple belge", "en": "a Belgian couple", "es": "una pareja belga" }, "loyer": 16000, "prix": null, "mois": "2026-10" }` (`profil` peut être `null`), puis commit + push.
- **Jamais de nom ni de prénom du client** sans son accord écrit (loi 09-08) : seulement nationalité + famille / couple / personne seule.
- Si le montant final diffère de l'annonce, mettre aussi l'annonce au montant final.
