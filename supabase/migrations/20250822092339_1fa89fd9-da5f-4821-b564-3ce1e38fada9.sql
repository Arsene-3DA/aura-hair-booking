-- Corriger la fonction secure_change_user_role pour mettre à jour les DEUX tables
CREATE OR REPLACE FUNCTION public.secure_change_user_role(target_user_id uuid, new_role text, csrf_token text DEFAULT NULL::text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  calling_user_role text;
  target_user_data jsonb;
  old_role text;
  recent_changes_count integer;
BEGIN
  -- SECURITY: Verify caller is admin
  SELECT get_current_user_role() INTO calling_user_role;
  IF calling_user_role != 'admin' THEN
    PERFORM log_security_event('unauthorized_role_change', 'Non-admin attempted role change', target_user_id);
    RETURN jsonb_build_object('success', false, 'error', 'Accès non autorisé');
  END IF;

  -- SECURITY: Validate new role
  IF new_role NOT IN ('client', 'coiffeur', 'coiffeuse', 'cosmetique', 'admin') THEN
    RETURN jsonb_build_object('success', false, 'error', 'Rôle invalide');
  END IF;

  -- SECURITY: Prevent self-modification
  IF target_user_id = auth.uid() THEN
    PERFORM log_security_event('self_role_change_attempt', 'Admin attempted self role change', auth.uid());
    RETURN jsonb_build_object('success', false, 'error', 'Auto-modification interdite');
  END IF;

  -- Get current user data from profiles table
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
  SELECT COUNT(*) INTO recent_changes_count
  FROM public.system_logs 
  WHERE event_type = 'role_change' 
  AND metadata->>'changed_by' = auth.uid()::text 
  AND created_at > NOW() - INTERVAL '1 minute';
  
  IF recent_changes_count >= 5 THEN
    PERFORM log_security_event('role_change_rate_limit', 'Role change rate limit exceeded', auth.uid());
    RETURN jsonb_build_object('success', false, 'error', 'Trop de changements récents');
  END IF;

  -- CRUCIAL FIX: Update BOTH tables for consistency
  
  -- 1. Update profiles table
  UPDATE public.profiles 
  SET role = new_role::user_role,
      updated_at = now()
  WHERE user_id = target_user_id;

  -- 2. Update users table to maintain consistency
  UPDATE public.users 
  SET role = new_role::user_role,
      updated_at = now()
  WHERE auth_id = target_user_id;

  -- Enhanced audit logging
  PERFORM log_security_event(
    'secure_role_change',
    'Role changed via secure function in both tables',
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

  -- Insert into system_logs for tracking
  INSERT INTO public.system_logs (event_type, message, metadata, created_at)
  VALUES (
    'role_change',
    'User role changed from ' || old_role || ' to ' || new_role || ' in both users and profiles tables',
    jsonb_build_object(
      'target_user_id', target_user_id,
      'old_role', old_role,
      'new_role', new_role,
      'changed_by', auth.uid()
    ),
    now()
  );

  RETURN jsonb_build_object(
    'success', true,
    'message', 'Rôle modifié avec succès dans les deux tables',
    'oldRole', old_role,
    'newRole', new_role
  );
END;
$$;