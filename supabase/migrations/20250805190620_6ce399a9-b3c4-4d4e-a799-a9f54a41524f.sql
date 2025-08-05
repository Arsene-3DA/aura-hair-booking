-- Allow stylists to create and manage services
CREATE POLICY "Stylists can create services" 
ON public.services 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE user_id = auth.uid() 
    AND role IN ('coiffeur', 'coiffeuse', 'cosmetique')
  )
);

CREATE POLICY "Stylists can update services" 
ON public.services 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM hairdresser_services hs
    JOIN hairdressers h ON h.id = hs.hairdresser_id
    WHERE h.auth_id = auth.uid() 
    AND hs.service_id = services.id
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM hairdresser_services hs
    JOIN hairdressers h ON h.id = hs.hairdresser_id
    WHERE h.auth_id = auth.uid() 
    AND hs.service_id = services.id
  )
);

CREATE POLICY "Stylists can delete services" 
ON public.services 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM hairdresser_services hs
    JOIN hairdressers h ON h.id = hs.hairdresser_id
    WHERE h.auth_id = auth.uid() 
    AND hs.service_id = services.id
  )
);