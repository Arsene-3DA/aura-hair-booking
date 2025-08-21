-- Fix RLS policies for public access to professional profiles and availability

-- First, ensure hairdressers table allows public access to active professionals
DROP POLICY IF EXISTS "Public can view basic hairdresser info" ON public.hairdressers;

CREATE POLICY "Public can view active hairdressers" 
ON public.hairdressers 
FOR SELECT 
USING (is_active = true);

-- Ensure availability/time slots are publicly viewable for booking
DROP POLICY IF EXISTS "Public can view availabilities for booking" ON public.availabilities;

CREATE POLICY "Public can view availabilities for booking" 
ON public.availabilities 
FOR SELECT 
USING (true);

-- Ensure services and hairdresser_services are publicly accessible
DROP POLICY IF EXISTS "Public read access to services" ON public.services;
DROP POLICY IF EXISTS "Everyone can view hairdresser services" ON public.hairdresser_services;

CREATE POLICY "Public read access to services" 
ON public.services 
FOR SELECT 
USING (true);

CREATE POLICY "Public can view hairdresser services" 
ON public.hairdresser_services 
FOR SELECT 
USING (true);

-- Ensure confirmed reservations times are visible for availability checking
DROP POLICY IF EXISTS "Public can view confirmed reservations times" ON public.new_reservations;

CREATE POLICY "Public can view confirmed reservations times" 
ON public.new_reservations 
FOR SELECT 
USING (status = 'confirmed'::booking_status);