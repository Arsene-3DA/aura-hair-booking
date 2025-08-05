-- Corriger les fonctions avec search_path pour la sécurité
CREATE OR REPLACE FUNCTION public.manage_professional_client_relationship()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Quand une nouvelle réservation est créée
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.professional_clients (
      professional_id,
      client_id,
      first_booking_date,
      status,
      total_bookings,
      last_booking_date
    ) 
    VALUES (
      NEW.stylist_user_id,
      NEW.client_user_id,
      NEW.scheduled_at,
      'pending',
      1,
      NEW.scheduled_at
    )
    ON CONFLICT (professional_id, client_id) 
    DO UPDATE SET
      total_bookings = professional_clients.total_bookings + 1,
      last_booking_date = GREATEST(professional_clients.last_booking_date, NEW.scheduled_at),
      updated_at = now();
    
    RETURN NEW;
  END IF;
  
  -- Quand le statut d'une réservation change
  IF TG_OP = 'UPDATE' THEN
    -- Si la réservation est confirmée, mettre à jour le statut du client
    IF OLD.status = 'pending' AND NEW.status = 'confirmed' THEN
      UPDATE public.professional_clients 
      SET 
        status = 'confirmed',
        updated_at = now()
      WHERE professional_id = NEW.stylist_user_id 
        AND client_id = NEW.client_user_id;
    END IF;
    
    -- Si la réservation est terminée, marquer le client comme actif
    IF OLD.status != 'completed' AND NEW.status = 'completed' THEN
      UPDATE public.professional_clients 
      SET 
        status = 'active',
        updated_at = now()
      WHERE professional_id = NEW.stylist_user_id 
        AND client_id = NEW.client_user_id;
    END IF;
    
    RETURN NEW;
  END IF;
  
  RETURN NULL;
END;
$$;