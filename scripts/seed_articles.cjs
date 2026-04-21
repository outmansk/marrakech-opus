const fs = require('fs');

const PROJECT_ID = 'djrdqhetzqleygfhccco';
const MGMT_TOKEN = 'sbp_c1ed51d259f9290d347cf182fff0dfaeb31a9045';

const articles = [
  {
    slug: 'location-appartement-longue-duree-marrakech',
    title: "Guide complet : La location d'appartement longue durée à Marrakech",
    category: 'location-longue-duree',
    excerpt: "Découvrez tout ce qu'il faut savoir pour louer un appartement longue durée à Marrakech : quartiers, prix, et démarches administratives.",
    meta_title: "Location Appartement Longue Durée Marrakech | Dar Prestige",
    meta_description: "Trouvez votre appartement idéal en location longue durée à Marrakech. Guide complet sur les meilleurs quartiers et conseils pratiques.",
    image_url: "https://images.unsplash.com/photo-1590483736622-398544c41460?auto=format&fit=crop&q=80",
    est_publie: true,
    content: `## Pourquoi choisir Marrakech pour une location longue durée ?

Marrakech est une ville fascinante qui attire de plus en plus d'expatriés, de retraités et de digital nomads. S'installer dans la ville ocre permet de profiter d'un ensoleillement exceptionnel (plus de 300 jours par an), d'une qualité de vie agréable et d'un coût de la vie très attractif.

### Les meilleurs quartiers pour louer à Marrakech

#### Guéliz : Le cœur moderne
Le quartier de Guéliz est le centre névralgique de la ville nouvelle. Parfait pour les jeunes actifs et les expatriés, vous y trouverez de nombreux appartements de haut standing.

#### L'Hivernage : Le luxe résidentiel
Si vous recherchez un appartement de très haut standing dans une résidence sécurisée avec piscine, l'Hivernage est fait pour vous.

#### La Palmeraie : Le calme absolu
La Palmeraie offre des duplex et des appartements de luxe au sein de complexes résidentiels fermés. Idéal pour les familles.

## Budget à prévoir en 2026

En 2026, un appartement moderne de 2 chambres à Guéliz se négocie entre 7 000 et 12 000 MAD par mois. Dans l'Hivernage, les prix peuvent atteindre 15 000 à 20 000 MAD mensuels.

### Nos conseils pour bien louer

- Vérifiez si les charges de copropriété sont incluses dans le loyer.
- Exigez un état des lieux minutieux, surtout si l'appartement est meublé.
- Faites-vous accompagner par Dar Prestige pour éviter les mauvaises surprises.`
  },
  {
    slug: 'location-villa-longue-duree-marrakech',
    title: "Location de villa de prestige longue durée à Marrakech : L'art de vivre",
    category: 'location-longue-duree',
    excerpt: "Vivre dans une villa avec piscine à l'année est un rêve accessible à Marrakech. Lisez notre guide pour choisir la villa parfaite.",
    meta_title: "Location Villa Longue Durée Marrakech | Villas de Rêve",
    meta_description: "Expertise en location de villas de luxe longue durée à Marrakech : Route de Fès, Palmeraie, Amelkis. Nos conseils de sélection.",
    image_url: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80",
    est_publie: true,
    content: `## Vivre le rêve luxueux à Marrakech

Opter pour la location d'une villa en longue durée à Marrakech est un choix de vie incomparable. Les vastes étendues, les jardins luxuriants et la culture locale confèrent un charme oriental mêlé à un luxe contemporain.

### Les zones résidentielles de prédilection

#### Route de Fès : L'espace et la discrétion
Idéale pour louer une propriété sur plusieurs hectares. Réputée pour ses immenses propriétés avec de vastes jardins.

#### Amelkis & Al Maaden : Le paradis des Golfeurs
Sécurisés, verdoyants et paisibles, ces domaines golfiques offrent des villas magnifiques avec vue sur l'Atlas.

#### La fameuse Palmeraie
Résider dans la Palmeraie, c'est choisir l'exclusivité. Des villas d'une architecture arabo-andalouse lovées entre les palmiers centenaires.

## Ce qu'il faut vérifier avant de louer

- L'entretien de la piscine et du jardin est-il à la charge du propriétaire ?
- La villa est-elle dans une résidence sécurisée ?
- Le chauffage réversible est-il présent ? Les hivers à Marrakech sont froids.

## Budget

Entre 25 000 MAD et plus de 100 000 MAD par mois selon la superficie et la zone.`
  },
  {
    slug: 'expatrie-marrakech-logement',
    title: "S'expatrier à Marrakech : Trouver son logement sereinement",
    category: 'location-longue-duree',
    excerpt: "Le guide définitif pour les expatriés souhaitant s'installer à Marrakech. Tout savoir sur le logement et vos premiers pas.",
    meta_title: "Expatrié à Marrakech : Guide du logement 2026",
    meta_description: "Vous vous installez au Maroc ? Apprenez comment trouver et signer pour un logement pour votre expatriation à Marrakech.",
    image_url: "https://images.unsplash.com/photo-1549487405-240eeaf63a3a?auto=format&fit=crop&q=80",
    est_publie: true,
    content: `## Une expatriation au soleil

S'expatrier à Marrakech est devenu la destination privilégiée de nombreux entrepreneurs, familles et digital nomads d'Europe. Le climat exceptionnel, la culture riche et l'évolution moderne de la ville en font un hub idéal.

### Les étapes clés

#### 1. Arriver en location saisonnière
Ne prenez pas un bail longue durée sans avoir vu le bien. Commencez par un Airbnb pour explorer les quartiers.

#### 2. Comprendre le marché local
La demande est forte en 2026. Quand un bien de qualité se présente à bon prix, soyez réactif.

#### 3. Les démarches légales
Un résident étranger peut louer facilement avec son passeport. Le contrat de bail légalisé sera nécessaire pour la carte de séjour.

## Les pièges à éviter

- N'acceptez pas d'accords verbaux.
- Vérifiez que les climatisations fonctionnent avant de signer.
- L'eau et l'électricité ne sont presque jamais incluses dans le bail.`
  },
  {
    slug: 'sous-location-appartement-marrakech',
    title: "La Sous-Location d'Appartement à Marrakech : Légalité et Opportunités",
    category: 'sous-location',
    excerpt: "Comment gérer ou trouver une sous-location légale et lucrative à Marrakech en 2026. Tout le fonctionnement expliqué.",
    meta_title: "Sous-location Appartement Marrakech | Opportunités 2026",
    meta_description: "Intéressé par la sous-location à Marrakech ? Découvrez le cadre légal et les meilleures stratégies.",
    image_url: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80",
    est_publie: true,
    content: `## Qu'est-ce que la sous-location professionnelle ?

Avec l'essor d'Airbnb et Booking, la sous-location est devenue un sujet brûlant à Marrakech. Vous louez un appartement longue durée puis, avec l'accord du propriétaire, vous l'exploitez en courte durée.

### Les impératifs légaux

#### L'accord explicite du propriétaire
La sous-location est interdite sans clause expresse dans le bail ou autorisation écrite du propriétaire.

#### La réglementation des plateformes
La ville de Marrakech standardise les procédures (déclaration à la police, taxes de séjour). Un statut auto-entrepreneur est recommandé.

## Les quartiers stratégiques

- **Guéliz** : Taux de remplissage 80%. Très apprécié des couples et groupes d'amis.
- **Hivernage** : Clientèle Premium, tarifs élevés.

## L'investissement de départ

Prévoyez : 1 mois d'avance + 2 mois de caution + 1 mois d'agence + l'ameublement.
Il faut un appartement qui se démarque visuellement pour performer sur les plateformes.`
  },
  {
    slug: 'sous-louer-villa-marrakech',
    title: "Comment sous-louer une villa de luxe à Marrakech",
    category: 'sous-location',
    excerpt: "Vous souhaitez créer un business rentable autour d'une villa de prestige ? La sous-location est une piste sérieuse.",
    meta_title: "Sous-louer une Villa à Marrakech | Opportunité Rentable",
    meta_description: "Créer sa conciergerie et sous-louer des villas à Marrakech. Conseils, zones ciblées et accords propriétaires.",
    image_url: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80",
    est_publie: true,
    content: `## L'essor du marché des villas en courte durée

Marrakech est la destination incontournable pour partager une somptueuse villa entre amis (anniversaires, EVG, retraites bien-être). Sous-louer une villa peut dégager des revenus très attractifs.

### Choisir la villa idéale

#### Les zones géographiques
- **Route de l'Ourika** : Très tendance. Bon compromis entre la campagne et la proximité du centre (15 min).
- **Palmeraie** : Excellente zone mais avec des règles strictes de copropriété.

#### Design et capacités
Pour une rentabilité optimale, privilégiez les villas de 5 à 8 chambres. Une villa se loue entre 200 et 400 € la chambre par nuit !

## Convaincre le propriétaire

1. **Garantie d'entretien** : Vous êtes garant des jardins et piscines.
2. **Loyers en avance** : Proposer 6 à 12 mois en une traite facilite la décision.
3. **Aménagements à votre charge** : Apporter une valeur ajoutée augmente l'attrait du bien.`
  },
  {
    slug: 'acheter-appartement-marrakech-2026',
    title: "Achat d'appartement à Marrakech en 2026 : Le Guide Définitif",
    category: 'vente',
    excerpt: "Analyses, tendances du marché et quartiers porteurs pour acheter votre appartement au cœur de la ville ocre.",
    meta_title: "Acheter un Appartement à Marrakech en 2026 : Prix et Marché",
    meta_description: "Le marché immobilier de Marrakech est en plein boom. Découvrez où acheter, à quel prix/m² et pour quelle plus-value.",
    image_url: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80",
    est_publie: true,
    content: `## Pourquoi investir dans la pierre à Marrakech en 2026 ?

La Coupe du Monde 2030 (co-organisée par le Maroc), les nouvelles infrastructures et les mutations économiques de Marrakech poussent l'immobilier vers le haut.

### Le prix au mètre carré

#### Hyper-centre (Guéliz, Hivernage)
- **Hivernage** : 25 000 à 40 000 MAD/m² selon les finitions
- **Guéliz** : 12 000 à 22 000 MAD/m²

#### Nouveaux quartiers (Targa, Agdal)
Entre 10 000 et 15 000 MAD/m² avec de grandes piscines communes.

## Fiscalité sur l'achat

- **Frais de notaire** : ~6% du prix d'achat (à la charge de l'acquéreur)
- **Pas d'impôt sur la succession** en ligne directe au Maroc
- **Plus-values immobilières** : 20% avec abattements progressifs dans le temps

Un investisseur étranger peut rapatrier ses plus-values sous simple présentation de certificats.`
  },
  {
    slug: 'villa-a-vendre-marrakech',
    title: "Villa à vendre à Marrakech : Les secrets pour trouver le bien de ses rêves",
    category: 'vente',
    excerpt: "Acheter une villa de rêve à Marrakech nécessite l'appui de professionnels du terrain. Découvrez nos astuces.",
    meta_title: "Villas à vendre à Marrakech : Prestige et Luxe",
    meta_description: "Notre expertise sur la vente de villas à Marrakech. Où acheter ? Sur-plan ou ancien ? Architecture et budgets.",
    image_url: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&q=80",
    est_publie: true,
    content: `## S'offrir le luxe méditerranéen en Afrique du Nord

Le marché de la villa à Marrakech se fragmente en trois typologies : villa contemporaine, villa arabo-andalouse (Beldi chic) et maison hacienda de campagne.

### Les deux grandes options d'investissement

#### Le VEFA (Vente en État Futur d'Achèvement)
Acheter sur plan reste très intéressant avec des paiements échelonnés (10 à 30% d'apport). Vous pouvez personnaliser le marbre, les boiseries et la piscine.

#### L'Ancien
Parfait si l'emplacement prime. Les villas des années 2000-2010 dans la Palmeraie ont des terrains immenses devenus très rares.

## Quel budget ?

- **Budget de départ** : À partir de 3 000 000 MAD (≈ 300 K€)
- **Haut de gamme** : Entre 8 et 15 millions MAD (0,8 à 1,5 M€)
- **Ultra-Luxe** : Plus de 2 millions d'euros — Marrakech joue désormais dans la cour des grands.`
  },
  {
    slug: 'riad-a-vendre-marrakech',
    title: "Acheter un Riad dans la Médina de Marrakech : Conseils d'experts",
    category: 'vente',
    excerpt: "L'authenticité absolue. Tout ce qu'il faut savoir avant d'investir dans un Riad à Marrakech.",
    meta_title: "Riads à vendre - Médina de Marrakech | Authentique",
    meta_description: "Dar Prestige vous guide sur les pièges à éviter lors de l'achat d'un riad en Medina : titrage, rénovation et potentiel.",
    image_url: "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&q=80",
    est_publie: true,
    content: `## Plonger dans le patrimoine culturel marocain

Le Riad (maison ancestrale articulée autour d'un grand patio arboré) est très demandé par les passionnés du Maroc. C'est un véritable monument porteur d'histoire et d'âme.

### Points cardinaux lors d'un achat en médina

#### Le problème du 'Melkia' vs La Titration foncière
Beaucoup de biens en médina appartiennent à de vieilles familles sur de simples actes manuscrits.
**Notre conseil** : Exigez un Titre Foncier (immatriculation à la Conservation Foncière) avant tout achat.

#### L'accès
Un riad sans accès convenable est inutilisable. L'idéal est un "Riad à porte de voiture" permettant l'approche par véhicule.

## Exploitation : Devenir maison d'hôtes ?

Si le plan est de convertir le bien en maison d'hôtes, assurez-vous des conditions de classement de la Mairie. La rénovation doit inclure des experts en boiseries Cèdre, Tadelakt et zelliges.`
  },
  {
    slug: 'terrain-a-vendre-marrakech',
    title: "Acheter un terrain constructible à Marrakech : Tout ce qu'il faut vérifier",
    category: 'terrain',
    excerpt: "Le secret d'une belle maison commence par une belle parcelle foncière. Comment réussir l'achat de son terrain.",
    meta_title: "Terrain à vendre Marrakech | Constructible, VNA, Palmeraie",
    meta_description: "Toutes les informations techniques et juridiques pour acheter un terrain constructible à Marrakech aujourd'hui.",
    image_url: "https://images.unsplash.com/photo-1604085572504-a392ddf0d86a?auto=format&fit=crop&q=80",
    est_publie: true,
    content: `## Pourquoi acheter un terrain plutôt qu'un bien fini ?

Bâtir selon ses envies est un luxe incontestable. À Marrakech, la chaîne des artisans (maçon, sculpteur de plâtre, ferronnier) est très prolifique. Un chantier qui coûte 5 M€ en Suisse peut sortir pour 3 à 4 fois moins cher avec de meilleurs matériaux nobles.

### Les pièges du zonage urbain

Avant de vous lancer :

1. **Note de Renseignement** : Exigez ce document de l'Agence Urbaine de Marrakech. Il valide ce que vous avez le droit de construire sur la parcelle.
2. **Nappes phréatiques** : Renseignez-vous sur la profondeur de l'eau dans le secteur.

## Les prix indicatifs

- **Palmeraie** (titrée) : entre 1,8 et 3 millions MAD/hectare
- **Route d'Amizmiz** : en forte hausse, belle vue Atlas
- **Terrain de lotissement Guéliz** : jusqu'à 15 000 MAD/m² vide !`
  },
  {
    slug: 'investir-terrain-marrakech-2026',
    title: "Le formidable investissement foncier autour de Marrakech en 2026",
    category: 'terrain',
    excerpt: "Comprendre pourquoi de grandes fortunes mondiales acquièrent des terres à côté de Marrakech pour parier sur la Coupe du Monde.",
    meta_title: "Investir sur le foncier à Marrakech 2026 | Analyse",
    meta_description: "Pari audacieux et rentable : pourquoi et comment investir sur de grands terrains dans la région de Marrakech-Safi.",
    image_url: "https://images.unsplash.com/photo-1502444330042-d1a1ddf9d782?auto=format&fit=crop&q=80",
    est_publie: true,
    content: `## L'expansion démographique impressionnante

D'année en année, le rayonnement de Marrakech ne fait qu'augmenter. Acheter de grands terrains hors du plan d'aménagement actuel, en tablant que la ville les rattrape d'ici 5 à 10 ans, est un calcul financier porteur (land banking).

### La Coupe du Monde 2030, la bascule ?

Les futurs projets de tramway, le Grand Stade et le parc des expositions vont décaler les centres de gravité urbains. Investir dans la plaine du Haouz peut quintupler votre mise sur le long terme !

### Comment s'y prendre

- Viser les grandes parcelles non viabilisées aux confins Est et Sud de la ville
- Si possible, revendre à des promoteurs après découpage
- Nécessite d'excellentes structures juridiques basées au Maroc

Dar Prestige collabore avec des cabinets d'avocats de premier rang pour ces macro-investissements.`
  }
];

// Escape SQL single quotes
function escapeSql(str) {
  if (str === null || str === undefined) return 'NULL';
  return `'${str.replace(/'/g, "''")}'`;
}

async function runQuery(query) {
  const response = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_ID}/database/query`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${MGMT_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ query })
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`HTTP ${response.status}: ${text}`);
  }
  return response.json();
}

async function seed() {
  console.log('🚀 Insertion des articles du blog Dar Prestige...\n');

  let inserted = 0;
  let skipped = 0;

  for (const article of articles) {
    const query = `
      INSERT INTO public.articles (slug, title, category, content, excerpt, meta_title, meta_description, image_url, est_publie)
      VALUES (
        ${escapeSql(article.slug)},
        ${escapeSql(article.title)},
        ${escapeSql(article.category)},
        ${escapeSql(article.content)},
        ${escapeSql(article.excerpt)},
        ${escapeSql(article.meta_title)},
        ${escapeSql(article.meta_description)},
        ${escapeSql(article.image_url)},
        ${article.est_publie}
      )
      ON CONFLICT (slug) DO UPDATE SET
        title = EXCLUDED.title,
        category = EXCLUDED.category,
        content = EXCLUDED.content,
        excerpt = EXCLUDED.excerpt,
        meta_title = EXCLUDED.meta_title,
        meta_description = EXCLUDED.meta_description,
        image_url = EXCLUDED.image_url,
        est_publie = EXCLUDED.est_publie,
        updated_at = NOW();
    `;

    try {
      await runQuery(query);
      console.log(`  ✅ ${article.title.substring(0, 60)}...`);
      inserted++;
    } catch (err) {
      console.error(`  ❌ Erreur pour "${article.slug}": ${err.message}`);
      skipped++;
    }
  }

  console.log(`\n🏁 Terminé ! ${inserted} articles insérés, ${skipped} erreurs.`);
  if (inserted > 0) {
    console.log('📰 Recharge /blog pour voir les articles !');
  }
}

seed().catch(console.error);
