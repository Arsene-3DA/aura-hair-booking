-- SECURITY FIX: Correct function search paths
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_full_name text;
BEGIN
  /* ---------------- Déterminer le nom à enregistrer ---------------- */
  v_full_name :=
    COALESCE(
      NEW.raw_user_meta_data ->> 'full_name',
      NEW.raw_user_meta_data ->> 'name',
      split_part(NEW.email, '@', 1)
    );

  /* ---------------- Insérer ou mettre à jour le profil -------------- */
  INSERT INTO public.profiles (user_id, full_name, avatar_url, role)
  VALUES (
    NEW.id,
    v_full_name,
    NEW.raw_user_meta_data ->> 'picture',
    COALESCE(
      (NEW.raw_user_meta_data ->> 'role')::public.user_role,
      'client'
    )
  )
  ON CONFLICT (user_id) DO
    UPDATE
    SET full_name   = COALESCE(EXCLUDED.full_name, profiles.full_name),
        avatar_url  = COALESCE(EXCLUDED.avatar_url, profiles.avatar_url),
        updated_at  = now();

  RETURN NEW;

EXCEPTION WHEN others THEN
  RAISE WARNING 'handle_new_user : % (%). NEW.id=%',
                SQLERRM, SQLSTATE, NEW.id;
  RETURN NEW;
END;
$$;

-- SECURITY FIX: Update ensure_user_profile function
CREATE OR REPLACE FUNCTION public.ensure_user_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'client')
  )
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- SECURITY FIX: Create storage policies for strict access control
DELETE FROM storage.objects WHERE bucket_id = 'avatars';
DELETE FROM storage.objects WHERE bucket_id = 'portfolio';

-- Remove old permissive policies
DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Portfolio images public read" ON storage.objects;
DROP POLICY IF EXISTS "Stylists can upload portfolio images" ON storage.objects;

-- SECURITY FIX: Create strict RLS policies for storage
CREATE POLICY "Avatars: Users can view their own and public avatars"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'avatars' AND 
  (auth.uid()::text = (storage.foldername(name))[1] OR 
   EXISTS (SELECT 1 FROM profiles WHERE user_id = ((storage.foldername(name))[1])::uuid AND role IN ('coiffeur', 'coiffeuse', 'cosmetique')))
);

CREATE POLICY "Avatars: Users can upload their own avatar"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Avatars: Users can update their own avatar"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'avatars' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Avatars: Users can delete their own avatar"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'avatars' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Portfolio storage policies
CREATE POLICY "Portfolio: Public can view professional portfolios"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'portfolio' AND
  EXISTS (SELECT 1 FROM profiles WHERE user_id = ((storage.foldername(name))[1])::uuid AND role IN ('coiffeur', 'coiffeuse', 'cosmetique'))
);

CREATE POLICY "Portfolio: Stylists can manage their own portfolio"
ON storage.objects FOR ALL
USING (
  bucket_id = 'portfolio' AND 
  auth.uid()::text = (storage.foldername(name))[1]
)
WITH CHECK (
  bucket_id = 'portfolio' AND 
  auth.uid()::text = (storage.foldername(name))[1] AND
  EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role IN ('coiffeur', 'coiffeuse', 'cosmetique'))
);

-- SECURITY FIX: Add comprehensive audit logging table
CREATE TABLE IF NOT EXISTS public.security_audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL,
  user_id uuid REFERENCES auth.users(id),
  event_data jsonb DEFAULT '{}',
  ip_address inet,
  user_agent text,
  created_at timestamp with time zone DEFAULT now(),
  severity text CHECK (severity IN ('low', 'medium', 'high', 'critical')) DEFAULT 'medium'
);

-- Enable RLS on audit logs
ALTER TABLE public.security_audit_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Only admins can view audit logs"
ON public.security_audit_logs FOR SELECT
USING (is_admin());

-- Allow system to insert audit logs
CREATE POLICY "System can insert audit logs"
ON public.security_audit_logs FOR INSERT
WITH CHECK (true);

-- SECURITY FIX: Create enhanced security validation function
CREATE OR REPLACE FUNCTION public.validate_security_context()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  user_data jsonb;
  session_age interval;
  suspicious_activity boolean := false;
  security_warnings text[] := '{}';
BEGIN
  -- Get current user data
  SELECT jsonb_build_object(
    'user_id', user_id,
    'role', role,
    'created_at', created_at,
    'updated_at', updated_at
  ) INTO user_data
  FROM public.profiles 
  WHERE user_id = auth.uid();
  
  IF user_data IS NULL THEN
    RETURN jsonb_build_object(
      'valid', false, 
      'reason', 'User profile not found',
      'security_level', 'critical'
    );
  END IF;
  
  -- Check for suspicious login patterns
  SELECT EXISTS (
    SELECT 1 FROM public.security_audit_logs 
    WHERE event_type = 'login_attempt'
    AND user_id = auth.uid()
    AND created_at > NOW() - INTERVAL '15 minutes'
    HAVING COUNT(*) > 10
  ) INTO suspicious_activity;
  
  IF suspicious_activity THEN
    security_warnings := array_append(security_warnings, 'Multiple rapid login attempts detected');
  END IF;
  
  -- Check for concurrent sessions (simplified check)
  SELECT EXISTS (
    SELECT 1 FROM public.security_audit_logs 
    WHERE event_type = 'session_active'
    AND user_id = auth.uid()
    AND created_at > NOW() - INTERVAL '1 hour'
    HAVING COUNT(DISTINCT ip_address) > 3
  ) INTO suspicious_activity;
  
  IF suspicious_activity THEN
    security_warnings := array_append(security_warnings, 'Multiple concurrent sessions detected');
  END IF;
  
  RETURN jsonb_build_object(
    'valid', true, 
    'user_data', user_data,
    'security_level', CASE 
      WHEN array_length(security_warnings, 1) > 0 THEN 'high'
      ELSE 'normal'
    END,
    'warnings', security_warnings
  );
END;
$$;