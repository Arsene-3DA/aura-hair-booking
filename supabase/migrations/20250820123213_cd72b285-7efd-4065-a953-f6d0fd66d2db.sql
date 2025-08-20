-- FINAL SECURITY FIX: Completely lock down hairdresser personal data
-- Remove ALL policies that allow public access to personal information

-- Drop all existing policies on hairdressers table
DROP POLICY IF EXISTS "Public can view business info only" ON public.hairdressers;
DROP POLICY IF EXISTS "Authenticated users can view hairdresser details" ON public.hairdressers;
DROP POLICY IF EXISTS "Hairdressers can view and update their profiles" ON public.hairdressers;
DROP POLICY IF EXISTS "Admin manage all hairdressers" ON public.hairdressers;
DROP POLICY IF EXISTS "Admins can view all hairdresser data" ON public.hairdressers;
DROP POLICY IF EXISTS "Public can view limited hairdresser info" ON public.hairdressers;
DROP POLICY IF EXISTS "hairdresser_self" ON public.hairdressers;

-- Create a completely secure set of policies
-- 1. Hairdressers can only access their own data
CREATE POLICY "hairdressers_own_data_only" 
ON public.hairdressers 
FOR ALL
USING (auth_id = auth.uid())
WITH CHECK (auth_id = auth.uid());

-- 2. Admins can access all hairdresser data
CREATE POLICY "admins_full_access_hairdressers" 
ON public.hairdressers 
FOR ALL
USING (get_current_user_role() = 'admin')
WITH CHECK (get_current_user_role() = 'admin');

-- 3. Authenticated users can ONLY see basic business info (no email/phone)
-- We'll handle this through a secure function instead of a policy

-- Create a secure function for public hairdresser data access
CREATE OR REPLACE FUNCTION public.get_hairdressers_safe()
RETURNS TABLE (
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
  -- Only return business-relevant information, NO personal contact data
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

-- Grant public access to the safe function
GRANT EXECUTE ON FUNCTION public.get_hairdressers_safe() TO public;
GRANT EXECUTE ON FUNCTION public.get_hairdressers_safe() TO anon;
GRANT EXECUTE ON FUNCTION public.get_hairdressers_safe() TO authenticated;

-- Create function for authorized contact info access
CREATE OR REPLACE FUNCTION public.get_hairdresser_contact_info(hairdresser_id uuid)
RETURNS TABLE (
  email text,
  phone text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Only allow access if:
  -- 1. User is the hairdresser themselves
  -- 2. User is an admin
  -- 3. User has an active booking with this hairdresser
  
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;
  
  -- Check authorization
  IF NOT (
    -- Hairdresser accessing their own data
    EXISTS (SELECT 1 FROM public.hairdressers WHERE id = hairdresser_id AND auth_id = auth.uid())
    OR
    -- Admin access
    get_current_user_role() = 'admin'
    OR
    -- Client with active booking
    EXISTS (
      SELECT 1 FROM public.new_reservations nr 
      WHERE nr.stylist_user_id = (SELECT auth_id FROM public.hairdressers WHERE id = hairdresser_id)
      AND nr.client_user_id = auth.uid()
      AND nr.status IN ('confirmed', 'pending', 'completed')
    )
  ) THEN
    RAISE EXCEPTION 'Access denied';
  END IF;
  
  -- Return contact info
  RETURN QUERY
  SELECT h.email, h.phone
  FROM public.hairdressers h
  WHERE h.id = hairdresser_id AND h.is_active = true;
END;
$$;

-- Grant access to authorized users only
GRANT EXECUTE ON FUNCTION public.get_hairdresser_contact_info(uuid) TO authenticated;

-- Log this security update
PERFORM log_security_event(
  'hairdresser_data_secured',
  'Hairdresser table access completely secured - personal data protected',
  NULL,
  jsonb_build_object(
    'action', 'security_lockdown',
    'table', 'hairdressers',
    'timestamp', extract(epoch from now())
  )
);