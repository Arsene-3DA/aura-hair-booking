-- SECURITY FIX: Fix function search path issues
CREATE OR REPLACE FUNCTION public.validate_reservation_data()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = 'public'
AS $$
BEGIN
  -- Validate scheduled_at is not in the past
  IF NEW.scheduled_at < now() THEN
    RAISE EXCEPTION 'La date de réservation ne peut pas être dans le passé';
  END IF;
  
  -- Prevent scheduling too far in advance (1 year max)
  IF NEW.scheduled_at > now() + INTERVAL '1 year' THEN
    RAISE EXCEPTION 'La date de réservation ne peut pas dépasser 1 an';
  END IF;
  
  -- Validate user IDs are valid UUIDs and not null
  IF NEW.client_user_id IS NULL THEN
    RAISE EXCEPTION 'ID client requis';
  END IF;
  
  IF NEW.stylist_user_id IS NULL THEN
    RAISE EXCEPTION 'ID styliste requis';
  END IF;
  
  -- Sanitize notes field
  IF NEW.notes IS NOT NULL THEN
    NEW.notes = trim(NEW.notes);
    -- Remove potential XSS patterns
    NEW.notes = regexp_replace(NEW.notes, '<[^>]*>', '', 'g');
    NEW.notes = regexp_replace(NEW.notes, 'javascript:', '', 'gi');
  END IF;
  
  RETURN NEW;
END;
$$;

-- SECURITY FIX: Add rate limiting for reservation creation
CREATE OR REPLACE FUNCTION public.check_reservation_rate_limit()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = 'public'
AS $$
DECLARE
  recent_count INTEGER;
BEGIN
  -- Check for too many reservations in the last hour
  SELECT COUNT(*) INTO recent_count
  FROM public.new_reservations
  WHERE client_user_id = NEW.client_user_id
    AND created_at > now() - INTERVAL '1 hour';
    
  IF recent_count >= 3 THEN
    RAISE EXCEPTION 'Trop de réservations créées récemment. Veuillez attendre avant de créer une nouvelle réservation.';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Apply rate limiting trigger
DROP TRIGGER IF EXISTS reservation_rate_limit_trigger ON public.new_reservations;
CREATE TRIGGER reservation_rate_limit_trigger
  BEFORE INSERT ON public.new_reservations
  FOR EACH ROW
  EXECUTE FUNCTION public.check_reservation_rate_limit();

-- SECURITY FIX: Drop the problematic security definer view
DROP VIEW IF EXISTS public.v_admin_reports;