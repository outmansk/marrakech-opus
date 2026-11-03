---
name: annonce-louee
description: Passer une annonce de liveinmarrakech.com en « Loué / vendu » (ou la remettre disponible) et donner le code SQL à coller dans Supabase, avec si possible le profil anonyme du client pour le badge « Déjà loué ». À utiliser dès que l'utilisateur dit qu'un bien est loué, vendu, réservé, « c'est fait », « on l'a loué à un couple français », ou au contraire qu'il est de nouveau libre.
---

# Annonce louée ou vendue

Répondre en français, court, et rendre **un SQL prêt à coller** (Supabase → SQL Editor → Run), dans la réponse et dans un fichier (`<dossier du bien>/loue.sql`, sinon `01 - Biens\_SQL\AAAA-MM-JJ-<slug>-loue.sql`).

## Déroulé

1. Retrouver l'annonce : `node .claude/skills/publier-bien/find-bien.mjs "<nom>"`.
2. SQL :
   ```sql
   UPDATE public.properties_v2 SET statut = 'vendu-loue', updated_at = now()
   WHERE id = '<id>';
   ```
   Si le loyer ou le prix final diffère de l'annonce, le mettre aussi (colonne de prix + montants du texte, comme dans `modifier-annonce`).
   Remettre disponible : `statut = 'publie'`. Retirer du site sans supprimer : voir `retirer-annonce`.
3. **Profil client (facultatif mais utile)** : le badge « Déjà loué », l'encart sur la fiche et la section « Récemment loués et vendus » de l'accueil viennent de `src/content/propertyDeals.json` :
   `"<id>": { "profil": { "fr": "un couple français", "en": "a French couple", "es": "una pareja francesa" }, "loyer": 12000, "prix": null, "mois": "2026-11" }`
   (`profil` peut être `null` ; `prix` pour une vente). Ce fichier fait partie du site : l'ajouter, commit + `git push origin HEAD:main` (visible après le déploiement automatique), puis le dire en une ligne. Si l'utilisateur ne donne pas de profil, faire le SQL seul et proposer d'ajouter le profil.
4. Après « c'est fait » : `find-bien.mjs` doit montrer `vendu-loue`.

## Règles

- **Jamais de nom ni de prénom du client** sans son accord écrit (loi 09-08) : seulement nationalité + famille / couple / personne seule (« une famille marocaine », « un client espagnol »).
- Un bien loué reste visible (badge « Déjà loué », en fin de catalogue) : c'est voulu, il rassure les clients. Pour le faire disparaître, c'est `retirer-annonce`.
- Si le bien est dans `propertyFeatured.json` (mis en avant), le signaler : un bien loué n'y reste pas affiché en tête ; proposer de l'en retirer.
