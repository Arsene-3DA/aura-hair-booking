-- Ensure public access to professional profiles and portfolio data

-- Update profiles table policies for public access to professional profiles
CREATE POLICY IF NOT EXISTS "Public can view professional profiles" 
ON public.profiles 
FOR SELECT 
USING (role IN ('coiffeur', 'coiffeuse', 'cosmetique'));

-- Update portfolio table policies for public access
CREATE POLICY IF NOT EXISTS "Public can view portfolio" 
ON public.portfolio 
FOR SELECT 
USING (true);

-- Update hairdressers table policies for public access
CREATE POLICY IF NOT EXISTS "Public can view active hairdressers" 
ON public.hairdressers 
FOR SELECT 
USING (is_active = true);

-- Update hairdresser_services policies for public access
CREATE POLICY IF NOT EXISTS "Public can view hairdresser services" 
ON public.hairdresser_services 
FOR SELECT 
USING (true);

-- Update reviews policies for public access to approved reviews
CREATE POLICY IF NOT EXISTS "Public can view approved reviews" 
ON public.reviews 
FOR SELECT 
USING (is_approved = true);