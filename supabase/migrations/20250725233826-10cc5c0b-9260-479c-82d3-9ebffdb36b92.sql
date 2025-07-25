-- Activer la réplication temps réel pour les tables importantes
ALTER TABLE public.bookings REPLICA IDENTITY FULL;
ALTER TABLE public.profiles REPLICA IDENTITY FULL;

-- Ajouter les tables à la publication realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.bookings;
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;

-- Ajouter une politique pour permettre aux admins de voir tous les profils
CREATE POLICY "Admin can view all profiles" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (get_current_user_role() = 'admin');