# Design QA — refonte Live In Marrakech

Date : 26 août 2026  
État testé : page d’accueil en français, onglet « Acheter », tous les quartiers, données Supabase chargées.

## Références et captures

- Cible visuelle originale : `C:\Users\outman\.codex\generated_images\01a038a1-e5b2-7d32-9487-9fcb40df5c35\exec-1186abb0-bfdc-4b13-81ce-00412ee59c05.png`
- Cible normalisée pour la comparaison : `C:\Users\outman\.codex\visualizations\2026\08\25\01a038a1-e5b2-7d32-9487-9fcb40df5c35\source-normalized-1265x712.jpg`
- Implémentation desktop : `C:\Users\outman\.codex\visualizations\2026\08\25\01a038a1-e5b2-7d32-9487-9fcb40df5c35\home-redesign-desktop-final.jpg`
- Implémentation mobile : `C:\Users\outman\.codex\visualizations\2026\08\25\01a038a1-e5b2-7d32-9487-9fcb40df5c35\home-redesign-mobile-final.jpg`
- Catalogue desktop : `C:\Users\outman\.codex\visualizations\2026\08\25\01a038a1-e5b2-7d32-9487-9fcb40df5c35\catalogue-redesign-desktop.jpg`
- Catalogue mobile : `C:\Users\outman\.codex\visualizations\2026\08\25\01a038a1-e5b2-7d32-9487-9fcb40df5c35\catalogue-redesign-mobile.jpg`
- Fiche bien desktop : `C:\Users\outman\.codex\visualizations\2026\08\25\01a038a1-e5b2-7d32-9487-9fcb40df5c35\detail-redesign-desktop.jpg`
- Fiche bien mobile : `C:\Users\outman\.codex\visualizations\2026\08\25\01a038a1-e5b2-7d32-9487-9fcb40df5c35\detail-redesign-mobile.jpg`

## Viewports et densité

- Comparaison desktop bloquante : 1265 × 712 px pour les deux images, état initial identique.
- Navigateur desktop : viewport CSS 1280 × 720, densité 1,5 ; la capture exclut la largeur du scrollbar et mesure 1265 × 712 px.
- Vérification responsive : viewport CSS 390 × 844 ; capture utile 375 × 812 px après exclusion du scrollbar.
- Cible originale : 1487 × 1058 px ; recadrage haut et normalisation haute qualité vers 1265 × 712 px pour la comparaison directe.

## Comparaison visuelle

La cible normalisée et l’implémentation ont été ouvertes ensemble dans une même entrée de comparaison. Les points structurants sont alignés : en-tête ivoire, logo à gauche, navigation centrée, sélecteur de langues à droite, hero partagé, coupe diagonale, grande photographie immobilière, titre serif, onglets d’intention, champ de quartier, CTA terracotta, CTA conseiller et amorce de la sélection de biens au-dessus de la ligne de flottaison.

Différences acceptées : la photographie générée de la cible est remplacée par une vraie photographie déjà présente dans le projet ; les cartes utilisent exclusivement les biens publiés dans Supabase ; la rubrique « Propriétés à découvrir » garde la hiérarchie éditoriale de la marque actuelle.

## Itérations et corrections

1. Premier rendu : hero trop haut et séparation verticale. Correction : réduction de la hauteur, du rythme vertical et ajout de la coupe diagonale.
2. Deuxième rendu : recherche mobile située trop bas. Correction : image mobile ramenée à 285 px, espaces et contrôles resserrés ; le CTA principal est désormais visible dans le premier écran à 390 px.
3. Catalogue : filtres mobiles auparavant coupés. Correction : panneau mobile plein écran, compteur de filtres actifs, recherche texte, type, projet et quartier fonctionnels.
4. Fiche bien : galerie desktop trop uniforme et prix trop bas. Correction : mosaïque 2+1, titre et prix remontés, barre mobile WhatsApp/Visiter avec prise en charge de la safe area.
5. Console : avertissement React `fetchPriority` et avertissements React Router. Correction : attribut retiré et future flags activés.
6. Performance : bundle initial monolithique. Correction : routes lazy-loadées et chunks React, motion, query, i18n, icônes et Radix séparés ; aucun chunk public ne dépasse 500 Ko.

## Interactions testées

- Navigation Accueil → Catalogue → fiche bien.
- Onglets Acheter / Louer à l’année / Séjourner.
- Sélection d’un quartier et transmission dans l’URL.
- Filtre catalogue « Acheter » : 6 résultats réels lors du test.
- Recherche et suppression complète des filtres.
- Ouverture du panneau de filtres mobile.
- Liens de fiche bien, galerie, CTA WhatsApp et bouton de demande de visite.
- Menu mobile, absence de débordement horizontal à 390 px.
- Console navigateur finale : 0 erreur, 0 avertissement.

## Validation technique

- `npm run typecheck` : réussi.
- `npm run lint` : réussi, 0 erreur.
- `npx vitest run src/test/example.test.ts --reporter=verbose` : 1 fichier / 1 test réussi.
- `npm run build` : réussi ; `tsc --noEmit` est exécuté avant Vite.

## Résultat final

P0 : 0  
P1 : 0  
P2 : 0  
P3 : différences cosmétiques acceptées et documentées ci-dessus.

**final result: passed**
