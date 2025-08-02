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

CREATE POLICY "Stylists view and update assigned reservations" 
ON public.new_reservations 
FOR SELECT, UPDATE
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

-- SECURITY FIX: Enhanced rate limiting for reservation creation
CREATE OR REPLACE FUNCTION public.check_reservation_rate_limit()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql;

-- Apply rate limiting trigger
DROP TRIGGER IF EXISTS reservation_rate_limit_trigger ON public.new_reservations;
CREATE TRIGGER reservation_rate_limit_trigger
  BEFORE INSERT ON public.new_reservations
  FOR EACH ROW
  EXECUTE FUNCTION public.check_reservation_rate_limit();

-- SECURITY FIX: Replace the problematic security definer view with a function
DROP VIEW IF EXISTS public.v_admin_reports;

CREATE OR REPLACE FUNCTION public.get_admin_reports(
  start_date DATE DEFAULT NULL,
  end_date DATE DEFAULT NULL
)
RETURNS TABLE (
  report_date DATE,
  status booking_status,
  total_bookings BIGINT,
  confirmed_bookings BIGINT,
  declined_bookings BIGINT,
  pending_bookings BIGINT,
  no_shows BIGINT,
  total_revenue NUMERIC,
  avg_service_price NUMERIC,
  unique_stylists BIGINT,
  unique_clients BIGINT,
  year NUMERIC,
  month NUMERIC,
  week NUMERIC,
  day_of_week NUMERIC,
  service TEXT
)
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  -- Restrict access to admins only
  SELECT 
    CASE WHEN get_current_user_role() != 'admin' THEN
      RAISE EXCEPTION 'Accès non autorisé: seuls les administrateurs peuvent consulter les rapports'
    END;
    
  SELECT 
    b.scheduled_at::DATE as report_date,
    b.status,
    COUNT(*) as total_bookings,
    COUNT(*) FILTER (WHERE b.status = 'confirmed') as confirmed_bookings,
    COUNT(*) FILTER (WHERE b.status = 'declined') as declined_bookings,
    COUNT(*) FILTER (WHERE b.status = 'pending') as pending_bookings,
    COUNT(*) FILTER (WHERE b.status = 'no_show') as no_shows,
    COALESCE(SUM(s.price), 0) as total_revenue,
    COALESCE(AVG(s.price), 0) as avg_service_price,
    COUNT(DISTINCT b.stylist_user_id) as unique_stylists,
    COUNT(DISTINCT b.client_user_id) as unique_clients,
    EXTRACT(YEAR FROM b.scheduled_at) as year,
    EXTRACT(MONTH FROM b.scheduled_at) as month,
    EXTRACT(WEEK FROM b.scheduled_at) as week,
    EXTRACT(DOW FROM b.scheduled_at) as day_of_week,
    s.name as service
  FROM public.new_reservations b
  LEFT JOIN public.services s ON s.id = b.service_id
  WHERE (start_date IS NULL OR b.scheduled_at::DATE >= start_date)
    AND (end_date IS NULL OR b.scheduled_at::DATE <= end_date)
  GROUP BY 
    b.scheduled_at::DATE,
    b.status,
    EXTRACT(YEAR FROM b.scheduled_at),
    EXTRACT(MONTH FROM b.scheduled_at),
    EXTRACT(WEEK FROM b.scheduled_at),
    EXTRACT(DOW FROM b.scheduled_at),
    s.name
  ORDER BY report_date DESC;
$$;