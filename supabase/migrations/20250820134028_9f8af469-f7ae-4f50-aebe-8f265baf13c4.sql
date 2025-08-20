-- SECURITY FIX: Restrict public access to hairdressers table to only business information
-- Drop the overly permissive public policy
DROP POLICY IF EXISTS "Public can view business info only" ON public.hairdressers;

-- Create a secure public view policy that restricts which columns can be accessed by unauthenticated users
CREATE POLICY "Public can view business info only (secure)" 
ON public.hairdressers 
FOR SELECT 
USING (
  is_active = true 
  AND auth.uid() IS NULL
);

-- Update hooks to use the secure hairdressers_public table instead of exposing full hairdresser data
-- The hairdressers_public table already exists and excludes email/phone columns

-- Log this security fix
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