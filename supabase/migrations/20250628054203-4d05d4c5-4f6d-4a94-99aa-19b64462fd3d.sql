
-- Supprimer d'abord toutes les policies existantes sur hairdressers
DROP POLICY IF EXISTS "Les coiffeurs peuvent voir leur propre profil" ON public.hairdressers;
DROP POLICY IF EXISTS "Les coiffeurs peuvent modifier leur propre profil" ON public.hairdressers;
DROP POLICY IF EXISTS "Les administrateurs peuvent tout voir" ON public.hairdressers;
DROP POLICY IF EXISTS "Les administrateurs peuvent tout modifier" ON public.hairdressers;

-- Supprimer les anciennes tables et recréer avec la nouvelle structure auth
DROP TABLE IF EXISTS public.coiffeur_profiles CASCADE;
DROP TABLE IF EXISTS public.user_sessions CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- Modifier la table hairdressers pour utiliser auth.users
ALTER TABLE public.hairdressers 
DROP COLUMN IF EXISTS user_id CASCADE,
ADD COLUMN IF NOT EXISTS auth_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Créer une table clients optionnelle
CREATE TABLE IF NOT EXISTS public.clients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  auth_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT,
  email TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(auth_id)
);

-- Modifier la table bookings pour référencer auth.users directement
ALTER TABLE public.bookings 
DROP COLUMN IF EXISTS client_user_id CASCADE,
ADD COLUMN IF NOT EXISTS client_auth_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Activer RLS sur toutes les tables
ALTER TABLE public.hairdressers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Nouvelles policies RLS pour hairdressers
CREATE POLICY "hairdresser_self" ON public.hairdressers
  FOR ALL
  USING (auth.uid() = auth_id);

CREATE POLICY "admin_full_hairdressers" ON public.hairdressers
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "public_read_hairdressers" ON public.hairdressers
  FOR SELECT
  USING (is_active = true);

-- Policies pour clients
CREATE POLICY "client_self" ON public.clients
  FOR ALL
  USING (auth.uid() = auth_id);

CREATE POLICY "admin_full_clients" ON public.clients
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin');

-- Policies pour bookings
CREATE POLICY "client_insert_booking" ON public.bookings
  FOR INSERT
  WITH CHECK (client_auth_id = auth.uid() OR auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "client_view_own_bookings" ON public.bookings
  FOR SELECT
  USING (client_auth_id = auth.uid() OR auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "hairdresser_view_bookings" ON public.bookings
  FOR SELECT
  USING (
    hairdresser_id IN (
      SELECT id FROM public.hairdressers WHERE auth_id = auth.uid()
    ) OR auth.jwt() ->> 'role' = 'admin'
  );

CREATE POLICY "hairdresser_update_bookings" ON public.bookings
  FOR UPDATE
  USING (
    hairdresser_id IN (
      SELECT id FROM public.hairdressers WHERE auth_id = auth.uid()
    ) OR auth.jwt() ->> 'role' = 'admin'
  );

CREATE POLICY "admin_full_bookings" ON public.bookings
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin');

-- Fonction pour créer automatiquement un profil client à l'inscription
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.raw_user_meta_data ->> 'role' = 'client' OR NEW.raw_user_meta_data ->> 'role' IS NULL THEN
    INSERT INTO public.clients (auth_id, name, email)
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data ->> 'name', NEW.email),
      NEW.email
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger pour créer automatiquement les profils
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Nettoyer les anciennes données
DELETE FROM public.hairdressers;
