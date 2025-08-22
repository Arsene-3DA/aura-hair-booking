-- Synchroniser les rôles entre les tables users et profiles
UPDATE public.users 
SET role = p.role, updated_at = now()
FROM public.profiles p
WHERE users.auth_id = p.user_id 
AND users.role != p.role;

-- Vérifier les résultats de la synchronisation
SELECT 
  'Synchronization completed' as status,
  COUNT(*) as synchronized_count
FROM public.users u
JOIN public.profiles p ON u.auth_id = p.user_id
WHERE u.role = p.role;