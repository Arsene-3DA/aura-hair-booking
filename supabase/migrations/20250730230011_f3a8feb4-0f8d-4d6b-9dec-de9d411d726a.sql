-- SECURITY FIX: Address linter warnings

-- Fix function search path mutable warnings
CREATE OR REPLACE FUNCTION public.validate_password_strength(password text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  result jsonb := '{"valid": true, "errors": []}'::jsonb;
  errors text[] := '{}';
BEGIN
  -- Minimum length
  IF length(password) < 12 THEN
    errors := array_append(errors, 'Le mot de passe doit contenir au moins 12 caractères');
  END IF;
  
  -- Must contain uppercase
  IF password !~ '[A-Z]' THEN
    errors := array_append(errors, 'Le mot de passe doit contenir au moins une majuscule');
  END IF;
  
  -- Must contain lowercase
  IF password !~ '[a-z]' THEN
    errors := array_append(errors, 'Le mot de passe doit contenir au moins une minuscule');
  END IF;
  
  -- Must contain number
  IF password !~ '[0-9]' THEN
    errors := array_append(errors, 'Le mot de passe doit contenir au moins un chiffre');
  END IF;
  
  -- Must contain special character
  IF password !~ '[!@#$%^&*(),.?":{}|<>]' THEN
    errors := array_append(errors, 'Le mot de passe doit contenir au moins un caractère spécial');
  END IF;
  
  -- No common patterns
  IF password ~* '(password|123456|qwerty|admin|user)' THEN
    errors := array_append(errors, 'Le mot de passe ne doit pas contenir de motifs courants');
  END IF;
  
  result := jsonb_build_object(
    'valid', array_length(errors, 1) IS NULL,
    'errors', errors
  );
  
  RETURN result;
END;
$$;

CREATE OR REPLACE FUNCTION public.validate_session_security()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  user_data jsonb;
  last_activity timestamp;
  suspicious_activity boolean := false;
BEGIN
  -- Get current user data
  SELECT jsonb_build_object(
    'user_id', user_id,
    'role', role,
    'updated_at', updated_at
  ) INTO user_data
  FROM public.profiles 
  WHERE user_id = auth.uid();
  
  IF user_data IS NULL THEN
    RETURN jsonb_build_object('valid', false, 'reason', 'User not found');
  END IF;
  
  -- Check for suspicious activity (multiple rapid login attempts)
  SELECT EXISTS (
    SELECT 1 FROM public.system_logs 
    WHERE event_type LIKE '%login%' 
    AND metadata->>'user_id' = auth.uid()::text
    AND created_at > NOW() - INTERVAL '5 minutes'
    HAVING COUNT(*) > 10
  ) INTO suspicious_activity;
  
  IF suspicious_activity THEN
    PERFORM log_security_event('suspicious_session_activity', 'Multiple rapid authentication events detected', auth.uid());
    RETURN jsonb_build_object('valid', false, 'reason', 'Suspicious activity detected');
  END IF;
  
  RETURN jsonb_build_object('valid', true, 'user_data', user_data);
END;
$$;