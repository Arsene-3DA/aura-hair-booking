-- Créer une table pour les relations client-professionnel
CREATE TABLE IF NOT EXISTS public.professional_clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  first_booking_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'active')),
  total_bookings INTEGER DEFAULT 1,
  last_booking_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(professional_id, client_id)
);

-- Activer RLS
ALTER TABLE public.professional_clients ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour professional_clients
CREATE POLICY "Stylists can view their clients"
ON public.professional_clients
FOR SELECT
USING (professional_id = auth.uid());

CREATE POLICY "Stylists can manage their clients"
ON public.professional_clients
FOR ALL
USING (professional_id = auth.uid())
WITH CHECK (professional_id = auth.uid());

CREATE POLICY "Admin full access to professional_clients"
ON public.professional_clients
FOR ALL
USING (get_current_user_role() = 'admin');

-- Fonction pour gérer automatiquement les relations client-professionnel
CREATE OR REPLACE FUNCTION public.manage_professional_client_relationship()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Créer le trigger
CREATE TRIGGER manage_professional_client_relationship_trigger
  AFTER INSERT OR UPDATE ON public.new_reservations
  FOR EACH ROW
  EXECUTE FUNCTION public.manage_professional_client_relationship();

-- Trigger pour mettre à jour updated_at
CREATE TRIGGER update_professional_clients_updated_at
  BEFORE UPDATE ON public.professional_clients
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Peupler la table avec les données existantes
INSERT INTO public.professional_clients (
  professional_id,
  client_id,
  first_booking_date,
  status,
  total_bookings,
  last_booking_date
)
SELECT 
  stylist_user_id as professional_id,
  client_user_id as client_id,
  MIN(scheduled_at) as first_booking_date,
  CASE 
    WHEN COUNT(CASE WHEN status = 'completed' THEN 1 END) > 0 THEN 'active'
    WHEN COUNT(CASE WHEN status = 'confirmed' THEN 1 END) > 0 THEN 'confirmed'
    ELSE 'pending'
  END as status,
  COUNT(*) as total_bookings,
  MAX(scheduled_at) as last_booking_date
FROM public.new_reservations
WHERE stylist_user_id IS NOT NULL AND client_user_id IS NOT NULL
GROUP BY stylist_user_id, client_user_id
ON CONFLICT (professional_id, client_id) DO NOTHING;