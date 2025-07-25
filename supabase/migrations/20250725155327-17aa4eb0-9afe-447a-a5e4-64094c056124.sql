-- Ajouter les policies RLS pour les tables services et new_reservations

-- Policies pour services
CREATE POLICY "Services viewable by everyone" ON public.services
  FOR SELECT USING (true);

CREATE POLICY "Admin manage services" ON public.services
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- Policies pour new_reservations  
CREATE POLICY "Clients view own reservations" ON public.new_reservations
  FOR SELECT USING (client_user_id = auth.uid());

CREATE POLICY "Stylists view their reservations" ON public.new_reservations
  FOR SELECT USING (stylist_user_id = auth.uid());

CREATE POLICY "Admins view all reservations" ON public.new_reservations
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Clients create reservations" ON public.new_reservations
  FOR INSERT WITH CHECK (client_user_id = auth.uid());

CREATE POLICY "Stylists update status" ON public.new_reservations
  FOR UPDATE USING (stylist_user_id = auth.uid())
  WITH CHECK (stylist_user_id = auth.uid());

CREATE POLICY "Clients update own reservations" ON public.new_reservations
  FOR UPDATE USING (client_user_id = auth.uid())
  WITH CHECK (client_user_id = auth.uid());

CREATE POLICY "Admins manage all reservations" ON public.new_reservations
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'admin')
  );