-- Généré par .claude/skills/publier-bien/make-sql.mjs : coller dans Supabase → SQL Editor → Run.

-- Prépare les colonnes une seule fois (sans effet si elles existent déjà).

ALTER TABLE public.properties_v2
  ADD COLUMN IF NOT EXISTS titre_en TEXT, ADD COLUMN IF NOT EXISTS titre_es TEXT,
  ADD COLUMN IF NOT EXISTS description_courte_en TEXT, ADD COLUMN IF NOT EXISTS description_courte_es TEXT,
  ADD COLUMN IF NOT EXISTS description_longue_en TEXT, ADD COLUMN IF NOT EXISTS description_longue_es TEXT,
  ADD COLUMN IF NOT EXISTS traduction_a_relire BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS meuble BOOLEAN;

-- Recrée le bien pour lui donner l'adresse /bien/villa-rahal-route-de-fes
-- (l'adresse d'un bien est fixée à sa création ; sans effet si le bien n'existe pas encore).
DELETE FROM public.properties_v2 WHERE id = '30dbd6c1-162b-409d-875d-5a2832dcf4cb';

-- Villa Rahal Route de Fès (DP-26-RAHAL)
INSERT INTO public.properties_v2 (id, titre, type, service, services, prix_vente, prix_location_longue, prix_location_courte, devise, surface_habitable, surface_terrain, chambres, salles_de_bain, quartier, meuble, description_courte, description_longue, titre_en, titre_es, description_courte_en, description_courte_es, description_longue_en, description_longue_es, traduction_a_relire, equipements, proximites, photos, photo_principale, statut, disponible_le, reference, created_at)
VALUES ('30dbd6c1-162b-409d-875d-5a2832dcf4cb', $q$Villa Rahal Route de Fès$q$, $q$villa$q$, $q$vente$q$, ARRAY[$q$vente$q$]::text[], 1700000, NULL, NULL, $q$MAD$q$, 200, 1000, 3, 2, $q$Route de Fes$q$, NULL, $q$Villa à vendre sur la route de Fès, à 15 km de Marrakech : 3 chambres, 2 salles de bain, grand salon, jardin arboré de 1 000 m² avec oliviers et trou de piscine déjà creusé. Prix : 1 700 000 DH, négociable.$q$, $q$La villa (200 m²)
• 3 chambres
• 2 salles de bain
• Grand salon et plusieurs espaces salon
• Pièces lumineuses
• Style marocain simple et chaleureux
• Cour intérieure

L’extérieur (1 000 m²)
• Grand jardin arboré, planté de plusieurs oliviers
• Trou de piscine déjà creusé : vous réalisez la piscine comme vous le souhaitez
• De belles possibilités d’aménagement

Emplacement
Sur la route de Fès, à 15 km de Marrakech par une route goudronnée, puis 300 m de piste. Un environnement calme et verdoyant.

Situation juridique
• Melkiya adoulaire (ملكية عدلية)
• Titrage foncier en cours
• Pas de VNA (attestation de vocation non agricole)
• Pour tout point juridique, le notaire vous renseignera avant la signature

Conditions de vente
• Prix : 1 700 000 DH, négociable
• Visite sur place ou en vidéo sur WhatsApp

Une belle opportunité d’investissement
• Une fois la piscine terminée, ce sera une très belle maison
• Plutôt que d’acheter une villa à plus de 4 000 000 DH, vous achetez celle-ci à 1 700 000 DH et faites vos travaux tranquillement, à votre rythme
• Idéale pour une résidence principale, une maison secondaire ou un projet d’investissement$q$, $q$Villa Rahal, Fez Road$q$, $q$Villa Rahal, carretera de Fez$q$, $q$Villa for sale on the Fez road, 15 km from Marrakech: 3 bedrooms, 2 bathrooms, large living room, 1,000 m² garden with olive trees and a pool already dug. Price: 1,700,000 MAD, negotiable.$q$, $q$Villa en venta en la carretera de Fez, a 15 km de Marrakech: 3 dormitorios, 2 baños, gran salón, jardín de 1.000 m² con olivos y vaso de piscina ya excavado. Precio: 1.700.000 MAD, negociable.$q$, $q$The villa (200 m²)
• 3 bedrooms
• 2 bathrooms
• Large living room and several sitting areas
• Bright rooms
• Simple, warm Moroccan style
• Inner courtyard

Outside (1,000 m²)
• Large garden with trees, including several olive trees
• Pool already dug: finish it exactly the way you want
• Plenty of room for further landscaping

Location
On the Fez road, 15 km from Marrakech on a paved road, then 300 m of dirt track. A quiet, green setting.

Legal status
• Melkiya adoulaire (ملكية عدلية), a traditional deed drawn up by adouls
• Land title (titre foncier) registration in progress
• No VNA (certificate of non-agricultural use)
• For any legal question, the notary will advise you before signing

Sale terms
• Price: 1,700,000 MAD, negotiable
• Viewing on site or by video on WhatsApp

A great investment opportunity
• Once the pool is finished, it will be a very beautiful home
• Rather than buying a villa for more than 4,000,000 MAD, buy this one for 1,700,000 MAD and do the work calmly, at your own pace
• Ideal as a main residence, a second home or an investment project$q$, $q$La villa (200 m²)
• 3 dormitorios
• 2 baños
• Gran salón y varias zonas de estar
• Estancias luminosas
• Estilo marroquí sencillo y acogedor
• Patio interior

El exterior (1.000 m²)
• Gran jardín arbolado, con varios olivos
• Vaso de piscina ya excavado: termine la piscina a su gusto
• Amplias posibilidades de acondicionamiento

Ubicación
En la carretera de Fez, a 15 km de Marrakech por carretera asfaltada y luego 300 m de pista. Un entorno tranquilo y verde.

Situación jurídica
• Melkiya adoulaire (ملكية عدلية), escritura tradicional redactada por adules
• Título de propiedad (titre foncier) en trámite
• Sin VNA (certificado de uso no agrícola)
• Para cualquier cuestión jurídica, el notario le informará antes de la firma

Condiciones de venta
• Precio: 1.700.000 MAD, negociable
• Visita in situ o por vídeo en WhatsApp

Una buena oportunidad de inversión
• Una vez terminada la piscina, será una casa muy bonita
• En lugar de comprar una villa por más de 4.000.000 MAD, compre esta por 1.700.000 MAD y haga las obras con calma, a su ritmo
• Ideal como residencia principal, segunda residencia o proyecto de inversión$q$, false, ARRAY[$q$Jardin$q$]::text[], $q$[{"time":"15 km","place":"Marrakech (centre)"}]$q$::jsonb, ARRAY[$q$properties/w65fhhdrigqvxqj7xsww$q$, $q$properties/e0bdzamedvv92lryq1qs$q$, $q$properties/fi4tjsdbxca8tzxw55up$q$, $q$properties/n4me9v4rfcde8sylvtb1$q$]::text[], $q$properties/w65fhhdrigqvxqj7xsww$q$, $q$publie$q$, NULL, $q$DP-26-RAHAL$q$, now())
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
