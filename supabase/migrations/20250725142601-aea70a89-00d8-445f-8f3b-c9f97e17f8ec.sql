-- Create the set_user_role RPC function
CREATE OR REPLACE FUNCTION public.set_user_role(user_id UUID, new_role TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Validate that the calling user is an admin
  IF get_current_user_role() != 'admin' THEN
    RAISE EXCEPTION 'Seuls les administrateurs peuvent modifier les rôles';
  END IF;
  
  -- Validate the new role
  IF new_role NOT IN ('client', 'coiffeur', 'admin') THEN
    RAISE EXCEPTION 'Rôle invalide: %', new_role;
  END IF;
  
  -- Update user role in profiles table
  UPDATE public.profiles 
  SET role = new_role::user_role 
  WHERE user_id = set_user_role.user_id;
  
  -- If no row was updated, the user doesn't exist
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Utilisateur non trouvé';
  END IF;
END;
$$;