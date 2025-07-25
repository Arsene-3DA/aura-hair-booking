-- 1. Clean ALL existing policies that might conflict
DROP POLICY IF EXISTS "Admins can view all profiles"           ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles"         ON public.profiles;
DROP POLICY IF EXISTS "Stylists can view client profiles for their bookings" ON public.profiles;

-- Clean old user policies to recreate them
DROP POLICY IF EXISTS "Les admins peuvent voir tous les utilisateurs" ON public.users;
DROP POLICY IF EXISTS "Les admins peuvent modifier tous les utilisateurs" ON public.users;
DROP POLICY IF EXISTS "Les admins peuvent créer des utilisateurs" ON public.users;
DROP POLICY IF EXISTS "Les admins peuvent voir toutes les réservations" ON public.reservations;

-- 2. Drop and recreate helper functions with CASCADE
DROP FUNCTION IF EXISTS public.get_current_user_role() CASCADE;
DROP FUNCTION IF EXISTS public.is_admin() CASCADE;

-- Recreate functions
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$ SELECT role::text FROM public.profiles WHERE user_id = auth.uid() LIMIT 1; $$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$ SELECT EXISTS (
  SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'admin'
); $$;

GRANT EXECUTE ON FUNCTION public.is_admin()            TO authenticator;
GRANT EXECUTE ON FUNCTION public.get_current_user_role TO authenticator;

-- 3. Recreate policies for users table
CREATE POLICY "Les admins peuvent voir tous les utilisateurs"
  ON public.users
  FOR SELECT USING (public.get_current_user_role() = 'admin');

CREATE POLICY "Les admins peuvent modifier tous les utilisateurs"
  ON public.users
  FOR UPDATE USING (public.get_current_user_role() = 'admin');

CREATE POLICY "Les admins peuvent créer des utilisateurs"
  ON public.users
  FOR INSERT WITH CHECK (public.get_current_user_role() = 'admin');

-- 4. Recreate policies for reservations table
CREATE POLICY "Les admins peuvent voir toutes les réservations"
  ON public.reservations
  FOR SELECT USING (public.get_current_user_role() = 'admin');

-- 5. Create new admin policies for profiles (non-recursive)
CREATE POLICY "Admins can view all profiles"
  ON public.profiles
  FOR SELECT USING (public.is_admin());

CREATE POLICY "Admins can update all profiles"
  ON public.profiles
  FOR UPDATE USING (public.is_admin());

-- 6. Create hairdresser_services table
CREATE TABLE IF NOT EXISTS public.hairdresser_services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hairdresser_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  service_id uuid     NOT NULL REFERENCES public.services(id)  ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE (hairdresser_id, service_id)
);

ALTER TABLE public.hairdresser_services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view hairdresser services"
  ON public.hairdresser_services
  FOR SELECT USING (true);

CREATE POLICY "Hairdressers manage their services"
  ON public.hairdresser_services
  FOR ALL
  USING (hairdresser_id = auth.uid());

-- 7. Insert default services for existing coiffeurs (correct enum value)
INSERT INTO public.hairdresser_services (hairdresser_id, service_id)
SELECT p.id, s.id
FROM public.profiles p
JOIN public.services s ON true
WHERE p.role = 'coiffeur'
ON CONFLICT DO NOTHING;

-- 8. Fix bookings table
DO $$
BEGIN
  -- Remove password_hash column if it exists
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_name='bookings' AND column_name='password_hash')
  THEN
    ALTER TABLE public.bookings DROP COLUMN password_hash;
  END IF;

  -- Add client_auth_id if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name='bookings' AND column_name='client_auth_id')
  THEN
    ALTER TABLE public.bookings ADD COLUMN client_auth_id uuid REFERENCES auth.users(id);
  END IF;
END $$;

-- 9. Create profile auto-creation trigger
CREATE OR REPLACE FUNCTION public.ensure_user_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $func$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'client')
  )
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$func$;

GRANT EXECUTE ON FUNCTION public.ensure_user_profile() TO authenticator;

DROP TRIGGER IF EXISTS ensure_user_profile_trigger ON auth.users;
CREATE TRIGGER ensure_user_profile_trigger
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.ensure_user_profile();