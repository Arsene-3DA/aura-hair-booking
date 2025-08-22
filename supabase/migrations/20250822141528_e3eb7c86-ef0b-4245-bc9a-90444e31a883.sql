-- Créer une fonction RPC publique pour obtenir les créneaux de disponibilité d'un professionnel
-- Cette fonction permet aux utilisateurs non connectés d'accéder aux créneaux
CREATE OR REPLACE FUNCTION public.get_public_professional_availability(
  professional_auth_id uuid,
  check_date text
)
RETURNS TABLE(
  time_slot text,
  is_available boolean,
  booking_duration integer
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  hairdresser_uuid uuid;
  working_hours jsonb;
  day_name text;
  day_hours jsonb;
BEGIN
  -- Récupérer l'ID du coiffeur et ses horaires de travail à partir de auth_id
  SELECT h.id, h.working_hours INTO hairdresser_uuid, working_hours
  FROM public.hairdressers h
  WHERE h.auth_id = professional_auth_id
    AND h.is_active = true;
    
  IF hairdresser_uuid IS NULL THEN
    RETURN; -- Pas de coiffeur trouvé
  END IF;
  
  -- Déterminer le jour de la semaine
  day_name := CASE EXTRACT(DOW FROM check_date::date)
    WHEN 0 THEN 'sunday'
    WHEN 1 THEN 'monday'
    WHEN 2 THEN 'tuesday'
    WHEN 3 THEN 'wednesday'
    WHEN 4 THEN 'thursday'
    WHEN 5 THEN 'friday'
    WHEN 6 THEN 'saturday'
  END;
  
  -- Récupérer les horaires pour ce jour
  day_hours := working_hours->day_name;
  
  -- Vérifier si le salon est ouvert ce jour
  IF day_hours IS NULL OR NOT (day_hours->>'isOpen')::boolean THEN
    RETURN; -- Salon fermé
  END IF;
  
  -- Générer les créneaux de 30 minutes entre l'ouverture et la fermeture
  RETURN QUERY
  WITH time_slots AS (
    SELECT 
      to_char(slot_time, 'HH24:MI') as slot_time_str,
      slot_time
    FROM generate_series(
      (check_date || ' ' || (day_hours->>'open'))::timestamp,
      (check_date || ' ' || (day_hours->>'close'))::timestamp - interval '30 minutes',
      interval '30 minutes'
    ) AS slot_time
  ),
  unavailable_slots AS (
    SELECT start_at, end_at
    FROM public.availabilities
    WHERE stylist_id = professional_auth_id
      AND status = 'unavailable'
      AND start_at::date = check_date::date
  ),
  confirmed_bookings AS (
    SELECT scheduled_at
    FROM public.new_reservations
    WHERE stylist_user_id = professional_auth_id
      AND status IN ('confirmed', 'pending')
      AND scheduled_at::date = check_date::date
  )
  SELECT 
    ts.slot_time_str as time_slot,
    CASE 
      WHEN EXISTS (
        SELECT 1 FROM unavailable_slots us 
        WHERE ts.slot_time >= us.start_at AND ts.slot_time < us.end_at
      ) THEN false
      WHEN EXISTS (
        SELECT 1 FROM confirmed_bookings cb 
        WHERE date_trunc('minute', cb.scheduled_at) = ts.slot_time
      ) THEN false
      WHEN ts.slot_time <= NOW() + interval '30 minutes' THEN false
      ELSE true
    END as is_available,
    30 as booking_duration
  FROM time_slots ts
  ORDER BY ts.slot_time;
END;
$$;