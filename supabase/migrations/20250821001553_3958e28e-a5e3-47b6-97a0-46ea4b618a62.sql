-- Update existing policies to allow public access to professional data

-- Update hairdressers policy for better public access
DROP POLICY IF EXISTS "Public can view active hairdressers" ON public.hairdressers;

CREATE POLICY "Public can view active hairdressers" 
ON public.hairdressers 
FOR SELECT 
USING (is_active = true);

-- Ensure availability slots are publicly viewable
ALTER TABLE public.availabilities ENABLE ROW LEVEL SECURITY;

-- Check if policy exists first, then create if needed
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public view availabilities' AND tablename = 'availabilities') THEN
        CREATE POLICY "Public view availabilities" 
        ON public.availabilities 
        FOR SELECT 
        USING (true);
    END IF;
END $$;