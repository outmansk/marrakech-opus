-- Généré par .claude/skills/publier-bien/make-sql.mjs : coller dans Supabase → SQL Editor → Run.

-- Prépare les colonnes une seule fois (sans effet si elles existent déjà).

ALTER TABLE public.properties_v2
  ADD COLUMN IF NOT EXISTS titre_en TEXT, ADD COLUMN IF NOT EXISTS titre_es TEXT,
  ADD COLUMN IF NOT EXISTS description_courte_en TEXT, ADD COLUMN IF NOT EXISTS description_courte_es TEXT,
  ADD COLUMN IF NOT EXISTS description_longue_en TEXT, ADD COLUMN IF NOT EXISTS description_longue_es TEXT,
  ADD COLUMN IF NOT EXISTS traduction_a_relire BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS meuble BOOLEAN;

-- Élégante Villa Contemporaine Meublée avec Piscine Privée (DP-26-10I4Z)
INSERT INTO public.properties_v2 (id, titre, type, service, services, prix_vente, prix_location_longue, prix_location_courte, devise, surface_habitable, surface_terrain, chambres, salles_de_bain, quartier, meuble, description_courte, description_longue, titre_en, titre_es, description_courte_en, description_courte_es, description_longue_en, description_longue_es, traduction_a_relire, equipements, proximites, photos, photo_principale, statut, disponible_le, reference, created_at)
VALUES ('4b731349-1a9e-4c53-84fb-c082b44dd38e', $q$Élégante Villa Contemporaine Meublée avec Piscine Privée$q$, $q$villa$q$, $q$vente$q$, ARRAY[$q$vente$q$, $q$location-longue-duree$q$]::text[], 3500000, 25000, NULL, $q$MAD$q$, 250, 500, 5, 5, $q$Route de Fes$q$, true, $q$Villa contemporaine meublée avec piscine à Douar Ra9, à 15 km de Marrakech : 5 chambres avec salle de bain privative, 250 m² habitables sur 500 m² de terrain. À vendre ou à louer à l’année.$q$, $q$Villa contemporaine meublée, à vendre ou à louer à l’année, à Douar Ra9, à 15 km du centre de Marrakech. Prix de vente : 3 500 000 DH, vendue entièrement meublée. Loyer : 25 000 DH par mois.

La villa
• 250 m² habitables sur un terrain de 500 m²
• 5 chambres, chacune avec sa salle de bain privative
• Grand salon ouvert avec séjour
• Cuisine entièrement équipée
• Entièrement meublée

L’extérieur
• Piscine privée
• Jardin
• Parking privé

Emplacement
Au calme, en retrait de l’agitation de la ville : environ 15 km du centre de Marrakech, 10 km d’Atacadao et 14 km du McDonald’s.

Conditions de location
• Bail d’un an minimum
• Caution : 2 mois de loyer (logement meublé)
• Document demandé : passeport ou carte d’identité

Visite sur rendez-vous, sur place ou en vidéo sur WhatsApp.$q$, $q$Furnished contemporary villa with pool, Douar Ra9$q$, $q$Villa contemporánea amueblada con piscina, Douar Ra9$q$, $q$Furnished contemporary villa with a pool in Douar Ra9, 15 km from Marrakech: 5 bedrooms each with a private bathroom, 250 m² of living space on a 500 m² plot. For sale or long-term rent.$q$, $q$Villa contemporánea amueblada con piscina en Douar Ra9, a 15 km de Marrakech: 5 dormitorios con baño privado, 250 m² habitables en una parcela de 500 m². En venta o en alquiler de larga duración.$q$, $q$Furnished contemporary villa for sale or long-term rent in Douar Ra9, 15 km from the centre of Marrakech. Sale price: 3,500,000 MAD, sold fully furnished. Rent: 25,000 MAD per month.

The villa
• 250 m² of living space on a 500 m² plot
• 5 bedrooms, each with a private bathroom
• Large open living room with lounge area
• Fully equipped kitchen
• Fully furnished

Outside
• Private pool
• Garden
• Private parking

Location
Quiet, away from the bustle of the city: about 15 km from the centre of Marrakech, 10 km from Atacadao and 14 km from McDonald’s.

Rental terms
• One-year minimum lease
• Deposit: two months’ rent (furnished home)
• Document required: passport or national ID card

Viewings by appointment, in person or by video on WhatsApp.$q$, $q$Villa contemporánea amueblada, en venta o en alquiler de larga duración, en Douar Ra9, a 15 km del centro de Marrakech. Precio de venta: 3.500.000 MAD, se vende totalmente amueblada. Alquiler: 25.000 MAD al mes.

La villa
• 250 m² habitables en una parcela de 500 m²
• 5 dormitorios, cada uno con su baño privado
• Gran salón abierto con zona de estar
• Cocina totalmente equipada
• Totalmente amueblada

El exterior
• Piscina privada
• Jardín
• Parking privado

Ubicación
Tranquila, lejos del bullicio de la ciudad: a unos 15 km del centro de Marrakech, 10 km de Atacadao y 14 km del McDonald’s.

Condiciones de alquiler
• Contrato de un año como mínimo
• Fianza: 2 meses de alquiler (vivienda amueblada)
• Documento necesario: pasaporte o documento de identidad

Visitas con cita previa, en persona o por vídeo en WhatsApp.$q$, false, ARRAY[$q$Piscine$q$, $q$Jardin$q$, $q$Climatisation$q$, $q$Cuisine équipée$q$, $q$Parking$q$, $q$Télévision$q$, $q$Gardiennage 24/7$q$, $q$Terrasse$q$, $q$Internet Fibre$q$, $q$Cheminée$q$]::text[], $q$[{"time":"15 km","place":"Marrakech (centre)"},{"time":"10 km","place":"Atacado"},{"time":"14 km","place":"McDonald's"}]$q$::jsonb, ARRAY[$q$properties/dljcretvfqtnmkrpfakk$q$, $q$properties/a1b73dk1wenvjbjensi4$q$, $q$properties/dm0ed9pebp2tfwe8yiwt$q$, $q$properties/gg3uquoloutl88jceeam$q$, $q$properties/dlpquzrzrbpkthb8mocx$q$, $q$properties/l50ykadc0tnzs1p6a54o$q$, $q$properties/wvvybnb7vargtseljgis$q$, $q$properties/vovpwpohaxnvnvrsilkp$q$, $q$properties/zm4lkfeuxmn3gkibez4q$q$, $q$properties/sskoi0zu5wjfyimwbibk$q$, $q$properties/oc3juwpjv5lrrbho7ol7$q$, $q$properties/vd12ilmmwv8gyqfv3bws$q$]::text[], $q$properties/dljcretvfqtnmkrpfakk$q$, $q$publie$q$, NULL, $q$DP-26-10I4Z$q$, $q$2026-05-24T16:49:09.247529+00:00$q$)
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
