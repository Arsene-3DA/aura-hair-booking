
-- Créer une table pour les profils des coiffeurs
CREATE TABLE public.hairdressers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  specialties TEXT[],
  experience TEXT,
  location TEXT,
  gender TEXT CHECK (gender IN ('male', 'female')),
  image_url TEXT,
  rating DECIMAL(2,1) DEFAULT 0.0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Créer une table pour les réservations
CREATE TABLE public.bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  hairdresser_id UUID REFERENCES public.hairdressers(id) ON DELETE CASCADE NOT NULL,
  client_name TEXT NOT NULL,
  client_email TEXT NOT NULL,
  client_phone TEXT NOT NULL,
  service TEXT NOT NULL,
  booking_date DATE NOT NULL,
  booking_time TIME NOT NULL,
  status TEXT CHECK (status IN ('en_attente', 'confirmé', 'refusé', 'terminé')) DEFAULT 'en_attente',
  comments TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(hairdresser_id, booking_date, booking_time)
);

-- Activer RLS (Row Level Security)
ALTER TABLE public.hairdressers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour hairdressers
CREATE POLICY "Les coiffeurs peuvent voir leur propre profil" 
  ON public.hairdressers 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Les coiffeurs peuvent modifier leur propre profil" 
  ON public.hairdressers 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Tout le monde peut voir les coiffeurs actifs" 
  ON public.hairdressers 
  FOR SELECT 
  USING (is_active = true);

-- Politiques RLS pour bookings
CREATE POLICY "Les coiffeurs peuvent voir leurs réservations" 
  ON public.bookings 
  FOR SELECT 
  USING (
    hairdresser_id IN (
      SELECT id FROM public.hairdressers WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Les coiffeurs peuvent modifier leurs réservations" 
  ON public.bookings 
  FOR UPDATE 
  USING (
    hairdresser_id IN (
      SELECT id FROM public.hairdressers WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Tout le monde peut créer des réservations" 
  ON public.bookings 
  FOR INSERT 
  WITH CHECK (true);

-- Insérer les coiffeurs existants dans la base de données
INSERT INTO public.hairdressers (name, email, specialties, experience, location, gender, image_url, rating) VALUES
('Anna Martin', 'anna.martin@salonpremium.fr', ARRAY['Coupe Femme', 'Couleur', 'Balayage'], '8 ans d''expérience', 'Salon Premium - 16e arr.', 'female', 'https://images.unsplash.com/photo-1562322140-8baeececf3df?w=400&h=400&fit=crop&crop=face', 4.9),
('Julie Dubois', 'julie.dubois@salonpremium.fr', ARRAY['Soins', 'Extensions', 'Coiffage'], '6 ans d''expérience', 'Salon Premium - 7e arr.', 'female', 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=400&h=400&fit=crop&crop=face', 4.8),
('Marc Rousseau', 'marc.rousseau@salonpremium.fr', ARRAY['Coupe Homme', 'Barbe', 'Styling'], '12 ans d''expérience', 'Salon Premium - 15e arr.', 'male', 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop&crop=face', 4.9),
('Sophie Laurent', 'sophie.laurent@salonpremium.fr', ARRAY['Coupe', 'Couleur', 'Mèches'], '5 ans d''expérience', 'Salon Premium - 9e arr.', 'female', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=face', 4.7),
('Thomas Moreau', 'thomas.moreau@salonpremium.fr', ARRAY['Coupe Moderne', 'Dégradé', 'Entretien'], '7 ans d''expérience', 'Salon Premium - 8e arr.', 'male', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face', 4.8),
('Camille Petit', 'camille.petit@salonpremium.fr', ARRAY['Mariée', 'Événement', 'Chignon'], '10 ans d''expérience', 'Salon Premium - 6e arr.', 'female', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face', 5.0),
('Pierre Martin', 'pierre.martin@salonpremium.fr', ARRAY['Coupe Classique', 'Barbe', 'Rasage'], '15 ans d''expérience', 'Salon Premium - 1er arr.', 'male', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face', 4.7);

-- Fonction pour nettoyer les réservations expirées
CREATE OR REPLACE FUNCTION public.clean_expired_bookings()
RETURNS void AS $$
BEGIN
  DELETE FROM public.bookings 
  WHERE status = 'en_attente' 
  AND expires_at IS NOT NULL 
  AND expires_at < NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
