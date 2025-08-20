-- SECURITY FIX: Completely block unauthenticated access to sensitive hairdresser data
-- Remove the public access policy that allows unauthenticated users to access the main table
DROP POLICY IF EXISTS "Public can view business info only (secure)" ON public.hairdressers;

-- Create a much more restrictive policy that only allows authenticated users to access the full table
CREATE POLICY "Authenticated users only access to hairdressers" 
ON public.hairdressers 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL
);

-- Create a secure function for public hairdresser data access
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
  WHERE h.is_active = true;
END;
$$;

-- Log this security improvement
INSERT INTO public.system_logs (event_type, message, metadata, created_at)
VALUES (
  'security_enhancement_applied',
  'Completely restricted unauthenticated access to hairdressers table and created secure public function',
  jsonb_build_object(
    'action', 'hairdressers_table_access_completely_restricted',
    'change', 'Created get_public_hairdresser_data() function for safe public access',
    'timestamp', extract(epoch from now())
  ),
  now()
);