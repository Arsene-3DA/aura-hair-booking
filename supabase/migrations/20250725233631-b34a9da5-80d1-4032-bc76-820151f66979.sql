-- Ajouter une politique RLS pour permettre aux admins de voir toutes les réservations
CREATE POLICY "Admin can view all bookings" 
ON public.bookings 
FOR SELECT 
TO authenticated
USING (get_current_user_role() = 'admin');

-- Ajouter une politique RLS pour permettre aux admins de modifier toutes les réservations
CREATE POLICY "Admin can update all bookings" 
ON public.bookings 
FOR UPDATE 
TO authenticated
USING (get_current_user_role() = 'admin')
WITH CHECK (get_current_user_role() = 'admin');

-- Ajouter une politique RLS pour permettre aux admins de supprimer toutes les réservations
CREATE POLICY "Admin can delete all bookings" 
ON public.bookings 
FOR DELETE 
TO authenticated
USING (get_current_user_role() = 'admin');