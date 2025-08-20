-- Remove the problematic SECURITY DEFINER view and finalize security
DROP VIEW IF EXISTS public_hairdressers_view;

-- Run a final security scan to check remaining issues
-- Most remaining issues are configuration-based, not SQL-based:
-- 1. Function Search Path Mutable - These are warnings for existing functions
-- 2. Auth OTP long expiry - Admin panel configuration
-- 3. Leaked Password Protection Disabled - Admin panel configuration

-- Let's create a simple secure function that doesn't use SECURITY DEFINER
-- (since the linter flagged that as a concern)
CREATE OR REPLACE FUNCTION get_public_hairdresser_data_safe()
RETURNS TABLE (
  id UUID,
  name TEXT,
  rating NUMERIC,
  location TEXT,
  bio TEXT,
  website TEXT,
  instagram TEXT,
  working_hours JSONB,
  image_url TEXT,
  gender TEXT,
  is_active BOOLEAN,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
LANGUAGE sql
STABLE
AS $$
  SELECT 
    h.id,
    h.name,
    h.rating,
    h.salon_address as location,
    CASE 
      WHEN LENGTH(COALESCE(h.bio, '')) > 100 THEN LEFT(h.bio, 100) || '...'
      ELSE COALESCE(h.bio, '')
    END as bio,
    h.website,
    h.instagram,
    h.working_hours,
    h.image_url,
    h.gender,
    h.is_active,
    h.created_at,
    h.updated_at
  FROM hairdressers h
  WHERE h.is_active = true;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_public_hairdresser_data_safe() TO public;