-- Créer les profils professionnels manquants pour les utilisateurs existants
INSERT INTO public.hairdressers (
  auth_id, 
  name, 
  email,
  gender,
  is_active,
  rating,
  working_hours
)
SELECT 
  u.auth_id,
  COALESCE(p.full_name, u.email) as name,
  u.email,
  CASE u.role 
    WHEN 'coiffeuse' THEN 'femme'
    WHEN 'cosmetique' THEN 'non_specifie'
    ELSE 'homme'
  END as gender,
  true as is_active,
  5.0 as rating,
  jsonb_build_object(
    'monday', jsonb_build_object('isOpen', true, 'open', '09:00', 'close', '18:00'),
    'tuesday', jsonb_build_object('isOpen', true, 'open', '09:00', 'close', '18:00'),
    'wednesday', jsonb_build_object('isOpen', true, 'open', '09:00', 'close', '18:00'),
    'thursday', jsonb_build_object('isOpen', true, 'open', '09:00', 'close', '18:00'),
    'friday', jsonb_build_object('isOpen', true, 'open', '09:00', 'close', '18:00'),
    'saturday', jsonb_build_object('isOpen', true, 'open', '09:00', 'close', '17:00'),
    'sunday', jsonb_build_object('isOpen', false, 'open', '10:00', 'close', '16:00')
  ) as working_hours
FROM users u
LEFT JOIN profiles p ON u.auth_id = p.user_id
LEFT JOIN hairdressers h ON u.auth_id = h.auth_id
WHERE u.role IN ('coiffeur', 'coiffeuse', 'cosmetique')
  AND h.id IS NULL  -- N'existe pas encore dans hairdressers
ON CONFLICT (auth_id) DO NOTHING;