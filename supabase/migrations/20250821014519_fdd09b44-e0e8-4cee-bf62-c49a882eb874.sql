-- Améliorer les politiques RLS pour permettre l'affichage public des créneaux
-- et des données nécessaires pour les réservations

-- Permettre l'accès public aux données de disponibilité
CREATE POLICY "Public can view availability for booking" ON public.availabilities
FOR SELECT 
USING (true);

-- S'assurer que les hairdressers sont visibles publiquement pour les réservations
DROP POLICY IF EXISTS "Public can view hairdresser booking info" ON public.hairdressers;
CREATE POLICY "Public can view hairdresser booking info" ON public.hairdressers
FOR SELECT 
USING (is_active = true);

-- Permettre l'accès public aux services pour affichage durant réservation
DROP POLICY IF EXISTS "Public view services for booking" ON public.services;
CREATE POLICY "Public view services for booking" ON public.services
FOR SELECT 
USING (true);

-- Permettre l'accès public aux liaisons hairdresser_services
DROP POLICY IF EXISTS "Public view hairdresser services for booking" ON public.hairdresser_services;
CREATE POLICY "Public view hairdresser services for booking" ON public.hairdresser_services
FOR SELECT 
USING (true);