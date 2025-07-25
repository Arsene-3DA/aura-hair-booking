-- Créer les tables services et bookings pour le système de réservation (version corrigée)

-- Table des services
CREATE TABLE IF NOT EXISTS public.services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10,2) NOT NULL,
  duration INTEGER NOT NULL, -- en minutes
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Type enum pour le statut des réservations
DO $$ BEGIN
  CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'declined', 'completed');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Table des réservations
CREATE TABLE IF NOT EXISTS public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stylist_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  service_id UUID REFERENCES public.services(id) ON DELETE SET NULL,
  scheduled_at TIMESTAMPTZ NOT NULL,
  status booking_status NOT NULL DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Activer RLS sur les tables
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Policies pour services (tous peuvent voir les services)
CREATE POLICY "Services are viewable by everyone"
  ON public.services FOR SELECT
  USING (true);

CREATE POLICY "Only admins can manage services"
  ON public.services FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Policies pour bookings
CREATE POLICY "Clients can view their own bookings"
  ON public.bookings FOR SELECT
  USING (client_user_id = auth.uid());

CREATE POLICY "Stylists can view their bookings"
  ON public.bookings FOR SELECT
  USING (stylist_user_id = auth.uid());

CREATE POLICY "Admins can view all bookings"
  ON public.bookings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Clients can create bookings"
  ON public.bookings FOR INSERT
  WITH CHECK (client_user_id = auth.uid());

CREATE POLICY "Stylists can update their booking status"
  ON public.bookings FOR UPDATE
  USING (stylist_user_id = auth.uid())
  WITH CHECK (stylist_user_id = auth.uid());

CREATE POLICY "Admins can manage all bookings"
  ON public.bookings FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Trigger pour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON public.services
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON public.bookings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insérer quelques services de base
INSERT INTO public.services (name, description, price, duration) VALUES
  ('Coupe Homme', 'Coupe classique pour homme', 25.00, 30),
  ('Coupe Femme', 'Coupe et brushing pour femme', 35.00, 45),
  ('Coloration', 'Coloration complète', 60.00, 90),
  ('Mèches', 'Mèches et balayage', 80.00, 120),
  ('Permanente', 'Permanente complète', 70.00, 105)
ON CONFLICT DO NOTHING;