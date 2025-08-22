-- Améliorer la fonction RPC pour mieux respecter les paramètres individuels des professionnels
DROP FUNCTION IF EXISTS public.get_public_professional_availability(uuid, text);

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
  hairdresser_data RECORD;
  day_name text;
  day_hours jsonb;
  open_time time;
  close_time time;
BEGIN
  -- Récupérer les données complètes du professionnel
  SELECT 
    h.id, 
    h.working_hours, 
    h.is_active,
    h.name
  INTO hairdresser_data
  FROM public.hairdressers h
  WHERE h.auth_id = professional_auth_id
    AND h.is_active = true;
    
  IF hairdresser_data IS NULL THEN
    RETURN; -- Professionnel non trouvé ou inactif
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
  
  -- Récupérer les horaires pour ce jour spécifique
  day_hours := hairdresser_data.working_hours->day_name;
  
  -- Vérifier si le salon est ouvert ce jour
  IF day_hours IS NULL OR NOT (day_hours->>'isOpen')::boolean THEN
    RETURN; -- Salon fermé ce jour
  END IF;
  
  -- Extraire les heures d'ouverture et de fermeture
  open_time := (day_hours->>'open')::time;
  close_time := (day_hours->>'close')::time;
  
  -- Générer les créneaux basés sur les horaires RÉELS du professionnel
  RETURN QUERY
  WITH time_slots AS (
    SELECT 
      to_char(slot_time, 'HH24:MI') as slot_time_str,
      slot_time
    FROM generate_series(
      (check_date || ' ' || open_time::text)::timestamp,
      (check_date || ' ' || close_time::text)::timestamp - interval '30 minutes',
      interval '30 minutes'
    ) AS slot_time
  ),
  professional_availabilities AS (
    SELECT 
      start_at, 
      end_at, 
      status
    FROM public.availabilities
    WHERE stylist_id = professional_auth_id
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
      -- 1. Si créneau réservé (priorité absolue)
      WHEN EXISTS (
        SELECT 1 FROM confirmed_bookings cb 
        WHERE date_trunc('minute', cb.scheduled_at) = ts.slot_time
      ) THEN false
      
      -- 2. Si dans le passé (avec buffer de 1 heure)
      WHEN ts.slot_time <= NOW() + interval '1 hour' THEN false
      
      -- 3. Si le professionnel a explicitement marqué comme indisponible
      WHEN EXISTS (
        SELECT 1 FROM professional_availabilities pa 
        WHERE ts.slot_time >= pa.start_at 
          AND ts.slot_time < pa.end_at
          AND pa.status = 'unavailable'
      ) THEN false
      
      -- 4. Si le professionnel a marqué comme occupé
      WHEN EXISTS (
        SELECT 1 FROM professional_availabilities pa 
        WHERE ts.slot_time >= pa.start_at 
          AND ts.slot_time < pa.end_at
          AND pa.status = 'busy'
      ) THEN false
      
      -- 5. Si le professionnel a explicitement marqué comme disponible
      WHEN EXISTS (
        SELECT 1 FROM professional_availabilities pa 
        WHERE ts.slot_time >= pa.start_at 
          AND ts.slot_time < pa.end_at
          AND pa.status = 'available'
      ) THEN true
      
      -- 6. Par défaut: disponible pendant les heures d'ouverture
      ELSE true
    END as is_available,
    30 as booking_duration
  FROM time_slots ts
  ORDER BY ts.slot_time;
END;
$$;