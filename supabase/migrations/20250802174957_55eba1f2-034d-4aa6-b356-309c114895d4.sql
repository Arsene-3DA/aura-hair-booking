-- Create functions for React components
CREATE OR REPLACE FUNCTION get_admin_reservations()
RETURNS TABLE (
  id uuid,
  scheduled_at timestamptz,
  status booking_status,
  notes text,
  created_at timestamptz,
  updated_at timestamptz,
  client_name text,
  client_avatar text,
  client_email text,
  client_phone text,
  stylist_name text,
  stylist_avatar text,
  stylist_email text,
  stylist_phone text,
  stylist_specialties text[],
  stylist_location text,
  stylist_role user_role,
  service_name text,
  service_description text,
  service_price numeric,
  service_duration integer,
  service_category text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if user is admin
  IF get_current_user_role() != 'admin' THEN
    RAISE EXCEPTION 'Accès refusé. Seuls les administrateurs peuvent voir toutes les réservations.';
  END IF;
  
  RETURN QUERY
  SELECT 
    nr.id,
    nr.scheduled_at,
    nr.status,
    nr.notes,
    nr.created_at,
    nr.updated_at,
    -- Client information
    cp.full_name as client_name,
    cp.avatar_url as client_avatar,
    au_client.email as client_email,
    c.phone as client_phone,
    -- Stylist information  
    sp.full_name as stylist_name,
    sp.avatar_url as stylist_avatar,
    au_stylist.email as stylist_email,
    h.phone as stylist_phone,
    h.specialties as stylist_specialties,
    h.location as stylist_location,
    sp.role as stylist_role,
    -- Service information
    s.name as service_name,
    s.description as service_description,
    s.price as service_price,
    s.duration as service_duration,
    s.category as service_category
  FROM new_reservations nr
  -- Client joins
  LEFT JOIN profiles cp ON nr.client_user_id = cp.user_id
  LEFT JOIN auth.users au_client ON cp.user_id = au_client.id
  LEFT JOIN clients c ON nr.client_user_id = c.auth_id
  -- Stylist joins  
  LEFT JOIN profiles sp ON nr.stylist_user_id = sp.user_id
  LEFT JOIN auth.users au_stylist ON sp.user_id = au_stylist.id
  LEFT JOIN hairdressers h ON nr.stylist_user_id = h.auth_id
  -- Service joins
  LEFT JOIN services s ON nr.service_id = s.id
  ORDER BY nr.created_at DESC;
END;
$$;

-- Create function for stylists to get their reservations
CREATE OR REPLACE FUNCTION get_stylist_reservations()
RETURNS TABLE (
  id uuid,
  scheduled_at timestamptz,
  status booking_status,
  notes text,
  created_at timestamptz,
  updated_at timestamptz,
  client_name text,
  client_avatar text,
  client_email text,
  client_phone text,
  service_name text,
  service_description text,
  service_price numeric,
  service_duration integer,
  service_category text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    nr.id,
    nr.scheduled_at,
    nr.status,
    nr.notes,
    nr.created_at,
    nr.updated_at,
    -- Client information
    cp.full_name as client_name,
    cp.avatar_url as client_avatar,
    au_client.email as client_email,
    c.phone as client_phone,
    -- Service information
    s.name as service_name,
    s.description as service_description,
    s.price as service_price,
    s.duration as service_duration,
    s.category as service_category
  FROM new_reservations nr
  -- Client joins
  LEFT JOIN profiles cp ON nr.client_user_id = cp.user_id
  LEFT JOIN auth.users au_client ON cp.user_id = au_client.id
  LEFT JOIN clients c ON nr.client_user_id = c.auth_id
  -- Service joins
  LEFT JOIN services s ON nr.service_id = s.id
  WHERE nr.stylist_user_id = auth.uid()
  ORDER BY nr.scheduled_at ASC;
END;
$$;