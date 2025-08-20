-- Corriger les politiques RLS pour permettre l'accès public aux données nécessaires

-- 1. Permettre l'accès public aux profils des professionnels
DROP POLICY IF EXISTS "profile_public_professionals" ON profiles;
CREATE POLICY "profile_public_professionals" 
ON profiles FOR SELECT 
USING (role IN ('coiffeur', 'coiffeuse', 'cosmetique'));

-- 2. Permettre l'accès public aux données des coiffeurs actifs
DROP POLICY IF EXISTS "Public can view basic hairdresser info" ON hairdressers;
CREATE POLICY "Public can view basic hairdresser info" 
ON hairdressers FOR SELECT 
USING (is_active = true);

-- 3. Permettre l'accès public aux disponibilités pour la génération de créneaux
DROP POLICY IF EXISTS "Public can view availabilities for booking" ON availabilities;
CREATE POLICY "Public can view availabilities for booking" 
ON availabilities FOR SELECT 
USING (true);

-- 4. Permettre l'accès public aux réservations confirmées (pour éviter les conflits)
DROP POLICY IF EXISTS "Public can view confirmed reservations times" ON new_reservations;
CREATE POLICY "Public can view confirmed reservations times" 
ON new_reservations FOR SELECT 
USING (status = 'confirmed');

-- 5. Permettre l'accès public aux services et relations hairdresser_services
DROP POLICY IF EXISTS "Public can view services" ON services;
CREATE POLICY "Public can view services" 
ON services FOR SELECT 
USING (true);

DROP POLICY IF EXISTS "Public can view hairdresser services relationships" ON hairdresser_services;
CREATE POLICY "Public can view hairdresser services relationships" 
ON hairdresser_services FOR SELECT 
USING (true);