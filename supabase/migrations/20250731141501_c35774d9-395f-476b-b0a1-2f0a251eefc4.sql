-- Fix new_reservations table structure and RLS policies

-- 1. Ensure new_reservations has proper structure
ALTER TABLE public.new_reservations 
ADD COLUMN IF NOT EXISTS client_user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS stylist_user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

-- 2. Create RPC functions for booking management
CREATE OR REPLACE FUNCTION public.confirm_booking(p_booking_id uuid)
RETURNS void 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Update booking status to confirmed
  UPDATE new_reservations
  SET status = 'confirmed', updated_at = now()
  WHERE id = p_booking_id
    AND stylist_user_id = auth.uid()
    AND status = 'pending';
  
  -- Create notification for client
  INSERT INTO notifications (user_id, title, body, created_at)
  SELECT client_user_id, 
         'Réservation confirmée', 
         'Votre demande de réservation a été acceptée !',
         now()
  FROM new_reservations 
  WHERE id = p_booking_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.decline_booking(p_booking_id uuid)
RETURNS void 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Update booking status to declined
  UPDATE new_reservations
  SET status = 'declined', updated_at = now()
  WHERE id = p_booking_id
    AND stylist_user_id = auth.uid()
    AND status = 'pending';
  
  -- Create notification for client
  INSERT INTO notifications (user_id, title, body, created_at)
  SELECT client_user_id, 
         'Réservation refusée', 
         'Votre demande de réservation a été refusée.',
         now()
  FROM new_reservations 
  WHERE id = p_booking_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.validate_booking_service(p_stylist_user_id uuid, p_service_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  stylist_has_services boolean;
BEGIN
  -- Check if stylist has any services
  SELECT EXISTS (
    SELECT 1 FROM hairdresser_services hs
    JOIN hairdressers h ON h.id = hs.hairdresser_id
    WHERE h.auth_id = p_stylist_user_id
  ) INTO stylist_has_services;
  
  -- If stylist has no services, service_id can be null
  IF NOT stylist_has_services THEN
    RETURN true;
  END IF;
  
  -- If stylist has services, service_id must be provided and valid
  IF p_service_id IS NULL THEN
    RETURN false;
  END IF;
  
  -- Check if the service belongs to this stylist
  RETURN EXISTS (
    SELECT 1 FROM hairdresser_services hs
    JOIN hairdressers h ON h.id = hs.hairdresser_id
    WHERE h.auth_id = p_stylist_user_id
      AND hs.service_id = p_service_id
  );
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.confirm_booking TO authenticated;
GRANT EXECUTE ON FUNCTION public.decline_booking TO authenticated; 
GRANT EXECUTE ON FUNCTION public.validate_booking_service TO authenticated;

-- 3. Update RLS policies for new_reservations
DROP POLICY IF EXISTS "Clients create reservations" ON public.new_reservations;
DROP POLICY IF EXISTS "Clients view own reservations" ON public.new_reservations;
DROP POLICY IF EXISTS "Clients update own reservations" ON public.new_reservations;
DROP POLICY IF EXISTS "Stylists view their reservations" ON public.new_reservations;
DROP POLICY IF EXISTS "Stylists update status" ON public.new_reservations;

-- New comprehensive RLS policies
CREATE POLICY "Clients can create own reservations"
ON public.new_reservations FOR INSERT
WITH CHECK (client_user_id = auth.uid());

CREATE POLICY "Users can view related reservations"
ON public.new_reservations FOR SELECT
USING (client_user_id = auth.uid() OR stylist_user_id = auth.uid());

CREATE POLICY "Clients can update own pending reservations"
ON public.new_reservations FOR UPDATE
USING (client_user_id = auth.uid() AND status = 'pending')
WITH CHECK (client_user_id = auth.uid());

CREATE POLICY "Stylists can update reservation status"
ON public.new_reservations FOR UPDATE
USING (stylist_user_id = auth.uid())
WITH CHECK (stylist_user_id = auth.uid());