-- Fix security linter warnings

-- 1. Fix search_path for existing functions
CREATE OR REPLACE FUNCTION public.get_professional_availability(
  professional_id uuid,
  check_date date
) RETURNS TABLE(
  time_slot time,
  is_available boolean,
  booking_duration interval
) 
LANGUAGE plpgsql 
SECURITY DEFINER 
STABLE
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  WITH time_slots AS (
    SELECT 
      (generate_series(
        (check_date + '09:00'::time)::timestamp,
        (check_date + '18:00'::time)::timestamp,
        '30 minutes'::interval
      ))::time as slot_time
  ),
  professional_hours AS (
    SELECT 
      h.working_hours,
      EXTRACT(dow FROM check_date) as day_of_week
    FROM public.hairdressers h
    WHERE h.id = professional_id AND h.is_active = true
  ),
  booked_slots AS (
    SELECT 
      scheduled_at::time as booked_time,
      (scheduled_at + INTERVAL '1 hour')::time as booked_end
    FROM public.new_reservations nr
    WHERE nr.stylist_user_id = (
      SELECT auth_id FROM public.hairdressers WHERE id = professional_id
    )
    AND nr.scheduled_at::date = check_date
    AND nr.status IN ('confirmed', 'pending')
  )
  SELECT 
    ts.slot_time,
    (bs.booked_time IS NULL) as is_available,
    '30 minutes'::interval as booking_duration
  FROM time_slots ts
  LEFT JOIN booked_slots bs ON ts.slot_time >= bs.booked_time 
    AND ts.slot_time < bs.booked_end
  ORDER BY ts.slot_time;
END;
$$;

-- 2. Fix search_path for booking function
CREATE OR REPLACE FUNCTION public.create_public_booking(
  professional_id uuid,
  client_name text,
  client_email text,
  client_phone text,
  service_id uuid,
  scheduled_datetime timestamp with time zone,
  notes text DEFAULT NULL
) RETURNS jsonb 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  professional_auth_id uuid;
  service_exists boolean;
  slot_available boolean;
  new_booking_id uuid;
BEGIN
  -- Validate inputs
  IF client_name IS NULL OR trim(client_name) = '' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Le nom est requis');
  END IF;
  
  IF client_email IS NULL OR client_email !~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Email invalide');
  END IF;
  
  -- Get professional auth_id
  SELECT auth_id INTO professional_auth_id
  FROM public.hairdressers 
  WHERE id = professional_id AND is_active = true;
  
  IF professional_auth_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Professionnel non trouvé');
  END IF;
  
  -- Check if service exists and belongs to professional
  SELECT EXISTS(
    SELECT 1 FROM public.hairdresser_services hs
    JOIN public.hairdressers h ON h.id = hs.hairdresser_id
    WHERE h.id = professional_id AND hs.service_id = create_public_booking.service_id
  ) INTO service_exists;
  
  -- Allow booking without specific service if professional has no services defined
  IF NOT service_exists AND service_id IS NOT NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Service non disponible pour ce professionnel');
  END IF;
  
  -- Check slot availability
  SELECT NOT EXISTS(
    SELECT 1 FROM public.new_reservations 
    WHERE stylist_user_id = professional_auth_id
    AND scheduled_at = scheduled_datetime
    AND status IN ('confirmed', 'pending')
  ) INTO slot_available;
  
  IF NOT slot_available THEN
    RETURN jsonb_build_object('success', false, 'error', 'Ce créneau n''est plus disponible');
  END IF;
  
  -- Create booking for authenticated user or create guest booking
  INSERT INTO public.new_reservations (
    client_user_id,
    stylist_user_id,
    service_id,
    scheduled_at,
    status,
    notes
  ) VALUES (
    COALESCE(auth.uid(), gen_random_uuid()), -- Allow guest bookings
    professional_auth_id,
    service_id,
    scheduled_datetime,
    'pending',
    notes
  ) RETURNING id INTO new_booking_id;
  
  -- Store guest information if not authenticated
  IF auth.uid() IS NULL THEN
    -- Create a temporary client record for guest bookings
    INSERT INTO public.clients (
      auth_id,
      name,
      email,
      phone
    ) VALUES (
      (SELECT client_user_id FROM public.new_reservations WHERE id = new_booking_id),
      trim(client_name),
      lower(trim(client_email)),
      trim(client_phone)
    ) ON CONFLICT DO NOTHING;
  END IF;
  
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Réservation créée avec succès',
    'booking_id', new_booking_id
  );
END;
$$;