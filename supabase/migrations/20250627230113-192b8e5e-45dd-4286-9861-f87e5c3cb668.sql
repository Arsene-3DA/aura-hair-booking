
-- Créer une table pour les utilisateurs (clients et coiffeurs)
CREATE TABLE public.users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  user_type TEXT CHECK (user_type IN ('client', 'coiffeur', 'admin')) DEFAULT 'client',
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_active BOOLEAN DEFAULT true
);

-- Créer une table pour lier les coiffeurs aux utilisateurs
CREATE TABLE public.coiffeur_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  hairdresser_id UUID REFERENCES public.hairdressers(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id),
  UNIQUE(hairdresser_id)
);

-- Créer une table pour stocker les sessions
CREATE TABLE public.user_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  session_token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Modifier la table bookings pour lier aux utilisateurs clients
ALTER TABLE public.bookings ADD COLUMN client_user_id UUID REFERENCES public.users(id);

-- Activer RLS sur les nouvelles tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coiffeur_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour users
CREATE POLICY "Users can view their own profile" 
  ON public.users 
  FOR SELECT 
  USING (id = auth.uid() OR EXISTS (
    SELECT 1 FROM public.user_sessions 
    WHERE user_id = public.users.id 
    AND session_token = current_setting('app.current_session', true)
  ));

CREATE POLICY "Admins can view all users" 
  ON public.users 
  FOR SELECT 
  USING (user_type = 'admin');

CREATE POLICY "Users can update their own profile" 
  ON public.users 
  FOR UPDATE 
  USING (id = auth.uid());

CREATE POLICY "Admins can create users" 
  ON public.users 
  FOR INSERT 
  WITH CHECK (true);

-- Politiques RLS pour coiffeur_profiles
CREATE POLICY "Coiffeurs can view their own profile" 
  ON public.coiffeur_profiles 
  FOR SELECT 
  USING (user_id IN (
    SELECT id FROM public.users WHERE id = auth.uid()
  ));

CREATE POLICY "Admins can manage all coiffeur profiles" 
  ON public.coiffeur_profiles 
  FOR ALL 
  USING (EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND user_type = 'admin'
  ));

-- Politiques RLS pour user_sessions
CREATE POLICY "Users can view their own sessions" 
  ON public.user_sessions 
  FOR SELECT 
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own sessions" 
  ON public.user_sessions 
  FOR INSERT 
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own sessions" 
  ON public.user_sessions 
  FOR DELETE 
  USING (user_id = auth.uid());

-- Mettre à jour les politiques RLS pour bookings
DROP POLICY IF EXISTS "Les coiffeurs peuvent voir leurs réservations" ON public.bookings;
DROP POLICY IF EXISTS "Les coiffeurs peuvent modifier leurs réservations" ON public.bookings;

CREATE POLICY "Coiffeurs peuvent voir leurs réservations via profile" 
  ON public.bookings 
  FOR SELECT 
  USING (
    hairdresser_id IN (
      SELECT cp.hairdresser_id 
      FROM public.coiffeur_profiles cp 
      JOIN public.users u ON cp.user_id = u.id 
      WHERE u.id = auth.uid()
    )
  );

CREATE POLICY "Coiffeurs peuvent modifier leurs réservations via profile" 
  ON public.bookings 
  FOR UPDATE 
  USING (
    hairdresser_id IN (
      SELECT cp.hairdresser_id 
      FROM public.coiffeur_profiles cp 
      JOIN public.users u ON cp.user_id = u.id 
      WHERE u.id = auth.uid()
    )
  );

-- Fonction pour créer un hash de mot de passe (simulation, en production utiliser bcrypt)
CREATE OR REPLACE FUNCTION public.hash_password(password TEXT)
RETURNS TEXT AS $$
BEGIN
  -- En production, utiliser une vraie fonction de hash comme bcrypt
  -- Ici on fait une simulation simple
  RETURN encode(digest(password || 'salon_salt', 'sha256'), 'hex');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour créer un utilisateur client automatiquement lors d'une réservation
CREATE OR REPLACE FUNCTION public.create_client_user_if_not_exists()
RETURNS TRIGGER AS $$
DECLARE
  existing_user_id UUID;
  new_user_id UUID;
BEGIN
  -- Vérifier si l'utilisateur existe déjà
  SELECT id INTO existing_user_id 
  FROM public.users 
  WHERE email = NEW.client_email;
  
  IF existing_user_id IS NULL THEN
    -- Créer un nouvel utilisateur client
    INSERT INTO public.users (email, password_hash, user_type, first_name, phone)
    VALUES (
      NEW.client_email,
      public.hash_password('motdepasse123'), -- Mot de passe par défaut
      'client',
      NEW.client_name,
      NEW.client_phone
    )
    RETURNING id INTO new_user_id;
    
    NEW.client_user_id = new_user_id;
  ELSE
    NEW.client_user_id = existing_user_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger pour créer automatiquement les utilisateurs clients
CREATE TRIGGER create_client_user_trigger
  BEFORE INSERT ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.create_client_user_if_not_exists();

-- Créer un utilisateur admin par défaut
INSERT INTO public.users (email, password_hash, user_type, first_name, last_name)
VALUES ('admin@salon.fr', public.hash_password('admin123'), 'admin', 'Admin', 'Salon')
ON CONFLICT (email) DO NOTHING;

-- Créer des utilisateurs coiffeurs pour les coiffeurs existants
DO $$
DECLARE
  hairdresser_record RECORD;
  new_user_id UUID;
BEGIN
  FOR hairdresser_record IN SELECT * FROM public.hairdressers LOOP
    -- Créer un utilisateur pour chaque coiffeur
    INSERT INTO public.users (email, password_hash, user_type, first_name, phone)
    VALUES (
      hairdresser_record.email,
      public.hash_password('coiffeur123'), -- Mot de passe par défaut
      'coiffeur',
      hairdresser_record.name,
      hairdresser_record.phone
    )
    ON CONFLICT (email) DO NOTHING
    RETURNING id INTO new_user_id;
    
    -- Si l'utilisateur a été créé, créer le profil coiffeur
    IF new_user_id IS NOT NULL THEN
      INSERT INTO public.coiffeur_profiles (user_id, hairdresser_id)
      VALUES (new_user_id, hairdresser_record.id)
      ON CONFLICT DO NOTHING;
    END IF;
  END LOOP;
END $$;
