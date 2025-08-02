-- Migrate existing bookings data to new_reservations table
INSERT INTO new_reservations (
  id,
  client_user_id,
  stylist_user_id,
  scheduled_at,
  status,
  notes,
  created_at,
  updated_at
)
SELECT 
  b.id,
  COALESCE(b.client_auth_id, b.client_id, gen_random_uuid()),
  COALESCE(b.stylist_id, b.hairdresser_id, gen_random_uuid()),
  b.scheduled_at,
  CASE 
    WHEN b.status = 'pending' THEN 'pending'::booking_status
    WHEN b.status = 'confirmed' THEN 'confirmed'::booking_status  
    WHEN b.status = 'declined' THEN 'declined'::booking_status
    WHEN b.status = 'completed' THEN 'completed'::booking_status
    ELSE 'pending'::booking_status
  END,
  b.comments,
  b.created_at,
  b.created_at
FROM bookings b
WHERE NOT EXISTS (
  SELECT 1 FROM new_reservations nr WHERE nr.id = b.id
);

-- Create view for admin with all reservation details
CREATE OR REPLACE VIEW admin_reservations_view AS
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
LEFT JOIN services s ON nr.service_id = s.id;

-- Grant access to admin view
GRANT SELECT ON admin_reservations_view TO authenticated;

-- Create RLS policy for admin view
CREATE POLICY "Admin can view all reservations details" ON admin_reservations_view
FOR SELECT USING (get_current_user_role() = 'admin');

-- Create view for stylists with their own reservation details
CREATE OR REPLACE VIEW stylist_reservations_view AS
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
  s.category as service_category,
  -- Include stylist_user_id for RLS filtering
  nr.stylist_user_id
FROM new_reservations nr
-- Client joins
LEFT JOIN profiles cp ON nr.client_user_id = cp.user_id
LEFT JOIN auth.users au_client ON cp.user_id = au_client.id
LEFT JOIN clients c ON nr.client_user_id = c.auth_id
-- Service joins
LEFT JOIN services s ON nr.service_id = s.id
WHERE nr.stylist_user_id = auth.uid();

-- Grant access to stylist view
GRANT SELECT ON stylist_reservations_view TO authenticated;

-- Create updated functions for status management
CREATE OR REPLACE FUNCTION update_reservation_status(
  reservation_id uuid,
  new_status booking_status
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role text;
  stylist_id uuid;
  result jsonb;
BEGIN
  -- Get current user role
  SELECT get_current_user_role() INTO user_role;
  
  -- Get stylist_user_id for the reservation
  SELECT nr.stylist_user_id INTO stylist_id
  FROM new_reservations nr 
  WHERE nr.id = reservation_id;
  
  -- Check permissions
  IF user_role = 'admin' THEN
    -- Admins can update any reservation
    UPDATE new_reservations 
    SET status = new_status, updated_at = now()
    WHERE id = reservation_id;
  ELSIF stylist_id = auth.uid() THEN
    -- Stylists can only update their own reservations
    UPDATE new_reservations 
    SET status = new_status, updated_at = now()
    WHERE id = reservation_id AND stylist_user_id = auth.uid();
  ELSE
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Permission denied'
    );
  END IF;
  
  -- Check if update was successful
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Reservation not found or permission denied'
    );
  END IF;
  
  -- Create notification for client if status changed by stylist
  IF user_role != 'admin' AND new_status IN ('confirmed', 'declined') THEN
    INSERT INTO notifications (user_id, title, body, created_at)
    SELECT 
      nr.client_user_id,
      CASE 
        WHEN new_status = 'confirmed' THEN 'Réservation confirmée'
        WHEN new_status = 'declined' THEN 'Réservation refusée'
      END,
      CASE 
        WHEN new_status = 'confirmed' THEN 'Votre demande de réservation a été acceptée !'
        WHEN new_status = 'declined' THEN 'Votre demande de réservation a été refusée.'
      END,
      now()
    FROM new_reservations nr 
    WHERE nr.id = reservation_id;
  END IF;
  
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Status updated successfully'
  );
END;
$$;