-- Données de démonstration de la section Réseaux sociaux (facultatif).
-- Toutes marquées is_demo = true : elles se suppriment avec le bloc « Suppression » en bas,
-- sans toucher aux vraies données.

INSERT INTO public.social_groups (nom, lien, reseau, membres, type, langue, regles, agences_interdites, approbation_obligatoire, is_demo) VALUES
  ('[Démo] Immobilier Marrakech', 'https://facebook.com/groups/demo-immo-marrakech', 'facebook', 48000, 'immo', 'fr', 'Une publication par bien et par semaine.', false, true, true),
  ('[Démo] Expats in Marrakech', 'https://facebook.com/groups/demo-expats', 'facebook', 21000, 'expat', 'en', 'English only.', false, true, true),
  ('[Démo] Français de Marrakech', 'https://facebook.com/groups/demo-francais', 'facebook', 15000, 'expat', 'fr', 'Pas d''agences.', true, true, true),
  ('[Démo] Route de Fès voisins', 'https://facebook.com/groups/demo-route-fes', 'facebook', 3200, 'quartier', 'fr-en', NULL, false, false, true)
ON CONFLICT DO NOTHING;

INSERT INTO public.social_publications (bien_hors_site, groupe_id, reseau, publie_le, langue, texte_debut, nb_photos, statut, is_demo)
SELECT '[Démo] Villa test', g.id, 'facebook', now() - (n || ' days')::interval, g.langue,
       'Villa à louer à l''année, piscine et jardin…', 8,
       (ARRAY['en-ligne', 'en-attente', 'refusee', 'en-ligne'])[1 + n % 4], true
FROM public.social_groups g, generate_series(0, 6) AS n
WHERE g.is_demo;

INSERT INTO public.social_account_alerts (survenue_le, reseau, type, compte, remarque, is_demo)
VALUES (now() - interval '2 days', 'facebook', 'avertissement', 'Compte principal', '[Démo] Trop de publications en peu de temps.', true);

-- ─── Suppression des données de démonstration ─────────────────────────
-- DELETE FROM public.social_account_alerts WHERE is_demo;
-- DELETE FROM public.social_publications WHERE is_demo;
-- DELETE FROM public.social_groups WHERE is_demo;
