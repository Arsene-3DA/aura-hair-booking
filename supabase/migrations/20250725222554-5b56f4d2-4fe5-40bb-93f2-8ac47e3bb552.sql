-- SECURITY FIX: Critical RLS and Database Function Security Updates

-- 1. Fix database functions with missing search_path (CRITICAL SECURITY FIX)
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

  -- SECURITY FIX: Validate email format
  IF p_email !~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' THEN
    RAISE EXCEPTION 'Format d''email invalide';
  END IF;

  -- Find user by email
  SELECT id INTO v_uid FROM auth.users WHERE email = lower(trim(p_email)) LIMIT 1;
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Utilisateur % introuvable', p_email;
  END IF;

  -- SECURITY FIX: Prevent self-promotion abuse
  IF v_uid = auth.uid() THEN
    RAISE EXCEPTION 'Impossible de se promouvoir soi-même';
  END IF;

  -- Update user role
  UPDATE public.profiles SET role = 'admin' WHERE user_id = v_uid;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Profil introuvable pour %', p_email;
  END IF;

  -- SECURITY FIX: Enhanced audit logging
  INSERT INTO public.system_logs (event_type, message, metadata, created_at)
  VALUES (
    'admin_promotion',
    'User promoted to admin: ' || p_email,
    jsonb_build_object(
      'promoted_user_email', p_email,
      'promoted_user_id', v_uid,
      'promoting_user_id', auth.uid(),
      'ip_address', inet_client_addr(),
      'user_agent', current_setting('request.headers', true)::json->>'user-agent'
    ),
    NOW()
  );
END;
$function$;

-- 2. Fix set_super_admin function security
CREATE OR REPLACE FUNCTION public.set_super_admin(user_email text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_user_id uuid;
BEGIN
  -- SECURITY FIX: Validate email format
  IF user_email !~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' THEN
    RAISE EXCEPTION 'Format d''email invalide';
  END IF;

  -- Trouver l'utilisateur par email
  SELECT id INTO v_user_id FROM auth.users WHERE email = lower(trim(user_email)) LIMIT 1;
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Utilisateur % introuvable', user_email;
  END IF;

  -- Mettre à jour le profil comme admin
  UPDATE public.profiles 
  SET role = 'admin', 
      full_name = COALESCE(full_name, user_email),
      updated_at = now()
  WHERE user_id = v_user_id;
  
  -- Créer le profil s'il n'existe pas
  INSERT INTO public.profiles (user_id, role, full_name, created_at, updated_at)
  VALUES (v_user_id, 'admin', user_email, now(), now())
  ON CONFLICT (user_id) DO UPDATE SET 
    role = 'admin',
    updated_at = now();

  -- SECURITY FIX: Enhanced audit logging
  INSERT INTO public.system_logs (event_type, message, metadata, created_at)
  VALUES (
    'super_admin_promotion',
    'Super administrateur défini: ' || user_email,
    jsonb_build_object(
      'user_email', user_email,
      'user_id', v_user_id,
      'promoted_at', now(),
      'ip_address', inet_client_addr()
    ),
    now()
  );
END;
$function$;

-- 3. Fix get_current_user_role function security
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$ 
  SELECT role::text FROM public.profiles WHERE user_id = auth.uid() LIMIT 1; 
$function$;

-- 4. Fix is_admin function security  
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$ 
  SELECT EXISTS (
    SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'admin'
  ); 
$function$;

-- 5. SECURITY FIX: Add missing WITH CHECK constraints to RLS policies

-- Fix new_reservations policies
DROP POLICY IF EXISTS "Clients create reservations" ON public.new_reservations;
CREATE POLICY "Clients create reservations" 
ON public.new_reservations 
FOR INSERT 
TO authenticated
WITH CHECK (client_user_id = auth.uid());

-- Fix profiles policies for INSERT
DROP POLICY IF EXISTS "Users can create profiles" ON public.profiles;
CREATE POLICY "Users can create profiles" 
ON public.profiles 
FOR INSERT 
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Fix client_notes policies
DROP POLICY IF EXISTS "stylist_rw_notes" ON public.client_notes;
CREATE POLICY "stylist_rw_notes" 
ON public.client_notes 
FOR ALL
TO authenticated
USING (stylist_id = auth.uid())
WITH CHECK (stylist_id = auth.uid());

-- Fix portfolio policies
DROP POLICY IF EXISTS "stylist_owns_portfolio" ON public.portfolio;
CREATE POLICY "stylist_owns_portfolio" 
ON public.portfolio 
FOR ALL
TO authenticated
USING (stylist_id = auth.uid())
WITH CHECK (stylist_id = auth.uid());

-- Fix availabilities policies
DROP POLICY IF EXISTS "stylist_rw" ON public.availabilities;
CREATE POLICY "stylist_rw" 
ON public.availabilities 
FOR ALL
TO authenticated
USING (stylist_id = auth.uid())
WITH CHECK (stylist_id = auth.uid());

-- 6. SECURITY FIX: Standardize inconsistent role checking in hairdressers table
DROP POLICY IF EXISTS "admin_full_hairdressers" ON public.hairdressers;
CREATE POLICY "admin_full_hairdressers" 
ON public.hairdressers 
FOR ALL
TO authenticated
USING (get_current_user_role() = 'admin');

-- 7. SECURITY FIX: Enhanced validation trigger with better security
CREATE OR REPLACE FUNCTION public.validate_booking_data()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
BEGIN
  -- SECURITY FIX: Enhanced date validation
  IF NEW.booking_date < CURRENT_DATE THEN
    RAISE EXCEPTION 'La date de réservation ne peut pas être dans le passé';
  END IF;
  
  -- SECURITY FIX: Prevent booking too far in advance
  IF NEW.booking_date > CURRENT_DATE + INTERVAL '1 year' THEN
    RAISE EXCEPTION 'La date de réservation ne peut pas dépasser 1 an';
  END IF;
  
  -- SECURITY FIX: Enhanced email validation
  IF NEW.client_email IS NULL OR NEW.client_email = '' THEN
    RAISE EXCEPTION 'Email client requis';
  END IF;
  
  IF NEW.client_email !~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' THEN
    RAISE EXCEPTION 'Format email invalide';
  END IF;
  
  -- SECURITY FIX: Sanitize client inputs
  NEW.client_name = trim(NEW.client_name);
  NEW.client_email = lower(trim(NEW.client_email));
  NEW.client_phone = trim(NEW.client_phone);
  
  -- SECURITY FIX: Validate required fields
  IF NEW.client_name IS NULL OR NEW.client_name = '' THEN
    RAISE EXCEPTION 'Nom du client requis';
  END IF;
  
  IF NEW.service IS NULL OR NEW.service = '' THEN
    RAISE EXCEPTION 'Service requis';
  END IF;
  
  RETURN NEW;
END;
$function$;

-- 8. SECURITY FIX: Create enhanced security audit logging
CREATE OR REPLACE FUNCTION public.log_security_event(
  event_type text,
  event_message text,
  user_id uuid DEFAULT auth.uid(),
  metadata jsonb DEFAULT '{}'::jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.system_logs (event_type, message, metadata, created_at)
  VALUES (
    event_type,
    event_message,
    metadata || jsonb_build_object(
      'user_id', user_id,
      'timestamp', extract(epoch from now()),
      'ip_address', coalesce(inet_client_addr()::text, 'unknown')
    ),
    now()
  );
END;
$function$;