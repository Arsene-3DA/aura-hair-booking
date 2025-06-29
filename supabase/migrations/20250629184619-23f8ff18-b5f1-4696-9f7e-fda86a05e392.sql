
-- Nettoyer et recréer la structure pour le système de rôles
DROP TABLE IF EXISTS public.user_roles CASCADE;
DROP TABLE IF EXISTS public.coiffeur_profiles CASCADE;
DROP TABLE IF EXISTS public.user_sessions CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- Créer un enum pour les rôles
CREATE TYPE public.user_role AS ENUM ('client', 'coiffeur', 'admin');

-- Créer un enum pour les statuts
CREATE TYPE public.user_status AS ENUM ('actif', 'bloque', 'inactif');

-- Créer un enum pour les statuts de réservation
CREATE TYPE public.reservation_status AS ENUM ('en_attente', 'confirmee', 'annulee');

-- Table users principale
CREATE TABLE public.users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  auth_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  nom TEXT NOT NULL,
  prenom TEXT NOT NULL,
  telephone TEXT,
  role user_role DEFAULT 'client',
  status user_status DEFAULT 'actif',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Renommer la table bookings en reservations et l'adapter
DROP TABLE IF EXISTS public.reservations CASCADE;
CREATE TABLE public.reservations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  coiffeur_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  date_reservation DATE NOT NULL,
  heure_reservation TIME NOT NULL,
  service_demande TEXT NOT NULL,
  status reservation_status DEFAULT 'en_attente',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Activer RLS sur toutes les tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;

-- Fonction pour obtenir le rôle de l'utilisateur actuel
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS user_role AS $$
BEGIN
  RETURN (
    SELECT role 
    FROM public.users 
    WHERE auth_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Fonction pour obtenir l'ID utilisateur à partir de auth.uid()
CREATE OR REPLACE FUNCTION public.get_current_user_id()
RETURNS UUID AS $$
BEGIN
  RETURN (
    SELECT id 
    FROM public.users 
    WHERE auth_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Policies pour la table users
CREATE POLICY "Les utilisateurs peuvent voir leur propre profil" 
  ON public.users 
  FOR SELECT 
  USING (auth_id = auth.uid());

CREATE POLICY "Les admins peuvent voir tous les utilisateurs" 
  ON public.users 
  FOR SELECT 
  USING (public.get_current_user_role() = 'admin');

CREATE POLICY "Les coiffeurs peuvent voir les clients qui ont réservé chez eux" 
  ON public.users 
  FOR SELECT 
  USING (
    public.get_current_user_role() = 'coiffeur' 
    AND id IN (
      SELECT client_id 
      FROM public.reservations 
      WHERE coiffeur_id = public.get_current_user_id()
    )
  );

CREATE POLICY "Les utilisateurs peuvent modifier leur propre profil" 
  ON public.users 
  FOR UPDATE 
  USING (auth_id = auth.uid());

CREATE POLICY "Les admins peuvent modifier tous les utilisateurs" 
  ON public.users 
  FOR UPDATE 
  USING (public.get_current_user_role() = 'admin');

CREATE POLICY "Les admins peuvent créer des utilisateurs" 
  ON public.users 
  FOR INSERT 
  WITH CHECK (public.get_current_user_role() = 'admin');

-- Policies pour la table reservations
CREATE POLICY "Les clients peuvent voir leurs propres réservations" 
  ON public.reservations 
  FOR SELECT 
  USING (client_id = public.get_current_user_id());

CREATE POLICY "Les coiffeurs peuvent voir leurs réservations" 
  ON public.reservations 
  FOR SELECT 
  USING (coiffeur_id = public.get_current_user_id());

CREATE POLICY "Les admins peuvent voir toutes les réservations" 
  ON public.reservations 
  FOR SELECT 
  USING (public.get_current_user_role() = 'admin');

CREATE POLICY "Les clients peuvent créer des réservations" 
  ON public.reservations 
  FOR INSERT 
  WITH CHECK (client_id = public.get_current_user_id());

CREATE POLICY "Les coiffeurs peuvent modifier leurs réservations" 
  ON public.reservations 
  FOR UPDATE 
  USING (coiffeur_id = public.get_current_user_id());

CREATE POLICY "Les clients peuvent modifier leurs propres réservations" 
  ON public.reservations 
  FOR UPDATE 
  USING (client_id = public.get_current_user_id());

-- Fonction pour créer automatiquement un profil utilisateur
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (auth_id, email, nom, prenom, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'nom', 'Nom'),
    COALESCE(NEW.raw_user_meta_data ->> 'prenom', 'Prénom'),
    COALESCE((NEW.raw_user_meta_data ->> 'role')::user_role, 'client')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger pour créer automatiquement les profils
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();

-- Insérer les données de test
-- 1. Admin (nécessite d'abord créer l'utilisateur auth puis le profil)
INSERT INTO public.users (email, nom, prenom, role, telephone) 
VALUES ('admin@salon.com', 'Administrateur', 'Système', 'admin', '0123456789')
ON CONFLICT (email) DO NOTHING;

-- 2. Coiffeurs
INSERT INTO public.users (email, nom, prenom, role, telephone) 
VALUES 
  ('marie@salon.com', 'Dupont', 'Marie', 'coiffeur', '0123456790'),
  ('pierre@salon.com', 'Martin', 'Pierre', 'coiffeur', '0123456791')
ON CONFLICT (email) DO NOTHING;

-- 3. Client
INSERT INTO public.users (email, nom, prenom, role, telephone) 
VALUES ('client@email.com', 'Durand', 'Sophie', 'client', '0123456792')
ON CONFLICT (email) DO NOTHING;

-- Créer quelques réservations de test
INSERT INTO public.reservations (client_id, coiffeur_id, date_reservation, heure_reservation, service_demande, notes)
SELECT 
  (SELECT id FROM public.users WHERE email = 'client@email.com'),
  (SELECT id FROM public.users WHERE email = 'marie@salon.com'),
  CURRENT_DATE + INTERVAL '1 day',
  '14:00',
  'Coupe et brushing',
  'Première visite'
WHERE EXISTS (SELECT 1 FROM public.users WHERE email = 'client@email.com')
  AND EXISTS (SELECT 1 FROM public.users WHERE email = 'marie@salon.com');

INSERT INTO public.reservations (client_id, coiffeur_id, date_reservation, heure_reservation, service_demande, notes)
SELECT 
  (SELECT id FROM public.users WHERE email = 'client@email.com'),
  (SELECT id FROM public.users WHERE email = 'pierre@salon.com'),
  CURRENT_DATE + INTERVAL '3 days',
  '10:30',
  'Coloration',
  'Couleur châtain'
WHERE EXISTS (SELECT 1 FROM public.users WHERE email = 'client@email.com')
  AND EXISTS (SELECT 1 FROM public.users WHERE email = 'pierre@salon.com');
