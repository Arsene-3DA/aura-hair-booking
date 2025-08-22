-- Activer les mises à jour temps réel pour les tables du dashboard client
-- Ajouter les tables à la publication supabase_realtime pour activer les mises à jour temps réel

-- Table des profils utilisateur
ALTER TABLE public.profiles REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;

-- Table des notifications  
ALTER TABLE public.notifications REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- Table des nouvelles réservations
ALTER TABLE public.new_reservations REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.new_reservations;

-- Table des avis
ALTER TABLE public.reviews REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.reviews;