-- Fix critical database security vulnerabilities

-- 1. Fix overly permissive booking creation policy
DROP POLICY IF EXISTS "Tout le monde peut créer des réservations" ON public.bookings;

-- Replace with proper authenticated-only policy
CREATE POLICY "Utilisateurs authentifiés peuvent créer des réservations" 
ON public.bookings 
FOR INSERT 
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- 2. Fix all database functions with proper search_path to prevent SQL injection
CREATE OR REPLACE FUNCTION public.clean_expired_bookings()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  DELETE FROM public.bookings 
  WHERE status = 'en_attente' 
  AND expires_at IS NOT NULL 
  AND expires_at < NOW();
END;
$function$;

CREATE OR REPLACE FUNCTION public.create_client_user_if_not_exists()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  existing_user_id UUID;
  new_user_id UUID;
BEGIN
  -- Input validation
  IF NEW.client_email IS NULL OR NEW.client_email = '' THEN
    RAISE EXCEPTION 'Email client requis';
  END IF;
  
  IF NEW.client_name IS NULL OR NEW.client_name = '' THEN
    RAISE EXCEPTION 'Nom client requis';
  END IF;

  -- Vérifier si l'utilisateur existe déjà
  SELECT id INTO existing_user_id 
  FROM public.users 
  WHERE email = NEW.client_email;
  
  IF existing_user_id IS NULL THEN
    -- Créer un nouvel utilisateur client
    INSERT INTO public.users (email, password_hash, user_type, first_name, phone)
    VALUES (
      NEW.client_email,
      public.hash_password('motdepasse123'),
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
$function$;

CREATE OR REPLACE FUNCTION public.get_current_user_id()
RETURNS uuid
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  RETURN (
    SELECT id 
    FROM public.users 
    WHERE auth_id = auth.uid()
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS user_role
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  RETURN (
    SELECT role 
    FROM public.users 
    WHERE auth_id = auth.uid()
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.hash_password(password text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  -- Input validation
  IF password IS NULL OR length(password) < 6 THEN
    RAISE EXCEPTION 'Mot de passe invalide';
  END IF;
  
  RETURN encode(digest(password || 'salon_salt', 'sha256'), 'hex');
END;
$function$;

CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  -- Input validation
  IF NEW.email IS NULL OR NEW.email = '' THEN
    RAISE EXCEPTION 'Email requis';
  END IF;

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
$function$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
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
$function$;

-- 3. Add booking validation trigger
CREATE OR REPLACE FUNCTION public.validate_booking_data()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $function$
BEGIN
  -- Validate booking date is not in the past
  IF NEW.booking_date < CURRENT_DATE THEN
    RAISE EXCEPTION 'La date de réservation ne peut pas être dans le passé';
  END IF;
  
  -- Validate booking date is not too far in the future (1 year max)
  IF NEW.booking_date > CURRENT_DATE + INTERVAL '1 year' THEN
    RAISE EXCEPTION 'La date de réservation ne peut pas dépasser 1 an';
  END IF;
  
  -- Validate email format
  IF NEW.client_email !~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' THEN
    RAISE EXCEPTION 'Format email invalide';
  END IF;
  
  -- Validate phone format (French phone numbers)
  IF NEW.client_phone IS NOT NULL AND NEW.client_phone !~ '^(\+33|0)[1-9]([0-9]{8})$' THEN
    RAISE EXCEPTION 'Format téléphone invalide';
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Create the validation trigger
DROP TRIGGER IF EXISTS validate_booking_trigger ON public.bookings;
CREATE TRIGGER validate_booking_trigger
  BEFORE INSERT OR UPDATE ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_booking_data();

-- 4. Add rate limiting for booking creation
CREATE TABLE IF NOT EXISTS public.booking_rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_email text NOT NULL,
  booking_count integer DEFAULT 1,
  window_start timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now()
);

CREATE OR REPLACE FUNCTION public.check_booking_rate_limit()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $function$
DECLARE
  current_count integer;
  window_start_time timestamp with time zone;
BEGIN
  -- Check rate limit: max 5 bookings per hour per email
  SELECT booking_count, window_start 
  INTO current_count, window_start_time
  FROM public.booking_rate_limits 
  WHERE client_email = NEW.client_email
  AND window_start > now() - INTERVAL '1 hour';
  
  IF current_count IS NULL THEN
    -- First booking in this window
    INSERT INTO public.booking_rate_limits (client_email, booking_count, window_start)
    VALUES (NEW.client_email, 1, now());
  ELSIF current_count >= 5 THEN
    RAISE EXCEPTION 'Limite de réservations atteinte. Veuillez réessayer plus tard.';
  ELSE
    -- Update count
    UPDATE public.booking_rate_limits 
    SET booking_count = booking_count + 1
    WHERE client_email = NEW.client_email
    AND window_start = window_start_time;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Create rate limiting trigger
DROP TRIGGER IF EXISTS booking_rate_limit_trigger ON public.bookings;
CREATE TRIGGER booking_rate_limit_trigger
  BEFORE INSERT ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.check_booking_rate_limit();

-- 5. Enable RLS on rate limits table
ALTER TABLE public.booking_rate_limits ENABLE ROW LEVEL SECURITY;

-- Only admins can see rate limit data
CREATE POLICY "Admins peuvent voir les limites de taux"
ON public.booking_rate_limits
FOR ALL
USING (get_current_user_role() = 'admin');

-- Clean up old rate limit entries (older than 24 hours)
CREATE OR REPLACE FUNCTION public.cleanup_rate_limits()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  DELETE FROM public.booking_rate_limits 
  WHERE created_at < now() - INTERVAL '24 hours';
END;
$function$;