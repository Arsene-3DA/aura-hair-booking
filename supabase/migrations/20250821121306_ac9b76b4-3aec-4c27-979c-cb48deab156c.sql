-- Assurer l'accès public complet aux professionnels
-- 1. Politique RLS pour accès public anonyme aux professionnels actifs
CREATE POLICY IF NOT EXISTS "Anonymous users can view active professionals" 
ON public.hairdressers 
FOR SELECT 
TO anon
USING (is_active = true);

-- 2. Politique RLS pour accès public aux profils de professionnels
CREATE POLICY IF NOT EXISTS "Public can view professional profiles" 
ON public.profiles 
FOR SELECT 
TO public
USING (role IN ('coiffeur', 'coiffeuse', 'cosmetique'));

-- 3. Assurer que la vue professionals_public est accessible publiquement
GRANT SELECT ON public.professionals_public TO anon;
GRANT SELECT ON public.professionals_public TO authenticated;