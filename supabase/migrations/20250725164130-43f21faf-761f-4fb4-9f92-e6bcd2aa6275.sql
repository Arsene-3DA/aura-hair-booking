-- Supprimer le trigger et la fonction obsolète qui causent l'erreur password_hash

-- 1. Supprimer le trigger
DROP TRIGGER IF EXISTS create_client_user_trigger ON public.bookings;

-- 2. Supprimer la fonction obsolète 
DROP FUNCTION IF EXISTS public.create_client_user_if_not_exists();

-- 3. Supprimer aussi la fonction hash_password obsolète
DROP FUNCTION IF EXISTS public.hash_password(text);