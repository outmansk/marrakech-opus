---
name: modifier-annonce
description: Modifier une annonce déjà en ligne sur liveinmarrakech.com et donner le code SQL à coller dans Supabase. Couvre le prix (baisse, hausse, « dernier prix »), les frais d'entrée et la caution, les photos (changer, réordonner, mettre une autre photo en premier), le titre ou le nom, la description, les chambres et salles de bain, meublé ou non, les équipements, l'ajout des traductions EN/ES et la mise en tête du catalogue. À utiliser dès que l'utilisateur nomme un bien existant avec un changement (« villa elhaj 11000 par mois », « le prix c'est 8000 », « change les photos », « renomme en villa rayan », « mets-la en premier »), même avec une capture d'écran de la fiche.
---

# Modifier une annonce

Répondre en français, court. L'utilisateur donne son besoin, Claude analyse et rend **un SQL prêt à coller** dans Supabase → SQL Editor → Run. Pas de passage par l'admin, pas de build. Ne poser une question que si le changement est ambigu (quel bien ? quel montant ?).

## Déroulé

1. **Retrouver l'annonce** : `node .claude/skills/publier-bien/find-bien.mjs "<nom>"` (titre, slug ou référence ; le nom d'un dossier comme « villa 3kari » ou « 15k sab3a elhaj » marche souvent avec le mot distinctif). Le script montre l'id, l'adresse, le statut, le prix, les montants écrits dans le texte et les fichiers du site qui changent l'affichage. Plusieurs résultats : choisir d'après la capture ou le contexte, sinon demander.
2. **Lire ce qu'il faut changer** : `--json <scratchpad>/bien.json` pour avoir la ligne complète (textes FR/EN/ES).
3. **Écrire un `UPDATE … WHERE id = '<id>'`** limité aux colonnes touchées, toujours avec `updated_at = now()`.
4. **Livrer** : le SQL dans un bloc ```sql dans la réponse **et** dans un fichier : `<dossier du bien>/annonce.sql` si le dossier est connu (`C:\Users\outman\Desktop\PROJETS SK\Othmane agent immobilier\01 - Biens\…`), sinon `01 - Biens\_SQL\AAAA-MM-JJ-<slug>-<changement>.sql`. Puis 2 à 4 puces sur ce qui change et, si besoin, un point à confirmer.
5. **Après « c'est fait »** : relancer `find-bien.mjs` et confirmer. Si rien n'a changé (`updated_at` ancien) : le SQL n'a pas été lancé en entier, ou un `UPDATE` a été lancé sur une annonce qui n'existait pas encore (il faut d'abord l'`INSERT`), ou la fiche était ouverte dans l'admin et a été ré-enregistrée → expliquer et redonner la marche à suivre.

## Pièges à éviter (vus en vrai)

- **Fichiers qui masquent la base** : si `find-bien` signale `propertyOverrides.json`, le site affiche ce fichier et non la base, tant que la base n'est pas modifiée. Un `UPDATE` de la base reprend la main : il doit donc contenir **la version complète et corrigée** (service, prix, textes FR depuis l'override ; textes EN/ES depuis `propertyTranslations.json` ; titre depuis `propertyHeadlines.json`), pas seulement le prix. Sinon l'ancien texte de la base réapparaît.
- **Le prix est écrit à plusieurs endroits** : colonne de prix (`prix_location_longue`, `prix_vente`, `prix_location_courte`, ou `prix` pour la sous-location) **et** montants dans `description_courte/_longue` et leurs versions `_en` (15,000 MAD) / `_es` (15.000 MAD). Recalculer caution, premier loyer, frais d'agence et total. Utiliser `replace()` ciblé sur la phrase exacte (« 2 mois de caution : 20 000 DH ») plutôt qu'un simple nombre, pour ne pas toucher un autre montant (ex. entretien 1 500 DH).
- **Annonce encore « vente » alors que c'est une location** (anciennes fiches) : corriger aussi `service`, `services`, et vider l'ancienne colonne de prix.
- **Titre** : on peut le changer librement, l'adresse `/bien/<slug>` ne bouge pas (verrouillée en base pour que les liens partagés marchent). Titre long et vendeur : nom + secteur + 2 ou 3 atouts, 70 à 110 caractères, avec `titre_en` / `titre_es`. Changer aussi `reference` si elle contient l'ancien nom. Un titre dans `propertyHeadlines.json` passe devant celui de la base : le retirer du fichier (commit + push) si on change le titre d'un bien qui y figure.
- **Photos** : réordonner = réécrire tout le tableau `photos` + `photo_principale` (la 1re). Nouvelles photos : `upload-photos.mjs` comme dans `publier-bien` (planche avec `contact-sheet.cjs` si les noms ne disent rien) ; la plus belle vue de la piscine en premier pour une villa.
- **Traductions manquantes** (`traductions en base : - -`) : la fiche est en français sur /en et /es et non référencée dans ces langues. Le signaler une fois et proposer de les ajouter (`titre_en/_es`, `description_courte_en/_es`, `description_longue_en/_es`, `traduction_a_relire = false`).
- **Mettre en tête** : `UPDATE … SET created_at = now()` (le catalogue trie du plus récent au plus ancien) ; seuls les biens de `src/content/propertyFeatured.json` passent devant.

Règles de contenu (caution 2 mois meublé / 1 mois non meublé, frais d'agence 1 mois, bail 1 an, passeport ou CIN, pas d'emojis, rien d'inventé) : voir la skill `publier-bien`.
