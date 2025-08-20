-- SECURITY FIX: Remove all remaining public access to hairdressers table
DROP POLICY IF EXISTS "Public business info access" ON public.hairdressers;

-- Verify no unauthenticated users can access the table with sensitive data
-- The "Authenticated users only access to hairdressers" policy should be the only SELECT policy for the main table

-- Log this final security fix
INSERT INTO public.system_logs (event_type, message, metadata, created_at)
VALUES (
  'security_final_fix',
  'Removed all remaining public access policies to hairdressers table',
  jsonb_build_object(
    'action', 'removed_public_business_info_access_policy',
    'timestamp', extract(epoch from now())
  ),
  now()
);