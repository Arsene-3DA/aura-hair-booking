-- Fix the public hairdresser data function to work with filters
-- The current function returns a table, but when filtered it should still work

-- First, let's create a better function that handles individual lookups
CREATE OR REPLACE FUNCTION public.get_professional_by_id(professional_id uuid)
RETURNS TABLE(
  id uuid,
  name text,
  rating numeric,
  salon_address text,
  bio text,
  website text,
  instagram text,
  experience text,
  working_hours jsonb,
  image_url text,
  gender text,
  specialties text[],
  is_active boolean,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  auth_id uuid
)
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    h.id,
    h.name,
    h.rating,
    h.salon_address,
    h.bio,
    h.website,
    h.instagram,
    h.experience,
    h.working_hours,
    h.image_url,
    h.gender,
    h.specialties,
    h.is_active,
    h.created_at,
    h.updated_at,
    h.auth_id
  FROM public.hairdressers h
  WHERE h.id = professional_id
    AND h.is_active = true;
END;
$$;

-- Grant public access
GRANT EXECUTE ON FUNCTION public.get_professional_by_id(uuid) TO anon;
GRANT EXECUTE ON FUNCTION public.get_professional_by_id(uuid) TO authenticated;

-- Also create a function to get professional by auth_id
CREATE OR REPLACE FUNCTION public.get_professional_by_auth_id(auth_user_id uuid)
RETURNS TABLE(
  id uuid,
  name text,
  rating numeric,
  salon_address text,
  bio text,
  website text,
  instagram text,
  experience text,
  working_hours jsonb,
  image_url text,
  gender text,
  specialties text[],
  is_active boolean,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  auth_id uuid
)
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    h.id,
    h.name,
    h.rating,
    h.salon_address,
    h.bio,
    h.website,
    h.instagram,
    h.experience,
    h.working_hours,
    h.image_url,
    h.gender,
    h.specialties,
    h.is_active,
    h.created_at,
    h.updated_at,
    h.auth_id
  FROM public.hairdressers h
  WHERE h.auth_id = auth_user_id
    AND h.is_active = true;
END;
$$;

-- Grant public access
GRANT EXECUTE ON FUNCTION public.get_professional_by_auth_id(uuid) TO anon;
GRANT EXECUTE ON FUNCTION public.get_professional_by_auth_id(uuid) TO authenticated;

-- Update the availability function to use hairdresser ID instead of auth_id
CREATE OR REPLACE FUNCTION public.get_professional_availability_by_id(
  hairdresser_id uuid,
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
      h.auth_id,
      EXTRACT(dow FROM check_date) as day_of_week
    FROM public.hairdressers h
    WHERE h.id = hairdresser_id AND h.is_active = true
  ),
  booked_slots AS (
    SELECT 
      scheduled_at::time as booked_time,
      (scheduled_at + INTERVAL '1 hour')::time as booked_end
    FROM public.new_reservations nr
    JOIN professional_hours ph ON nr.stylist_user_id = ph.auth_id
    WHERE nr.scheduled_at::date = check_date
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

-- Grant public access to new availability function
GRANT EXECUTE ON FUNCTION public.get_professional_availability_by_id(uuid, date) TO anon;
GRANT EXECUTE ON FUNCTION public.get_professional_availability_by_id(uuid, date) TO authenticated;

-- Create a booking function that works with hairdresser ID
CREATE OR REPLACE FUNCTION public.create_booking_by_hairdresser_id(
  hairdresser_id uuid,
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
  
  -- Get professional auth_id from hairdresser ID
  SELECT auth_id INTO professional_auth_id
  FROM public.hairdressers 
  WHERE id = hairdresser_id AND is_active = true;
  
  IF professional_auth_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Professionnel non trouvé');
  END IF;
  
  -- Check if service exists and belongs to professional (if specified)
  IF service_id IS NOT NULL THEN
    SELECT EXISTS(
      SELECT 1 FROM public.hairdresser_services hs
      WHERE hs.hairdresser_id = create_booking_by_hairdresser_id.hairdresser_id 
      AND hs.service_id = create_booking_by_hairdresser_id.service_id
    ) INTO service_exists;
    
    IF NOT service_exists THEN
      RETURN jsonb_build_object('success', false, 'error', 'Service non disponible pour ce professionnel');
    END IF;
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
  
  -- Create booking
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

-- Grant execute access to booking function
GRANT EXECUTE ON FUNCTION public.create_booking_by_hairdresser_id(uuid, text, text, text, uuid, timestamp with time zone, text) TO anon;
GRANT EXECUTE ON FUNCTION public.create_booking_by_hairdresser_id(uuid, text, text, text, uuid, timestamp with time zone, text) TO authenticated;