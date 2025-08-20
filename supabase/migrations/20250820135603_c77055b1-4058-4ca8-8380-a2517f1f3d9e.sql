-- Nettoyage des données de test des professionnels
-- Supprimer les professionnels qui n'ont pas de compte utilisateur réel

-- D'abord, identifier et supprimer les professionnels sans compte utilisateur valide
DELETE FROM public.hairdressers 
WHERE auth_id IS NULL 
   OR NOT EXISTS (
     SELECT 1 FROM public.profiles 
     WHERE profiles.user_id = hairdressers.auth_id
   );

-- Supprimer les professionnels qui n'ont pas de rôle professionnel
DELETE FROM public.hairdressers h
WHERE NOT EXISTS (
  SELECT 1 FROM public.profiles p 
  WHERE p.user_id = h.auth_id 
  AND p.role IN ('coiffeur', 'coiffeuse', 'cosmetique')
);

-- Nettoyer également les services liés aux professionnels supprimés
DELETE FROM public.hairdresser_services hs
WHERE NOT EXISTS (
  SELECT 1 FROM public.hairdressers h 
  WHERE h.id = hs.hairdresser_id
);

-- Nettoyer le portfolio des professionnels supprimés
DELETE FROM public.portfolio p
WHERE NOT EXISTS (
  SELECT 1 FROM public.profiles pr 
  WHERE pr.user_id = p.stylist_id 
  AND pr.role IN ('coiffeur', 'coiffeuse', 'cosmetique')
);

-- Log du nettoyage
INSERT INTO public.system_logs (event_type, message, metadata, created_at)
VALUES (
  'data_cleanup',
  'Suppression des données de test des professionnels',
  jsonb_build_object(
    'action', 'cleanup_test_professionals',
    'timestamp', extract(epoch from now()),
    'description', 'Suppression des professionnels sans compte utilisateur réel'
  ),
  now()
);