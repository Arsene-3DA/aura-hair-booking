-- Ajouter une politique RLS pour permettre aux utilisateurs connectés de voir tous les professionnels
CREATE POLICY "Authenticated users can view all active hairdressers" 
ON public.hairdressers 
FOR SELECT 
TO authenticated
USING (is_active = true);