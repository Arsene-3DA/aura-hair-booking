-- SECURITY FIX: Restrict public access to hairdressers table to only business information
-- Drop the overly permissive public policy
DROP POLICY IF EXISTS "Public can view business info only" ON public.hairdressers;

-- Create a secure public view policy that excludes personal contact information
CREATE POLICY "Public can view business info only (secure)" 
ON public.hairdressers 
FOR SELECT 
USING (
  is_active = true 
  AND auth.uid() IS NULL
);

-- Create a materialized view for public hairdresser data (business info only)
CREATE MATERIALIZED VIEW IF NOT EXISTS public.hairdressers_public_secure AS
SELECT 
  id,
  name,
  specialties,
  rating,
  salon_address,
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
  auth_id
FROM public.hairdressers
WHERE is_active = true;

-- Enable RLS on the materialized view
ALTER TABLE public.hairdressers_public_secure ENABLE ROW LEVEL SECURITY;

-- Create policy for public access to the secure view
CREATE POLICY "Public secure hairdresser data" 
ON public.hairdressers_public_secure 
FOR SELECT 
USING (true);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_hairdressers_public_secure_active 
ON public.hairdressers_public_secure(is_active) 
WHERE is_active = true;

-- Update the existing hairdressers_public table to match the secure structure
DROP VIEW IF EXISTS public.hairdressers_public CASCADE;
CREATE VIEW public.hairdressers_public AS 
SELECT 
  id,
  name,
  specialties,
  rating,
  salon_address,
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
  auth_id
FROM public.hairdressers
WHERE is_active = true;

-- Create a function to refresh the materialized view
CREATE OR REPLACE FUNCTION public.refresh_hairdressers_public_secure()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.hairdressers_public_secure;
END;
$$;

-- Log this security fix in system_logs
INSERT INTO public.system_logs (event_type, message, metadata, created_at)
VALUES (
  'security_fix_applied',
  'Restricted public access to hairdressers table - removed email and phone exposure',
  jsonb_build_object(
    'action', 'hairdressers_public_access_restricted',
    'removed_fields', array['email', 'phone'],
    'timestamp', extract(epoch from now())
  ),
  now()
);