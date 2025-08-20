-- Simply update the secure function to use safer data handling
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
  -- Return only public-safe data, absolutely no sensitive information
  RETURN QUERY
  SELECT 
    h.id,
    h.name,
    h.rating,
    h.salon_address as location,
    CASE 
      WHEN LENGTH(COALESCE(h.bio, '')) > 150 THEN LEFT(h.bio, 150) || '...'
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
  WHERE h.is_active = true
    AND h.name IS NOT NULL 
    AND h.name != '';
END;
$$;