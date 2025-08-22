-- Améliorer la fonction secure_change_user_role pour créer automatiquement le profil professionnel
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
  user_email text;
  user_name text;
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

  -- Get current user data from profiles table and email from auth
  SELECT 
    jsonb_build_object('role', p.role, 'full_name', p.full_name),
    p.role::text,
    au.email,
    COALESCE(p.full_name, au.email)
  INTO target_user_data, old_role, user_email, user_name
  FROM public.profiles p
  LEFT JOIN auth.users au ON p.user_id = au.id
  WHERE p.user_id = target_user_id;
  
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

  -- Update BOTH tables for consistency
  UPDATE public.profiles 
  SET role = new_role::user_role,
      updated_at = now()
  WHERE user_id = target_user_id;

  UPDATE public.users 
  SET role = new_role::user_role,
      updated_at = now()
  WHERE auth_id = target_user_id;

  -- CRUCIAL: Create professional profile if becoming a professional
  IF new_role IN ('coiffeur', 'coiffeuse', 'cosmetique') THEN
    -- Check if hairdresser profile exists
    IF NOT EXISTS (SELECT 1 FROM public.hairdressers WHERE auth_id = target_user_id) THEN
      -- Create hairdresser profile
      INSERT INTO public.hairdressers (
        auth_id, 
        name, 
        email,
        gender,
        is_active,
        rating,
        working_hours
      ) VALUES (
        target_user_id,
        user_name,
        user_email,
        CASE new_role 
          WHEN 'coiffeuse' THEN 'femme'
          WHEN 'cosmetique' THEN 'non_specifie'
          ELSE 'homme'
        END,
        true,
        5.0,
        jsonb_build_object(
          'monday', jsonb_build_object('isOpen', true, 'open', '09:00', 'close', '18:00'),
          'tuesday', jsonb_build_object('isOpen', true, 'open', '09:00', 'close', '18:00'),
          'wednesday', jsonb_build_object('isOpen', true, 'open', '09:00', 'close', '18:00'),
          'thursday', jsonb_build_object('isOpen', true, 'open', '09:00', 'close', '18:00'),
          'friday', jsonb_build_object('isOpen', true, 'open', '09:00', 'close', '18:00'),
          'saturday', jsonb_build_object('isOpen', true, 'open', '09:00', 'close', '17:00'),
          'sunday', jsonb_build_object('isOpen', false, 'open', '10:00', 'close', '16:00')
        )
      );
    ELSE
      -- Réactiver le profil existant s'il était désactivé
      UPDATE public.hairdressers 
      SET is_active = true,
          updated_at = now()
      WHERE auth_id = target_user_id;
    END IF;
  END IF;

  -- If becoming a client, deactivate professional profile (don't delete for data integrity)
  IF new_role = 'client' AND old_role IN ('coiffeur', 'coiffeuse', 'cosmetique') THEN
    UPDATE public.hairdressers 
    SET is_active = false,
        updated_at = now()
    WHERE auth_id = target_user_id;
  END IF;

  -- Enhanced audit logging
  PERFORM log_security_event(
    'secure_role_change_with_profile',
    'Role changed with professional profile creation',
    auth.uid(),
    jsonb_build_object(
      'target_user_id', target_user_id,
      'old_role', old_role,
      'new_role', new_role,
      'changed_by', auth.uid(),
      'professional_profile_created', new_role IN ('coiffeur', 'coiffeuse', 'cosmetique'),
      'ip_address', inet_client_addr(),
      'timestamp', extract(epoch from now())
    )
  );

  -- Insert into system_logs for tracking
  INSERT INTO public.system_logs (event_type, message, metadata, created_at)
  VALUES (
    'role_change',
    'User role changed from ' || old_role || ' to ' || new_role || ' with professional profile management',
    jsonb_build_object(
      'target_user_id', target_user_id,
      'old_role', old_role,
      'new_role', new_role,
      'changed_by', auth.uid(),
      'professional_profile_action', CASE 
        WHEN new_role IN ('coiffeur', 'coiffeuse', 'cosmetique') THEN 'created_or_activated'
        WHEN new_role = 'client' AND old_role IN ('coiffeur', 'coiffeuse', 'cosmetique') THEN 'deactivated'
        ELSE 'none'
      END
    ),
    now()
  );

  RETURN jsonb_build_object(
    'success', true,
    'message', 'Rôle modifié avec succès et profil professionnel configuré',
    'oldRole', old_role,
    'newRole', new_role,
    'professionalProfileCreated', new_role IN ('coiffeur', 'coiffeuse', 'cosmetique')
  );
END;
$$;