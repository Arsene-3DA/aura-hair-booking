-- 1. Clean old policies
DROP POLICY IF EXISTS "Admins can view all profiles"           ON public.profiles;
DROP POLICY IF EXISTS "Stylists can view client profiles for their bookings" ON public.profiles;

-- 2. Drop and recreate helper functions to fix return types
DROP FUNCTION IF EXISTS public.get_current_user_role();
DROP FUNCTION IF EXISTS public.is_admin();

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

-- 3. Re-create admin policies without recursion
CREATE POLICY "Admins can view all profiles"
  ON public.profiles
  FOR SELECT USING (public.is_admin());

CREATE POLICY "Admins can update all profiles"
  ON public.profiles
  FOR UPDATE USING (public.is_admin());

-- 4. Table hairdresser_services (many-to-many)
CREATE TABLE IF NOT EXISTS public.hairdresser_services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hairdresser_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  service_id uuid     NOT NULL REFERENCES public.services(id)  ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE (hairdresser_id, service_id)
);
ALTER TABLE public.hairdresser_services ENABLE ROW LEVEL SECURITY;

-- Everyone can read
CREATE POLICY "Everyone can view hairdresser services"
  ON public.hairdresser_services
  FOR SELECT USING (true);

-- Hairdresser manages his own services
CREATE POLICY "Hairdressers manage their services"
  ON public.hairdresser_services
  FOR ALL
  USING (hairdresser_id = auth.uid());

-- 5. Insert default services for existing hairdressers
INSERT INTO public.hairdresser_services (hairdresser_id, service_id)
SELECT p.id, s.id
FROM public.profiles p
JOIN public.services s ON true
WHERE p.role = 'stylist'
ON CONFLICT DO NOTHING;

-- 6. Patch bookings table
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_name='bookings' AND column_name='password_hash')
  THEN
    ALTER TABLE public.bookings DROP COLUMN password_hash;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name='bookings' AND column_name='client_auth_id')
  THEN
    ALTER TABLE public.bookings ADD COLUMN client_auth_id uuid REFERENCES auth.users(id);
  END IF;
END $$;

-- 7. Ensure each auth.user has a profile
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