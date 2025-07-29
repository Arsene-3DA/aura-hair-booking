-- Fix missing services.category column
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS category TEXT;

-- Fix system_logs RLS policy to allow logging
DROP POLICY IF EXISTS "Allow system logs" ON public.system_logs;
CREATE POLICY "Allow system logs" ON public.system_logs
FOR INSERT WITH CHECK (true);

-- Add some sample hairdresser_services data to fix empty queries
INSERT INTO public.hairdresser_services (hairdresser_id, service_id) 
SELECT h.id, s.id 
FROM public.hairdressers h, public.services s 
WHERE NOT EXISTS (
  SELECT 1 FROM public.hairdresser_services hs 
  WHERE hs.hairdresser_id = h.id AND hs.service_id = s.id
)
LIMIT 20
ON CONFLICT DO NOTHING;