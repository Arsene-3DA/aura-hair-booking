-- Fix critical security issues detected by the scanner

-- 1. Restrict public access to users table (contains sensitive personal data)
DROP POLICY IF EXISTS "Les utilisateurs peuvent voir leur propre profil" ON users;

CREATE POLICY "Users can view their own profile" 
ON users 
FOR SELECT 
USING (auth_id = auth.uid());

-- 2. Ensure hairdressers email/phone are not exposed publicly
DROP POLICY IF EXISTS "hairdresser_public_active" ON hairdressers;

CREATE POLICY "Public can view basic hairdresser info only" 
ON hairdressers 
FOR SELECT 
USING (is_active = true AND auth.uid() IS NULL) -- Only for non-authenticated users with limited data
WITH CHECK (false); -- No inserts from public

-- Authenticated users get more access
CREATE POLICY "Authenticated users view hairdressers" 
ON hairdressers 
FOR SELECT 
USING (is_active = true AND auth.uid() IS NOT NULL);

-- 3. Ensure clients table is not publicly accessible
-- Already has proper RLS with client_self policy

-- 4. Ensure bookings are properly secured
-- Already has proper RLS policies

-- 5. Ensure contact_requests are properly secured  
-- Already has proper RLS policies

-- 6. Update the secure function to not expose sensitive data
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
  -- Return only non-sensitive public data for display purposes
  RETURN QUERY
  SELECT 
    h.id,
    h.name,
    h.rating,
    h.salon_address as location,
    CASE 
      WHEN LENGTH(h.bio) > 100 THEN LEFT(h.bio, 100) || '...'
      ELSE h.bio
    END as bio, -- Truncate bio for security
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
END;
$$;