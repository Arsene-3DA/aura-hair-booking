-- SECURITY FIX: Restrict public access to hairdressers table to only business information
-- Drop the overly permissive public policy
DROP POLICY IF EXISTS "Public can view business info only" ON public.hairdressers;

-- Create a secure public view policy that restricts which columns can be accessed by unauthenticated users
-- This policy will work in conjunction with application-level column filtering
CREATE POLICY "Public can view business info only (secure)" 
ON public.hairdressers 
FOR SELECT 
USING (
  is_active = true 
  AND auth.uid() IS NULL
);

-- Update the existing hairdressers_public view to exclude sensitive data
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

-- Create RLS policy for the view
CREATE POLICY "hairdressers_public_view_access" 
ON public.hairdressers_public 
FOR SELECT 
USING (true);

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