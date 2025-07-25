-- SECURITY FIX: Fix remaining linter issues

-- 1. Fix trigger_refresh_stylists_rating function (missing search_path)
CREATE OR REPLACE FUNCTION public.trigger_refresh_stylists_rating()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
BEGIN
  -- Use pg_notify to trigger async refresh
  PERFORM pg_notify('refresh_stylists_rating', '');
  RETURN COALESCE(NEW, OLD);
END;
$function$;

-- 2. Fix refresh_stylists_rating function (missing search_path) 
CREATE OR REPLACE FUNCTION public.refresh_stylists_rating()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Check if materialized view exists before refreshing
  IF EXISTS (
    SELECT 1 FROM pg_matviews 
    WHERE schemaname = 'public' AND matviewname = 'stylists_with_rating'
  ) THEN
    REFRESH MATERIALIZED VIEW CONCURRENTLY stylists_with_rating;
    
    -- Log the refresh
    INSERT INTO public.system_logs (event_type, message, created_at)
    VALUES ('materialized_view_refresh', 'stylists_with_rating refreshed', NOW())
    ON CONFLICT DO NOTHING;
  END IF;
END;
$function$;