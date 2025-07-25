-- Fix security linter issues

-- 1. Enable RLS on system_logs table (ERROR 6)
ALTER TABLE public.system_logs ENABLE ROW LEVEL SECURITY;

-- Create policy for system_logs (only admins can read)
CREATE POLICY "Only admins can read system logs"
  ON public.system_logs
  FOR SELECT USING (public.is_admin());

-- 2. Fix function search_path issues (WARN 1-5) by setting search_path
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = 'public'
AS $$ SELECT role::text FROM public.profiles WHERE user_id = auth.uid() LIMIT 1; $$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = 'public'
AS $$ SELECT EXISTS (
  SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'admin'
); $$;

CREATE OR REPLACE FUNCTION public.ensure_user_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $func$
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
$func$;

-- Update other existing functions to include search_path
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.validate_booking_data()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = 'public'
AS $function$
BEGIN
  -- Validate booking date is not in the past
  IF NEW.booking_date < CURRENT_DATE THEN
    RAISE EXCEPTION 'La date de réservation ne peut pas être dans le passé';
  END IF;
  
  -- Validate booking date is not too far in the future (1 year max)
  IF NEW.booking_date > CURRENT_DATE + INTERVAL '1 year' THEN
    RAISE EXCEPTION 'La date de réservation ne peut pas dépasser 1 an';
  END IF;
  
  -- Validate email format
  IF NEW.client_email !~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' THEN
    RAISE EXCEPTION 'Format email invalide';
  END IF;
  
  RETURN NEW;
END;
$function$;