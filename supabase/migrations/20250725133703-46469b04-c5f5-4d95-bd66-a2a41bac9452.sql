-- Fix remaining security warnings - add search_path to remaining functions

CREATE OR REPLACE FUNCTION public.create_client_user_if_not_exists()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  existing_user_id UUID;
  new_user_id UUID;
BEGIN
  -- Input validation
  IF NEW.client_email IS NULL OR NEW.client_email = '' THEN
    RAISE EXCEPTION 'Email client requis';
  END IF;
  
  IF NEW.client_name IS NULL OR NEW.client_name = '' THEN
    RAISE EXCEPTION 'Nom client requis';
  END IF;

  -- Vérifier si l'utilisateur existe déjà
  SELECT id INTO existing_user_id 
  FROM public.users 
  WHERE email = NEW.client_email;
  
  IF existing_user_id IS NULL THEN
    -- Créer un nouvel utilisateur client
    INSERT INTO public.users (email, password_hash, user_type, first_name, phone)
    VALUES (
      NEW.client_email,
      public.hash_password('motdepasse123'),
      'client',
      NEW.client_name,
      NEW.client_phone
    )
    RETURNING id INTO new_user_id;
    
    NEW.client_user_id = new_user_id;
  ELSE
    NEW.client_user_id = existing_user_id;
  END IF;
  
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  -- Input validation
  IF NEW.email IS NULL OR NEW.email = '' THEN
    RAISE EXCEPTION 'Email requis';
  END IF;

  INSERT INTO public.users (auth_id, email, nom, prenom, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'nom', 'Nom'),
    COALESCE(NEW.raw_user_meta_data ->> 'prenom', 'Prénom'),
    COALESCE((NEW.raw_user_meta_data ->> 'role')::user_role, 'client')
  );
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  IF NEW.raw_user_meta_data ->> 'role' = 'client' OR NEW.raw_user_meta_data ->> 'role' IS NULL THEN
    INSERT INTO public.clients (auth_id, name, email)
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data ->> 'name', NEW.email),
      NEW.email
    );
  END IF;
  RETURN NEW;
END;
$function$;