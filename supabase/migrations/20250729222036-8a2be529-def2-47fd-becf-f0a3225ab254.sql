-- Ajouter un enum pour le statut des disponibilités
CREATE TYPE public.availability_status AS ENUM ('available', 'busy');

-- Ajouter la colonne status à la table availabilities
ALTER TABLE public.availabilities 
ADD COLUMN status public.availability_status DEFAULT 'available';

-- Ajouter un index pour améliorer les performances
CREATE INDEX idx_availabilities_stylist_date ON public.availabilities (stylist_id, start_at, end_at);

-- Mettre à jour les données existantes pour avoir le statut 'available'
UPDATE public.availabilities 
SET status = 'available' 
WHERE status IS NULL;