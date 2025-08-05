-- Corriger la politique RLS pour hairdresser_services
DROP POLICY IF EXISTS "Hairdressers manage their services" ON public.hairdresser_services;

-- Créer une nouvelle politique qui vérifie correctement l'ownership
CREATE POLICY "Hairdressers manage their services" 
ON public.hairdresser_services 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM hairdressers h 
    WHERE h.id = hairdresser_services.hairdresser_id 
    AND h.auth_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM hairdressers h 
    WHERE h.id = hairdresser_services.hairdresser_id 
    AND h.auth_id = auth.uid()
  )
);

-- Permettre à tous les utilisateurs authentifiés de voir les services des coiffeurs
CREATE POLICY "Everyone can view hairdresser services relationships" 
ON public.hairdresser_services 
FOR SELECT 
USING (true);