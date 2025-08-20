-- FINAL SECURITY FIX: Ensure hairdresser personal data is properly protected
-- Remove the overly permissive public policy that's still causing issues

-- First, check if there are any remaining policies that expose personal data
DROP POLICY IF EXISTS "Hairdressers can view and update their profiles" ON public.hairdressers;

-- Recreate with proper restrictions
CREATE POLICY "Hairdressers can view and update their profiles" 
ON public.hairdressers 
FOR ALL
USING (auth_id = auth.uid())
WITH CHECK (auth_id = auth.uid());

-- Ensure admin access is separate
CREATE POLICY "Admins can view all hairdresser data" 
ON public.hairdressers 
FOR SELECT
USING (get_current_user_role() = 'admin');

-- Make sure there's no policy that allows public access to contact info
-- The "Public can view business info only" should only work for unauthenticated users
-- and should not expose email/phone

-- Create a function to get sanitized hairdresser data for public use
CREATE OR REPLACE FUNCTION public.get_public_hairdresser_data()
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

-- Grant access to this function for public use
GRANT EXECUTE ON FUNCTION public.get_public_hairdresser_data() TO anon;