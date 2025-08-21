-- Créer une fonction RPC pour les réservations publiques (invités)
CREATE OR REPLACE FUNCTION public.create_guest_booking(
  p_hairdresser_id UUID,
  p_client_name TEXT,
  p_client_email TEXT,
  p_client_phone TEXT,
  p_service_id UUID DEFAULT NULL,
  p_scheduled_datetime TIMESTAMP WITH TIME ZONE,
  p_notes TEXT DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_booking_id UUID;
  v_booking_data jsonb;
BEGIN
  -- Validation des données d'entrée
  IF p_hairdresser_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Hairdresser ID is required');
  END IF;
  
  IF p_client_name IS NULL OR trim(p_client_name) = '' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Client name is required');
  END IF;
  
  IF p_client_email IS NULL OR trim(p_client_email) = '' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Client email is required');
  END IF;
  
  IF p_client_phone IS NULL OR trim(p_client_phone) = '' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Client phone is required');
  END IF;
  
  IF p_scheduled_datetime IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Scheduled datetime is required');
  END IF;
  
  -- Vérifier que le créneau n'est pas dans le passé
  IF p_scheduled_datetime <= NOW() THEN
    RETURN jsonb_build_object('success', false, 'error', 'Cannot book a slot in the past');
  END IF;
  
  -- Vérifier que le coiffeur existe
  IF NOT EXISTS (SELECT 1 FROM public.hairdressers WHERE id = p_hairdresser_id AND is_active = true) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Hairdresser not found or inactive');
  END IF;
  
  -- Vérifier que le service existe si fourni
  IF p_service_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.services WHERE id = p_service_id) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Service not found');
  END IF;
  
  -- Vérifier les conflits de créneaux (réservations existantes confirmées)
  IF EXISTS (
    SELECT 1 FROM public.new_reservations 
    WHERE stylist_user_id = (SELECT auth_id FROM public.hairdressers WHERE id = p_hairdresser_id)
    AND status = 'confirmed'
    AND scheduled_at = p_scheduled_datetime
  ) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Time slot already booked');
  END IF;
  
  -- Insérer la nouvelle réservation
  INSERT INTO public.new_reservations (
    id,
    client_user_id,
    stylist_user_id,
    service_id,
    scheduled_at,
    status,
    notes,
    created_at,
    updated_at
  ) VALUES (
    gen_random_uuid(),
    NULL, -- Client invité, pas d'auth_id
    (SELECT auth_id FROM public.hairdressers WHERE id = p_hairdresser_id),
    p_service_id,
    p_scheduled_datetime,
    'pending'::booking_status,
    p_notes,
    NOW(),
    NOW()
  ) RETURNING id INTO v_booking_id;
  
  -- Insérer dans bookings pour compatibilité avec l'ancien système
  INSERT INTO public.bookings (
    id,
    hairdresser_id,
    client_name,
    client_email,
    client_phone,
    service_id,
    scheduled_at,
    status,
    comments,
    booking_date,
    booking_time,
    service,
    created_at
  ) VALUES (
    v_booking_id,
    p_hairdresser_id,
    p_client_name,
    p_client_email,
    p_client_phone,
    p_service_id,
    p_scheduled_datetime,
    'pending'::booking_status,
    p_notes,
    p_scheduled_datetime::date,
    p_scheduled_datetime::time,
    COALESCE((SELECT name FROM public.services WHERE id = p_service_id), 'Service général'),
    NOW()
  );
  
  -- Construire les données de retour
  v_booking_data := jsonb_build_object(
    'success', true,
    'booking_id', v_booking_id,
    'message', 'Booking created successfully'
  );
  
  RETURN v_booking_data;
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false, 
      'error', 'Database error: ' || SQLERRM
    );
END;
$$;

-- Mettre à jour les politiques RLS pour permettre aux invités de créer des réservations via la fonction
CREATE POLICY "Allow guest bookings via RPC" ON public.new_reservations
FOR INSERT 
WITH CHECK (client_user_id IS NULL);

CREATE POLICY "Allow guest bookings in bookings table" ON public.bookings
FOR INSERT 
WITH CHECK (client_auth_id IS NULL);