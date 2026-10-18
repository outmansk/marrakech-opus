-- Généré par .claude/skills/publier-bien/make-sql.mjs : coller dans Supabase → SQL Editor → Run.

-- Prépare les colonnes une seule fois (sans effet si elles existent déjà).

ALTER TABLE public.properties_v2
  ADD COLUMN IF NOT EXISTS titre_en TEXT, ADD COLUMN IF NOT EXISTS titre_es TEXT,
  ADD COLUMN IF NOT EXISTS description_courte_en TEXT, ADD COLUMN IF NOT EXISTS description_courte_es TEXT,
  ADD COLUMN IF NOT EXISTS description_longue_en TEXT, ADD COLUMN IF NOT EXISTS description_longue_es TEXT,
  ADD COLUMN IF NOT EXISTS traduction_a_relire BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS meuble BOOLEAN;

-- Villa Machmam (DP-26-MCHMM)
INSERT INTO public.properties_v2 (id, titre, type, service, services, prix_vente, prix_location_longue, prix_location_courte, devise, surface_habitable, surface_terrain, chambres, salles_de_bain, quartier, meuble, description_courte, description_longue, titre_en, titre_es, description_courte_en, description_courte_es, description_longue_en, description_longue_es, traduction_a_relire, equipements, proximites, photos, photo_principale, statut, disponible_le, reference, created_at)
VALUES ('ccb89162-f950-4f65-b33b-2d1f7a551153', $q$Villa Machmam$q$, $q$villa$q$, $q$location-longue-duree$q$, ARRAY[$q$location-longue-duree$q$]::text[], NULL, 16000, NULL, $q$MAD$q$, 150, 800, 3, 3, $q$Route de Fes$q$, true, $q$Villa meublée de 3 suites à louer à l’année dans une résidence sécurisée de la route de Fès : piscine, jardin de 800 m², salon avec cheminée.$q$, $q$Villa meublée à louer à l’année (location longue durée), dans une résidence sécurisée 24 h/24 et 7 j/7 sur la route de Fès, à 18 km de Marrakech. Loyer : 16 000 DH par mois.

La villa (150 m²)
• 3 suites, chacune avec sa salle de bain
• Grand salon avec cheminée
• Cuisine équipée ouverte sur le salon
• Entièrement meublée

L’extérieur
• Piscine privée entourée de transats
• Jardin de 800 m² planté d’oliviers, de palmiers et de lauriers-roses
• Pergola avec salon et table à manger extérieurs

La résidence
La villa se trouve dans une résidence fermée et gardée jour et nuit, au calme, à l’écart de la ville.

Conditions
• Bail d’un an minimum
• Caution : 2 mois de loyer (logement meublé)
• Document demandé : passeport ou carte d’identité

Une villa prête à vivre pour une famille ou un couple qui cherche l’espace, une piscine et la sécurité d’une résidence, à 18 km de Marrakech. Visite sur place ou en vidéo sur WhatsApp.$q$, $q$Villa Machmam: Furnished 3-Suite Villa with Pool – Route de Fès$q$, $q$Villa Machmam: villa amueblada de 3 suites con piscina – carretera de Fez$q$, $q$Furnished villa with 3 en-suite bedrooms for long-term rent in a gated residence on the Route de Fès: pool, 800 m² garden, living room with fireplace.$q$, $q$Villa amueblada de 3 suites en alquiler de larga duración en una urbanización vigilada de la carretera de Fez: piscina, jardín de 800 m² y chimenea.$q$, $q$Furnished villa for long-term rent in a residence with security 24/7, on the Route de Fès, 18 km from Marrakech. Rent: 16,000 MAD per month.

The villa (150 m²)
• 3 suites, each with its own bathroom
• Large living room with fireplace
• Equipped kitchen open to the living room
• Fully furnished

Outside
• Private pool lined with sun loungers
• 800 m² garden with olive trees, palms and oleanders
• Pergola with an outdoor lounge and dining table

The residence
The villa stands in a gated residence guarded day and night, in a quiet setting away from the city.

Terms
• One-year minimum lease
• Deposit: two months’ rent (furnished home)
• Document required: passport or national ID card

A ready-to-live-in home for a family or a couple looking for space, a pool and the security of a gated residence, 18 km from Marrakech. In-person or video viewings on WhatsApp.$q$, $q$Villa amueblada en alquiler de larga duración, en una urbanización con vigilancia las 24 horas, en la carretera de Fez, a 18 km de Marrakech. Alquiler: 16.000 MAD al mes.

La villa (150 m²)
• 3 suites, cada una con su baño
• Gran salón con chimenea
• Cocina equipada abierta al salón
• Totalmente amueblada

El exterior
• Piscina privada rodeada de tumbonas
• Jardín de 800 m² con olivos, palmeras y adelfas
• Pérgola con salón y mesa de comedor exteriores

La urbanización
La villa se encuentra en una urbanización cerrada y vigilada día y noche, en un entorno tranquilo, lejos de la ciudad.

Condiciones
• Contrato de un año como mínimo
• Fianza: dos meses de alquiler (vivienda amueblada)
• Documento necesario: pasaporte o documento de identidad

Una casa lista para entrar a vivir, para una familia o una pareja que busca espacio, piscina y la seguridad de una urbanización, a 18 km de Marrakech. Visita en persona o por vídeo en WhatsApp.$q$, false, ARRAY[$q$Piscine$q$, $q$Jardin$q$, $q$Cheminée$q$, $q$Cuisine équipée$q$, $q$Gardiennage 24/7$q$, $q$Meublé$q$]::text[], $q$[]$q$::jsonb, ARRAY[$q$/biens/villa-machmam/piscine-jardin.webp$q$, $q$/biens/villa-machmam/salon.webp$q$, $q$/biens/villa-machmam/pergola-salon-exterieur.webp$q$, $q$/biens/villa-machmam/facade-jardin.webp$q$, $q$/biens/villa-machmam/suite.webp$q$, $q$/biens/villa-machmam/cuisine.webp$q$, $q$/biens/villa-machmam/salle-de-bain.webp$q$, $q$/biens/villa-machmam/jardin.webp$q$, $q$/biens/villa-machmam/transats-piscine.webp$q$]::text[], $q$/biens/villa-machmam/piscine-jardin.webp$q$, $q$vendu-loue$q$, NULL, $q$DP-26-MCHMM$q$, $q$2026-10-10T09:00:00+00:00$q$)
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

-- Riad d’hôtes Médina Touareg (DP-26-RDTRG)
INSERT INTO public.properties_v2 (id, titre, type, service, services, prix_vente, prix_location_longue, prix_location_courte, devise, surface_habitable, surface_terrain, chambres, salles_de_bain, quartier, meuble, description_courte, description_longue, titre_en, titre_es, description_courte_en, description_courte_es, description_longue_en, description_longue_es, traduction_a_relire, equipements, proximites, photos, photo_principale, statut, disponible_le, reference, created_at)
VALUES ('f0590681-c07d-4fdb-88b0-b480e958b40a', $q$Riad d’hôtes Médina Touareg$q$, $q$riad$q$, $q$vente$q$, ARRAY[$q$vente$q$]::text[], 5800000, NULL, NULL, $q$MAD$q$, NULL, 103, 5, 5, $q$Medina$q$, true, $q$Riad d’hôtes titré à vendre dans la médina, à 2 minutes de Jemaa el-Fna : 5 chambres avec salle de bain, piscine chauffée et jacuzzi, toit-terrasse. Rénové en 2023, vendu meublé.$q$, $q$Riad d’hôtes à vendre dans la médina de Marrakech, secteur Touareg, à 2 minutes à pied de Jemaa el-Fna. Titre foncier, autorisation de maison d’hôtes active, rénové en 2023 et vendu entièrement meublé et équipé : aucun travaux à prévoir. Prix : 5 800 000 DH.

Le riad (2 niveaux)
• 5 chambres climatisées avec salle de bain privative : 3 chambres triples et 2 chambres doubles
• Salon, salle de restauration et cuisine équipée
• Capacité d’accueil : jusqu’à 12 personnes
• Superficie au sol : 103 m²

Le patio et le toit
• Patio en zellige avec fontaine
• Piscine chauffée et jacuzzi
• Toit-terrasse aménagé avec solarium

Une maison d’hôtes en activité
L’établissement reçoit des clients aujourd’hui et il est noté 9,9/10 sur Booking. Rénové en 2023, il est vendu avec son mobilier et son équipement.

Accès
Au cœur de la médina, à 2 minutes à pied de Jemaa el-Fna. Le riad n’est pas accessible en voiture jusqu’à la porte, comme la plupart des riads de la médina.

Conditions de vente
• Prix : 5 800 000 DH
• Honoraires d’agence : 2,5 %
• Statut juridique : titre foncier
• Visite sur place ou en vidéo sur WhatsApp

Un riad prêt à l’emploi pour reprendre une maison d’hôtes à deux pas de Jemaa el-Fna, avec la sécurité d’un titre foncier.$q$, $q$Guesthouse riad for sale in the Marrakech medina$q$, $q$Riad de huéspedes en venta en la medina de Marrakech$q$, $q$Titled guesthouse riad for sale in the medina, 2 minutes from Jemaa el-Fna: 5 en-suite bedrooms, heated pool and jacuzzi, roof terrace. Renovated in 2023, sold furnished.$q$, $q$Riad de huéspedes con título en venta en la medina, a 2 minutos de Jemaa el-Fna: 5 habitaciones con baño, piscina climatizada y jacuzzi, azotea. Reformado en 2023, se vende amueblado.$q$, $q$Guesthouse riad for sale in the Marrakech medina, in the Touareg area, a 2-minute walk from Jemaa el-Fna. Land title, active guesthouse licence, renovated in 2023 and sold fully furnished and equipped: no work needed. Price: 5,800,000 MAD.

The riad (2 floors)
• 5 air-conditioned bedrooms with private bathrooms: 3 triple rooms and 2 double rooms
• Living room, dining room and equipped kitchen
• Sleeps up to 12 guests
• Footprint: 103 m²

The patio and the roof
• Zellige-tiled patio with a fountain
• Heated pool and jacuzzi
• Furnished roof terrace with a sun deck

A guesthouse in operation
The riad welcomes guests today and is rated 9.9/10 on Booking. Renovated in 2023, it is sold with its furniture and equipment.

Access
In the heart of the medina, a 2-minute walk from Jemaa el-Fna. Like most medina riads, it cannot be reached by car right to the door.

Terms of sale
• Price: 5,800,000 MAD
• Agency fee: 2.5%
• Legal status: land title
• In-person or video viewings on WhatsApp

A ready-to-run riad for anyone looking to take over a guesthouse steps from Jemaa el-Fna, with the security of a land title.$q$, $q$Riad de huéspedes en venta en la medina de Marrakech, en el sector Touareg, a 2 minutos a pie de Jemaa el-Fna. Título de propiedad, licencia de casa de huéspedes vigente, reformado en 2023 y vendido totalmente amueblado y equipado: sin obras previstas. Precio: 5.800.000 MAD.

El riad (2 plantas)
• 5 habitaciones con aire acondicionado y baño privado: 3 triples y 2 dobles
• Salón, comedor y cocina equipada
• Capacidad para 12 personas
• Superficie en planta: 103 m²

El patio y la azotea
• Patio de zellige con fuente
• Piscina climatizada y jacuzzi
• Azotea acondicionada con solárium

Una casa de huéspedes en actividad
El riad recibe clientes hoy y tiene una nota de 9,9/10 en Booking. Reformado en 2023, se vende con su mobiliario y su equipamiento.

Acceso
En el corazón de la medina, a 2 minutos a pie de Jemaa el-Fna. Como la mayoría de los riads de la medina, no se llega en coche hasta la puerta.

Condiciones de venta
• Precio: 5.800.000 MAD
• Honorarios de agencia: 2,5 %
• Situación jurídica: título de propiedad
• Visita en persona o por vídeo en WhatsApp

Un riad listo para funcionar para quien quiera retomar una casa de huéspedes a dos pasos de Jemaa el-Fna, con la seguridad de un título de propiedad.$q$, false, ARRAY[$q$Piscine$q$, $q$Climatisation$q$, $q$Cuisine équipée$q$, $q$Terrasse$q$, $q$Meublé$q$]::text[], $q$[]$q$::jsonb, ARRAY[$q$/biens/riad-medina-touareg/patio-vue-du-dessus.webp$q$, $q$/biens/riad-medina-touareg/piscine-interieure.webp$q$, $q$/biens/riad-medina-touareg/patio.webp$q$, $q$/biens/riad-medina-touareg/chambre-double.webp$q$, $q$/biens/riad-medina-touareg/chambre-triple.webp$q$, $q$/biens/riad-medina-touareg/chambre-triple-2.webp$q$]::text[], $q$/biens/riad-medina-touareg/patio-vue-du-dessus.webp$q$, $q$publie$q$, NULL, $q$DP-26-RDTRG$q$, $q$2026-10-10T15:00:00+00:00$q$)
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

-- Villa Bouzar (DP-26-BOUZR)
INSERT INTO public.properties_v2 (id, titre, type, service, services, prix_vente, prix_location_longue, prix_location_courte, devise, surface_habitable, surface_terrain, chambres, salles_de_bain, quartier, meuble, description_courte, description_longue, titre_en, titre_es, description_courte_en, description_courte_es, description_longue_en, description_longue_es, traduction_a_relire, equipements, proximites, photos, photo_principale, statut, disponible_le, reference, created_at)
VALUES ('5e990dd2-cd67-487b-a201-f0b46b7721e3', $q$Villa Bouzar$q$, $q$villa$q$, $q$vente$q$, ARRAY[$q$vente$q$]::text[], 5000000, NULL, NULL, $q$MAD$q$, 420, 2500, 5, 5, NULL, NULL, $q$Villa de 420 m² à vendre sur un terrain de 2 500 m² : 5 chambres avec salle de bain, piscine privée, jardin d’oliviers, cheminée. 5 000 000 DH non meublée, 5 300 000 DH meublée.$q$, $q$Villa à vendre à Marrakech sur un terrain de 2 500 m², avec 420 m² habitables, piscine privée et grand jardin planté d’oliviers et de palmiers. Prix : 5 000 000 DH non meublée, 5 300 000 DH meublée.

La villa (420 m²)
• 5 chambres avec salle de bain, télévision, placards et climatisation
• Salon et séjour avec cheminée
• Cuisine équipée
• Sols en marbre et grandes baies vitrées ouvertes sur la piscine
• Petite chambre pour le gardien

L’extérieur (2 500 m²)
• Piscine privée bordée de transats et de parasols
• Jardin arboré : oliviers, palmiers et pelouse
• Terrasse avec table à manger extérieure
• Balcon à l’étage avec vue sur la piscine et le jardin
• Parking privé

À proximité
• Boulangerie Josef : 3 km
• Palais Bleu : 6 km
• Atacadão : 12 km

Conditions de vente
• Non meublée : 5 000 000 DH
• Meublée : 5 300 000 DH
• Visite sur place ou en vidéo sur WhatsApp

Une grande villa familiale au calme, avec un vrai jardin et une piscine, pour vivre à l’année à Marrakech ou y recevoir famille et amis.$q$, $q$Villa Bouzar: 5-bedroom villa with pool for sale in Marrakech$q$, $q$Villa Bouzar: villa de 5 dormitorios con piscina en venta en Marrakech$q$, $q$420 m² villa for sale on a 2,500 m² plot: 5 bedrooms with bathroom, private pool, olive-tree garden, fireplace. 5,000,000 MAD unfurnished, 5,300,000 MAD furnished.$q$, $q$Villa de 420 m² en venta en una parcela de 2.500 m²: 5 dormitorios con baño, piscina privada, jardín con olivos y chimenea. 5.000.000 MAD sin amueblar, 5.300.000 MAD amueblada.$q$, $q$Villa for sale in Marrakech on a 2,500 m² plot, with 420 m² of living space, a private pool and a large garden planted with olive and palm trees. Price: 5,000,000 MAD unfurnished, 5,300,000 MAD furnished.

The villa (420 m²)
• 5 bedrooms with bathroom, TV, wardrobes and air conditioning
• Living and sitting room with a fireplace
• Equipped kitchen
• Marble floors and large glass doors opening onto the pool
• Small room for the caretaker

Outside (2,500 m²)
• Private pool with sun loungers and parasols
• Tree-lined garden: olive trees, palms and lawn
• Terrace with an outdoor dining table
• Upstairs balcony overlooking the pool and garden
• Private parking

Nearby
• Josef bakery: 3 km
• Palais Bleu: 6 km
• Atacadão hypermarket: 12 km

Terms of sale
• Unfurnished: 5,000,000 MAD
• Furnished: 5,300,000 MAD
• In-person or video viewings on WhatsApp

A large, quiet family villa with a real garden and a pool, to live in Marrakech all year round or to welcome family and friends.$q$, $q$Villa en venta en Marrakech en una parcela de 2.500 m², con 420 m² habitables, piscina privada y un gran jardín con olivos y palmeras. Precio: 5.000.000 MAD sin amueblar, 5.300.000 MAD amueblada.

La villa (420 m²)
• 5 dormitorios con baño, televisión, armarios y aire acondicionado
• Salón y sala de estar con chimenea
• Cocina equipada
• Suelos de mármol y grandes ventanales abiertos a la piscina
• Pequeña habitación para el guarda

El exterior (2.500 m²)
• Piscina privada con tumbonas y sombrillas
• Jardín arbolado: olivos, palmeras y césped
• Terraza con mesa de comedor exterior
• Balcón en la planta alta con vistas a la piscina y al jardín
• Aparcamiento privado

Cerca
• Panadería Josef: 3 km
• Palais Bleu: 6 km
• Hipermercado Atacadão: 12 km

Condiciones de venta
• Sin amueblar: 5.000.000 MAD
• Amueblada: 5.300.000 MAD
• Visita en persona o por vídeo en WhatsApp

Una gran villa familiar y tranquila, con un jardín de verdad y piscina, para vivir todo el año en Marrakech o recibir a familia y amigos.$q$, false, ARRAY[$q$Piscine$q$, $q$Jardin$q$, $q$Climatisation$q$, $q$Cuisine équipée$q$, $q$Cheminée$q$, $q$Parking$q$, $q$Terrasse$q$]::text[], $q$[{"time":"3 km","place":"Boulangerie Josef"},{"time":"6 km","place":"Palais Bleu"},{"time":"12 km","place":"Atacadão"}]$q$::jsonb, ARRAY[$q$/biens/villa-bouzar/piscine-villa.webp$q$, $q$/biens/villa-bouzar/salon-cheminee.webp$q$, $q$/biens/villa-bouzar/piscine-oliviers.webp$q$, $q$/biens/villa-bouzar/facade-entree.webp$q$, $q$/biens/villa-bouzar/chambre-1.webp$q$, $q$/biens/villa-bouzar/chambre-2.webp$q$, $q$/biens/villa-bouzar/vue-etage-piscine.webp$q$, $q$/biens/villa-bouzar/jardin.webp$q$, $q$/biens/villa-bouzar/entree.webp$q$]::text[], $q$/biens/villa-bouzar/piscine-villa.webp$q$, $q$publie$q$, NULL, $q$DP-26-BOUZR$q$, $q$2026-10-11T09:00:00+00:00$q$)
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

-- Villa Bensilam (DP-26-BNSLM)
INSERT INTO public.properties_v2 (id, titre, type, service, services, prix_vente, prix_location_longue, prix_location_courte, devise, surface_habitable, surface_terrain, chambres, salles_de_bain, quartier, meuble, description_courte, description_longue, titre_en, titre_es, description_courte_en, description_courte_es, description_longue_en, description_longue_es, traduction_a_relire, equipements, proximites, photos, photo_principale, statut, disponible_le, reference, created_at)
VALUES ('8e584940-602f-4e2f-8db2-b8cdc28e18c6', $q$Villa Bensilam$q$, $q$villa$q$, $q$vente$q$, ARRAY[$q$vente$q$]::text[], 6500000, NULL, NULL, $q$MAD$q$, 400, 3000, 5, 5, $q$Route de Fes$q$, true, $q$Villa de 400 m² à vendre sur un terrain de 3 000 m², route de Fès : 5 chambres, 5 salles de bain, piscine privée, grand jardin de palmiers et vue sur l’Atlas. Vendue meublée.$q$, $q$Villa à vendre sur la route de Fès, dans une résidence au calme à 16 km de Marrakech (environ 20 minutes). Construite sur un terrain de 3 000 m², elle offre 400 m² habitables, une piscine privée, un grand jardin arboré et une vue sur les montagnes de l’Atlas. Vendue meublée. Prix : 6 500 000 DH.

La villa (400 m²)
• 5 chambres et 5 salles de bain
• Grand salon lumineux, ouvert sur le jardin par de larges baies vitrées
• Cuisine équipée
• Cave
• Escalier en marbre
• Plusieurs terrasses et balcons, dont des chambres avec terrasse privée

L’extérieur (3 000 m²)
• Piscine privée
• Grand jardin arboré : palmiers, oliviers et pelouse
• Salon de jardin au bord de la piscine
• Parking privé
• Puits

Vue sur l’Atlas
Depuis les terrasses de l’étage, la vue s’ouvre sur le jardin et sur les montagnes de l’Atlas.

Emplacement
Dans une résidence sur la route de Fès, à 16 km de Marrakech, soit environ 20 minutes en voiture.

Conditions de vente
• Prix : 6 500 000 DH, vendue meublée
• Honoraires d’agence : 3 %
• Visite sur place ou en vidéo sur WhatsApp

Beaucoup d’espace, le calme et une vue sur les montagnes : une adresse pour une grande famille, ou pour un projet touristique.$q$, $q$Villa Bensilam: 5-bedroom villa for sale on the Fez road$q$, $q$Villa Bensilam: villa de 5 dormitorios en venta en la carretera de Fez$q$, $q$400 m² villa for sale on a 3,000 m² plot on the Fez road: 5 bedrooms, 5 bathrooms, private pool, large palm garden and Atlas mountain views. Sold furnished.$q$, $q$Villa de 400 m² en venta en una parcela de 3.000 m² en la carretera de Fez: 5 dormitorios, 5 baños, piscina privada, gran jardín con palmeras y vistas al Atlas. Se vende amueblada.$q$, $q$Villa for sale on the Fez road, in a quiet residence 16 km from Marrakech (about 20 minutes). Built on a 3,000 m² plot, it offers 400 m² of living space, a private pool, a large tree-lined garden and views of the Atlas mountains. Sold furnished. Price: 6,500,000 MAD.

The villa (400 m²)
• 5 bedrooms and 5 bathrooms
• Large, bright living room opening onto the garden through wide glass doors
• Equipped kitchen
• Cellar
• Marble staircase
• Several terraces and balconies, including bedrooms with a private terrace

Outside (3,000 m²)
• Private pool
• Large tree-lined garden: palms, olive trees and lawn
• Garden lounge by the pool
• Private parking
• Well

Atlas views
From the upstairs terraces, the view opens onto the garden and the Atlas mountains.

Location
In a residence on the Fez road, 16 km from Marrakech, about 20 minutes by car.

Terms of sale
• Price: 6,500,000 MAD, sold furnished
• Agency fee: 3%
• In-person or video viewings on WhatsApp

Plenty of space, peace and quiet and mountain views: a home for a large family, or for a tourism project.$q$, $q$Villa en venta en la carretera de Fez, en una urbanización tranquila a 16 km de Marrakech (unos 20 minutos). Construida en una parcela de 3.000 m², ofrece 400 m² habitables, piscina privada, un gran jardín arbolado y vistas a las montañas del Atlas. Se vende amueblada. Precio: 6.500.000 MAD.

La villa (400 m²)
• 5 dormitorios y 5 baños
• Gran salón luminoso, abierto al jardín con amplios ventanales
• Cocina equipada
• Bodega
• Escalera de mármol
• Varias terrazas y balcones, con dormitorios con terraza privada

El exterior (3.000 m²)
• Piscina privada
• Gran jardín arbolado: palmeras, olivos y césped
• Salón de jardín junto a la piscina
• Aparcamiento privado
• Pozo

Vistas al Atlas
Desde las terrazas de la planta alta, la vista se abre al jardín y a las montañas del Atlas.

Ubicación
En una urbanización de la carretera de Fez, a 16 km de Marrakech, unos 20 minutos en coche.

Condiciones de venta
• Precio: 6.500.000 MAD, se vende amueblada
• Honorarios de agencia: 3 %
• Visita en persona o por vídeo en WhatsApp

Mucho espacio, tranquilidad y vistas a la montaña: una casa para una familia numerosa o para un proyecto turístico.$q$, false, ARRAY[$q$Piscine$q$, $q$Jardin$q$, $q$Climatisation$q$, $q$Cuisine équipée$q$, $q$Parking$q$, $q$Terrasse$q$, $q$Meublé$q$]::text[], $q$[{"time":"16 km · 20 min","place":"Marrakech"}]$q$::jsonb, ARRAY[$q$/biens/villa-bensilam/facade-piscine.webp$q$, $q$/biens/villa-bensilam/piscine.webp$q$, $q$/biens/villa-bensilam/salon.webp$q$, $q$/biens/villa-bensilam/salon-2.webp$q$, $q$/biens/villa-bensilam/chambre-vue-atlas.webp$q$, $q$/biens/villa-bensilam/chambre-terrasse.webp$q$, $q$/biens/villa-bensilam/salon-de-jardin.webp$q$, $q$/biens/villa-bensilam/jardin-vue-atlas.webp$q$, $q$/biens/villa-bensilam/allee-palmiers.webp$q$, $q$/biens/villa-bensilam/escalier-marbre.webp$q$]::text[], $q$/biens/villa-bensilam/facade-piscine.webp$q$, $q$publie$q$, NULL, $q$DP-26-BNSLM$q$, $q$2026-10-12T09:00:00+00:00$q$)
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

-- Maison Route d’Essaouira (DP-26-ESSAO)
INSERT INTO public.properties_v2 (id, titre, type, service, services, prix_vente, prix_location_longue, prix_location_courte, devise, surface_habitable, surface_terrain, chambres, salles_de_bain, quartier, meuble, description_courte, description_longue, titre_en, titre_es, description_courte_en, description_courte_es, description_longue_en, description_longue_es, traduction_a_relire, equipements, proximites, photos, photo_principale, statut, disponible_le, reference, created_at)
VALUES ('5909c6c4-a5e9-4502-80c9-be6b944f737b', $q$Maison Route d’Essaouira$q$, $q$maison$q$, $q$location-longue-duree$q$, ARRAY[$q$location-longue-duree$q$]::text[], NULL, 12000, NULL, $q$MAD$q$, NULL, NULL, 2, 1, $q$Route d'Essaouira$q$, true, $q$Maison meublée avec piscine à louer à l’année, route d’Essaouira à 12 km de Marrakech : 2 chambres, salon avec cheminée, toit accessible. 12 000 DH/mois, eau et électricité comprises.$q$, $q$Maison meublée avec piscine à louer à l’année sur la route d’Essaouira, à 12 km du centre de Marrakech. Loyer : 12 000 DH par mois, eau et électricité comprises.

La maison
• 2 chambres, dont une avec dressing
• Salon avec cheminée
• Grande cuisine équipée
• Une salle de bain et un WC invités
• Climatisation dans le salon et les deux chambres
• Entièrement meublée

L’extérieur
• Piscine
• Petit jardin
• Toit accessible avec une belle vue dégagée
• Garage intérieur

Charges et frais d’entrée
• Eau et électricité comprises dans le loyer
• À l’entrée : 2 mois de caution (24 000 DH), 1 mois de loyer d’avance (12 000 DH) et 1 mois de frais d’agence (12 000 DH)

Une maison prête à vivre, avec piscine et toit-terrasse, sans facture d’eau ni d’électricité à gérer. Visite sur place ou en vidéo sur WhatsApp.$q$, $q$Furnished house with pool for long-term rent, Essaouira road$q$, $q$Casa amueblada con piscina en alquiler, carretera de Esauira$q$, $q$Furnished house with a pool for long-term rent on the Essaouira road, 12 km from Marrakech: 2 bedrooms, living room with fireplace, accessible roof. 12,000 MAD/month, water and electricity included.$q$, $q$Casa amueblada con piscina en alquiler de larga duración en la carretera de Esauira, a 12 km de Marrakech: 2 dormitorios, salón con chimenea, azotea accesible. 12.000 MAD/mes, agua y luz incluidas.$q$, $q$Furnished house with a pool for long-term rent on the Essaouira road, 12 km from the centre of Marrakech. Rent: 12,000 MAD per month, water and electricity included.

The house
• 2 bedrooms, one with a walk-in wardrobe
• Living room with a fireplace
• Large equipped kitchen
• One bathroom and a guest toilet
• Air conditioning in the living room and both bedrooms
• Fully furnished

Outside
• Swimming pool
• Small garden
• Accessible roof with a clear, open view
• Indoor garage

Bills and move-in costs
• Water and electricity included in the rent
• On move-in: 2 months’ deposit (24,000 MAD), 1 month’s rent in advance (12,000 MAD) and 1 month’s agency fee (12,000 MAD)

A ready-to-live-in house with a pool and a roof terrace, with no water or electricity bills to handle. In-person or video viewings on WhatsApp.$q$, $q$Casa amueblada con piscina en alquiler de larga duración en la carretera de Esauira, a 12 km del centro de Marrakech. Alquiler: 12.000 MAD al mes, agua y electricidad incluidas.

La casa
• 2 dormitorios, uno con vestidor
• Salón con chimenea
• Gran cocina equipada
• Un baño y un aseo de invitados
• Aire acondicionado en el salón y en los dos dormitorios
• Totalmente amueblada

El exterior
• Piscina
• Pequeño jardín
• Azotea accesible con bonitas vistas despejadas
• Garaje interior

Gastos y costes de entrada
• Agua y electricidad incluidas en el alquiler
• A la entrada: 2 meses de fianza (24.000 MAD), 1 mes de alquiler por adelantado (12.000 MAD) y 1 mes de honorarios de agencia (12.000 MAD)

Una casa lista para entrar a vivir, con piscina y azotea, sin facturas de agua ni de luz que gestionar. Visita en persona o por vídeo en WhatsApp.$q$, false, ARRAY[$q$Piscine$q$, $q$Jardin$q$, $q$Climatisation$q$, $q$Cuisine équipée$q$, $q$Cheminée$q$, $q$Parking$q$, $q$Terrasse$q$, $q$Meublé$q$]::text[], $q$[{"time":"12 km","place":"Marrakech (centre)"}]$q$::jsonb, ARRAY[$q$/biens/maison-route-essaouira/piscine-maison.webp$q$, $q$/biens/maison-route-essaouira/salon.webp$q$, $q$/biens/maison-route-essaouira/piscine-jardin.webp$q$, $q$/biens/maison-route-essaouira/cheminee.webp$q$, $q$/biens/maison-route-essaouira/cuisine.webp$q$, $q$/biens/maison-route-essaouira/chambre-dressing.webp$q$, $q$/biens/maison-route-essaouira/chambre-2.webp$q$]::text[], $q$/biens/maison-route-essaouira/piscine-maison.webp$q$, $q$publie$q$, NULL, $q$DP-26-ESSAO$q$, $q$2026-10-13T09:00:00+00:00$q$)
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

-- Appartement Zara Guéliz (DP-26-ZARA)
INSERT INTO public.properties_v2 (id, titre, type, service, services, prix_vente, prix_location_longue, prix_location_courte, devise, surface_habitable, surface_terrain, chambres, salles_de_bain, quartier, meuble, description_courte, description_longue, titre_en, titre_es, description_courte_en, description_courte_es, description_longue_en, description_longue_es, traduction_a_relire, equipements, proximites, photos, photo_principale, statut, disponible_le, reference, created_at)
VALUES ('76b25b2d-43f5-45a0-bd3e-abf31d386dd3', $q$Appartement Zara Guéliz$q$, $q$appartement$q$, $q$location-longue-duree$q$, ARRAY[$q$location-longue-duree$q$]::text[], NULL, 14500, NULL, $q$MAD$q$, 98, NULL, 2, 2, $q$Gueliz$q$, true, $q$Appartement meublé de 98 m² à louer à l’année dans la résidence Zara, en plein centre de Marrakech (Guéliz) : 2 chambres, 2 salles de bain, balcon, ascenseur et parking en sous-sol. 14 500 DH/mois.$q$, $q$Appartement moderne et meublé de 98 m² à louer à l’année dans la résidence Zara, en hyper centre de Marrakech (Guéliz), dans un secteur sécurisé à proximité immédiate de toutes les commodités. Loyer : 14 500 DH par mois.

L’appartement
• 2 chambres
• 2 salles de bain
• Salon lumineux
• Cuisine équipée ouverte sur le salon
• Joli espace extérieur : balcon avec vue sur la ville
• Entièrement meublé

L’immeuble
• 4ᵉ étage avec ascenseur
• Parking en sous-sol

Frais d’entrée
• 2 mois de caution (29 000 DH)
• 1 mois de loyer d’avance (14 500 DH)
• 1 mois de frais d’agence (14 500 DH)

Conditions
• Bail d’un an minimum
• Document demandé : passeport ou carte d’identité

Un appartement prêt à vivre au cœur de Marrakech, pour profiter de la ville à pied. Visite sur place ou en vidéo sur WhatsApp.$q$, $q$Furnished apartment for long-term rent in Gueliz, Zara residence$q$, $q$Apartamento amueblado en alquiler de larga duración en Gueliz, residencia Zara$q$, $q$Furnished 98 m² apartment for long-term rent in the Zara residence, right in the centre of Marrakech (Gueliz): 2 bedrooms, 2 bathrooms, balcony, lift and underground parking. 14,500 MAD/month.$q$, $q$Apartamento amueblado de 98 m² en alquiler de larga duración en la residencia Zara, en pleno centro de Marrakech (Gueliz): 2 dormitorios, 2 baños, balcón, ascensor y parking subterráneo. 14.500 MAD/mes.$q$, $q$Modern, furnished 98 m² apartment for long-term rent in the Zara residence, in the very centre of Marrakech (Gueliz), in a secure area close to all amenities. Rent: 14,500 MAD per month.

The apartment
• 2 bedrooms
• 2 bathrooms
• Bright living room
• Equipped kitchen open to the living room
• Nice outdoor space: balcony overlooking the city
• Fully furnished

The building
• 4th floor with lift
• Underground parking

Move-in costs
• Deposit: 2 months’ rent (29,000 MAD)
• 1 month’s rent in advance (14,500 MAD)
• Agency fee: 1 month’s rent (14,500 MAD)

Terms
• One-year minimum lease
• Document required: passport or national ID card

A ready-to-live-in apartment in the heart of Marrakech, to enjoy the city on foot. In-person or video viewings on WhatsApp.$q$, $q$Apartamento moderno y amueblado de 98 m² en alquiler de larga duración en la residencia Zara, en pleno centro de Marrakech (Gueliz), en una zona segura cerca de todos los servicios. Alquiler: 14.500 MAD al mes.

El apartamento
• 2 dormitorios
• 2 baños
• Salón luminoso
• Cocina equipada abierta al salón
• Bonito espacio exterior: balcón con vistas a la ciudad
• Totalmente amueblado

El edificio
• 4.ª planta con ascensor
• Parking subterráneo

Gastos de entrada
• Fianza: 2 meses de alquiler (29.000 MAD)
• 1 mes de alquiler por adelantado (14.500 MAD)
• Honorarios de agencia: 1 mes de alquiler (14.500 MAD)

Condiciones
• Contrato de un año como mínimo
• Documento necesario: pasaporte o documento de identidad

Un apartamento listo para vivir en el corazón de Marrakech, para disfrutar de la ciudad a pie. Visita presencial o por vídeo en WhatsApp.$q$, false, ARRAY[$q$Cuisine équipée$q$, $q$Ascenseur$q$, $q$Parking$q$, $q$Terrasse$q$, $q$Meublé$q$]::text[], $q$[]$q$::jsonb, ARRAY[$q$/biens/appartement-zara-gueliz/salon.webp$q$, $q$/biens/appartement-zara-gueliz/balcon.webp$q$, $q$/biens/appartement-zara-gueliz/cuisine.webp$q$, $q$/biens/appartement-zara-gueliz/chambre-1.webp$q$, $q$/biens/appartement-zara-gueliz/chambre-2.webp$q$, $q$/biens/appartement-zara-gueliz/salle-de-bain.webp$q$, $q$/biens/appartement-zara-gueliz/salle-de-bain-2.webp$q$, $q$/biens/appartement-zara-gueliz/couloir.webp$q$]::text[], $q$/biens/appartement-zara-gueliz/salon.webp$q$, $q$publie$q$, NULL, $q$DP-26-ZARA$q$, $q$2026-10-15T09:00:00+00:00$q$)
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

-- Villa Golf Atlas (DP-26-GATLS)
INSERT INTO public.properties_v2 (id, titre, type, service, services, prix_vente, prix_location_longue, prix_location_courte, devise, surface_habitable, surface_terrain, chambres, salles_de_bain, quartier, meuble, description_courte, description_longue, titre_en, titre_es, description_courte_en, description_courte_es, description_longue_en, description_longue_es, traduction_a_relire, equipements, proximites, photos, photo_principale, statut, disponible_le, reference, created_at)
VALUES ('5ae8e008-1dc3-4e27-8e5f-d056dfd0daca', $q$Villa Golf Atlas$q$, $q$villa$q$, $q$location-longue-duree$q$, ARRAY[$q$location-longue-duree$q$, $q$vente$q$]::text[], 4000000, 18000, NULL, $q$MAD$q$, 150, 500, 3, 3, $q$Golf Atlas$q$, false, $q$Villa beldi moderne non meublée avec piscine et grand jardin, secteur Golf Atlas : 3 chambres, 3 salles de bain, cheminée, toit-terrasse. 18 000 DH/mois ou 4 000 000 DH à la vente.$q$, $q$Villa de style beldi moderne, non meublée, à louer à l’année ou à vendre, dans le secteur Golf Atlas à Marrakech. Loyer : 18 000 DH par mois. Prix de vente : 4 000 000 DH.

La villa
• 150 m² habitables sur un terrain de 500 m²
• 3 chambres spacieuses
• 3 salles de bain
• Salon avec cheminée
• Cuisine équipée
• Style beldi moderne, finitions artisanales et matériaux de qualité

L’extérieur
• Grand jardin privé
• Piscine
• Toit-terrasse avec véranda vitrée

Emplacement
Environnement calme et recherché, proche des golfs et des écoles internationales :
• Golf Amelkis : 5 km
• American School of Marrakech : 5 km
• Atacadão : 5 km
• Centre-ville / Guéliz : 10 km
• Jardin Majorelle : 10 km

Frais d’entrée (location)
• 2 mois de caution (36 000 DH), à la demande du propriétaire
• 1 mois de loyer d’avance (18 000 DH)

Conditions
• Bail d’un an minimum
• Document demandé : passeport ou carte d’identité

Une villa idéale pour une résidence longue durée, au calme et en toute intimité, à quelques minutes des principales commodités. Visite sur place ou en vidéo sur WhatsApp.$q$, $q$Unfurnished villa with pool for rent or sale, Golf Atlas$q$, $q$Villa sin amueblar con piscina en alquiler o venta, Golf Atlas$q$, $q$Unfurnished modern beldi villa with pool and large garden in the Golf Atlas area: 3 bedrooms, 3 bathrooms, fireplace, roof terrace. 18,000 MAD/month or 4,000,000 MAD for sale.$q$, $q$Villa beldi moderna sin amueblar con piscina y gran jardín en la zona Golf Atlas: 3 dormitorios, 3 baños, chimenea, azotea. 18.000 MAD/mes o 4.000.000 MAD en venta.$q$, $q$Unfurnished modern beldi-style villa for long-term rent or for sale in the Golf Atlas area of Marrakech. Rent: 18,000 MAD per month. Sale price: 4,000,000 MAD.

The villa
• 150 m² of living space on a 500 m² plot
• 3 spacious bedrooms
• 3 bathrooms
• Living room with fireplace
• Equipped kitchen
• Modern beldi style, handcrafted finishes and quality materials

Outside
• Large private garden
• Pool
• Roof terrace with a glazed veranda

Location
A quiet, sought-after setting close to the golf courses and international schools:
• Amelkis Golf: 5 km
• American School of Marrakech: 5 km
• Atacadão: 5 km
• City centre / Gueliz: 10 km
• Majorelle Garden: 10 km

Move-in costs (rental)
• Deposit: 2 months’ rent (36,000 MAD), as requested by the owner
• 1 month’s rent in advance (18,000 MAD)

Terms
• One-year minimum lease
• Document required: passport or national ID card

An ideal villa for a long-term home, quiet and private, a few minutes from the main amenities. In-person or video viewings on WhatsApp.$q$, $q$Villa de estilo beldi moderno, sin amueblar, en alquiler de larga duración o en venta en la zona Golf Atlas de Marrakech. Alquiler: 18.000 MAD al mes. Precio de venta: 4.000.000 MAD.

La villa
• 150 m² habitables en una parcela de 500 m²
• 3 dormitorios amplios
• 3 baños
• Salón con chimenea
• Cocina equipada
• Estilo beldi moderno, acabados artesanales y materiales de calidad

El exterior
• Gran jardín privado
• Piscina
• Azotea con veranda acristalada

Ubicación
Un entorno tranquilo y buscado, cerca de los campos de golf y de los colegios internacionales:
• Golf Amelkis: 5 km
• American School of Marrakech: 5 km
• Atacadão: 5 km
• Centro / Gueliz: 10 km
• Jardín Majorelle: 10 km

Gastos de entrada (alquiler)
• Fianza: 2 meses de alquiler (36.000 MAD), a petición del propietario
• 1 mes de alquiler por adelantado (18.000 MAD)

Condiciones
• Contrato de un año como mínimo
• Documento necesario: pasaporte o documento de identidad

Una villa ideal para vivir a largo plazo, tranquila y con privacidad, a pocos minutos de los principales servicios. Visita presencial o por vídeo en WhatsApp.$q$, false, ARRAY[$q$Piscine$q$, $q$Jardin$q$, $q$Cheminée$q$, $q$Climatisation$q$, $q$Cuisine équipée$q$, $q$Terrasse$q$]::text[], $q$[{"time":"5 km","place":"Golf Amelkis"},{"time":"5 km","place":"American School of Marrakech"},{"time":"5 km","place":"Atacadão"},{"time":"10 km","place":"Guéliz (centre-ville)"},{"time":"10 km","place":"Jardin Majorelle"}]$q$::jsonb, ARRAY[$q$/biens/villa-golf-atlas/facade-piscine.webp$q$, $q$/biens/villa-golf-atlas/piscine-jardin.webp$q$, $q$/biens/villa-golf-atlas/jardin.webp$q$, $q$/biens/villa-golf-atlas/salon.webp$q$, $q$/biens/villa-golf-atlas/salon-2.webp$q$, $q$/biens/villa-golf-atlas/cuisine.webp$q$, $q$/biens/villa-golf-atlas/entree.webp$q$, $q$/biens/villa-golf-atlas/chambre-1.webp$q$, $q$/biens/villa-golf-atlas/chambre-2.webp$q$, $q$/biens/villa-golf-atlas/terrasse-veranda.webp$q$, $q$/biens/villa-golf-atlas/escalier.webp$q$]::text[], $q$/biens/villa-golf-atlas/facade-piscine.webp$q$, $q$publie$q$, NULL, $q$DP-26-GATLS$q$, $q$2026-10-16T09:00:00+00:00$q$)
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
