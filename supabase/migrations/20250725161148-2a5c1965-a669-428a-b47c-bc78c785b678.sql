-- Create booking status enum if it doesn't exist
DO $$ BEGIN
    CREATE TYPE booking_status AS ENUM ('pending','confirmed','declined');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- First, let's rename and restructure the existing bookings table
-- Add new columns to existing table
ALTER TABLE public.bookings 
ADD COLUMN IF NOT EXISTS client_id uuid REFERENCES auth.users ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS stylist_id uuid REFERENCES auth.users ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS service_id uuid REFERENCES public.services ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS scheduled_at timestamptz;

-- Update client_id from client_auth_id if it exists
UPDATE public.bookings 
SET client_id = client_auth_id 
WHERE client_auth_id IS NOT NULL AND client_id IS NULL;

-- Update stylist_id from hairdresser_id 
UPDATE public.bookings 
SET stylist_id = hairdresser_id 
WHERE hairdresser_id IS NOT NULL AND stylist_id IS NULL;

-- Create scheduled_at from booking_date and booking_time
UPDATE public.bookings 
SET scheduled_at = (booking_date::text || ' ' || booking_time::text)::timestamptz
WHERE booking_date IS NOT NULL AND booking_time IS NOT NULL AND scheduled_at IS NULL;

-- Update status column to use new enum values
UPDATE public.bookings 
SET status = CASE 
    WHEN status = 'en_attente' THEN 'pending'
    WHEN status = 'confirmé' THEN 'confirmed'
    WHEN status = 'refusé' THEN 'declined'
    ELSE 'pending'
END;

-- Change status column type to use enum
ALTER TABLE public.bookings 
ALTER COLUMN status TYPE booking_status USING status::booking_status;

-- Set default for status
ALTER TABLE public.bookings 
ALTER COLUMN status SET DEFAULT 'pending';

-- Make required columns NOT NULL
ALTER TABLE public.bookings 
ALTER COLUMN scheduled_at SET NOT NULL;

-- Enable RLS
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "client_rw_own" ON public.bookings;
DROP POLICY IF EXISTS "stylist_update_status" ON public.bookings;
DROP POLICY IF EXISTS "stylist_read_own" ON public.bookings;
DROP POLICY IF EXISTS "Stylists can update their bookings status" ON public.bookings;
DROP POLICY IF EXISTS "Stylists can view their bookings" ON public.bookings;
DROP POLICY IF EXISTS "Utilisateurs authentifiés peuvent créer des réservations" ON public.bookings;
DROP POLICY IF EXISTS "admin_full_bookings" ON public.bookings;
DROP POLICY IF EXISTS "client_insert_booking" ON public.bookings;
DROP POLICY IF EXISTS "client_view_own_bookings" ON public.bookings;
DROP POLICY IF EXISTS "hairdresser_update_bookings" ON public.bookings;
DROP POLICY IF EXISTS "hairdresser_view_bookings" ON public.bookings;

-- Client can read/insert their own bookings
CREATE POLICY "client_rw_own"
ON public.bookings
FOR ALL
USING (client_id = auth.uid())
WITH CHECK (client_id = auth.uid());

-- Stylist can read their bookings
CREATE POLICY "stylist_read_own"
ON public.bookings
FOR SELECT
USING (stylist_id = auth.uid());

-- Stylist can update status of their bookings
CREATE POLICY "stylist_update_status"
ON public.bookings
FOR UPDATE
USING (stylist_id = auth.uid())
WITH CHECK (stylist_id = auth.uid() AND status IN ('confirmed','declined'));