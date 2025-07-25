-- Create booking status enum if it doesn't exist
DO $$ BEGIN
    CREATE TYPE booking_status AS ENUM ('pending','confirmed','declined');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create or update bookings table
CREATE TABLE IF NOT EXISTS public.bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES auth.users ON DELETE CASCADE,
  stylist_id uuid REFERENCES auth.users ON DELETE CASCADE,
  service_id uuid REFERENCES public.services ON DELETE SET NULL,
  scheduled_at timestamptz NOT NULL,
  status booking_status DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "client_rw_own" ON public.bookings;
DROP POLICY IF EXISTS "stylist_update_status" ON public.bookings;
DROP POLICY IF EXISTS "stylist_read_own" ON public.bookings;

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

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_bookings_updated_at ON public.bookings;
CREATE TRIGGER update_bookings_updated_at
    BEFORE UPDATE ON public.bookings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();