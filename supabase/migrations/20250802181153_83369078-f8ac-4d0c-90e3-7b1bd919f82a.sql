-- Modify reservation validation to allow status updates on past dates
-- Drop the existing trigger
DROP TRIGGER IF EXISTS validate_reservation_trigger ON new_reservations;

-- Update the validation function to be more flexible
CREATE OR REPLACE FUNCTION validate_reservation_data()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Only validate dates for NEW reservations (INSERT operations)
  -- Allow status updates on existing reservations regardless of date
  IF TG_OP = 'INSERT' THEN
    -- Validate scheduled_at is not in the past for new reservations
    IF NEW.scheduled_at < now() THEN
      RAISE EXCEPTION 'La date de réservation ne peut pas être dans le passé';
    END IF;
    
    -- Prevent scheduling too far in advance (1 year max)
    IF NEW.scheduled_at > now() + INTERVAL '1 year' THEN
      RAISE EXCEPTION 'La date de réservation ne peut pas dépasser 1 an';
    END IF;
  END IF;
  
  -- Validate user IDs are valid UUIDs and not null (for both INSERT and UPDATE)
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

-- Recreate the trigger
CREATE TRIGGER validate_reservation_trigger
  BEFORE INSERT OR UPDATE ON new_reservations
  FOR EACH ROW
  EXECUTE FUNCTION validate_reservation_data();