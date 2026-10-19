-- Généré par .claude/skills/publier-bien/make-sql.mjs : coller dans Supabase → SQL Editor → Run.

-- Prépare les colonnes une seule fois (sans effet si elles existent déjà).

ALTER TABLE public.properties_v2
  ADD COLUMN IF NOT EXISTS titre_en TEXT, ADD COLUMN IF NOT EXISTS titre_es TEXT,
  ADD COLUMN IF NOT EXISTS description_courte_en TEXT, ADD COLUMN IF NOT EXISTS description_courte_es TEXT,
  ADD COLUMN IF NOT EXISTS description_longue_en TEXT, ADD COLUMN IF NOT EXISTS description_longue_es TEXT,
  ADD COLUMN IF NOT EXISTS traduction_a_relire BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS meuble BOOLEAN;

-- Villa Ourika Golf (DP-26-OURKA)
INSERT INTO public.properties_v2 (id, titre, type, service, services, prix_vente, prix_location_longue, prix_location_courte, devise, surface_habitable, surface_terrain, chambres, salles_de_bain, quartier, meuble, description_courte, description_longue, titre_en, titre_es, description_courte_en, description_courte_es, description_longue_en, description_longue_es, traduction_a_relire, equipements, proximites, photos, photo_principale, statut, disponible_le, reference, created_at)
VALUES ('3cbf78ee-ebd3-4874-b076-45a1dd493376', $q$Villa Ourika Golf$q$, $q$villa$q$, $q$location-longue-duree$q$, ARRAY[$q$location-longue-duree$q$]::text[], NULL, 26000, NULL, $q$MAD$q$, NULL, 500, 3, 2, $q$Route de l'Ourika$q$, true, $q$Villa moderne meublée avec piscine vue golf, route de l’Ourika à 11 km de Marrakech : suite parentale, 2 chambres, salon avec cheminée, climatisation partout. 26 000 DH/mois.$q$, $q$Villa moderne et meublée à louer à l’année dans une résidence calme et très bien entretenue, route de l’Ourika, à 11 km de Marrakech. Loyer : 26 000 DH par mois.

La villa
• Terrain de 500 m² avec la maison, le jardin et la piscine
• Climatisation dans toutes les pièces
• Entièrement meublée

Rez-de-chaussée
• Petit salon et grand salon avec cheminée
• Accès direct à l’espace piscine
• Cuisine
• Toilettes d’invités
• Chambre de personnel

Étage
• Grande suite parentale avec salle de bain, dressing, espace extérieur et vue sur le golf
• Deux chambres meublées avec placards
• Une salle de bain indépendante

L’extérieur
• Piscine avec vue sur le golf
• Jardin

Frais d’entrée
• 2 mois de caution (52 000 DH)
• 1 mois de loyer d’avance (26 000 DH)
• 1 mois de frais d’agence (26 000 DH)

Conditions
• Bail d’un an minimum
• Document demandé : passeport ou carte d’identité

Visite sur place ou en vidéo sur WhatsApp.$q$, $q$Furnished villa with pool and golf view, Ourika road$q$, $q$Villa amueblada con piscina y vistas al golf, carretera de Ourika$q$, $q$Modern furnished villa with a pool overlooking the golf course, Ourika road 11 km from Marrakech: master suite, 2 bedrooms, living room with fireplace, air conditioning throughout. 26,000 MAD/month.$q$, $q$Villa moderna amueblada con piscina y vistas al golf, carretera de Ourika a 11 km de Marrakech: suite principal, 2 dormitorios, salón con chimenea, aire acondicionado en toda la casa. 26.000 MAD/mes.$q$, $q$Modern furnished villa for long-term rent in a quiet, very well-kept residence on the Ourika road, 11 km from Marrakech. Rent: 26,000 MAD per month.

The villa
• 500 m² plot with the house, garden and pool
• Air conditioning in every room
• Fully furnished

Ground floor
• Small living room and large living room with fireplace
• Direct access to the pool area
• Kitchen
• Guest toilet
• Staff bedroom

Upstairs
• Large master suite with bathroom, dressing room, outdoor space and golf view
• Two furnished bedrooms with wardrobes
• A separate bathroom

Outside
• Pool with a view of the golf course
• Garden

Move-in costs
• Deposit: 2 months’ rent (52,000 MAD)
• 1 month’s rent in advance (26,000 MAD)
• Agency fee: 1 month’s rent (26,000 MAD)

Terms
• One-year minimum lease
• Document required: passport or national ID card

In-person or video viewings on WhatsApp.$q$, $q$Villa moderna y amueblada en alquiler de larga duración en una urbanización tranquila y muy bien cuidada, en la carretera de Ourika, a 11 km de Marrakech. Alquiler: 26.000 MAD al mes.

La villa
• Parcela de 500 m² con la casa, el jardín y la piscina
• Aire acondicionado en todas las estancias
• Totalmente amueblada

Planta baja
• Salón pequeño y gran salón con chimenea
• Acceso directo a la zona de la piscina
• Cocina
• Aseo de invitados
• Habitación de servicio

Planta alta
• Gran suite principal con baño, vestidor, espacio exterior y vistas al golf
• Dos dormitorios amueblados con armarios
• Un baño independiente

El exterior
• Piscina con vistas al campo de golf
• Jardín

Gastos de entrada
• Fianza: 2 meses de alquiler (52.000 MAD)
• 1 mes de alquiler por adelantado (26.000 MAD)
• Honorarios de agencia: 1 mes de alquiler (26.000 MAD)

Condiciones
• Contrato de un año como mínimo
• Documento necesario: pasaporte o documento de identidad

Visita presencial o por vídeo en WhatsApp.$q$, false, ARRAY[$q$Piscine$q$, $q$Jardin$q$, $q$Climatisation$q$, $q$Cheminée$q$, $q$Terrasse$q$, $q$Meublé$q$]::text[], $q$[{"time":"11 km","place":"Marrakech"}]$q$::jsonb, ARRAY[$q$properties/abamlzz3lrjd5i0g5ni1$q$, $q$properties/kpgfwixj3cctbwajhjdq$q$, $q$properties/a4dscs3bl32rakjjzqik$q$, $q$properties/gj4bjq0s1qex5xox8yuq$q$, $q$properties/tgvrl7vcurmjzl6vhsor$q$, $q$properties/s3x80n5bsg8qe081fwjq$q$, $q$properties/afg9ljvsiyjh7y9qsai7$q$, $q$properties/h3dcfdspazxfxejcjwtc$q$, $q$properties/pbhefbgxmvtu61xly27f$q$, $q$properties/lriynccnxrii4vmoy5c4$q$, $q$properties/cckd5epny9jrsg7rbfre$q$, $q$properties/zndbheg5eucmfqobqrta$q$]::text[], $q$properties/abamlzz3lrjd5i0g5ni1$q$, $q$publie$q$, NULL, $q$DP-26-OURKA$q$, now())
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
