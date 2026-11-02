-- Photos principales plus vendeuses (novembre 2026) : 7 biens ouvraient sur un couloir, une chambre,
-- une cage d'escalier ou une photo avec des bandes. La photo choisie devient photo_principale (carte
-- du catalogue) ET la première de la galerie (fiche du bien) ; les autres photos gardent leur ordre.
-- Aucune photo n'est ajoutée ni supprimée. À coller dans Supabase → SQL Editor → Run. Rejouable.

-- Villa Rayan (DP-26-RAYAN) : piscine et palmiers en plein jour, au lieu du salon
UPDATE public.properties_v2
SET photo_principale = 'properties/lhof7grpc64g38gocbht',
    photos = array_prepend('properties/lhof7grpc64g38gocbht', array_remove(photos, 'properties/lhof7grpc64g38gocbht'))
WHERE id = 'b7c41e5a-2f86-4d0b-9e3a-6a1d58c0f972' AND 'properties/lhof7grpc64g38gocbht' = ANY(photos);

-- Villa Ourika Golf (DP-26-OURKA) : piscine au coucher du soleil, au lieu de la photo à bandes blanches
UPDATE public.properties_v2
SET photo_principale = 'properties/kpgfwixj3cctbwajhjdq',
    photos = array_prepend('properties/kpgfwixj3cctbwajhjdq', array_remove(photos, 'properties/kpgfwixj3cctbwajhjdq'))
WHERE id = '3cbf78ee-ebd3-4874-b076-45a1dd493376' AND 'properties/kpgfwixj3cctbwajhjdq' = ANY(photos);

-- Riad Village Touristique (REF-RIA-VILL-841) : la piscine, au lieu de la cage d'escalier
UPDATE public.properties_v2
SET photo_principale = 'properties/liv8kdiydkvjsvq8wmev',
    photos = array_prepend('properties/liv8kdiydkvjsvq8wmev', array_remove(photos, 'properties/liv8kdiydkvjsvq8wmev'))
WHERE id = '74b6e091-4e35-470b-9f65-b2e1c05f5100' AND 'properties/liv8kdiydkvjsvq8wmev' = ANY(photos);

-- Appartement Prestigia Ambre (REF-APP-AMBR-582) : le salon lumineux, au lieu des rideaux
UPDATE public.properties_v2
SET photo_principale = 'properties/izvka6bnbutgo2vvdma6',
    photos = array_prepend('properties/izvka6bnbutgo2vvdma6', array_remove(photos, 'properties/izvka6bnbutgo2vvdma6'))
WHERE id = 'b0b1924e-b9a3-46f2-92f1-7b10017db25d' AND 'properties/izvka6bnbutgo2vvdma6' = ANY(photos);

-- Appartement Chrifia (REF-APP-CHRI-482) : le salon, au lieu de la chambre
UPDATE public.properties_v2
SET photo_principale = 'properties/ir5zwbfham2hclrlmpgd',
    photos = array_prepend('properties/ir5zwbfham2hclrlmpgd', array_remove(photos, 'properties/ir5zwbfham2hclrlmpgd'))
WHERE id = 'b2686df2-14a9-4bd2-897e-e8d5bd93d6e2' AND 'properties/ir5zwbfham2hclrlmpgd' = ANY(photos);

-- Villa Swigya (DP-26-A1VZZ) : la piscine dans le jardin au coucher du soleil, au lieu du couloir
UPDATE public.properties_v2
SET photo_principale = 'properties/x7kd7qkwmikikl27lt2i',
    photos = array_prepend('properties/x7kd7qkwmikikl27lt2i', array_remove(photos, 'properties/x7kd7qkwmikikl27lt2i'))
WHERE id = '744048a5-2754-4075-a9a7-ddbe7bd79f51' AND 'properties/x7kd7qkwmikikl27lt2i' = ANY(photos);

-- Villa Agdal (DP-26-AGDAL) : la façade sous un ciel bleu, au lieu de la vue plongeante coupée
UPDATE public.properties_v2
SET photo_principale = 'properties/t7vx7pr8y4zad7efv9zy',
    photos = array_prepend('properties/t7vx7pr8y4zad7efv9zy', array_remove(photos, 'properties/t7vx7pr8y4zad7efv9zy'))
WHERE id = '193ecf04-704a-4987-8da0-99f756631125' AND 'properties/t7vx7pr8y4zad7efv9zy' = ANY(photos);

-- Vérification : 7 lignes, chaque photo_principale égale à photos[1]
SELECT reference, titre, photo_principale = photos[1] AS ok
FROM public.properties_v2
WHERE id IN ('b7c41e5a-2f86-4d0b-9e3a-6a1d58c0f972', '3cbf78ee-ebd3-4874-b076-45a1dd493376', '74b6e091-4e35-470b-9f65-b2e1c05f5100',
             'b0b1924e-b9a3-46f2-92f1-7b10017db25d', 'b2686df2-14a9-4bd2-897e-e8d5bd93d6e2', '744048a5-2754-4075-a9a7-ddbe7bd79f51',
             '193ecf04-704a-4987-8da0-99f756631125');
