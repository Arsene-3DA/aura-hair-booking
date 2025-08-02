-- Ensure public access to professional profiles and portfolio data

-- Add public access policy for professional profiles
DROP POLICY IF EXISTS "Public can view professional profiles" ON public.profiles;
CREATE POLICY "Public can view professional profiles" 
ON public.profiles 
FOR SELECT 
USING (role IN ('coiffeur', 'coiffeuse', 'cosmetique'));

-- Add public access policy for portfolio
DROP POLICY IF EXISTS "Public can view portfolio" ON public.portfolio;
CREATE POLICY "Public can view portfolio" 
ON public.portfolio 
FOR SELECT 
USING (true);

-- Add public access policy for active hairdressers (this one already exists but ensuring it's there)
DROP POLICY IF EXISTS "Public can view active hairdressers" ON public.hairdressers;
CREATE POLICY "Public can view active hairdressers" 
ON public.hairdressers 
FOR SELECT 
USING (is_active = true);

-- Add public access policy for hairdresser services (this one already exists as "Everyone can view hairdresser services")
DROP POLICY IF EXISTS "Public can view hairdresser services" ON public.hairdresser_services;
CREATE POLICY "Public can view hairdresser services" 
ON public.hairdresser_services 
FOR SELECT 
USING (true);

-- Add public access policy for approved reviews
DROP POLICY IF EXISTS "Public can view approved reviews" ON public.reviews;
CREATE POLICY "Public can view approved reviews" 
ON public.reviews 
FOR SELECT 
USING (is_approved = true);