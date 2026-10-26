-- Généré par .claude/skills/publier-bien/make-sql.mjs : coller dans Supabase → SQL Editor → Run.

-- Prépare les colonnes une seule fois (sans effet si elles existent déjà).

ALTER TABLE public.properties_v2
  ADD COLUMN IF NOT EXISTS titre_en TEXT, ADD COLUMN IF NOT EXISTS titre_es TEXT,
  ADD COLUMN IF NOT EXISTS description_courte_en TEXT, ADD COLUMN IF NOT EXISTS description_courte_es TEXT,
  ADD COLUMN IF NOT EXISTS description_longue_en TEXT, ADD COLUMN IF NOT EXISTS description_longue_es TEXT,
  ADD COLUMN IF NOT EXISTS traduction_a_relire BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS meuble BOOLEAN;

-- Villa Oliviers Route de Fès (DP-26-OLIVF)
INSERT INTO public.properties_v2 (id, titre, type, service, services, prix_vente, prix_location_longue, prix_location_courte, devise, surface_habitable, surface_terrain, chambres, salles_de_bain, quartier, meuble, description_courte, description_longue, titre_en, titre_es, description_courte_en, description_courte_es, description_longue_en, description_longue_es, traduction_a_relire, equipements, proximites, photos, photo_principale, statut, disponible_le, reference, created_at)
VALUES ('30dbd6c1-162b-409d-875d-5a2832dcf4cb', $q$Villa Oliviers Route de Fès$q$, $q$villa$q$, $q$vente$q$, ARRAY[$q$vente$q$]::text[], 1700000, NULL, NULL, $q$MAD$q$, 200, 1000, NULL, NULL, $q$Route de Fes$q$, NULL, $q$Villa à vendre sur la route de Fès à Marrakech : 200 m² habitables sur un terrain de 1 000 m², grand jardin arboré planté d’oliviers, dans un environnement calme et verdoyant. Prix : 1 700 000 DH.$q$, $q$La villa (200 m²)
• Pièces lumineuses
• Plusieurs espaces salon
• Style marocain simple et chaleureux
• Cour intérieure

L’extérieur (1 000 m²)
• Grand jardin arboré, planté de plusieurs oliviers
• Beaux espaces extérieurs
• De belles possibilités d’aménagement

Emplacement
Sur la route de Fès à Marrakech, dans un environnement calme et verdoyant.

Situation juridique
• Melkiya adliya (ملكية عدلية)
• Titre foncier en cours de procédure
• Pour tout point juridique, le notaire vous renseignera avant la signature

Conditions de vente
• Prix : 1 700 000 DH
• Visite sur place ou en vidéo sur WhatsApp

Une maison au calme avec un vrai jardin, pour une résidence principale, une maison secondaire ou un projet d’investissement.$q$, $q$Olive Tree Villa, Fez Road$q$, $q$Villa de los Olivos, carretera de Fez$q$, $q$Villa for sale on the Fez road in Marrakech: 200 m² of living space on a 1,000 m² plot, large garden planted with olive trees, in a quiet, green setting. Price: 1,700,000 MAD.$q$, $q$Villa en venta en la carretera de Fez, Marrakech: 200 m² habitables en una parcela de 1.000 m², gran jardín con olivos, en un entorno tranquilo y verde. Precio: 1.700.000 MAD.$q$, $q$The villa (200 m²)
• Bright rooms
• Several living areas
• Simple, warm Moroccan style
• Inner courtyard

Outside (1,000 m²)
• Large garden with trees, including several olive trees
• Pleasant outdoor spaces
• Plenty of room for further landscaping

Location
On the Fez road in Marrakech, in a quiet, green setting.

Legal status
• Melkiya adliya (ملكية عدلية), a traditional deed of ownership
• Land title (titre foncier) application in progress
• For any legal question, the notary will advise you before signing

Sale terms
• Price: 1,700,000 MAD
• Viewing on site or by video on WhatsApp

A quiet home with a real garden, as a main residence, a second home or an investment project.$q$, $q$La villa (200 m²)
• Estancias luminosas
• Varios salones
• Estilo marroquí sencillo y acogedor
• Patio interior

El exterior (1.000 m²)
• Gran jardín arbolado, con varios olivos
• Agradables espacios exteriores
• Amplias posibilidades de acondicionamiento

Ubicación
En la carretera de Fez, Marrakech, en un entorno tranquilo y verde.

Situación jurídica
• Melkiya adliya (ملكية عدلية), escritura tradicional de propiedad
• Título de propiedad (titre foncier) en trámite
• Para cualquier cuestión jurídica, el notario le informará antes de la firma

Condiciones de venta
• Precio: 1.700.000 MAD
• Visita in situ o por vídeo en WhatsApp

Una casa tranquila con un verdadero jardín, para residencia principal, segunda residencia o proyecto de inversión.$q$, false, ARRAY[$q$Jardin$q$]::text[], $q$[]$q$::jsonb, ARRAY[$q$properties/w65fhhdrigqvxqj7xsww$q$, $q$properties/e0bdzamedvv92lryq1qs$q$, $q$properties/fi4tjsdbxca8tzxw55up$q$, $q$properties/n4me9v4rfcde8sylvtb1$q$]::text[], $q$properties/w65fhhdrigqvxqj7xsww$q$, $q$publie$q$, NULL, $q$DP-26-OLIVF$q$, now())
ON CONFLICT (id) DO UPDATE SET
    titre = EXCLUDED.titre,
    type = EXCLUDED.type,
    service = EXCLUDED.service,
    services = EXCLUDED.services,
    prix_vente = EXCLUDED.prix_vente,
    prix_location_longue = EXCLUDED.prix_location_longue,
    prix_location_courte = EXCLUDED.prix_location_courte,
    devise = EXCLUDED.devise,
    surface_habitable = EXCLUDED.surface_habitable,
    surface_terrain = EXCLUDED.surface_terrain,
    chambres = EXCLUDED.chambres,
    salles_de_bain = EXCLUDED.salles_de_bain,
    quartier = EXCLUDED.quartier,
    meuble = EXCLUDED.meuble,
    description_courte = EXCLUDED.description_courte,
    description_longue = EXCLUDED.description_longue,
    titre_en = EXCLUDED.titre_en,
    titre_es = EXCLUDED.titre_es,
    description_courte_en = EXCLUDED.description_courte_en,
    description_courte_es = EXCLUDED.description_courte_es,
    description_longue_en = EXCLUDED.description_longue_en,
    description_longue_es = EXCLUDED.description_longue_es,
    traduction_a_relire = EXCLUDED.traduction_a_relire,
    equipements = EXCLUDED.equipements,
    proximites = EXCLUDED.proximites,
    photos = EXCLUDED.photos,
    photo_principale = EXCLUDED.photo_principale,
    statut = EXCLUDED.statut,
    disponible_le = EXCLUDED.disponible_le,
    reference = EXCLUDED.reference;

NOTIFY pgrst, 'reload schema';
