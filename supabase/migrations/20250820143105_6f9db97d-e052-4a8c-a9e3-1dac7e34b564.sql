-- Drop existing duplicate policies and fix the remaining issues
DROP POLICY IF EXISTS "Hairdressers can view their own profile" ON hairdressers;

-- Create proper secure policies for hairdressers table
CREATE POLICY "Hairdressers can view their own profile" 
ON hairdressers 
FOR SELECT 
USING (auth.uid() = auth_id);

-- Fix services to allow authenticated users only
DROP POLICY IF EXISTS "Services sont publiquement visibles" ON services;

-- Grant appropriate access to the secure functions
GRANT EXECUTE ON FUNCTION get_public_hairdresser_data_secure() TO public;
GRANT EXECUTE ON FUNCTION get_public_hairdresser_data() TO public;