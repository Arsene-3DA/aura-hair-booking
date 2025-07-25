-- Créer d'abord les tables services et bookings

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

-- Table des réservations avec les bonnes colonnes
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

-- Insérer quelques services de base
INSERT INTO public.services (name, description, price, duration) VALUES
  ('Coupe Homme', 'Coupe classique pour homme', 25.00, 30),
  ('Coupe Femme', 'Coupe et brushing pour femme', 35.00, 45),
  ('Coloration', 'Coloration complète', 60.00, 90),
  ('Mèches', 'Mèches et balayage', 80.00, 120),
  ('Permanente', 'Permanente complète', 70.00, 105)
ON CONFLICT DO NOTHING;