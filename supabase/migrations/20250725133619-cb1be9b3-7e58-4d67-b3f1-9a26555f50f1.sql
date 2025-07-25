-- Fix critical database security vulnerabilities (corrected)

-- 1. Fix overly permissive booking creation policy
DROP POLICY IF EXISTS "Tout le monde peut créer des réservations" ON public.bookings;

-- Replace with proper authenticated-only policy (corrected syntax)
CREATE POLICY "Utilisateurs authentifiés peuvent créer des réservations" 
ON public.bookings 
FOR INSERT 
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
  
  RETURN NEW;
END;
$function$;

-- Create the validation trigger
DROP TRIGGER IF EXISTS validate_booking_trigger ON public.bookings;
CREATE TRIGGER validate_booking_trigger
  BEFORE INSERT OR UPDATE ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_booking_data();