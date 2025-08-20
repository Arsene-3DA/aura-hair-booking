-- SECURITY FIX: Enable RLS on hairdressers_public table to protect against data harvesting
ALTER TABLE public.hairdressers_public ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public access to active hairdressers only
CREATE POLICY "Allow public access to active hairdressers" 
ON public.hairdressers_public 
FOR SELECT 
USING (is_active = true);

-- Log this final security fix
INSERT INTO public.system_logs (event_type, message, metadata, created_at)
VALUES (
  'security_rls_enabled',
  'Enabled RLS on hairdressers_public table and created access policy',
  jsonb_build_object(
    'action', 'hairdressers_public_rls_enabled',
    'timestamp', extract(epoch from now())
  ),
  now()
);