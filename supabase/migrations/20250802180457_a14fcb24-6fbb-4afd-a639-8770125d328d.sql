-- Fix column names in reservation functions
-- Drop existing functions
DROP FUNCTION IF EXISTS get_admin_reservations();
DROP FUNCTION IF EXISTS get_stylist_reservations();

-- Recreate admin reservations function with correct column names
CREATE OR REPLACE FUNCTION get_admin_reservations()
RETURNS TABLE (
  id UUID,
  scheduled_at TIMESTAMPTZ,
  status TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  client_name TEXT,
  client_avatar TEXT,
  client_email TEXT,
  client_phone TEXT,
  stylist_name TEXT,
  stylist_avatar TEXT,
  stylist_email TEXT,
  stylist_phone TEXT,
  stylist_specialties TEXT[],
  stylist_location TEXT,
  stylist_role TEXT,
  service_name TEXT,
  service_description TEXT,
  service_price NUMERIC,
  service_duration INTEGER,
  service_category TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if user is admin
  IF NOT EXISTS (
    SELECT 1 FROM profiles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Access denied: Admin role required';
  END IF;

  RETURN QUERY
  SELECT 
    r.id,
    r.scheduled_at,
    r.status::TEXT,
    r.notes,
    r.created_at,
    r.updated_at,
    cp.full_name::TEXT as client_name,
    cp.avatar_url::TEXT as client_avatar,
    cu.email::TEXT as client_email,
    cp.phone::TEXT as client_phone,
    sp.full_name::TEXT as stylist_name,
    sp.avatar_url::TEXT as stylist_avatar,
    su.email::TEXT as stylist_email,
    sp.phone::TEXT as stylist_phone,
    sp.specialties as stylist_specialties,
    sp.location::TEXT as stylist_location,
    sp.role::TEXT as stylist_role,
    s.name::TEXT as service_name,
    s.description::TEXT as service_description,
    s.price as service_price,
    s.duration as service_duration,
    s.category::TEXT as service_category
  FROM new_reservations r
  LEFT JOIN profiles cp ON r.client_user_id = cp.user_id
  LEFT JOIN auth.users cu ON r.client_user_id = cu.id
  LEFT JOIN profiles sp ON r.stylist_user_id = sp.user_id
  LEFT JOIN auth.users su ON r.stylist_user_id = su.id
  LEFT JOIN services s ON r.service_id = s.id
  ORDER BY r.created_at DESC;
END;
$$;

-- Recreate stylist reservations function with correct column names
CREATE OR REPLACE FUNCTION get_stylist_reservations()
RETURNS TABLE (
  id UUID,
  scheduled_at TIMESTAMPTZ,
  status TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  client_name TEXT,
  client_avatar TEXT,
  client_email TEXT,
  client_phone TEXT,
  service_name TEXT,
  service_description TEXT,
  service_price NUMERIC,
  service_duration INTEGER,
  service_category TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if user has stylist role
  IF NOT EXISTS (
    SELECT 1 FROM profiles 
    WHERE user_id = auth.uid() 
    AND role IN ('coiffeur', 'coiffeuse', 'cosmetique')
  ) THEN
    RAISE EXCEPTION 'Access denied: Stylist role required';
  END IF;

  RETURN QUERY
  SELECT 
    r.id,
    r.scheduled_at,
    r.status::TEXT,
    r.notes,
    r.created_at,
    r.updated_at,
    cp.full_name::TEXT as client_name,
    cp.avatar_url::TEXT as client_avatar,
    cu.email::TEXT as client_email,
    cp.phone::TEXT as client_phone,
    s.name::TEXT as service_name,
    s.description::TEXT as service_description,
    s.price as service_price,
    s.duration as service_duration,
    s.category::TEXT as service_category
  FROM new_reservations r
  LEFT JOIN profiles cp ON r.client_user_id = cp.user_id
  LEFT JOIN auth.users cu ON r.client_user_id = cu.id
  LEFT JOIN services s ON r.service_id = s.id
  WHERE r.stylist_user_id = auth.uid()
  ORDER BY r.created_at DESC;
END;
$$;