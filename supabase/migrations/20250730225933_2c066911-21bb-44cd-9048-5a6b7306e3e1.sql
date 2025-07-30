-- SECURITY FIX: Critical database security improvements

-- 1. Fix privilege escalation vulnerability in profiles table
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admin can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admin full access" ON public.profiles;

-- Create secure profile policies with proper WITH CHECK constraints
CREATE POLICY "Users can update own profile - no role changes" 
ON public.profiles 
FOR UPDATE 
USING (user_id = auth.uid()) 
WITH CHECK (
  user_id = auth.uid() AND 
  role = (SELECT role FROM public.profiles WHERE user_id = auth.uid())
);

CREATE POLICY "Users can view own profile" 
ON public.profiles 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Admins manage all profiles" 
ON public.profiles 
FOR ALL 
USING (get_current_user_role() = 'admin') 
WITH CHECK (get_current_user_role() = 'admin');

-- 2. Create secure admin-only role change function
CREATE OR REPLACE FUNCTION public.secure_change_user_role(
  target_user_id uuid, 
  new_role text,
  csrf_token text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  calling_user_role text;
  target_user_data jsonb;
  old_role text;
BEGIN
  -- SECURITY: Verify caller is admin
  SELECT get_current_user_role() INTO calling_user_role;
  IF calling_user_role != 'admin' THEN
    PERFORM log_security_event('unauthorized_role_change', 'Non-admin attempted role change', target_user_id);
    RETURN jsonb_build_object('success', false, 'error', 'Accès non autorisé');
  END IF;

  -- SECURITY: Validate new role
  IF new_role NOT IN ('client', 'coiffeur', 'cosmetique', 'admin') THEN
    RETURN jsonb_build_object('success', false, 'error', 'Rôle invalide');
  END IF;

  -- SECURITY: Prevent self-modification
  IF target_user_id = auth.uid() THEN
    PERFORM log_security_event('self_role_change_attempt', 'Admin attempted self role change', auth.uid());
    RETURN jsonb_build_object('success', false, 'error', 'Auto-modification interdite');
  END IF;

  -- Get current user data
  SELECT 
    jsonb_build_object('role', role, 'full_name', full_name),
    role::text
  INTO target_user_data, old_role
  FROM public.profiles 
  WHERE user_id = target_user_id;
  
  IF target_user_data IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Utilisateur non trouvé');
  END IF;

  -- SECURITY: Rate limiting check
  IF NOT EXISTS (
    SELECT 1 FROM public.system_logs 
    WHERE event_type = 'role_change' 
    AND metadata->>'changed_by' = auth.uid()::text 
    AND created_at > NOW() - INTERVAL '1 minute'
    HAVING COUNT(*) < 5
  ) THEN
    PERFORM log_security_event('role_change_rate_limit', 'Role change rate limit exceeded', auth.uid());
    RETURN jsonb_build_object('success', false, 'error', 'Trop de changements récents');
  END IF;

  -- Update role with enhanced logging
  UPDATE public.profiles 
  SET role = new_role::user_role,
      updated_at = now()
  WHERE user_id = target_user_id;

  -- Enhanced audit logging
  PERFORM log_security_event(
    'secure_role_change',
    'Role changed via secure function',
    auth.uid(),
    jsonb_build_object(
      'target_user_id', target_user_id,
      'old_role', old_role,
      'new_role', new_role,
      'changed_by', auth.uid(),
      'ip_address', inet_client_addr(),
      'timestamp', extract(epoch from now())
    )
  );

  RETURN jsonb_build_object(
    'success', true,
    'message', 'Rôle modifié avec succès',
    'old_role', old_role,
    'new_role', new_role
  );
END;
$$;

-- 3. Add security to bookings table
DROP POLICY IF EXISTS "stylist_update_status" ON public.bookings;
CREATE POLICY "stylist_update_status_secure" 
ON public.bookings 
FOR UPDATE 
USING (stylist_id = auth.uid()) 
WITH CHECK (
  stylist_id = auth.uid() AND 
  status IN ('confirmed', 'declined', 'completed') AND
  -- Prevent backdating completed bookings
  (status != 'completed' OR scheduled_at <= now())
);

-- 4. Secure reviews table
DROP POLICY IF EXISTS "client_owns_review" ON public.reviews;
CREATE POLICY "client_creates_review_secure" 
ON public.reviews 
FOR INSERT 
WITH CHECK (
  client_id = auth.uid() AND
  rating BETWEEN 1 AND 5 AND
  -- Ensure booking exists and belongs to client
  EXISTS (
    SELECT 1 FROM public.bookings 
    WHERE id = booking_id 
    AND client_id = auth.uid() 
    AND status = 'completed'
  )
);

CREATE POLICY "client_updates_own_review" 
ON public.reviews 
FOR UPDATE 
USING (client_id = auth.uid()) 
WITH CHECK (client_id = auth.uid());

CREATE POLICY "client_views_own_review" 
ON public.reviews 
FOR SELECT 
USING (client_id = auth.uid());

-- 5. Enhanced password validation function
CREATE OR REPLACE FUNCTION public.validate_password_strength(password text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
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

-- 6. Create secure session validation function
CREATE OR REPLACE FUNCTION public.validate_session_security()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
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