---
name: retirer-annonce
description: Retirer une annonce de liveinmarrakech.com (la masquer en brouillon, ou la supprimer définitivement) et donner le code SQL à coller dans Supabase. À utiliser dès que l'utilisateur dit « supprime », « enlève », « retire », « cache cette annonce », « le propriétaire ne veut plus », « doublon ».
---

# Retirer une annonce

Répondre en français, court, et rendre **un SQL prêt à coller** (Supabase → SQL Editor → Run), dans la réponse et dans un fichier (`01 - Biens\_SQL\AAAA-MM-JJ-<slug>-retrait.sql`).

## Choisir la bonne action

- **Masquer (par défaut)** : l'annonce disparaît du site mais reste dans l'admin, avec ses photos et ses textes, et peut revenir en un clic.
  ```sql
  UPDATE public.properties_v2 SET statut = 'brouillon', updated_at = now()
  WHERE id = '<id>';
  ```
  Remettre en ligne plus tard : `statut = 'publie'`.
- **Loué / vendu** : ne pas masquer, utiliser `annonce-louee` (le bien reste visible avec le badge « Déjà loué », ce qui rassure les clients). Le proposer si l'utilisateur dit « supprime, il est loué ».
- **Supprimer définitivement** : seulement si l'utilisateur le demande clairement (doublon, erreur de saisie). Demander confirmation avant de donner le SQL, en rappelant que c'est sans retour (photos Cloudinary non supprimées, mais fiche, textes et historique perdus).
  ```sql
  DELETE FROM public.properties_v2 WHERE id = '<id>';
  ```
  Les visites, contacts et tâches liés gardent leur ligne (lien vidé automatiquement).

## Déroulé

1. Retrouver l'annonce : `node .claude/skills/publier-bien/find-bien.mjs "<nom>"`. Un doublon : vérifier lequel garder (le plus récent `updated_at`, le plus de photos, des traductions) et le dire.
2. Une annonce masquée ou supprimée garde son adresse `/bien/<slug>` : la page affiche alors « introuvable ». Google l'oublie au prochain déploiement (sitemap régénéré).
3. Si `find-bien` signale `propertyFeatured.json`, `propertyOverrides.json`, `propertyHeadlines.json` ou `propertyDeals.json`, retirer l'entrée du fichier après une suppression définitive (commit + `git push origin HEAD:main`) ; inutile pour un simple masquage.
4. Après « c'est fait » : `find-bien.mjs` ne doit plus trouver l'annonce (un brouillon n'est pas visible avec la clé publique).
