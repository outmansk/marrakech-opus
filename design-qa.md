# Design QA — recherche mobile moderne

Date : 29 août 2026  
État : accueil français, onglet « Louer longue durée », quartier « Tous les quartiers ».

## Preuves

- Source visuelle : `C:\Users\outman\AppData\Local\Temp\codex-clipboard-f8bbffe1-0c0b-4d40-a44c-6af6d4340a99.png`
- Capture navigateur : `C:\Users\outman\Desktop\PROJETS SK\marrakech-opus-main\implementation-search-modern-final.png`
- Comparaison ciblée : `C:\Users\outman\Desktop\PROJETS SK\marrakech-opus-main\design-qa-search-modern-comparison.png`
- Viewport CSS : 390 × 844 px, densité 1.
- Source : 1400 × 1122 px, normalisée à 390 × 258 px.
- Implémentation : 390 × 844 px ; région de recherche recadrée à 390 × 258 px.

## Résultat visuel

La comparaison côte à côte confirme la même hiérarchie : phrase d’introduction, trois intentions sur une ligne éditoriale, soulignement terracotta animé, champ « Quartier » sur deux niveaux et CTA plein format. La version codée modernise volontairement la cible avec des rayons plus doux, une légère teinte sur l’onglet actif, une ombre courte sous le CTA et des transitions de focus/pression.

## Surfaces de fidélité

- Typographie : hiérarchie, capitales, interlettrage et retours de ligne cohérents à 390 px.
- Espacement : rythme compact conservé ; aucune perte de contenu au-dessus de la sélection de biens.
- Couleurs : ivoire, terracotta, gris chaud et contraste du bouton alignés.
- Images et icônes : aucune image supplémentaire nécessaire ; icône de localisation et chevron issus de la bibliothèque existante.
- Copie : « Louer longue durée », « Quartier », « Tous les quartiers » et « Découvrir les biens » corrects.

## Interactions vérifiées

- Changement d’onglet et état `aria-pressed`.
- Sélection du quartier « Hivernage ».
- Navigation du CTA vers `/catalogue?type=location-longue-duree&quartier=Hivernage`.
- Aucun débordement horizontal à 390 px.
- Console navigateur : 0 erreur.

## Historique de comparaison

1. Premier rendu : contour de focus rectangulaire trop présent autour de l’onglet actif (P2). Correction : focus moderne par teinte légère, sans cadre dur, tout en gardant un état visible.
2. Rendu final : aucun écart P0, P1 ou P2. Les rayons et la légère ombre sont des modernisations intentionnelles demandées.

## Validation

- `npm run typecheck` : réussi.
- `npm run build` : réussi.

P0 : 0  
P1 : 0  
P2 : 0  
P3 : 0

final result: passed
