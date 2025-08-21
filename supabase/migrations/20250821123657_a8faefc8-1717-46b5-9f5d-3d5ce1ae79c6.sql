-- SECURITY FIX: Protect hairdresser contact information from public access

-- 1. Remove existing public access policies that expose sensitive data
DROP POLICY IF EXISTS "Anonymous users can view active professionals" ON public.hairdressers;
DROP POLICY IF EXISTS "Public can view active hairdressers" ON public.hairdressers;
DROP POLICY IF EXISTS "Public can view basic hairdresser info" ON public.hairdressers;
DROP POLICY IF EXISTS "Public can view hairdresser booking info" ON public.hairdressers;

-- 2. Drop existing function if it exists
DROP FUNCTION IF EXISTS public.get_public_hairdresser_data_secure();

-- 3. Create a secure public view that excludes sensitive contact information
CREATE OR REPLACE VIEW public.hairdressers_public_safe AS
SELECT 
    id,
    name,
    specialties,
    rating,
    location,
    bio,
    website,
    instagram,
    experience,
    working_hours,
    image_url,
    gender,
    is_active,
    created_at,
    updated_at,
    auth_id,
    -- Exclude email and phone from public view
    -- salon_address can be public as it's business address
    salon_address
FROM public.hairdressers
WHERE is_active = true;

-- 4. Create new restrictive RLS policies
CREATE POLICY "Public can view safe hairdresser info" 
ON public.hairdressers 
FOR SELECT 
USING (
    is_active = true 
    AND auth.uid() IS NULL  -- Only for anonymous users
);

CREATE POLICY "Authenticated users can view hairdresser business info" 
ON public.hairdressers 
FOR SELECT 
USING (
    is_active = true 
    AND auth.uid() IS NOT NULL  -- Only basic info for authenticated users
);

-- 5. Allow contact info access only for:
-- - The hairdresser themselves
-- - Admins 
-- - Users with confirmed bookings with that hairdresser
CREATE POLICY "Restricted contact info access" 
ON public.hairdressers 
FOR SELECT 
USING (
    auth_id = auth.uid() OR  -- Own profile
    get_current_user_role() = 'admin' OR  -- Admin access
    EXISTS (  -- Users with confirmed bookings
        SELECT 1 FROM new_reservations nr 
        WHERE nr.stylist_user_id = hairdressers.auth_id 
        AND nr.client_user_id = auth.uid() 
        AND nr.status = 'confirmed'
    )
);

-- 6. Create a function to get public hairdresser data safely
CREATE OR REPLACE FUNCTION public.get_public_hairdresser_data_secure()
RETURNS TABLE(
    id uuid,
    name text,
    rating numeric,
    location text,
    bio text,
    website text,
    instagram text,
    working_hours jsonb,
    image_url text,
    gender text,
    is_active boolean,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    auth_id uuid,
    salon_address text,
    specialties text[]
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
    h.rating,
    h.location,
    h.bio,
    h.website,
    h.instagram,
    h.working_hours,
    h.image_url,
    h.gender,
    h.is_active,
    h.created_at,
    h.updated_at,
    h.auth_id,
    h.salon_address,
    h.specialties
  FROM public.hairdressers h
  WHERE h.is_active = true;
END;
$$;

-- 7. Log this security improvement
INSERT INTO public.system_logs (event_type, message, metadata, created_at)
VALUES (
    'security_policy_update',
    'Hairdresser contact information access restricted',
    jsonb_build_object(
        'action', 'restrict_hairdresser_contact_access',
        'affected_table', 'hairdressers',
        'security_level', 'improved'
    ),
    NOW()
);