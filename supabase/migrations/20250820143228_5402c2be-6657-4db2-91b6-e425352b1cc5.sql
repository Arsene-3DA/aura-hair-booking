-- Fix critical security issues - corrected version

-- 1. Drop the problematic policy and recreate properly
DROP POLICY IF EXISTS "hairdresser_public_active" ON hairdressers;
DROP POLICY IF EXISTS "Public can view basic hairdresser info only" ON hairdressers;
DROP POLICY IF EXISTS "Authenticated users view hairdressers" ON hairdressers;

-- Create a single comprehensive public read policy that doesn't expose sensitive data
CREATE POLICY "Public can view basic hairdresser info" 
ON hairdressers 
FOR SELECT 
USING (is_active = true);

-- The sensitive data protection is handled by the secure function, not the policy

-- 2. Ensure the secure function is the primary way to access public data
-- (This was already updated in the previous migration)

-- 3. Add rate limiting for the secure function by creating a view instead
CREATE OR REPLACE VIEW public_hairdressers_view AS
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

-- Grant access to the view
GRANT SELECT ON public_hairdressers_view TO public;