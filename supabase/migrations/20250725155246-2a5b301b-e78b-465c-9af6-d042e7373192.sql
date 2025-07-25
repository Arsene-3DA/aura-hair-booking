-- Créer une nouvelle table reservations pour le système de réservation moderne

-- Table des réservations modernes
CREATE TABLE IF NOT EXISTS public.reservations (
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

-- Activer RLS sur la nouvelle table
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;

-- Policies pour reservations
CREATE POLICY "Clients can view their own reservations"
  ON public.reservations FOR SELECT
  USING (client_user_id = auth.uid());

CREATE POLICY "Stylists can view their reservations"
  ON public.reservations FOR SELECT
  USING (stylist_user_id = auth.uid());

CREATE POLICY "Admins can view all reservations"
  ON public.reservations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Clients can create reservations"
  ON public.reservations FOR INSERT
  WITH CHECK (client_user_id = auth.uid());

CREATE POLICY "Stylists can update their reservation status"
  ON public.reservations FOR UPDATE
  USING (stylist_user_id = auth.uid())
  WITH CHECK (stylist_user_id = auth.uid());

CREATE POLICY "Clients can update their own reservations"
  ON public.reservations FOR UPDATE
  USING (client_user_id = auth.uid())
  WITH CHECK (client_user_id = auth.uid());

CREATE POLICY "Admins can manage all reservations"
  ON public.reservations FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Trigger pour updated_at
CREATE TRIGGER update_reservations_updated_at BEFORE UPDATE ON public.reservations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();