-- SECURITY FIX: Completely block unauthenticated access to sensitive hairdresser data
-- Remove the public access policy that allows unauthenticated users to access the main table
DROP POLICY IF EXISTS "Public can view business info only (secure)" ON public.hairdressers;

-- Create a much more restrictive policy that only allows authenticated users to access the full table
-- Public users must use the hairdressers_public table instead
CREATE POLICY "Authenticated users only access to hairdressers" 
ON public.hairdressers 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL
);

-- Ensure the hairdressers_public table has proper access for everyone
-- This table already excludes email and phone columns
DROP POLICY IF EXISTS "hairdressers_public_view_access" ON public.hairdressers_public;

-- Create comprehensive RLS policy for the public table
CREATE POLICY "Public access to business information only" 
ON public.hairdressers_public 
FOR SELECT 
USING (
  is_active = true
);

-- Log this security improvement
INSERT INTO public.system_logs (event_type, message, metadata, created_at)
VALUES (
  'security_enhancement_applied',
  'Completely restricted unauthenticated access to hairdressers table with sensitive data',
  jsonb_build_object(
    'action', 'hairdressers_table_access_completely_restricted',
    'change', 'Unauthenticated users can only access hairdressers_public table',
    'timestamp', extract(epoch from now())
  ),
  now()
);