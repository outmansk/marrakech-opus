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
3. **Profil client** (badge « Déjà loué », encart de la fiche, section « Récemment loués et vendus ») : en base, dans le même SQL, avec des valeurs de liste uniquement :
   `conclusion_client` = couple | famille | client | cliente | entreprise, `conclusion_nationalite` = francaise | belge | marocaine | espagnole | britannique | italienne | allemande | suisse | neerlandaise | americaine | canadienne | portugaise | russe | saoudienne | emiratie (codes de `src/lib/dealProfile.ts`), `conclusion_montant` = loyer ou prix conclu, `conclusion_mois` = 'AAAA-MM'. Le site compose la phrase en FR/EN/ES tout seul, sans déploiement. L'utilisateur peut aussi le faire lui-même dans l'admin : liste des biens → « … » → « Marquer « Déjà loué / vendu »… ». Ne plus écrire dans `propertyDeals.json` (anciens biens seulement).
4. Après « c'est fait » : `find-bien.mjs` doit montrer `vendu-loue`.

## Règles

- **Jamais de nom ni de prénom du client** sans son accord écrit (loi 09-08) : seulement nationalité + famille / couple / personne seule (« une famille marocaine », « un client espagnol »).
- Un bien loué reste visible (badge « Déjà loué », en fin de catalogue) : c'est voulu, il rassure les clients. Pour le faire disparaître, c'est `retirer-annonce`.
- Si le bien est dans `propertyFeatured.json` (mis en avant), le signaler : un bien loué n'y reste pas affiché en tête ; proposer de l'en retirer.
