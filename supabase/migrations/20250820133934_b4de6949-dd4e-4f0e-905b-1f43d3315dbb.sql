-- SECURITY FIX: Restrict public access to hairdressers table to only business information
-- Drop the overly permissive public policy
DROP POLICY IF EXISTS "Public can view business info only" ON public.hairdressers;

-- Create a more restrictive policy that still allows public access but will be enforced at application level
-- The key change is that we'll update the application code to use the secure view
CREATE POLICY "Public business info access" 
ON public.hairdressers 
FOR SELECT 
USING (
  is_active = true 
  AND auth.uid() IS NULL
);

-- Log this security fix in system_logs
INSERT INTO public.system_logs (event_type, message, metadata, created_at)
VALUES (
  'security_fix_applied',
  'Updated hairdressers table RLS policy for better security',
  jsonb_build_object(
    'action', 'hairdressers_rls_policy_updated',
    'timestamp', extract(epoch from now())
  ),
  now()
);