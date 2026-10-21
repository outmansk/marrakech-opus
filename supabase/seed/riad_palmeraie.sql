-- Généré par .claude/skills/publier-bien/make-sql.mjs : coller dans Supabase → SQL Editor → Run.

-- Prépare les colonnes une seule fois (sans effet si elles existent déjà).

ALTER TABLE public.properties_v2
  ADD COLUMN IF NOT EXISTS titre_en TEXT, ADD COLUMN IF NOT EXISTS titre_es TEXT,
  ADD COLUMN IF NOT EXISTS description_courte_en TEXT, ADD COLUMN IF NOT EXISTS description_courte_es TEXT,
  ADD COLUMN IF NOT EXISTS description_longue_en TEXT, ADD COLUMN IF NOT EXISTS description_longue_es TEXT,
  ADD COLUMN IF NOT EXISTS traduction_a_relire BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS meuble BOOLEAN;

-- Riad Palmeraie (DP-26-RPALM)
INSERT INTO public.properties_v2 (id, titre, type, service, services, prix_vente, prix_location_longue, prix_location_courte, devise, surface_habitable, surface_terrain, chambres, salles_de_bain, quartier, meuble, description_courte, description_longue, titre_en, titre_es, description_courte_en, description_courte_es, description_longue_en, description_longue_es, traduction_a_relire, equipements, proximites, photos, photo_principale, statut, disponible_le, reference, created_at)
VALUES ('80e1d306-944b-4fd5-ac9e-e22d52f883e1', $q$Riad Palmeraie$q$, $q$riad$q$, $q$vente$q$, ARRAY[$q$vente$q$, $q$location-longue-duree$q$]::text[], 4000000, 25000, NULL, $q$MAD$q$, 260, NULL, 4, 5, $q$Palmeraie$q$, true, $q$Riad meublé de 260 m² avec piscine privée et double terrasse, dans une résidence fermée de la Palmeraie : 4 chambres, 5 salles de bain. 4 000 000 DH ou 25 000 DH/mois.$q$, $q$Riad meublé de 260 m², à vendre ou à louer à l’année, au cœur de la Palmeraie de Marrakech, dans une résidence fermée et sécurisée. Un cadre de vie paisible, tout en restant proche des commerces et du centre-ville. Prix de vente : 4 000 000 DH. Loyer : 25 000 DH par mois.

Le riad
• Surface : 260 m²
• 4 chambres
• 5 salles de bain
• Salon spacieux
• Salle à manger
• Cuisine équipée
• Chambre pour gardien
• Entièrement meublé

L’extérieur
• Piscine privée
• Double terrasse

Emplacement
• Carrefour : 2 minutes à pied
• Jardin Majorelle : 4 km
• Centre-ville : 6 km

Conditions de location
• Bail d’un an minimum
• Caution : 2 mois de loyer (50 000 DH, logement meublé)
• Document demandé : passeport ou carte d’identité

Visite sur place ou en vidéo sur WhatsApp.$q$, $q$Furnished riad with private pool, Palmeraie$q$, $q$Riad amueblado con piscina privada, Palmeraie$q$, $q$Furnished 260 m² riad with a private pool and two terraces in a gated Palmeraie residence: 4 bedrooms, 5 bathrooms. 4,000,000 MAD or 25,000 MAD/month.$q$, $q$Riad amueblado de 260 m² con piscina privada y doble terraza en una urbanización cerrada de la Palmeraie: 4 dormitorios, 5 baños. 4.000.000 MAD o 25.000 MAD/mes.$q$, $q$Furnished 260 m² riad for sale or long-term rent in the heart of the Marrakech Palmeraie, in a gated and secure residence. A peaceful setting, close to the shops and the city centre. Sale price: 4,000,000 MAD. Rent: 25,000 MAD per month.

The riad
• Area: 260 m²
• 4 bedrooms
• 5 bathrooms
• Spacious living room
• Dining room
• Equipped kitchen
• Caretaker’s room
• Fully furnished

Outside
• Private pool
• Two terraces

Location
• Carrefour: 2 minutes on foot
• Majorelle Garden: 4 km
• City centre: 6 km

Rental terms
• One-year minimum lease
• Deposit: two months’ rent (50,000 MAD, furnished home)
• Document required: passport or national ID card

In-person or video viewings on WhatsApp.$q$, $q$Riad amueblado de 260 m², en venta o en alquiler de larga duración, en el corazón de la Palmeraie de Marrakech, en una urbanización cerrada y segura. Un entorno tranquilo, cerca de las tiendas y del centro. Precio de venta: 4.000.000 MAD. Alquiler: 25.000 MAD al mes.

El riad
• Superficie: 260 m²
• 4 dormitorios
• 5 baños
• Salón amplio
• Comedor
• Cocina equipada
• Habitación para el guarda
• Totalmente amueblado

El exterior
• Piscina privada
• Doble terraza

Ubicación
• Carrefour: 2 minutos a pie
• Jardín Majorelle: 4 km
• Centro: 6 km

Condiciones de alquiler
• Contrato de un año como mínimo
• Fianza: 2 meses de alquiler (50.000 MAD, vivienda amueblada)
• Documento necesario: pasaporte o documento de identidad

Visita presencial o por vídeo en WhatsApp.$q$, false, ARRAY[$q$Piscine$q$, $q$Terrasse$q$, $q$Climatisation$q$, $q$Cuisine équipée$q$, $q$Meublé$q$]::text[], $q$[{"time":"2 min à pied","place":"Carrefour"},{"time":"4 km","place":"Jardin Majorelle"},{"time":"6 km","place":"Centre-ville"}]$q$::jsonb, ARRAY[$q$properties/cpanznnwkhzkxhdkgfrd$q$, $q$properties/pnl5mxcrzbvtwfc8zlro$q$, $q$properties/pbtwj60r3y38hkcan0sk$q$, $q$properties/ibtjthjfbrlthrn9owdq$q$, $q$properties/gh3actoubtrmzfwldgbv$q$, $q$properties/ivfwpwtec62iurkrqwiu$q$, $q$properties/ppxdnmqz8wegxthaewcz$q$, $q$properties/vg8hak0wuqrlj53a7qsy$q$, $q$properties/gtpesqre0nflwoyl9y3g$q$, $q$properties/ar3kshvsy7j9p6eg35m4$q$, $q$properties/yxgddzndlpxdz5yannrc$q$, $q$properties/zj3r9ubmmgkusciervvl$q$]::text[], $q$properties/cpanznnwkhzkxhdkgfrd$q$, $q$publie$q$, NULL, $q$DP-26-RPALM$q$, now())
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
