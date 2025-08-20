-- SECURITY FIX: Update remaining functions to include proper search_path
-- Fix functions identified in security audit

-- Fix get_current_user_id function (if it exists and needs fixing)
CREATE OR REPLACE FUNCTION public.get_current_user_id()
RETURNS uuid
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN (
    SELECT id 
    FROM public.users 
    WHERE auth_id = auth.uid()
  );
END;
$$;

-- Fix any other functions that might be missing search_path
-- Update the handle_new_auth_user function
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
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
$$;

-- Add enhanced security monitoring function
CREATE OR REPLACE FUNCTION public.log_hairdresser_access(
  hairdresser_id uuid,
  access_type text,
  user_agent text DEFAULT NULL
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Log hairdresser profile access for security monitoring
  PERFORM log_security_event(
    'hairdresser_profile_access',
    'Hairdresser profile accessed: ' || access_type,
    auth.uid(),
    jsonb_build_object(
      'hairdresser_id', hairdresser_id,
      'access_type', access_type,
      'user_agent', user_agent,
      'timestamp', extract(epoch from now())
    )
  );
END;
$$;