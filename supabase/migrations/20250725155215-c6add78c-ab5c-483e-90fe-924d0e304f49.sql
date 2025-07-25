-- Activer RLS et ajouter les policies pour les nouvelles tables

-- Activer RLS sur les tables
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Policies pour services (tous peuvent voir les services)
CREATE POLICY "Services are viewable by everyone"
  ON public.services FOR SELECT
  USING (true);

CREATE POLICY "Only admins can manage services"
  ON public.services FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Policies pour bookings
CREATE POLICY "Clients can view their own bookings"
  ON public.bookings FOR SELECT
  USING (client_user_id = auth.uid());

CREATE POLICY "Stylists can view their bookings"
  ON public.bookings FOR SELECT
  USING (stylist_user_id = auth.uid());

CREATE POLICY "Admins can view all bookings"
  ON public.bookings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Clients can create bookings"
  ON public.bookings FOR INSERT
  WITH CHECK (client_user_id = auth.uid());

CREATE POLICY "Stylists can update their booking status"
  ON public.bookings FOR UPDATE
  USING (stylist_user_id = auth.uid())
  WITH CHECK (stylist_user_id = auth.uid());

CREATE POLICY "Clients can update their own bookings"
  ON public.bookings FOR UPDATE
  USING (client_user_id = auth.uid())
  WITH CHECK (client_user_id = auth.uid());

CREATE POLICY "Admins can manage all bookings"
  ON public.bookings FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Trigger pour updated_at
CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON public.services
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON public.bookings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();