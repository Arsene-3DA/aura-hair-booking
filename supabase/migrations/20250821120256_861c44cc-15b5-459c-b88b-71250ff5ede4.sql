-- Synchroniser les utilisateurs manquants de auth.users vers users
INSERT INTO public.users (auth_id, email, nom, prenom, role, status, created_at, updated_at)
SELECT 
  au.id,
  au.email,
  COALESCE(p.full_name, split_part(au.email, '@', 1)) as nom,
  '' as prenom,
  p.role,
  'actif'::user_status,
  au.created_at,
  p.updated_at
FROM auth.users au
JOIN public.profiles p ON au.id = p.user_id
LEFT JOIN public.users u ON au.id = u.auth_id
WHERE u.auth_id IS NULL  -- Seulement les utilisateurs qui n'existent pas dans users
  AND au.email IN ('gouvedissi@gmail.com', 'sharepoint.arsene@gmail.com')
ON CONFLICT (auth_id) DO UPDATE SET
  email = EXCLUDED.email,
  role = EXCLUDED.role,
  updated_at = now();