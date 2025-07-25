-- Créer la table reservations sans policies d'abord
CREATE TABLE IF NOT EXISTS public.new_reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stylist_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  service_id UUID REFERENCES public.services(id) ON DELETE SET NULL,
  scheduled_at TIMESTAMPTZ NOT NULL,
  status booking_status NOT NULL DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Activer RLS
ALTER TABLE public.new_reservations ENABLE ROW LEVEL SECURITY;

-- Trigger pour updated_at
CREATE TRIGGER update_new_reservations_updated_at BEFORE UPDATE ON public.new_reservations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();