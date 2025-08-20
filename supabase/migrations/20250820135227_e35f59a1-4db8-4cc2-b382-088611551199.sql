-- SECURITY UPDATE: Modify public hairdresser function to only show users with professional roles
CREATE OR REPLACE FUNCTION public.get_public_hairdresser_data()
RETURNS TABLE(
  id uuid,
  name text,
  specialties text[],
  rating numeric,
  salon_address text,
  location text,
  bio text,
  website text,
  instagram text,
  experience text,
  working_hours jsonb,
  image_url text,
  gender text,
  is_active boolean,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  auth_id uuid
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    h.id,
    h.name,
    h.specialties,
    h.rating,
    h.salon_address,
    h.location,
    h.bio,
    h.website,
    h.instagram,
    h.experience,
    h.working_hours,
    h.image_url,
    h.gender,
    h.is_active,
    h.created_at,
    h.updated_at,
    h.auth_id
  FROM public.hairdressers h
  INNER JOIN public.profiles p ON h.auth_id = p.user_id
  WHERE h.is_active = true
  AND p.role IN ('coiffeur', 'coiffeuse', 'cosmetique');
END;
$$;

-- Log this update
INSERT INTO public.system_logs (event_type, message, metadata, created_at)
VALUES (
  'function_security_update',
  'Updated get_public_hairdresser_data to filter by professional roles only',
  jsonb_build_object(
    'action', 'filter_professional_roles_only',
    'allowed_roles', array['coiffeur', 'coiffeuse', 'cosmetique'],
    'timestamp', extract(epoch from now())
  ),
  now()
);