import type { LandingCopy, LandingId } from "./landings";

// Textes des pages de recherche, en français (version de référence).
// Règle : aucun chiffre de marché inventé. Les chiffres affichés (nombre de biens, prix)
// viennent du catalogue ; les points juridiques et fiscaux renvoient au notaire.

const copy: Record<LandingId, LandingCopy> = {
  vente: {
    title: "Immobilier à vendre à Marrakech : villas, maisons, riads",
    description: "Villas, maisons et riads à vendre à Marrakech : prix affichés, photos des biens et accompagnement de la visite jusqu’à la signature chez le notaire.",
    eyebrow: "Acheter à Marrakech",
    h1: "Immobilier à vendre à Marrakech",
    answer: "Live In Marrakech propose des biens à vendre à Marrakech et dans ses environs, selon les disponibilités : villas, maisons, riads. Nous accompagnons l’acheteur, résident ou non, de la visite jusqu’à la signature chez le notaire.",
    sections: [
      {
        heading: "Quel type de bien acheter à Marrakech ?",
        paragraphs: [
          "Le choix dépend d’abord de votre façon de vivre la ville. Les villas, souvent avec jardin et piscine, se trouvent surtout en périphérie : Palmeraie, route de Fès, route de l’Ourika, route d’Amizmiz. Les appartements se concentrent dans les quartiers modernes comme Guéliz, l’Hivernage ou Agdal, et dans des résidences sécurisées avec piscine commune.",
          "Le riad, maison traditionnelle organisée autour d’un patio, est la signature de la médina. Il séduit ceux qui veulent vivre au cœur de la ville historique ou ouvrir une maison d’hôtes. Enfin, le terrain permet de faire construire sur mesure, à condition de bien vérifier ce que le plan d’urbanisme autorise.",
        ],
      },
      {
        heading: "Les étapes d’un achat au Maroc",
        paragraphs: [
          "Après les visites et l’accord sur le prix, l’achat se fait en général en deux temps : un compromis de vente, accompagné d’un acompte, puis l’acte définitif. Les actes sont rédigés par un notaire (ou par des adouls) et la vente est inscrite à la Conservation foncière lorsque le bien est titré.",
          "Avant de vous engager, demandez le certificat de propriété du titre foncier : il indique le propriétaire, la surface et les éventuelles hypothèques ou charges. Votre notaire vous remettra un décompte précis des frais (droits d’enregistrement, conservation foncière, honoraires) : ces montants dépendent du bien et de votre situation, nous ne les estimons pas à sa place.",
        ],
      },
      {
        heading: "Acheter en étant étranger ou Marocain résidant à l’étranger",
        paragraphs: [
          "Un étranger peut en règle générale acheter un appartement, une villa ou un riad au Maroc en pleine propriété, sans obligation de résidence. Les terres agricoles obéissent à un régime particulier, à vérifier au cas par cas avec le notaire.",
          "Si vous financez l’achat avec des fonds venant de l’étranger, faites passer le paiement par un circuit bancaire et conservez les justificatifs de transfert de devises : ils sont demandés pour pouvoir rapatrier le capital lors d’une future revente. Votre banque et votre notaire vous indiqueront les règles en vigueur.",
        ],
      },
      {
        heading: "Comment nous travaillons",
        paragraphs: [
          "Chaque annonce présente les photos du bien et son prix. Vous pouvez organiser une visite sur WhatsApp, sur place ou en vidéo, puis nous préparons le dossier avec votre notaire jusqu’à la remise des clés.",
          "Vous ne voyez pas le bien qui vous correspond ? Décrivez votre projet : budget, quartier, nombre de chambres. Nous vous envoyons une sélection, y compris des biens qui ne sont pas encore en ligne.",
        ],
      },
    ],
    faq: [
      { q: "Un étranger peut-il acheter un bien immobilier à Marrakech ?", a: "Oui, en règle générale un étranger peut acheter un appartement, une villa ou un riad en pleine propriété, sans carte de résident. Les terres agricoles relèvent d’un régime particulier : faites vérifier chaque cas par un notaire." },
      { q: "Qui rédige l’acte de vente au Maroc ?", a: "L’acte est rédigé par un notaire ou par des adouls. Pour un bien titré, la vente est ensuite inscrite à la Conservation foncière, ce qui officialise le transfert de propriété." },
      { q: "Combien coûtent les frais d’achat ?", a: "Ils comprennent principalement les droits d’enregistrement, les frais de conservation foncière et les honoraires du notaire. Leur montant dépend du prix et de la nature du bien : demandez un décompte écrit à votre notaire avant de signer." },
      { q: "Peut-on visiter à distance ?", a: "Oui. Nous pouvons faire une visite vidéo en direct sur WhatsApp, puis organiser une visite sur place lors de votre venue à Marrakech." },
      { q: "Le prix affiché est-il négociable ?", a: "Le prix publié est celui demandé par le propriétaire. Une marge de négociation existe parfois ; nous vous conseillons après la visite selon le bien et le marché du quartier." },
    ],
    areas: ["Palmeraie", "Gueliz", "Hivernage", "Medina", "Route de l'Ourika", "Route de Fes", "Agdal"],
  },

  "vente-villas": {
    title: "Villa à vendre à Marrakech avec piscine et jardin",
    description: "Villas à vendre à Marrakech, route de Fès ou route de Sidi Rahal : piscine, jardin, photos et prix affichés sur chaque annonce.",
    eyebrow: "Vente · Villas",
    h1: "Villas à vendre à Marrakech",
    answer: "Les villas à vendre à Marrakech se trouvent surtout en périphérie de la ville, dans la Palmeraie, sur la route de Fès, la route de l’Ourika et la route d’Amizmiz, souvent avec jardin et piscine privée.",
    sections: [
      {
        heading: "Où acheter une villa à Marrakech ?",
        paragraphs: [
          "La Palmeraie, au nord-est de la ville, reste l’adresse historique des grandes villas : terrains arborés, calme, proximité des golfs et accès rapide au centre. La route de Fès prolonge ce cadre avec de vastes propriétés, souvent sur plusieurs milliers de mètres carrés.",
          "Au sud, la route de l’Ourika et la route d’Amizmiz offrent des villas plus récentes avec vue sur l’Atlas, dans un environnement plus rural. Plus près du centre, quelques villas existent à l’Hivernage, à Targa ou à Agdal, sur des parcelles plus petites mais à quelques minutes des commerces.",
        ],
      },
      {
        heading: "Ce qu’il faut regarder lors de la visite",
        paragraphs: [
          "Au-delà du coup de cœur, vérifiez la situation juridique (titre foncier, surface du terrain, conformité des constructions au permis), l’accès en voiture toute l’année, la source d’eau (réseau ou puits) et l’état de la piscine et des installations électriques.",
          "Pensez aussi aux coûts d’entretien : jardin, piscine, gardiennage. Pour une grande propriété, ce budget annuel compte autant que le prix d’achat. Nous vous transmettons les informations connues du propriétaire et vous aidons à poser les bonnes questions.",
        ],
      },
      {
        heading: "Acheter pour y vivre ou pour louer",
        paragraphs: [
          "Beaucoup d’acheteurs combinent les deux : la villa est occupée une partie de l’année et louée le reste du temps. Certaines villas de notre catalogue sont d’ailleurs proposées à la fois à la vente et en location. Si vous envisagez la location saisonnière, renseignez-vous sur les autorisations et la fiscalité applicables avant d’acheter.",
        ],
      },
    ],
    faq: [
      { q: "Dans quel quartier acheter une villa à Marrakech ?", a: "La Palmeraie et la route de Fès pour les grandes propriétés au calme, la route de l’Ourika et la route d’Amizmiz pour les villas récentes avec vue sur l’Atlas, l’Hivernage ou Agdal pour être proche du centre." },
      { q: "Les villas sont-elles vendues meublées ?", a: "Cela dépend du propriétaire. Certaines villas sont vendues meublées et équipées, d’autres vides ; c’est indiqué sur chaque fiche ou précisé à la demande." },
      { q: "Quels documents vérifier avant d’acheter une villa ?", a: "Le certificat de propriété du titre foncier, le plan cadastral, le permis de construire et le permis d’habiter, ainsi que l’absence d’hypothèque. Votre notaire contrôle ces pièces avant la signature." },
      { q: "Peut-on louer sa villa quand on ne l’occupe pas ?", a: "Oui, la location longue durée est la plus simple à mettre en place. Pour la location saisonnière, des autorisations et une déclaration des revenus sont nécessaires : renseignez-vous avant l’achat." },
      { q: "Comment visiter une villa depuis l’étranger ?", a: "Nous organisons une visite vidéo en direct sur WhatsApp et vous envoyons les documents disponibles, puis une visite sur place lors de votre séjour." },
    ],
    areas: ["Palmeraie", "Route de Fes", "Route de l'Ourika", "Route d'Amizmiz", "Hivernage", "Targa", "Agdal"],
  },

  "vente-appartements": {
    title: "Appartement à vendre à Marrakech",
    description: "Vous cherchez un appartement à acheter à Marrakech ? Décrivez votre budget et votre quartier : nous vous envoyons une sélection sur mesure.",
    eyebrow: "Vente · Appartements",
    h1: "Appartements à vendre à Marrakech",
    answer: "Les appartements à vendre à Marrakech se trouvent principalement à Guéliz, à l’Hivernage, à Agdal et dans des résidences sécurisées avec piscine en périphérie. Un étranger peut en règle générale acheter un appartement en pleine propriété.",
    sections: [
      {
        heading: "Les quartiers pour acheter un appartement",
        paragraphs: [
          "Guéliz, la ville nouvelle, concentre commerces, cafés, restaurants et services : c’est le choix de ceux qui veulent tout faire à pied. L’Hivernage, entre Guéliz et la médina, est plus résidentiel et plus haut de gamme, avec de nombreux hôtels et des immeubles récents.",
          "Agdal, au sud de la médina, et des quartiers comme Targa ou Chrifia offrent des résidences plus récentes, souvent fermées et gardiennées, avec piscine commune et parking. Les prix y sont généralement plus accessibles qu’au centre.",
        ],
      },
      {
        heading: "Neuf, sur plan ou ancien",
        paragraphs: [
          "Dans le neuf vendu sur plan (VEFA), le paiement est échelonné selon l’avancement des travaux. Vérifiez la réputation du promoteur, les garanties prévues au contrat et la date de livraison. Dans l’ancien, regardez l’état de l’immeuble, le montant des charges de copropriété et le règlement de la résidence.",
          "Dans tous les cas, demandez le titre foncier de l’appartement (chaque lot a normalement son propre titre) et la situation du syndic. Votre notaire vérifie ces éléments avant l’acte définitif.",
        ],
      },
      {
        heading: "Habiter ou investir",
        paragraphs: [
          "Un appartement bien placé se loue facilement à l’année, à des actifs, des étudiants ou des expatriés. C’est souvent l’investissement le plus simple à gérer à distance. Nous pouvons aussi vous accompagner pour la mise en location une fois l’achat réalisé.",
        ],
      },
    ],
    faq: [
      { q: "Quel est le meilleur quartier pour acheter un appartement à Marrakech ?", a: "Guéliz pour la vie de quartier et les commerces, l’Hivernage pour le standing et le calme, Agdal ou Targa pour des résidences récentes avec piscine à des prix souvent plus accessibles." },
      { q: "Un étranger peut-il acheter un appartement à Marrakech ?", a: "Oui, en règle générale un étranger peut acheter un appartement en pleine propriété, sans obligation de résidence. Le notaire vérifie le dossier avant la signature." },
      { q: "Qu’est-ce que la VEFA ?", a: "La vente en l’état futur d’achèvement est l’achat d’un logement sur plan. Le prix est payé par étapes selon l’avancement du chantier, et le contrat doit préciser les garanties et la date de livraison." },
      { q: "Faut-il prévoir des charges de copropriété ?", a: "Oui, la plupart des résidences ont un syndic qui gère l’entretien, la sécurité et la piscine. Demandez le montant annuel des charges avant de faire une offre." },
      { q: "Peut-on acheter un appartement pour le louer ?", a: "Oui. La location à l’année est la plus simple à gérer. Pour la location courte durée, renseignez-vous sur les autorisations et le règlement de la résidence, qui peut l’interdire." },
    ],
    areas: ["Gueliz", "Hivernage", "Agdal", "Targa", "Chrifia"],
  },

  "vente-riads": {
    title: "Riad à vendre à Marrakech avec piscine",
    description: "Riad à vendre à Marrakech avec piscine et patio. Titre foncier, accès, travaux : ce qu’il faut vérifier avant d’acheter un riad.",
    eyebrow: "Vente · Riads",
    h1: "Riads à vendre à Marrakech",
    answer: "Un riad est une maison traditionnelle marocaine organisée autour d’un patio intérieur, souvent avec un bassin ou une piscine. Avant d’acheter, vérifiez surtout que le riad dispose d’un titre foncier, puis regardez son accès en voiture et l’état de la structure.",
    sections: [
      {
        heading: "Vivre dans un riad",
        paragraphs: [
          "Derrière une façade discrète, le riad s’ouvre sur un patio planté, parfois avec une piscine, sur lequel donnent les pièces de vie et les chambres. Une terrasse sur le toit complète souvent la maison. C’est un mode de vie tourné vers l’intérieur, calme et intime.",
          "Visitez à différents moments de la journée pour juger de la lumière, du bruit et de l’accès, qui varient beaucoup d’un riad à l’autre.",
        ],
      },
      {
        heading: "Les points à vérifier avant d’acheter",
        paragraphs: [
          "Le statut juridique est essentiel. Certains biens anciens sont encore détenus sous forme de « melkia » (acte adoulaire traditionnel), sans titre foncier. Privilégiez un riad titré, ou faites mener la procédure d’immatriculation par votre notaire avant la vente.",
          "Regardez aussi l’accès en voiture, l’état de la structure, l’humidité et l’étanchéité de la terrasse. Les travaux sur ce type de bâti peuvent être soumis à autorisation : renseignez-vous avant d’acheter un riad à rénover.",
        ],
      },
      {
        heading: "Riad privé ou maison d’hôtes",
        paragraphs: [
          "Beaucoup de riads sont transformés en maisons d’hôtes. Si c’est votre projet, l’exploitation touristique demande des autorisations et un classement spécifiques : vérifiez si le riad en dispose déjà et ce qu’il faudrait pour les obtenir.",
        ],
      },
    ],
    faq: [
      { q: "Qu’est-ce qu’un riad ?", a: "Une maison traditionnelle marocaine construite autour d’un patio intérieur, souvent planté, avec des pièces qui s’ouvrent sur ce patio et une terrasse sur le toit." },
      { q: "Pourquoi le titre foncier est-il si important pour un riad ?", a: "Le titre foncier garantit la propriété et sa surface, inscrites à la Conservation foncière. Un bien sous simple « melkia » est plus risqué : il faut le faire immatriculer, ce qui prend du temps." },
      { q: "Un étranger peut-il acheter un riad ?", a: "Oui, en règle générale un étranger peut acheter un riad en pleine propriété. Le notaire vérifie le statut du bien et l’origine de propriété avant la signature." },
      { q: "Peut-on rénover un riad librement ?", a: "Pas toujours : les travaux peuvent être soumis à autorisation et doivent respecter le caractère du bâti. Renseignez-vous avant l’achat si le riad demande une rénovation." },
      { q: "Peut-on transformer un riad en maison d’hôtes ?", a: "C’est possible, mais l’activité touristique nécessite des autorisations et un classement. Vérifiez si le riad est déjà exploité légalement ou ce qu’il faudrait pour le devenir." },
    ],
    areas: [],
  },

  "vente-maisons": {
    title: "Maison à vendre à Marrakech",
    description: "Maisons à vendre à Marrakech et alentours, dont une demeure traditionnelle avec jardin à Ennakhil (Palmeraie). Visite sur place ou en vidéo.",
    eyebrow: "Vente · Maisons",
    h1: "Maisons à vendre à Marrakech",
    answer: "À Marrakech, les maisons à vendre sont des habitations individuelles plus simples ou plus compactes qu’une villa : maisons avec jardin en périphérie, comme dans la Palmeraie, ou maisons de ville dans les quartiers résidentiels.",
    sections: [
      {
        heading: "Maison ou villa : quelle différence ?",
        paragraphs: [
          "Le mot « villa » désigne en général une maison individuelle de standing, sur un terrain plus grand, souvent avec piscine. La « maison » regroupe des biens plus variés : maisons avec jardin sans piscine, maisons de ville sur deux ou trois niveaux, maisons dans des ensembles résidentiels.",
          "Pour un budget donné, une maison offre souvent plus de surface habitable qu’une villa dans le même secteur, avec des coûts d’entretien plus raisonnables.",
        ],
      },
      {
        heading: "Les points à vérifier",
        paragraphs: [
          "Comme pour tout achat : titre foncier, conformité des constructions au permis, absence d’hypothèque. Pour une maison avec jardin, regardez l’accès à l’eau et l’orientation ; pour une maison de ville, le voisinage et le stationnement.",
          "Si vous envisagez d’agrandir ou de construire une piscine, demandez d’abord ce que permet le règlement d’urbanisme du secteur.",
        ],
      },
    ],
    faq: [
      { q: "Quelle est la différence entre une maison et une villa à Marrakech ?", a: "La villa est en général plus grande, sur un terrain plus vaste et souvent avec piscine. La maison regroupe des biens individuels plus simples ou plus compacts, avec ou sans jardin." },
      { q: "Peut-on ajouter une piscine à une maison ?", a: "Souvent, mais cela dépend du terrain et du règlement d’urbanisme. Demandez une note de renseignements urbanistiques avant de prévoir des travaux." },
      { q: "Un étranger peut-il acheter une maison à Marrakech ?", a: "Oui, en règle générale, hors terres agricoles. Le notaire vérifie le statut du bien avant la signature." },
      { q: "Proposez-vous des maisons qui ne sont pas en ligne ?", a: "Oui, certains propriétaires préfèrent la discrétion. Décrivez votre recherche et nous vous envoyons les biens correspondants." },
    ],
    areas: ["Palmeraie", "Targa", "Agdal", "Route de l'Ourika"],
  },

  "vente-terrains": {
    title: "Terrain à vendre à Marrakech",
    description: "Acheter un terrain à Marrakech : note de renseignements, titre foncier, viabilisation. Décrivez votre projet, nous cherchons pour vous.",
    eyebrow: "Vente · Terrains",
    h1: "Terrains à vendre à Marrakech",
    answer: "Acheter un terrain à Marrakech permet de faire construire une villa sur mesure. Avant tout achat, demandez la note de renseignements urbanistiques à l’Agence urbaine pour savoir ce qui peut y être construit, et vérifiez le titre foncier. Les terres agricoles relèvent d’un régime particulier pour les acheteurs étrangers.",
    sections: [
      {
        heading: "Où trouver un terrain autour de Marrakech",
        paragraphs: [
          "Les grandes parcelles se trouvent en périphérie : Palmeraie, route de Fès, route de l’Ourika, route d’Amizmiz. Plus près de la ville, les lotissements proposent des lots déjà viabilisés, de taille plus modeste, avec des règles de construction précises.",
        ],
      },
      {
        heading: "Les vérifications indispensables",
        paragraphs: [
          "La note de renseignements urbanistiques, délivrée par l’Agence urbaine de Marrakech, indique la zone du terrain et ce qui y est autorisé : hauteur, surface constructible, recul, usage. Sans elle, impossible de savoir si votre projet est réalisable.",
          "Vérifiez aussi le titre foncier et le bornage, l’accès par une voie, et la viabilisation : eau, électricité, assainissement. Raccorder un terrain isolé peut coûter cher et prendre du temps.",
          "Pour un acheteur étranger, l’acquisition de terres à vocation agricole est encadrée : selon la situation du terrain, une attestation de vocation non agricole peut être nécessaire. Faites vérifier ce point par un notaire avant tout engagement.",
        ],
      },
      {
        heading: "Faire construire",
        paragraphs: [
          "Une fois le terrain acheté, le projet passe par un architecte et une demande de permis de construire. Comptez le temps des études et des autorisations dans votre calendrier. Nous pouvons vous mettre en relation avec des professionnels locaux.",
        ],
      },
    ],
    faq: [
      { q: "Qu’est-ce que la note de renseignements urbanistiques ?", a: "Un document délivré par l’Agence urbaine qui indique la zone d’un terrain et les règles de construction qui s’y appliquent. C’est la première pièce à demander avant d’acheter." },
      { q: "Un étranger peut-il acheter un terrain au Maroc ?", a: "Un terrain constructible en zone urbaine, oui en règle générale. Les terres agricoles sont soumises à un régime particulier pour les étrangers : un notaire doit vérifier chaque cas." },
      { q: "Qu’est-ce qu’un terrain viabilisé ?", a: "Un terrain raccordé ou raccordable aux réseaux : voirie, eau, électricité, assainissement. Un terrain non viabilisé coûte moins cher mais demande des travaux de raccordement." },
      { q: "Combien de temps pour obtenir un permis de construire ?", a: "Cela dépend du projet et de la commune. Prévoyez plusieurs mois entre les études de l’architecte et l’obtention du permis." },
    ],
    areas: ["Palmeraie", "Route de Fes", "Route de l'Ourika", "Route d'Amizmiz"],
  },

  location: {
    title: "Location longue durée Marrakech : villas & appartements",
    description: "Villas et appartements à louer à l’année à Marrakech, meublés ou vides : bail d’1 an, loyer mensuel affiché, visite sur place ou en vidéo.",
    eyebrow: "Louer à l’année",
    h1: "Location longue durée à Marrakech",
    answer: "Live In Marrakech loue à l’année des villas et des appartements à Marrakech et dans ses environs, meublés ou vides, pour les expatriés, les familles, les retraités, les personnes en télétravail et les résidents marocains ou MRE. Le bail est d’un an minimum, le loyer est affiché par mois sur chaque annonce et un passeport ou une carte d’identité suffit pour louer. Vous pouvez visiter sur place ou en vidéo sur WhatsApp.",
    sections: [
      {
        heading: "Louer un appartement ou une villa",
        paragraphs: [
          "Les appartements se louent surtout à Guéliz, à l’Hivernage, à Agdal et dans des résidences sécurisées avec piscine. Ils conviennent aux actifs, aux couples et aux personnes qui veulent être proches des commerces.",
          "Les villas, souvent en périphérie, offrent jardin, piscine et calme : elles attirent les familles et ceux qui travaillent à distance. Comptez alors un véhicule pour les trajets quotidiens.",
        ],
      },
      {
        heading: "Comment se passe une location à l’année",
        paragraphs: [
          "Après la visite, un bail écrit est signé entre le propriétaire et le locataire ; les baux d’habitation sont encadrés par la loi n° 67-12. Le dépôt de garantie (un mois de loyer pour nos biens) et le premier loyer sont réglés à la signature.",
          "Préparez votre passeport ou votre pièce d’identité et des justificatifs de revenus. Un état des lieux, idéalement avec photos, est fait à l’entrée et à la sortie.",
        ],
      },
      {
        heading: "Meublé ou vide",
        paragraphs: [
          "La plupart des expatriés choisissent un logement meublé pour s’installer rapidement. Une location vide coûte souvent moins cher et convient à ceux qui restent plusieurs années avec leurs meubles. Chaque fiche précise les équipements ; demandez-nous la liste complète du mobilier si besoin.",
        ],
      },
    ],
    faq: [
      { q: "Quels documents faut-il pour louer à Marrakech ?", a: "Une pièce d’identité ou un passeport, et en général des justificatifs de revenus ou une garantie. Le propriétaire peut demander des pièces complémentaires." },
      { q: "Combien de caution faut-il prévoir ?", a: "Pour nos biens, le dépôt de garantie est d’un mois de loyer, meublé ou vide. Il est indiqué dans le bail." },
      { q: "Les charges sont-elles comprises dans le loyer ?", a: "Cela dépend du bien. En général l’eau, l’électricité et Internet sont à la charge du locataire ; les charges de résidence peuvent être incluses ou non. Chaque fiche ou le bail le précise." },
      { q: "Peut-on louer à distance avant d’arriver au Maroc ?", a: "Oui. Nous faisons une visite vidéo sur WhatsApp et préparons le bail ; la signature et l’état des lieux se font à votre arrivée." },
      { q: "Quelle est la durée d’un bail longue durée ?", a: "Le plus souvent un an renouvelable, mais d’autres durées peuvent être convenues avec le propriétaire." },
    ],
    areas: ["Gueliz", "Hivernage", "Agdal", "Palmeraie", "Targa", "Route de Fes", "Route de l'Ourika"],
  },

  "location-appartements": {
    title: "Appartement à louer à Marrakech à l’année, meublé ou vide",
    description: "Appartements à louer à l’année à Marrakech, à Chrifia ou au golf Prestigia : loyer mensuel affiché, bail d’1 an, pièce d’identité suffit.",
    eyebrow: "Location longue durée · Appartements",
    h1: "Appartements à louer à l’année à Marrakech",
    answer: "Live In Marrakech propose des appartements à louer à l’année à Marrakech, pour les expatriés, les couples, les personnes en télétravail et les résidents marocains ou MRE qui cherchent un logement simple à vivre au quotidien. Le bail est d’un an minimum, le loyer est affiché par mois et un passeport ou une carte d’identité suffit pour louer. Vous pouvez visiter sur place ou en vidéo sur WhatsApp.",
    sections: [
      {
        heading: "Dans quel quartier louer ?",
        paragraphs: [
          "Guéliz est le centre moderne : commerces, cafés, restaurants, salles de sport et services à pied. L’Hivernage est plus calme et plus résidentiel, à mi-chemin entre Guéliz et la médina. Agdal, plus au sud, propose des résidences récentes avec parking et piscine.",
          "Des quartiers comme Targa ou Chrifia offrent des loyers souvent plus doux, au prix de trajets un peu plus longs vers le centre. Les résidences fermées en périphérie séduisent les familles pour leurs espaces verts et leur gardiennage.",
        ],
      },
      {
        heading: "Appartement meublé à l’année",
        paragraphs: [
          "Un appartement meublé permet d’emménager avec une simple valise : cuisine équipée, literie, électroménager. C’est la solution la plus courante pour les expatriés et les personnes en mission de quelques mois à quelques années.",
          "Lors de la visite, faites l’inventaire du mobilier et de l’électroménager, vérifiez la climatisation et le chauffage (les nuits d’hiver sont fraîches à Marrakech) ainsi que la connexion Internet si vous travaillez à domicile.",
        ],
      },
      {
        heading: "Le bail et les frais",
        paragraphs: [
          "Le bail écrit précise le loyer, la durée, le dépôt de garantie et la répartition des charges. L’eau, l’électricité et Internet sont en général à la charge du locataire ; les charges de résidence (syndic, gardiennage, piscine) peuvent être incluses ou non dans le loyer.",
        ],
      },
    ],
    faq: [
      { q: "Quel quartier choisir pour louer un appartement à Marrakech ?", a: "Guéliz pour tout faire à pied, l’Hivernage pour le calme et le standing, Agdal pour des résidences récentes avec piscine, Targa ou Chrifia pour des loyers souvent plus accessibles." },
      { q: "Peut-on louer un appartement meublé à l’année ?", a: "Oui, c’est la formule la plus fréquente pour les expatriés. La fiche de chaque bien indique ses équipements ; nous pouvons vous envoyer l’inventaire du mobilier." },
      { q: "Le loyer affiché comprend-il les charges ?", a: "Le loyer affiché est mensuel. Les charges de résidence peuvent être incluses ou non ; l’eau, l’électricité et Internet sont en général en plus. C’est précisé avant la signature du bail." },
      { q: "Faut-il une voiture si l’on habite à Guéliz ?", a: "Pas forcément : Guéliz et l’Hivernage se vivent bien à pied et en taxi. En périphérie, une voiture devient presque indispensable." },
      { q: "Combien de temps pour trouver un appartement ?", a: "Si un bien du catalogue vous convient, la visite peut se faire en quelques jours. Sinon, décrivez votre recherche et nous vous proposons une sélection." },
    ],
    areas: ["Gueliz", "Hivernage", "Agdal", "Targa", "Chrifia"],
  },

  "location-villas": {
    title: "Location villa Marrakech longue durée, avec piscine",
    description: "Villas avec piscine à louer à l’année à Marrakech, route de Fès et route de Sidi Rahal : loyer mensuel affiché et bail d’1 an minimum.",
    eyebrow: "Location longue durée · Villas",
    h1: "Villas à louer à l’année à Marrakech",
    answer: "Live In Marrakech loue à l’année des villas avec jardin et piscine autour de Marrakech, pour les familles, les retraités, les personnes en télétravail et les résidents marocains ou MRE qui cherchent de l’espace et du calme. Le bail est d’un an minimum, le loyer est affiché par mois et un passeport ou une carte d’identité suffit pour louer. Vous pouvez visiter sur place ou en vidéo sur WhatsApp.",
    sections: [
      {
        heading: "Où louer une villa à Marrakech ?",
        paragraphs: [
          "La Palmeraie combine grands jardins, calme et proximité de la ville. La route de Fès propose de vastes propriétés, parfois sur plusieurs hectares. Au sud, la route de l’Ourika et la route d’Amizmiz offrent des villas récentes avec vue sur l’Atlas.",
          "Plus la villa est éloignée du centre, plus l’espace est généreux… et plus la voiture devient indispensable : pensez aux trajets vers l’école, le travail ou l’aéroport.",
        ],
      },
      {
        heading: "Ce que comprend la location d’une villa",
        paragraphs: [
          "Selon les propriétés, l’entretien du jardin et de la piscine, le gardiennage ou le personnel de maison peuvent être inclus dans le loyer ou à votre charge. Faites-le préciser dans le bail, tout comme la répartition des factures d’eau et d’électricité, qui peuvent être importantes avec une piscine.",
          "Vérifiez aussi le chauffage pour l’hiver, la climatisation pour l’été et la qualité de la connexion Internet si vous travaillez depuis la maison.",
        ],
      },
      {
        heading: "Pour qui ?",
        paragraphs: [
          "Familles qui s’installent, retraités, entrepreneurs et personnes en télétravail : la villa à l’année offre une qualité de vie difficile à trouver en appartement. Certaines villas de notre catalogue sont aussi à vendre, si vous envisagez d’acheter plus tard.",
        ],
      },
    ],
    faq: [
      { q: "Dans quel quartier louer une villa à l’année ?", a: "La Palmeraie pour le calme proche de la ville, la route de Fès pour les grandes propriétés, la route de l’Ourika et la route d’Amizmiz pour les villas récentes avec vue sur l’Atlas." },
      { q: "L’entretien de la piscine et du jardin est-il inclus ?", a: "Cela dépend de la villa. Il peut être compris dans le loyer ou à la charge du locataire : c’est précisé dans le bail." },
      { q: "Les villas sont-elles louées meublées ?", a: "La plupart le sont, mais certaines peuvent être louées vides. L’information figure sur la fiche ou nous la précisons à la demande." },
      { q: "Faut-il une voiture ?", a: "Oui, pour la plupart des villas en périphérie. Les trajets vers le centre prennent souvent de 15 à 30 minutes selon le secteur et la circulation." },
      { q: "Peut-on louer une villa puis l’acheter ?", a: "C’est parfois possible quand le propriétaire envisage de vendre. Certaines villas de notre catalogue sont proposées à la fois à la location et à la vente." },
    ],
    areas: ["Palmeraie", "Route de Fes", "Route de l'Ourika", "Route d'Amizmiz", "Targa"],
  },
};

export default copy;
