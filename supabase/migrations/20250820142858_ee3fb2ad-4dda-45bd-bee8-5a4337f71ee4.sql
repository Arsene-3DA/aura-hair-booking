-- Fix security issues for deployment

-- 1. Create a secure public function for hairdresser data without exposing sensitive info
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
  -- Return hairdresser data without email and phone
  RETURN QUERY
  SELECT 
    h.id,
    h.name,
    h.rating,
    h.salon_address as location,
    h.bio,
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

-- 2. Restrict direct access to hairdressers table
DROP POLICY IF EXISTS "Hairdressers are publicly viewable" ON hairdressers;

CREATE POLICY "Hairdressers can view their own profile" 
ON hairdressers 
FOR SELECT 
USING (auth.uid() = auth_id);

CREATE POLICY "Admins can view all hairdressers" 
ON hairdressers 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.auth_id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

-- 3. Restrict services pricing to authenticated users only
DROP POLICY IF EXISTS "Services sont publiquement visibles" ON services;

CREATE POLICY "Services are visible to authenticated users" 
ON services 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- 4. Fix search_path for existing functions
CREATE OR REPLACE FUNCTION get_public_hairdresser_data()
RETURNS TABLE (
  id UUID,
  name TEXT,
  specialties TEXT[],
  rating NUMERIC,
  salon_address TEXT,
  location TEXT,
  bio TEXT,
  website TEXT,
  instagram TEXT,
  experience TEXT,
  working_hours JSONB,
  image_url TEXT,
  gender TEXT,
  is_active BOOLEAN,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  auth_id UUID
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    h.id,
    h.name,
    h.specialties,
    h.rating,
    h.salon_address,
    h.location,
    h.bio,
    h.website,
    h.instagram,
    h.experience,
    h.working_hours,
    h.image_url,
    h.gender,
    h.is_active,
    h.created_at,
    h.updated_at,
    h.auth_id
  FROM hairdressers h
  WHERE h.is_active = true;
END;
$$;