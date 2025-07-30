-- Ajouter le nouveau rôle 'cosmetique' à l'enum user_role
ALTER TYPE user_role ADD VALUE 'cosmetique';

-- Créer un enum pour le genre
CREATE TYPE gender_type AS ENUM ('homme', 'femme', 'autre', 'non_specifie');

-- Ajouter une colonne genre à la table profiles
ALTER TABLE public.profiles 
ADD COLUMN gender gender_type DEFAULT 'non_specifie';

-- Ajouter une colonne genre à la table users (pour la compatibilité)
ALTER TABLE public.users 
ADD COLUMN gender gender_type DEFAULT 'non_specifie';