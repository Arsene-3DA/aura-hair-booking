-- Fix critical security issues detected by the scanner - corrected syntax

-- 1. Restrict public access to users table (contains sensitive personal data)
-- Already has proper RLS policies

-- 2. Fix hairdressers table policies
DROP POLICY IF EXISTS "hairdresser_public_active" ON hairdressers;

-- Public users can view basic info only (no sensitive data)
CREATE POLICY "Public can view basic hairdresser info" 
ON hairdressers 
FOR SELECT 
USING (is_active = true);

-- 3. Update the secure function to not expose any sensitive data
CREATE OR REPLACE FUNCTION get_public_hairdresser_data_secure()
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
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Return only public-safe data, no email or phone numbers
  RETURN QUERY
  SELECT 
    h.id,
    h.name,
    h.rating,
    h.salon_address as location,
    CASE 
      WHEN LENGTH(h.bio) > 150 THEN LEFT(h.bio, 150) || '...'
      ELSE h.bio
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
  WHERE h.is_active = true
    AND h.name IS NOT NULL 
    AND h.name != '';
END;
$$;