---
name: publier-bien
description: Publier rapidement un nouveau bien (villa, appartement, riad, maison, terrain) sur liveinmarrakech.com à partir de photos et d'un descriptif reçus directement dans le chat, par un lien (WhatsApp, annonce…) ou dans un dossier local (ex. C:\Users\outman\Desktop\BIENS\<nom>). Couvre aussi « marquer un bien loué / vendu » avec un profil client anonyme. À utiliser dès que l'utilisateur dit « ajouter un bien », « publier cette annonce », « nouveau bien », donne un dossier de photos ou un lien d'annonce.
---

# Publier un bien sur le site

But : bien en ligne en un seul passage, sans poser de questions inutiles. L'utilisateur veut que ce soit fait et poussé (« fais tout », « pusher »). Répondre en français.

Le bien est ajouté comme **bien « fichier »** (`src/content/fileProperties.json` + photos dans `public/biens/<slug>/`), pas dans Supabase. Voir CLAUDE.md, section « Long-term rental pages », pour le mécanisme.

## 1. Récupérer photos et descriptif

- **Dossier local** : lister le dossier, lire le `.txt` (descriptif) et **regarder chaque photo** avec Read (pour savoir quelle pièce elle montre et vérifier meublé, piscine, vue…).
- **Photos collées dans le chat** : elles sont dans le dossier `images` du scratchpad de la session ou à un chemin indiqué ; sinon demander un dossier.
- **Lien** (wa.me/p/…, Facebook, Avito…) : ouvrir avec le navigateur intégré, lire le texte. Les images d'un catalogue WhatsApp ne se téléchargent souvent pas : dans ce cas demander les photos dans un dossier. Ne jamais se connecter à un compte à la place de l'utilisateur.

## 2. Extraire les données (n'inventer aucun fait)

Remplir à partir du descriptif + photos uniquement :
- `type` villa | appartement | riad | maison | terrain ; `services` (vente, location-longue-duree, location-courte-duree, sous-location) et le prix de chaque service (`prix_vente`, `prix_location_longue`, `prix_location_courte`) ; `service` = le premier ; `devise` MAD.
- `chambres`, `salles_de_bain`, `surface_habitable`, `surface_terrain` (le site affiche **le terrain en priorité** sur les cartes ; ne pas inverser les deux), `meuble` (true/false).
- `quartier` : une valeur reconnue par `QUARTIER_TO_ZONE` dans `src/content/zones.ts` (Route de Fes, Chrifia, Palmeraie, Medina, Route d'Essaouira, Gueliz). Quartier nouveau → ajouter la zone partout (voir § 4).
- `equipements` : uniquement des libellés connus de `src/lib/propertyI18n.ts` (Piscine, Jardin, Climatisation, Cuisine équipée, Cheminée, Parking, Terrasse, Ascenseur, Gardiennage 24/7, Meublé…). Ne mettre que ce qui est dit ou clairement visible.
- `proximites` : seulement les distances/temps donnés par l'annonce (`{ "time": "12 km", "place": "Marrakech (centre)" }`), sinon `[]`.

Règles confirmées par l'agence (ne pas les contredire) :
- Location longue durée : bail 1 an minimum ; **caution 2 mois si meublé, 1 mois si non meublé** ; document : passeport ou carte d'identité. Si l'annonce donne d'autres frais d'entrée (loyer d'avance, frais d'agence), les écrire avec les montants calculés.
- Vente : honoraires d'agence seulement s'ils sont donnés (ex. 3 %). Points juridiques généraux, renvoyer au notaire.
- Pas de chiffres de marché inventés, pas d'emojis ni de « 🔥 À saisir » dans les textes du site.

Questions : n'en poser que si une info **bloque** (prix absent, vente ou location ?). Sinon décider, publier, puis lister en fin de réponse les 1–3 points déduits à confirmer (meublé ? quartier ?).

## 3. Photos

1. Choisir l'ordre : la photo la plus forte d'abord (piscine/façade pour une villa, salon ou patio pour un appartement/riad, sauf consigne de l'utilisateur), puis extérieur, séjour, cuisine, chambres, salles de bain. Noms en kebab-case par pièce (`salon`, `piscine-jardin`, `chambre-1`…).
2. Slug du dossier : `<type>-<nom>-<quartier>` en kebab-case sans accents (ex. `appartement-zara-gueliz`).
3. Convertir (sharp n'est pas dans le projet, l'installer une fois dans le scratchpad) :

```bash
npm i --no-save --prefix "<scratchpad>/img" sharp   # si absent
SHARP_DIR="<scratchpad>/img/node_modules" node .claude/skills/publier-bien/convert-photos.cjs <slug> "<chemin photo 1>=salon" "<chemin photo 2>=balcon" ...
```
Le script écrit `public/biens/<slug>/*.webp` (1200 px, q74) et affiche le JSON `photos` / `photo_principale` à recopier.

## 4. Écrire le bien

Écrire les scripts d'édition dans un fichier `.py` du scratchpad (les heredocs bash cassent sur les apostrophes), et faire des insertions textuelles (ne pas reformater tout le JSON).

1. **`src/content/fileProperties.json`** : ajouter à la fin de `properties` un objet avec tous les champs des entrées existantes (copier la structure de la dernière) : `id` = `crypto.randomUUID()`, `titre` court en français (sert à l'URL, ne plus le changer ensuite), `description_courte` (≈ 200 car.), `description_longue` (paragraphes séparés par une ligne vide, chaque bloc commence par un titre court sur sa propre ligne : « La villa », « L'extérieur », « Frais d'entrée », « Conditions »… puis des puces « • »), `statut` "publie", `reference` `DP-26-XXXX` (lettres du nom), `created_at`/`updated_at` = aujourd'hui `T09:00:00+00:00`.
2. **`src/content/propertyHeadlines.json`** : titre affiché FR/EN/ES = nom + ce qui le distingue (pas le prix, ni meublé, ni le nombre de chambres déjà sur la carte), ≤ ~65 caractères.
3. **`src/content/propertyTranslations.json`** : `en` et `es` avec `titre`, `description_courte`, `description_longue` (traductions fidèles, montants au format local : 14,500 MAD / 14.500 MAD).
4. **Nouveau quartier** seulement : dans `src/content/zones.ts` ajouter l'id au type `ZoneId`, l'entrée `ZONES` (label + texte FR/EN/ES qui ne dit que ce que l'annonce dit), `QUARTIER_TO_ZONE` et `ZONE_IN` ; dans `scripts/generate-sitemap.cjs` ajouter à `ZONE_NAMES` et `QUARTIER_ZONES`.

## 5. Vérifier, publier

```bash
npm run build      # doit finir par « N/N pages pre-rendered » ; vérifier dist/bien/<slug>-<id>.html et la présence dans dist/catalogue.html
npm run lint       # 4 warnings existants, 0 erreur
```
Optionnel si doute visuel : `preview_start` « dev » → ouvrir `/bien/<slug>-<id>` → capture → `preview_stop`.

Puis commit (uniquement les fichiers du bien : photos, JSON, zones, sitemap script, `public/llms.txt`/`sitemap.xml` régénérés si modifiés ; **jamais `.agents/mcp_config.json`** ni `.env*`) et `git push origin main`. Vercel déploie en 2–3 min.

## 6. Réponse à l'utilisateur (courte, en français)

Titre affiché, prix, caractéristiques clés, ordre des photos, où le bien apparaît (catalogue, page location/vente, accueil), puis les points déduits à confirmer. Rappeler que le site est à jour dans 2–3 minutes.

## Marquer un bien loué ou vendu

- Bien fichier : `"statut": "vendu-loue"` dans `fileProperties.json`. Bien en base : l'utilisateur le passe en « Loué / vendu » dans l'admin (ou `propertyOverrides.json` ne suffit pas pour le statut : les requêtes filtrent côté base).
- Ajouter dans `src/content/propertyDeals.json` : `"<id>": { "profil": { "fr": "un couple belge", "en": "a Belgian couple", "es": "una pareja belga" }, "loyer": 16000, "prix": null, "mois": null }` (`profil` peut être `null` si inconnu ; `mois` = "AAAA-MM").
- **Jamais de nom ni de prénom du client** sans son accord écrit (loi 09-08) : seulement nationalité + famille/couple/personne seule.
- Si le loyer/prix final diffère de l'annonce, mettre aussi l'annonce au montant final (prix + textes FR/EN/ES) pour éviter deux montants différents.
- Ces biens passent automatiquement en tête du catalogue et du carrousel d'accueil, et dans « Récemment loués et vendus ».
