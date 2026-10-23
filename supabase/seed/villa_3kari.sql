-- Généré par .claude/skills/publier-bien/make-sql.mjs : coller dans Supabase → SQL Editor → Run.

-- Prépare les colonnes une seule fois (sans effet si elles existent déjà).

ALTER TABLE public.properties_v2
  ADD COLUMN IF NOT EXISTS titre_en TEXT, ADD COLUMN IF NOT EXISTS titre_es TEXT,
  ADD COLUMN IF NOT EXISTS description_courte_en TEXT, ADD COLUMN IF NOT EXISTS description_courte_es TEXT,
  ADD COLUMN IF NOT EXISTS description_longue_en TEXT, ADD COLUMN IF NOT EXISTS description_longue_es TEXT,
  ADD COLUMN IF NOT EXISTS traduction_a_relire BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS meuble BOOLEAN;

-- Villa 3kari (DP-26-3KARI)
INSERT INTO public.properties_v2 (id, titre, type, service, services, prix_vente, prix_location_longue, prix_location_courte, devise, surface_habitable, surface_terrain, chambres, salles_de_bain, quartier, meuble, description_courte, description_longue, titre_en, titre_es, description_courte_en, description_courte_es, description_longue_en, description_longue_es, traduction_a_relire, equipements, proximites, photos, photo_principale, statut, disponible_le, reference, created_at)
VALUES ('6d2f1c8e-5b7a-4e3f-9a21-3c4d5e6f7a8b', $q$Villa 3kari$q$, $q$villa$q$, $q$location-longue-duree$q$, ARRAY[$q$location-longue-duree$q$]::text[], NULL, 15000, NULL, $q$MAD$q$, NULL, NULL, 4, 3, $q$Route de Fes$q$, false, $q$Villa privée et isolée avec piscine, jardin, bungalow indépendant et grand parking, route de Fès à 15 km de Marrakech. 15 000 DH/mois non meublée, entretien du jardin et de la piscine compris.$q$, $q$Villa privée et isolée, non meublée, avec piscine et jardin, à louer à l’année sur la route de Fès, à 15 km de Marrakech. Loyer : 15 000 DH par mois, entretien du jardin et de la piscine compris.

La maison
• 3 chambres
• 2 salles de bain
• Salon
• Cuisine

Le bungalow
• Une chambre indépendante
• Cuisine
• Salle de bain

L’extérieur
• Piscine
• Grand jardin
• Grand parking devant la villa pour 4 à 5 voitures

Accès
Route de Fès, à 15 km de Marrakech, puis 200 à 300 m de piste.

Version meublée
La villa peut aussi être louée meublée : 20 000 DH par mois, entretien compris (caution : 2 mois).

Frais d’entrée
• Caution : 1 mois de loyer (15 000 DH)
• Frais d’agence : 1 mois de loyer (15 000 DH)

Conditions
• Bail d’un an minimum
• Document demandé : passeport ou carte d’identité

Visite sur place ou en vidéo sur WhatsApp.$q$, $q$Secluded villa with pool and bungalow, Fès road$q$, $q$Villa aislada con piscina y bungalow, carretera de Fez$q$, $q$Private, secluded villa with pool, garden, separate bungalow and large parking, Fès road 15 km from Marrakech. 15,000 MAD/month unfurnished, garden and pool maintenance included.$q$, $q$Villa privada y aislada con piscina, jardín, bungalow independiente y gran aparcamiento, carretera de Fez a 15 km de Marrakech. 15.000 MAD/mes sin amueblar, mantenimiento del jardín y la piscina incluido.$q$, $q$Private, secluded unfurnished villa with pool and garden for long-term rent on the Fès road, 15 km from Marrakech. Rent: 15,000 MAD per month, garden and pool maintenance included.

The house
• 3 bedrooms
• 2 bathrooms
• Living room
• Kitchen

The bungalow
• A separate bedroom
• Kitchen
• Bathroom

Outside
• Pool
• Large garden
• Large parking area in front of the villa for 4 to 5 cars

Access
Fès road, 15 km from Marrakech, then a 200 to 300 m dirt track.

Furnished option
The villa can also be rented furnished: 20,000 MAD per month, maintenance included (deposit: 2 months).

Move-in costs
• Deposit: 1 month’s rent (15,000 MAD)
• Agency fee: 1 month’s rent (15,000 MAD)

Terms
• One-year minimum lease
• Document required: passport or national ID card

In-person or video viewings on WhatsApp.$q$, $q$Villa privada y aislada, sin amueblar, con piscina y jardín, en alquiler de larga duración en la carretera de Fez, a 15 km de Marrakech. Alquiler: 15.000 MAD al mes, mantenimiento del jardín y la piscina incluido.

La casa
• 3 dormitorios
• 2 baños
• Salón
• Cocina

El bungalow
• Un dormitorio independiente
• Cocina
• Baño

El exterior
• Piscina
• Gran jardín
• Gran aparcamiento delante de la villa para 4 o 5 coches

Acceso
Carretera de Fez, a 15 km de Marrakech, y luego 200 a 300 m de pista.

Opción amueblada
La villa también se puede alquilar amueblada: 20.000 MAD al mes, mantenimiento incluido (fianza: 2 meses).

Gastos de entrada
• Fianza: 1 mes de alquiler (15.000 MAD)
• Honorarios de agencia: 1 mes de alquiler (15.000 MAD)

Condiciones
• Contrato de un año como mínimo
• Documento necesario: pasaporte o documento de identidad

Visita presencial o por vídeo en WhatsApp.$q$, false, ARRAY[$q$Piscine$q$, $q$Jardin$q$, $q$Cuisine équipée$q$, $q$Parking$q$]::text[], $q$[{"time":"15 km","place":"Marrakech"}]$q$::jsonb, ARRAY[$q$properties/usqk3u6ldmspmeu4eodt$q$, $q$properties/efg7z7qku6tar7cnpk5d$q$, $q$properties/ongxttggmqd3v4pmzxcr$q$, $q$properties/q5rw3q9z1fhz9azxplon$q$, $q$properties/ej18ewhygcpeklouzrti$q$, $q$properties/pgqicywbnycndomx1lbp$q$, $q$properties/m2gqp9qnzfnjdl4snrdh$q$, $q$properties/jtvbxcehwrl0oct7w7wd$q$, $q$properties/juneoyhsmijpud1bcmvz$q$, $q$properties/glogk7icqnbspts4klzl$q$, $q$properties/rxucdlcnutm4xljltyad$q$, $q$properties/dh56bfsolbnj6isymomc$q$, $q$properties/sltcahwkmb97bxlvjwzr$q$]::text[], $q$properties/usqk3u6ldmspmeu4eodt$q$, $q$publie$q$, NULL, $q$DP-26-3KARI$q$, now())
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
