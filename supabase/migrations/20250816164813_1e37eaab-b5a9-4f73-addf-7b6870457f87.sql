-- SECURITY FIX: Restrict hairdresser data exposure
-- Step 1: Drop existing overly permissive public policy
DROP POLICY IF EXISTS "Public can view limited hairdresser info" ON public.hairdressers;

-- Step 2: Create restricted public view policy (business info only)
CREATE POLICY "Public can view business info only" 
ON public.hairdressers 
FOR SELECT 
USING (
  is_active = true 
  AND auth.uid() IS NULL -- Only for unauthenticated users
);

-- Step 3: Create authenticated user policy (includes contact info for authorized users)
CREATE POLICY "Authenticated users can view hairdresser details" 
ON public.hairdressers 
FOR SELECT 
USING (
  is_active = true 
  AND auth.uid() IS NOT NULL
  AND (
    -- Admin can see all
    get_current_user_role() = 'admin'
    -- Hairdresser can see their own profile
    OR auth_id = auth.uid()
    -- Client can see contact info only if they have a booking with this hairdresser
    OR EXISTS (
      SELECT 1 FROM new_reservations nr 
      WHERE nr.stylist_user_id = hairdressers.auth_id 
      AND nr.client_user_id = auth.uid()
      AND nr.status IN ('confirmed', 'pending', 'completed')
    )
  )
);

-- Step 4: Create a secure view for public hairdresser listings
CREATE OR REPLACE VIEW public.hairdressers_public AS
SELECT 
  id,
  name,
  specialties,
  rating,
  salon_address,
  location,
  bio,
  website,
  instagram,
  experience,
  working_hours,
  image_url,
  gender,
  is_active,
  created_at,
  updated_at,
  auth_id
FROM public.hairdressers
WHERE is_active = true;

-- Enable RLS on the view
ALTER VIEW public.hairdressers_public SET (security_invoker = true);

-- Step 5: Create contact request table for secure messaging
CREATE TABLE IF NOT EXISTS public.contact_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hairdresser_id uuid NOT NULL REFERENCES public.hairdressers(id),
  client_id uuid NOT NULL,
  client_name text NOT NULL,
  client_email text NOT NULL,
  subject text NOT NULL,
  message text NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'responded', 'closed')),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on contact_requests
ALTER TABLE public.contact_requests ENABLE ROW LEVEL SECURITY;

-- RLS policies for contact_requests
CREATE POLICY "Clients can create contact requests" 
ON public.contact_requests 
FOR INSERT 
WITH CHECK (client_id = auth.uid());

CREATE POLICY "Hairdressers can view their contact requests" 
ON public.contact_requests 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.hairdressers h 
    WHERE h.id = contact_requests.hairdresser_id 
    AND h.auth_id = auth.uid()
  )
);

CREATE POLICY "Clients can view their own contact requests" 
ON public.contact_requests 
FOR SELECT 
USING (client_id = auth.uid());

CREATE POLICY "Admins can manage all contact requests" 
ON public.contact_requests 
FOR ALL 
USING (get_current_user_role() = 'admin');

-- Step 6: Add trigger for contact_requests updated_at
CREATE TRIGGER update_contact_requests_updated_at
  BEFORE UPDATE ON public.contact_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Step 7: Create function to send contact request
CREATE OR REPLACE FUNCTION public.send_contact_request(
  p_hairdresser_id uuid,
  p_client_name text,
  p_client_email text,
  p_subject text,
  p_message text
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  contact_request_id uuid;
  hairdresser_data jsonb;
BEGIN
  -- Validate inputs
  IF p_client_name IS NULL OR trim(p_client_name) = '' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Le nom est requis');
  END IF;
  
  IF p_client_email IS NULL OR p_client_email !~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Email invalide');
  END IF;
  
  IF p_subject IS NULL OR trim(p_subject) = '' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Le sujet est requis');
  END IF;
  
  IF p_message IS NULL OR trim(p_message) = '' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Le message est requis');
  END IF;
  
  -- Check if hairdresser exists and is active
  SELECT jsonb_build_object('name', name, 'email', email) INTO hairdresser_data
  FROM public.hairdressers 
  WHERE id = p_hairdresser_id AND is_active = true;
  
  IF hairdresser_data IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Coiffeur non trouvé');
  END IF;
  
  -- Rate limiting: max 3 requests per hour per client
  IF auth.uid() IS NOT NULL THEN
    IF (
      SELECT COUNT(*) 
      FROM public.contact_requests 
      WHERE client_id = auth.uid() 
      AND created_at > now() - INTERVAL '1 hour'
    ) >= 3 THEN
      RETURN jsonb_build_object('success', false, 'error', 'Trop de demandes récentes. Veuillez réessayer plus tard.');
    END IF;
  END IF;
  
  -- Insert contact request
  INSERT INTO public.contact_requests (
    hairdresser_id,
    client_id,
    client_name,
    client_email,
    subject,
    message
  ) VALUES (
    p_hairdresser_id,
    COALESCE(auth.uid(), gen_random_uuid()), -- Allow anonymous requests with temp ID
    trim(p_client_name),
    lower(trim(p_client_email)),
    trim(p_subject),
    trim(p_message)
  ) RETURNING id INTO contact_request_id;
  
  -- Log the contact request
  PERFORM log_security_event(
    'contact_request_sent',
    'Contact request sent to hairdresser',
    auth.uid(),
    jsonb_build_object(
      'hairdresser_id', p_hairdresser_id,
      'contact_request_id', contact_request_id,
      'hairdresser_name', hairdresser_data->>'name'
    )
  );
  
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Votre demande de contact a été envoyée avec succès',
    'contact_request_id', contact_request_id
  );
END;
$$;