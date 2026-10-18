---
name: publier-bien
description: Publier rapidement un nouveau bien (villa, appartement, riad, maison, terrain) sur liveinmarrakech.com à partir d'un dossier local (photos + description.txt), de photos/texte collés dans le chat ou d'un lien d'annonce. Méthode par défaut : photos envoyées sur Cloudinary + code SQL que l'utilisateur colle dans Supabase. Couvre aussi « marquer un bien loué / vendu » avec un profil client anonyme. À utiliser dès que l'utilisateur dit « ajouter un bien », « publier cette annonce », « nouveau bien », ou donne un dossier de photos.
---

# Publier un bien sur le site

Répondre en français. L'utilisateur veut que ce soit fait vite et **avec peu de tokens** : ne pas regarder les photos une par une, ne pas lancer de build ni de navigateur pour la méthode SQL.

Scripts de ce dossier (chemins depuis la racine du projet) :
- `.claude/skills/publier-bien/contact-sheet.cjs` : planche numérotée des photos (une seule image à lire).
- `.claude/skills/publier-bien/upload-photos.mjs` : envoie les photos sur Cloudinary (preset de l'admin, dossier `properties`), affiche les `public_id`.
- `.claude/skills/publier-bien/make-sql.mjs` : JSON du bien → SQL `INSERT … ON CONFLICT (id) DO UPDATE` (prépare aussi les colonnes de traduction / `meuble`).
- `.claude/skills/publier-bien/convert-photos.cjs` : WebP locaux pour la méthode « fichier » (secours).

`sharp` n'est pas une dépendance du projet : l'installer une fois dans le scratchpad (`npm i --no-save --prefix "<scratchpad>/img" sharp`) et passer `SHARP_DIR="<scratchpad>/img/node_modules"`. `upload-photos.mjs` et `make-sql.mjs` n'en ont pas besoin.

## Méthode par défaut : SQL (le bien est dans la base et l'admin)

1. **Lire** `description.txt` (ou le texte du chat). Lister le dossier.
2. **Ordre des photos** : si les fichiers sont déjà numérotés (`1-…`, `2-…`), garder cet ordre sans les regarder. Sinon générer la planche avec `contact-sheet.cjs` et lire **cette seule image** pour choisir : la plus forte d'abord (piscine/façade pour une villa, salon/patio pour un appartement ou riad), puis extérieur, séjour, cuisine, chambres, salles de bain. Écarter les doublons.
3. **Envoyer** les photos dans l'ordre choisi : `node .claude/skills/publier-bien/upload-photos.mjs "<photo>" …` → récupérer `photos` et `photo_principale`. Photos HEIC : demander un export JPEG.
4. **Écrire le JSON du bien** dans le scratchpad (via un fichier `.py` ou l'outil Write : les heredocs bash cassent sur les apostrophes) avec les champs ci-dessous, puis `node .claude/skills/publier-bien/make-sql.mjs <bien.json> <scratchpad>/bien.sql`.
5. **Donner le SQL** à l'utilisateur : chemin du fichier + contenu dans un bloc ```sql à copier, avec la consigne « Supabase → SQL Editor → coller → Run ». Le bien est en ligne tout de suite (sa page fonctionne sans redéploiement ; le pré-rendu Google suit au prochain déploiement).
6. **Résumé court** + 1 à 3 points déduits à confirmer.

Pas de commit nécessaire. Seule exception : un quartier nouveau ou une caution hors règle demandent un petit changement de code (voir plus bas), à committer et pousser.

### Champs du JSON

`id` (laisser vide = généré), `titre` (français, descriptif, **sert à l'URL, ne plus le changer**, ex. « Villa Golf Atlas avec piscine et grand jardin »), `type` villa | appartement | riad | maison | terrain, `services` (vente, location-longue-duree, location-courte-duree, sous-location), `service` = le premier, `prix_vente` / `prix_location_longue` / `prix_location_courte`, `devise` MAD, `surface_habitable`, `surface_terrain` (ne pas les inverser ; le site montre le terrain en priorité), `chambres`, `salles_de_bain`, `quartier`, `meuble` true/false, `description_courte` (≈ 200 car.), `description_longue`, `titre_en`, `titre_es`, `description_courte_en/_es`, `description_longue_en/_es`, `equipements`, `proximites` ([{"time": "5 km", "place": "Golf Amelkis"}] seulement si l'annonce les donne), `photos`, `photo_principale`, `statut` "publie", `reference` `DP-26-XXXXX` (lettres du nom, unique).

- `quartier` : une valeur reconnue par `QUARTIER_TO_ZONE` dans `src/content/zones.ts` (Route de Fes, Chrifia, Palmeraie, Medina, Route d'Essaouira, Gueliz). Autre secteur (golfs, Sidi Rahal, Village Touristique…) : mettre le nom réel et ajouter `"<id>": { "zone": "golf" }` dans `src/content/propertyFacts.json` (donc fixer l'`id` dans le JSON). Quartier vraiment nouveau : ajouter la zone dans `zones.ts` (`ZoneId`, `ZONES`, `QUARTIER_TO_ZONE`, `ZONE_IN`) et dans `scripts/generate-sitemap.cjs` (`ZONE_NAMES`, `QUARTIER_ZONES`).
- `equipements` : uniquement des libellés connus de `src/lib/propertyI18n.ts` (Piscine, Jardin, Climatisation, Cuisine équipée, Cheminée, Parking, Terrasse, Ascenseur, Gardiennage 24/7, Meublé…), seulement ce qui est dit ou clairement visible.
- `description_longue` : paragraphes séparés par une ligne vide ; chaque bloc commence par un titre court sur sa propre ligne (« La villa », « L'extérieur », « Emplacement », « Frais d'entrée », « Conditions ») puis des puces « • ». Traductions EN/ES fidèles (montants : 14,500 MAD / 14.500 MAD).

### Règles confirmées (ne pas les contredire)

- Location longue durée : bail 1 an minimum ; **caution 2 mois si meublé, 1 mois si non meublé** ; document : passeport ou carte d'identité. Autres frais d'entrée de l'annonce (loyer d'avance, frais d'agence) : les écrire avec les montants calculés. Si le propriétaire exige une autre caution (ex. 2 mois pour un bien vide) : confirmer, puis `"caution_mois": 2` dans l'entrée du bien de `src/content/propertyFacts.json` (lu par `depositMonthsOf()`).
- Vente : honoraires seulement s'ils sont donnés (ex. 3 %). Points juridiques généraux, renvoyer au notaire.
- Pas de chiffres de marché inventés, pas d'emojis ni de « 🔥 » dans les textes du site.
- Questions : seulement si une info **bloque** (prix absent, vente ou location ?). Sinon décider et signaler à la fin.

## Méthode de secours : bien « fichier » (sans Supabase)

Si l'utilisateur ne peut pas lancer le SQL : `convert-photos.cjs <slug> "<src>=<nom>" …` → `public/biens/<slug>/`, entrée dans `src/content/fileProperties.json` (mêmes champs), titre affiché dans `src/content/propertyHeadlines.json`, traductions dans `src/content/propertyTranslations.json`, puis `npm run build` (vérifier `dist/bien/<slug>-<id>.html`), commit des seuls fichiers du bien (**jamais `.agents/mcp_config.json`, `.env*`, `CLAUDE.md` modifié par d'autres**) et `git push origin main`. Le bien n'est pas visible dans l'admin. `supabase/seed/biens_fichiers_vers_base.sql` (généré avec `make-sql.mjs` depuis `fileProperties.json` + traductions) fait passer ces biens dans la base ; une ligne de la base remplace l'entrée fichier de même `id`.

## Marquer un bien loué ou vendu

- Bien en base : l'utilisateur le passe en « Loué / vendu » dans l'admin (ou SQL `UPDATE public.properties_v2 SET statut = 'vendu-loue' WHERE id = '…';`). Bien fichier : `"statut": "vendu-loue"` dans `fileProperties.json`.
- Ajouter dans `src/content/propertyDeals.json` : `"<id>": { "profil": { "fr": "un couple belge", "en": "a Belgian couple", "es": "una pareja belga" }, "loyer": 16000, "prix": null, "mois": null }` (`profil` peut être `null` ; `mois` = "AAAA-MM"), puis commit + push.
- **Jamais de nom ni de prénom du client** sans son accord écrit (loi 09-08) : seulement nationalité + famille / couple / personne seule.
- Si le montant final diffère de l'annonce, mettre aussi l'annonce au montant final.
- Ces biens passent en tête du catalogue et du carrousel d'accueil, et dans « Récemment loués et vendus ».
