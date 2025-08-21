-- Ajouter les politiques RLS pour permettre aux invités de créer des réservations
CREATE POLICY "Allow guest bookings via RPC" ON public.new_reservations
FOR INSERT 
WITH CHECK (client_user_id IS NULL);

CREATE POLICY "Allow guest bookings in bookings table" ON public.bookings
FOR INSERT 
WITH CHECK (client_auth_id IS NULL);