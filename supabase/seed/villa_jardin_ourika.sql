-- Généré par .claude/skills/publier-bien/make-sql.mjs : coller dans Supabase → SQL Editor → Run.

-- Prépare les colonnes une seule fois (sans effet si elles existent déjà).

ALTER TABLE public.properties_v2
  ADD COLUMN IF NOT EXISTS titre_en TEXT, ADD COLUMN IF NOT EXISTS titre_es TEXT,
  ADD COLUMN IF NOT EXISTS description_courte_en TEXT, ADD COLUMN IF NOT EXISTS description_courte_es TEXT,
  ADD COLUMN IF NOT EXISTS description_longue_en TEXT, ADD COLUMN IF NOT EXISTS description_longue_es TEXT,
  ADD COLUMN IF NOT EXISTS traduction_a_relire BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS meuble BOOLEAN;

-- Villa Jardin Ourika (DP-26-JOURK)
INSERT INTO public.properties_v2 (id, titre, type, service, services, prix_vente, prix_location_longue, prix_location_courte, devise, surface_habitable, surface_terrain, chambres, salles_de_bain, quartier, meuble, description_courte, description_longue, titre_en, titre_es, description_courte_en, description_courte_es, description_longue_en, description_longue_es, traduction_a_relire, equipements, proximites, photos, photo_principale, statut, disponible_le, reference, created_at)
VALUES ('fad7f04f-dd3d-493f-ae6f-3ae8d5eeb82f', $q$Villa Jardin Ourika$q$, $q$villa$q$, $q$location-longue-duree$q$, ARRAY[$q$location-longue-duree$q$]::text[], NULL, 12000, NULL, $q$MAD$q$, NULL, 1000, 4, 4, $q$Route de l'Ourika$q$, true, $q$Villa meublée avec piscine privée et grand jardin de 1 000 m², route de l’Ourika à 30 min de Marrakech : 4 chambres, 4 salles de bain, 2 salons. 12 000 DH/mois, négociable.$q$, $q$Belle villa meublée avec jardin et piscine privée, à louer à l’année sur la route de l’Ourika, à environ 30 minutes de Marrakech. Loyer : 12 000 DH par mois, négociable.

La villa
• Terrain de 1 000 m²
• 4 chambres
• 2 salons, dont un avec cheminée
• 4 salles de bain et des toilettes d’invités
• Cuisine entièrement équipée
• Entièrement meublée

L’extérieur
• Piscine privée
• Grand jardin
• Terrasse avec vue sur l’Atlas

Frais d’entrée
• Caution : 2 mois de loyer (24 000 DH, logement meublé)
• Frais d’agence : 1 mois de loyer (12 000 DH)

Conditions
• Bail d’un an minimum
• Document demandé : passeport ou carte d’identité

Visite sur place ou en vidéo sur WhatsApp.$q$, $q$Furnished villa with pool and large garden, Ourika road$q$, $q$Villa amueblada con piscina y gran jardín, carretera de Ourika$q$, $q$Furnished villa with a private pool and a large 1,000 m² garden on the Ourika road, 30 min from Marrakech: 4 bedrooms, 4 bathrooms, 2 living rooms. 12,000 MAD/month, negotiable.$q$, $q$Villa amueblada con piscina privada y gran jardín de 1.000 m², carretera de Ourika a 30 min de Marrakech: 4 dormitorios, 4 baños, 2 salones. 12.000 MAD/mes, negociable.$q$, $q$Beautiful furnished villa with garden and private pool for long-term rent on the Ourika road, about 30 minutes from Marrakech. Rent: 12,000 MAD per month, negotiable.

The villa
• 1,000 m² plot
• 4 bedrooms
• 2 living rooms, one with a fireplace
• 4 bathrooms and a guest toilet
• Fully equipped kitchen
• Fully furnished

Outside
• Private pool
• Large garden
• Terrace with a view of the Atlas

Move-in costs
• Deposit: 2 months’ rent (24,000 MAD, furnished home)
• Agency fee: 1 month’s rent (12,000 MAD)

Terms
• One-year minimum lease
• Document required: passport or national ID card

In-person or video viewings on WhatsApp.$q$, $q$Bonita villa amueblada con jardín y piscina privada, en alquiler de larga duración en la carretera de Ourika, a unos 30 minutos de Marrakech. Alquiler: 12.000 MAD al mes, negociable.

La villa
• Parcela de 1.000 m²
• 4 dormitorios
• 2 salones, uno con chimenea
• 4 baños y aseo de invitados
• Cocina totalmente equipada
• Totalmente amueblada

El exterior
• Piscina privada
• Gran jardín
• Terraza con vistas al Atlas

Gastos de entrada
• Fianza: 2 meses de alquiler (24.000 MAD, vivienda amueblada)
• Honorarios de agencia: 1 mes de alquiler (12.000 MAD)

Condiciones
• Contrato de un año como mínimo
• Documento necesario: pasaporte o documento de identidad

Visita presencial o por vídeo en WhatsApp.$q$, false, ARRAY[$q$Piscine$q$, $q$Jardin$q$, $q$Terrasse$q$, $q$Cuisine équipée$q$, $q$Cheminée$q$, $q$Climatisation$q$, $q$Meublé$q$]::text[], $q$[{"time":"30 min","place":"Marrakech"}]$q$::jsonb, ARRAY[$q$properties/zuvtedwiwv39adxcc3ba$q$, $q$properties/tbxqno3jypcpbipzwurd$q$, $q$properties/nhog2ukwdxyg1b4qqpuf$q$, $q$properties/c7szuvusc6g0rvu2jfa2$q$, $q$properties/cmxwcl4lsyea7a9zvyvk$q$, $q$properties/nkuvijsmmixbqrbizonv$q$, $q$properties/gbkfej5nhkvl7nzpvus7$q$, $q$properties/z7gdbcvpe7cdqotqldtf$q$]::text[], $q$properties/zuvtedwiwv39adxcc3ba$q$, $q$publie$q$, NULL, $q$DP-26-JOURK$q$, now())
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
