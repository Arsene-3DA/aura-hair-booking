-- Fix database function security issues by adding proper authorization
-- Update promote_to_admin function with security checks
CREATE OR REPLACE FUNCTION public.promote_to_admin(p_email text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_uid uuid;
  calling_user_role text;
BEGIN
  -- SECURITY FIX: Check if calling user is admin
  SELECT get_current_user_role() INTO calling_user_role;
  IF calling_user_role != 'admin' THEN
    RAISE EXCEPTION 'Seuls les administrateurs peuvent promouvoir d''autres utilisateurs';
  END IF;

  -- Find user by email
  SELECT id INTO v_uid FROM auth.users WHERE email = p_email LIMIT 1;
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Utilisateur % introuvable', p_email;
  END IF;

  -- Update user role
  UPDATE public.profiles SET role = 'admin' WHERE user_id = v_uid;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Profil introuvable pour %', p_email;
  END IF;

  -- SECURITY FIX: Log admin promotion for audit trail
  INSERT INTO public.system_logs (event_type, message, metadata, created_at)
  VALUES (
    'admin_promotion',
    'User promoted to admin: ' || p_email,
    jsonb_build_object(
      'promoted_user_email', p_email,
      'promoted_user_id', v_uid,
      'promoting_user_id', auth.uid()
    ),
    NOW()
  );
END;
$function$;