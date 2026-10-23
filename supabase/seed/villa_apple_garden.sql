-- Généré par .claude/skills/publier-bien/make-sql.mjs : coller dans Supabase → SQL Editor → Run.

-- Prépare les colonnes une seule fois (sans effet si elles existent déjà).

ALTER TABLE public.properties_v2
  ADD COLUMN IF NOT EXISTS titre_en TEXT, ADD COLUMN IF NOT EXISTS titre_es TEXT,
  ADD COLUMN IF NOT EXISTS description_courte_en TEXT, ADD COLUMN IF NOT EXISTS description_courte_es TEXT,
  ADD COLUMN IF NOT EXISTS description_longue_en TEXT, ADD COLUMN IF NOT EXISTS description_longue_es TEXT,
  ADD COLUMN IF NOT EXISTS traduction_a_relire BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS meuble BOOLEAN;

-- Villa Apple Garden avec piscine chauffée sans vis-à-vis (DP-26-APPLG)
INSERT INTO public.properties_v2 (id, titre, type, service, services, prix_vente, prix_location_longue, prix_location_courte, devise, surface_habitable, surface_terrain, chambres, salles_de_bain, quartier, meuble, description_courte, description_longue, titre_en, titre_es, description_courte_en, description_courte_es, description_longue_en, description_longue_es, traduction_a_relire, equipements, proximites, photos, photo_principale, statut, disponible_le, reference, created_at)
VALUES ('f15fbf1e-43b1-407d-a275-273457382ae1', $q$Villa Apple Garden avec piscine chauffée sans vis-à-vis$q$, $q$villa$q$, $q$location-longue-duree$q$, ARRAY[$q$location-longue-duree$q$]::text[], NULL, 22000, NULL, $q$MAD$q$, NULL, 1060, 3, 3, $q$Route de Fes$q$, true, $q$Villa meublée avec piscine privée chauffée, sans vis-à-vis, dans la résidence fermée Apple Garden, route de Fès : 3 chambres, 3 salles de bain, terrain de 1 060 m². 22 000 DH/mois.$q$, $q$Villa meublée à louer à l’année dans la résidence fermée et sécurisée Apple Garden, sur la route de Fès, à environ 17 km de Marrakech (25 minutes du centre-ville). Loyer : 22 000 DH par mois.

La villa
• Terrain de 1 060 m²
• 3 chambres confortables
• 3 salles de bain
• Grand salon élégant et lumineux, avec cheminée
• Cuisine entièrement équipée
• Entièrement meublée

L’extérieur
• Piscine privée chauffée, sans vis-à-vis
• Grand jardin arboré

La résidence
Résidence fermée et sécurisée, dans un environnement calme, au km 17 de la route de Fès.

Conditions
• Bail d’un an minimum
• Caution : 2 mois de loyer (44 000 DH, logement meublé)
• Document demandé : passeport ou carte d’identité

Une très belle villa pour une famille qui cherche espace, confort, sécurité et tranquillité, tout en restant proche de Marrakech. Visite sur place ou en vidéo sur WhatsApp.$q$, $q$Villa with heated pool, no overlooking, Apple Garden – Fès road$q$, $q$Villa con piscina climatizada sin vecinos a la vista, Apple Garden – carretera de Fez$q$, $q$Furnished villa with a private heated pool and no overlooking neighbours in the gated Apple Garden residence, Fès road: 3 bedrooms, 3 bathrooms, 1,060 m² plot. 22,000 MAD/month.$q$, $q$Villa amueblada con piscina privada climatizada y sin vecinos a la vista en la urbanización cerrada Apple Garden, carretera de Fez: 3 dormitorios, 3 baños, parcela de 1.060 m². 22.000 MAD/mes.$q$, $q$Furnished villa for long-term rent in the gated and secure Apple Garden residence, on the Fès road, about 17 km from Marrakech (25 minutes from the city centre). Rent: 22,000 MAD per month.

The villa
• 1,060 m² plot
• 3 comfortable bedrooms
• 3 bathrooms
• Large, elegant and bright living room with fireplace
• Fully equipped kitchen
• Fully furnished

Outside
• Private heated pool with no overlooking neighbours
• Large garden with trees

The residence
A gated and secure residence in a quiet setting, at km 17 on the Fès road.

Terms
• One-year minimum lease
• Deposit: two months’ rent (44,000 MAD, furnished home)
• Document required: passport or national ID card

A beautiful villa for a family looking for space, comfort, security and peace, while staying close to Marrakech. In-person or video viewings on WhatsApp.$q$, $q$Villa amueblada en alquiler de larga duración en la urbanización cerrada y segura Apple Garden, en la carretera de Fez, a unos 17 km de Marrakech (25 minutos del centro). Alquiler: 22.000 MAD al mes.

La villa
• Parcela de 1.060 m²
• 3 dormitorios cómodos
• 3 baños
• Gran salón elegante y luminoso, con chimenea
• Cocina totalmente equipada
• Totalmente amueblada

El exterior
• Piscina privada climatizada, sin vecinos a la vista
• Gran jardín arbolado

La urbanización
Urbanización cerrada y segura, en un entorno tranquilo, en el km 17 de la carretera de Fez.

Condiciones
• Contrato de un año como mínimo
• Fianza: 2 meses de alquiler (44.000 MAD, vivienda amueblada)
• Documento necesario: pasaporte o documento de identidad

Una villa preciosa para una familia que busca espacio, comodidad, seguridad y tranquilidad, cerca de Marrakech. Visita presencial o por vídeo en WhatsApp.$q$, false, ARRAY[$q$Piscine$q$, $q$Jardin$q$, $q$Cheminée$q$, $q$Cuisine équipée$q$, $q$Gardiennage 24/7$q$, $q$Meublé$q$]::text[], $q$[{"time":"17 km","place":"Marrakech"},{"time":"25 min","place":"Centre-ville"}]$q$::jsonb, ARRAY[$q$properties/vf7tf2izbafvflu50v9f$q$, $q$properties/g5nfuunam7qtrmgjdygm$q$, $q$properties/hgfo7cembqibmp6kug9r$q$, $q$properties/q7f1yirvkhiwuhz5xxjd$q$, $q$properties/tdzlufork6f6zdllrfka$q$, $q$properties/xsyxyo5g9iysrz5tx8ty$q$, $q$properties/wkn5xepsc11nkdgggs2f$q$, $q$properties/prsgxcegaqf0kjdevu3x$q$, $q$properties/lfmrwqcmeqdf7aadza5b$q$]::text[], $q$properties/vf7tf2izbafvflu50v9f$q$, $q$publie$q$, NULL, $q$DP-26-APPLG$q$, now())
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
