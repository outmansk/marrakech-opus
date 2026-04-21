-- =====================================================
-- FIX DÉFINITIF : Aligne la table articles + insère les données
-- La table avait "titre" (français) au lieu de "title"
-- On renomme pour correspondre au code React
-- =====================================================

-- 1. Supprimer les colonnes mal ajoutées lors des tentatives précédentes
ALTER TABLE public.articles DROP COLUMN IF EXISTS title;
ALTER TABLE public.articles DROP COLUMN IF EXISTS content;
ALTER TABLE public.articles DROP COLUMN IF EXISTS excerpt;
ALTER TABLE public.articles DROP COLUMN IF EXISTS meta_title;
ALTER TABLE public.articles DROP COLUMN IF EXISTS meta_description;
ALTER TABLE public.articles DROP COLUMN IF EXISTS updated_at;

-- 2. Renommer les colonnes françaises → anglaises (pour correspondre au code)
DO $$ 
BEGIN
  -- titre → title
  IF EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_name='articles' AND column_name='titre' AND table_schema='public') THEN
    ALTER TABLE public.articles RENAME COLUMN titre TO title;
  END IF;
END $$;

-- 3. Ajouter toutes les colonnes manquantes
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS slug TEXT;
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS content TEXT;
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS excerpt TEXT;
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS meta_title TEXT;
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS meta_description TEXT;
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS est_publie BOOLEAN DEFAULT false;
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- 4. Contrainte UNIQUE sur slug
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'articles_slug_key' 
    AND conrelid = 'public.articles'::regclass
  ) THEN
    ALTER TABLE public.articles ADD CONSTRAINT articles_slug_key UNIQUE (slug);
  END IF;
END $$;

-- 5. Vider la table pour repartir proprement
TRUNCATE public.articles RESTART IDENTITY CASCADE;

-- 6. Insérer les 10 articles
INSERT INTO public.articles (slug, title, category, content, excerpt, meta_title, meta_description, image_url, est_publie)
VALUES
(
  'location-appartement-longue-duree-marrakech',
  'Guide complet : La location d''appartement longue durée à Marrakech',
  'location-longue-duree',
  '## Pourquoi choisir Marrakech pour une location longue durée ?

Marrakech attire de plus en plus d''expatriés, de retraités et de digital nomads. La ville ocre offre un ensoleillement exceptionnel (plus de 300 jours par an) et un coût de la vie très attractif comparé aux capitales européennes.

### Les meilleurs quartiers

#### Guéliz : Le cœur moderne
Centre névralgique de la ville nouvelle. Parfait pour les jeunes actifs et les expatriés avec de nombreux appartements de haut standing.

#### L''Hivernage : Le luxe résidentiel
Le quartier chic de Marrakech, très prisé pour sa tranquillité et ses résidences sécurisées avec piscine.

#### La Palmeraie : Le calme absolu
Des duplex et appartements de luxe au sein de complexes résidentiels fermés, idéal pour les familles.

## Budget à prévoir en 2026

Un appartement de 2 chambres à Guéliz : entre 7 000 et 12 000 MAD/mois.
Dans l''Hivernage : 15 000 à 20 000 MAD/mois.

### Nos conseils
- Vérifiez si les charges de copropriété sont incluses dans le loyer.
- Exigez un état des lieux minutieux.
- Faites-vous accompagner par Dar Prestige pour éviter les mauvaises surprises.',
  'Découvrez tout ce qu''il faut savoir pour louer un appartement longue durée à Marrakech : quartiers, prix, et démarches administratives.',
  'Location Appartement Longue Durée Marrakech | Dar Prestige',
  'Trouvez votre appartement idéal en location longue durée à Marrakech. Guide complet sur les meilleurs quartiers et conseils pratiques.',
  'https://images.unsplash.com/photo-1590483736622-398544c41460?auto=format&fit=crop&q=80',
  true
),
(
  'location-villa-longue-duree-marrakech',
  'Location de villa de prestige longue durée à Marrakech : L''art de vivre',
  'location-longue-duree',
  '## Vivre le rêve luxueux à Marrakech

Opter pour la location d''une villa en longue durée à Marrakech est un choix de vie incomparable. Les jardins luxuriants et la culture locale confèrent un charme oriental mêlé à un luxe contemporain.

### Les zones résidentielles de prédilection

#### Route de Fès : L''espace et la discrétion
Idéale pour louer une propriété sur plusieurs hectares avec de vastes jardins et sans grand vis-à-vis.

#### Amelkis & Al Maaden : Le paradis des Golfeurs
Domaines golfiques sécurisés avec vue imprenable sur les cimes enneigées de l''Atlas.

#### La Palmeraie
L''exclusivité absolue. Des villas d''architecture arabo-andalouse lovées entre les palmiers centenaires.

## Ce qu''il faut vérifier

- L''entretien piscine/jardin est-il à la charge du propriétaire ?
- La villa est-elle dans une résidence sécurisée ?
- Le chauffage réversible est-il fonctionnel ?

## Budget estimatif
Entre 25 000 MAD et plus de 100 000 MAD/mois selon superficie et zone.',
  'Vivre dans une villa avec piscine à l''année est un rêve accessible à Marrakech. Notre guide pour choisir la villa parfaite.',
  'Location Villa Longue Durée Marrakech | Villas de Rêve',
  'Expertise en location de villas de luxe longue durée à Marrakech : Route de Fès, Palmeraie, Amelkis. Nos conseils de sélection.',
  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80',
  true
),
(
  'expatrie-marrakech-logement',
  'S''expatrier à Marrakech : Trouver son logement sereinement',
  'location-longue-duree',
  '## Une expatriation au soleil

S''expatrier à Marrakech est devenu la destination privilégiée de nombreux entrepreneurs, familles et digital nomads d''Europe. Le climat exceptionnel et la culture riche en font un hub idéal en 2026.

### Les étapes clés

#### 1. Arriver en location saisonnière
Commencez par un Airbnb pour explorer les différents quartiers avant de signer un bail longue durée.

#### 2. Comprendre le marché
La demande est forte. Quand un bien de qualité se présente à bon prix, soyez très réactif.

#### 3. Les démarches légales
Un résident étranger peut louer avec son passeport. Le bail légalisé sera nécessaire pour la carte de séjour.

## Les pièges à éviter

- Refusez les accords verbaux.
- Vérifiez les climatisations avant de signer.
- Eau et électricité sont presque jamais incluses dans le bail.',
  'Le guide définitif pour les expatriés souhaitant s''installer à Marrakech. Tout savoir sur le logement et vos premiers pas.',
  'Expatrié à Marrakech : Guide du logement 2026',
  'Vous vous installez au Maroc ? Apprenez comment trouver et signer pour un logement pour votre expatriation à Marrakech.',
  'https://images.unsplash.com/photo-1549487405-240eeaf63a3a?auto=format&fit=crop&q=80',
  true
),
(
  'sous-location-appartement-marrakech',
  'La Sous-Location d''Appartement à Marrakech : Légalité et Opportunités',
  'sous-location',
  '## Qu''est-ce que la sous-location professionnelle ?

Avec l''essor d''Airbnb et Booking, vous louez un appartement longue durée puis, avec l''accord du propriétaire, vous l''exploitez en courte durée pour les touristes.

### Les impératifs légaux

#### L''accord du propriétaire
La sous-location est interdite sans clause expresse dans le bail. Sans cela, risque de résiliation immédiate.

#### La réglementation des plateformes
Marrakech standardise les procédures. Déclarez votre activité et collectez les taxes de séjour.

## Les quartiers stratégiques

- **Guéliz** : 80% de taux de remplissage. Très apprécié des couples et groupes.
- **Hivernage** : Clientèle Premium, tarifs nocturnes élevés.

## L''investissement de départ

Prévoyez : 1 mois d''avance + 2 mois caution + 1 mois agence + ameublement premium.
Un appartement visuellement marquant se loue 30% plus cher sur les plateformes.',
  'Comment gérer ou trouver une sous-location légale et lucrative à Marrakech en 2026.',
  'Sous-location Appartement Marrakech | Opportunités 2026',
  'Intéressé par la sous-location à Marrakech ? Découvrez le cadre légal et les meilleures stratégies de rendement.',
  'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80',
  true
),
(
  'sous-louer-villa-marrakech',
  'Comment sous-louer une villa de luxe à Marrakech',
  'sous-location',
  '## L''essor du marché des villas en courte durée

Marrakech est la destination incontournable pour partager une villa entre amis (anniversaires, EVG, retraites bien-être). Une villa peut dégager des revenus très attractifs.

### Choisir la villa idéale

#### Les zones géographiques
- **Route de l''Ourika** : Très tendance. 15 min du centre, grands terrains.
- **Palmeraie** : Excellente zone avec règles strictes de copropriété.

#### Design et capacités
Privilégiez les villas de 5 à 8 chambres. Une villa se loue entre 200 et 400 euros la chambre par nuit !

## Convaincre le propriétaire

1. **Garantie d''entretien** : Vous êtes garant des jardins et piscines.
2. **Loyers en avance** : Proposer 6 à 12 mois facilite la décision.
3. **Aménagements à votre charge** : Valeur ajoutée pour le propriétaire.

Dar Prestige accompagne les profils sérieux vers ces opportunités.',
  'Créer un business rentable autour d''une villa de prestige à Marrakech. La sous-location, une piste sérieuse.',
  'Sous-louer une Villa à Marrakech | Opportunité Rentable',
  'Créer sa conciergerie et sous-louer des villas à Marrakech. Conseils, zones ciblées et accords propriétaires.',
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80',
  true
),
(
  'acheter-appartement-marrakech-2026',
  'Achat d''appartement à Marrakech en 2026 : Le Guide Définitif',
  'vente',
  '## Pourquoi investir dans la pierre à Marrakech en 2026 ?

La Coupe du Monde 2030 co-organisée par le Maroc, les nouvelles infrastructures et les mutations économiques poussent l''immobilier vers le haut.

### Le prix au mètre carré

#### Hyper-centre (Guéliz, Hivernage)
- **Hivernage** : 25 000 à 40 000 MAD/m²
- **Guéliz** : 12 000 à 22 000 MAD/m²

#### Nouveaux quartiers (Targa, Agdal)
Entre 10 000 et 15 000 MAD/m² avec grandes piscines communes.

## Fiscalité sur l''achat

- **Frais de notaire** : ~6% du prix, à la charge de l''acquéreur
- **Pas d''impôt sur la succession** en ligne directe au Maroc
- **Plus-values immobilières** : 20% avec abattements progressifs

Un investisseur étranger peut rapatrier ses plus-values sous simple présentation de certificats.',
  'Analyses, tendances du marché et quartiers porteurs pour acheter votre appartement à Marrakech cette année.',
  'Acheter un Appartement à Marrakech en 2026 : Prix et Marché',
  'Le marché immobilier de Marrakech est en plein boom. Découvrez où acheter, à quel prix/m² et pour quelle plus-value.',
  'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80',
  true
),
(
  'villa-a-vendre-marrakech',
  'Villa à vendre à Marrakech : Les secrets pour trouver le bien de ses rêves',
  'vente',
  '## S''offrir le luxe méditerranéen en Afrique du Nord

Le marché de la villa à Marrakech se fragmente en trois typologies : villa contemporaine, villa arabo-andalouse (Beldi chic) et maison hacienda de campagne.

### Les deux grandes options

#### Le VEFA (sur plan)
Paiements échelonnés (10 à 30% d''apport). Vous personnalisez le marbre, les boiseries et la piscine selon vos goûts.

#### L''Ancien
Parfait si l''emplacement prime. Les villas 2000-2010 dans la Palmeraie ont des terrains immenses devenus très rares.

## Budgets indicatifs

- **Entrée de gamme** : À partir de 3 000 000 MAD (≈ 300 000 €)
- **Haut de gamme** : 8 à 15 millions MAD
- **Ultra-Luxe** : Plus de 2 millions d''euros

Dar Prestige fait l''interface avec les avocats et notaires pour sécuriser votre investissement.',
  'Acheter une villa de rêve à Marrakech nécessite l''appui de professionnels du terrain. Découvrez nos astuces clés.',
  'Villas à vendre à Marrakech : Prestige et Luxe',
  'Notre expertise sur la vente de villas à Marrakech. Où acheter ? Sur-plan ou ancien ? Architecture et budgets détaillés.',
  'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&q=80',
  true
),
(
  'riad-a-vendre-marrakech',
  'Acheter un Riad dans la Médina de Marrakech : Conseils d''experts',
  'vente',
  '## Plonger dans le patrimoine culturel marocain

Le Riad — maison ancestrale articulée autour d''un grand patio arboré — est très demandé par les passionnés du Maroc. C''est un véritable monument porteur d''histoire et d''âme.

### Points cardinaux lors d''un achat en médina

#### Melkia vs Titre Foncier
Beaucoup de biens appartiennent à de vieilles familles sur de simples actes manuscrits.
**Notre conseil** : N''achetez QUE des riads avec un Titre Foncier officiel (Conservation Foncière).

#### L''accès, souvent oublié
L''idéal est un riad accessible par véhicule. À défaut, maximum 5 min à pied d''un grand parking gardé.

## Exploitation en maison d''hôtes

Assurez-vous des conditions de classement de la Mairie de Marrakech. La rénovation doit inclure des experts en boiseries Cèdre, Tadelakt et zelliges authentiques.',
  'L''authenticité absolue. Tout ce qu''il faut savoir avant d''investir dans un Riad à Marrakech.',
  'Riads à vendre - Médina de Marrakech | Authentique',
  'Dar Prestige vous guide sur les pièges à éviter lors de l''achat d''un riad en Medina : titrage, rénovation et potentiel touristique.',
  'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&q=80',
  true
),
(
  'terrain-a-vendre-marrakech',
  'Acheter un terrain constructible à Marrakech : Tout ce qu''il faut vérifier',
  'terrain',
  '## Pourquoi acheter un terrain plutôt qu''un bien fini ?

Bâtir selon ses propres envies est un luxe incontestable. À Marrakech, les artisans (maçon, sculpteur de plâtre, ferronnier d''art) sont très prolifiques et leur savoir-faire exceptionnel.

### Les pièges du zonage urbain

Avant de vous lancer impérativement :

1. **Note de Renseignement** de l''Agence Urbaine de Marrakech — valide ce que vous pouvez construire.
2. **Nappes phréatiques** — vérifiez la profondeur de l''eau dans le secteur.

## Prix indicatifs

- **Palmeraie titrée** : 1,8 à 3 millions MAD/hectare
- **Route d''Amizmiz** : en forte hausse, belle vue Atlas
- **Lotissement Guéliz** : jusqu''à 15 000 MAD/m² vide

Confiez la recherche de votre parcelle à Dar Prestige.',
  'Le secret d''une belle maison commence par une belle parcelle foncière. Comment réussir l''achat de son terrain au Maroc.',
  'Terrain à vendre Marrakech | Constructible, VNA, Palmeraie',
  'Toutes les informations techniques, juridiques et de prix pour acheter un terrain constructible à Marrakech aujourd''hui.',
  'https://images.unsplash.com/photo-1604085572504-a392ddf0d86a?auto=format&fit=crop&q=80',
  true
),
(
  'investir-terrain-marrakech-2026',
  'Le formidable investissement foncier autour de Marrakech en 2026',
  'terrain',
  '## L''expansion démographique de Marrakech

Le rayonnement de la ville impériale ne fait qu''augmenter. Acheter de grands terrains hors plan d''aménagement actuel, en tablant que la ville les rattrape d''ici 5 à 10 ans, est un land banking très porteur.

### La Coupe du Monde 2030, la bascule ?

Tramway, Grand Stade, parc des expositions : ces projets vont décaler les centres de gravité urbains. Investir dans la plaine du Haouz peut quintupler votre mise sur le long terme !

### Comment s''y prendre

- Viser les grandes parcelles non viabilisées aux confins Est et Sud
- Revendre à des promoteurs après découpage foncier
- S''entourer d''excellentes structures juridiques marocaines

Dar Prestige collabore avec des cabinets d''avocats de premier rang pour ces macro-investissements fonciers.',
  'Pourquoi de grandes fortunes mondiales acquièrent des terres à côté de Marrakech pour parier sur la Coupe du Monde 2030.',
  'Investir sur le foncier à Marrakech 2026 | Analyse',
  'Pari audacieux et rentable : pourquoi et comment investir sur de grands terrains dans la région de Marrakech-Safi.',
  'https://images.unsplash.com/photo-1502444330042-d1a1ddf9d782?auto=format&fit=crop&q=80',
  true
);
