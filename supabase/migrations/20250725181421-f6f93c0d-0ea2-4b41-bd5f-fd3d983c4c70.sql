-- Corriger les fonctions avec search_path sécurisé
CREATE OR REPLACE FUNCTION public.promote_to_admin(p_email text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_uid uuid;
BEGIN
  SELECT id INTO v_uid FROM auth.users WHERE email = p_email LIMIT 1;
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Utilisateur % introuvable', p_email;
  END IF;

  UPDATE public.profiles SET role = 'admin' WHERE user_id = v_uid;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Profil introuvable pour %', p_email;
  END IF;
END;
$$;

-- Corriger la fonction get_current_user_role
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$ 
  SELECT role::text FROM public.profiles WHERE user_id = auth.uid() LIMIT 1; 
$$;

-- Corriger la fonction is_admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$ 
  SELECT EXISTS (
    SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'admin'
  ); 
$$;