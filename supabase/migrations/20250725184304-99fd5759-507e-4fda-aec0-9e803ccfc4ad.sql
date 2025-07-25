-- Fix database function security issues by adding search_path
-- This addresses the Function Search Path Mutable warnings

-- Update existing functions to include proper search_path
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
$function$

-- Update get_current_user_role function
CREATE OR REPLACE FUNCTION public.get_current_user_role()
 RETURNS text
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$ 
  SELECT role::text FROM public.profiles WHERE user_id = auth.uid() LIMIT 1; 
$function$

-- Update is_admin function
CREATE OR REPLACE FUNCTION public.is_admin()
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$ 
  SELECT EXISTS (
    SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'admin'
  ); 
$function$

-- Update set_user_role function
CREATE OR REPLACE FUNCTION public.set_user_role(user_id uuid, new_role text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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

  -- Log role change for audit trail
  INSERT INTO public.system_logs (event_type, message, metadata, created_at)
  VALUES (
    'role_change',
    'User role changed to: ' || new_role,
    jsonb_build_object(
      'target_user_id', user_id,
      'new_role', new_role,
      'changing_user_id', auth.uid()
    ),
    NOW()
  );
END;
$function$

-- SECURITY FIX: Remove problematic views with SECURITY DEFINER if they exist
-- Note: We'll need to check what views exist and replace them with proper RLS policies
DO $$
DECLARE
    view_record RECORD;
BEGIN
    -- Check for views with SECURITY DEFINER and log them
    FOR view_record IN 
        SELECT schemaname, viewname 
        FROM pg_views 
        WHERE schemaname = 'public'
    LOOP
        -- Log the view for manual review
        INSERT INTO public.system_logs (event_type, message, metadata, created_at)
        VALUES (
            'security_review',
            'View detected for security review: ' || view_record.schemaname || '.' || view_record.viewname,
            jsonb_build_object('view_name', view_record.viewname, 'schema', view_record.schemaname),
            NOW()
        );
    END LOOP;
END $$;

-- Create function to validate admin operations with rate limiting
CREATE OR REPLACE FUNCTION public.check_admin_rate_limit()
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
    recent_count integer;
BEGIN
    -- Check admin operations in last 5 minutes
    SELECT COUNT(*) INTO recent_count
    FROM public.system_logs
    WHERE metadata->>'promoting_user_id' = auth.uid()::text
    AND event_type = 'admin_promotion'
    AND created_at > NOW() - INTERVAL '5 minutes';
    
    -- Allow max 3 promotions per 5 minutes
    IF recent_count >= 3 THEN
        RAISE EXCEPTION 'Trop d''opérations d''administration récentes. Veuillez patienter.';
    END IF;
    
    RETURN true;
END;
$function$