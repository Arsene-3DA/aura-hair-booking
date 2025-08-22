-- Activer les mises à jour temps réel seulement pour les tables qui ne sont pas déjà configurées

-- Vérifier et ajouter les tables manquantes à la publication supabase_realtime

-- Table des notifications (si pas déjà ajoutée)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND schemaname = 'public' 
        AND tablename = 'notifications'
    ) THEN
        ALTER TABLE public.notifications REPLICA IDENTITY FULL;
        ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
    END IF;
END
$$;

-- Table des nouvelles réservations (si pas déjà ajoutée)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND schemaname = 'public' 
        AND tablename = 'new_reservations'
    ) THEN
        ALTER TABLE public.new_reservations REPLICA IDENTITY FULL;
        ALTER PUBLICATION supabase_realtime ADD TABLE public.new_reservations;
    END IF;
END
$$;

-- Table des avis (si pas déjà ajoutée)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND schemaname = 'public' 
        AND tablename = 'reviews'
    ) THEN
        ALTER TABLE public.reviews REPLICA IDENTITY FULL;
        ALTER PUBLICATION supabase_realtime ADD TABLE public.reviews;
    END IF;
END
$$;