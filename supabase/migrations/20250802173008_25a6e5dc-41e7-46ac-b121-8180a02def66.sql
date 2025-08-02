-- SECURITY FIX: Clean up conflicting RLS policies for new_reservations
-- Remove redundant and conflicting policies

DROP POLICY IF EXISTS "new_reservations_rls" ON public.new_reservations;
DROP POLICY IF EXISTS "Admins manage all reservations" ON public.new_reservations;
DROP POLICY IF EXISTS "Admins view all reservations" ON public.new_reservations;

-- Create clean, non-conflicting RLS policies for new_reservations
CREATE POLICY "Admin full access to reservations" 
ON public.new_reservations 
FOR ALL 
TO authenticated
USING (get_current_user_role() = 'admin')
WITH CHECK (get_current_user_role() = 'admin');

CREATE POLICY "Clients manage own reservations" 
ON public.new_reservations 
FOR ALL 
TO authenticated
USING (client_user_id = auth.uid())
WITH CHECK (client_user_id = auth.uid());

CREATE POLICY "Stylists view assigned reservations" 
ON public.new_reservations 
FOR SELECT
TO authenticated
USING (stylist_user_id = auth.uid());

CREATE POLICY "Stylists update assigned reservations" 
ON public.new_reservations 
FOR UPDATE
TO authenticated
USING (stylist_user_id = auth.uid())
WITH CHECK (stylist_user_id = auth.uid());

-- SECURITY FIX: Add trigger for input validation on new_reservations
CREATE OR REPLACE FUNCTION public.validate_reservation_data()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql;

-- Apply the validation trigger
DROP TRIGGER IF EXISTS validate_reservation_trigger ON public.new_reservations;
CREATE TRIGGER validate_reservation_trigger
  BEFORE INSERT OR UPDATE ON public.new_reservations
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_reservation_data();