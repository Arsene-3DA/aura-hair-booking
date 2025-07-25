-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO authenticated;
GRANT EXECUTE ON FUNCTION public.set_user_role(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_current_user_role() TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_updated_at_column() TO authenticated;

-- Add missing RLS policies for stylists on bookings
CREATE POLICY "Stylists can view their bookings" 
ON public.bookings 
FOR SELECT 
USING (
  hairdresser_id IN (
    SELECT id 
    FROM hairdressers 
    WHERE auth_id = auth.uid()
  )
);

CREATE POLICY "Stylists can update their bookings status" 
ON public.bookings 
FOR UPDATE 
USING (
  hairdresser_id IN (
    SELECT id 
    FROM hairdressers 
    WHERE auth_id = auth.uid()
  )
) 
WITH CHECK (
  hairdresser_id IN (
    SELECT id 
    FROM hairdressers 
    WHERE auth_id = auth.uid()
  )
);

-- Add policy for stylists to view client profiles for their bookings
CREATE POLICY "Stylists can view client profiles for their bookings" 
ON public.profiles 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 
    FROM bookings b 
    JOIN hairdressers h ON b.hairdresser_id = h.id 
    WHERE h.auth_id = auth.uid() 
    AND b.client_auth_id = profiles.user_id
  )
  OR user_id = auth.uid()
);

-- Ensure hairdressers can view their own profile
CREATE POLICY "Hairdressers can view and update their profiles" 
ON public.hairdressers 
FOR ALL 
USING (auth_id = auth.uid()) 
WITH CHECK (auth_id = auth.uid());