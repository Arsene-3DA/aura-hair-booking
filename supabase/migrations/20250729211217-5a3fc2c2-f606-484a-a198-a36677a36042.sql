-- Fix missing services.category column
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS category TEXT;

-- Fix system_logs RLS policy to allow logging 
DROP POLICY IF EXISTS "Allow system logs" ON public.system_logs;
CREATE POLICY "Allow system logs" ON public.system_logs
FOR INSERT WITH CHECK (true);

-- Create a route for /tarifs if it doesn't exist by adding a services page