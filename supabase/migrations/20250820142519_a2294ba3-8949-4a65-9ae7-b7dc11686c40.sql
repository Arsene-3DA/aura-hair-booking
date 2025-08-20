-- Corriger définitivement les problèmes de récursion infinie
-- Supprimer toutes les politiques problématiques et les recréer proprement

-- 1. Nettoyer les politiques profiles
DROP POLICY IF EXISTS "Admin full access to profiles" ON public.profiles;
DROP POLICY IF EXISTS "Public can view professional profiles" ON public.profiles;

-- 2. Nettoyer les politiques hairdressers problématiques
DROP POLICY IF EXISTS "Authenticated users can view hairdresser details" ON public.hairdressers;

-- 3. Créer des politiques simples et sans récursion pour profiles
CREATE POLICY "Users can view own profile clean" 
ON public.profiles 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users can update own profile clean" 
ON public.profiles 
FOR UPDATE 
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can create profiles clean" 
ON public.profiles 
FOR INSERT 
WITH CHECK (user_id = auth.uid());

-- 4. Politique admin simple utilisant la fonction existante
CREATE POLICY "Admin access profiles clean" 
ON public.profiles 
FOR ALL 
USING (get_current_user_role() = 'admin')
WITH CHECK (get_current_user_role() = 'admin');

-- 5. Politique publique simple pour les professionnels
CREATE POLICY "Public can view professional profiles clean" 
ON public.profiles 
FOR SELECT 
USING (role IN ('coiffeur', 'coiffeuse', 'cosmetique'));

-- 6. Politique hairdressers simplifiée
CREATE POLICY "Authenticated users view hairdressers clean" 
ON public.hairdressers 
FOR SELECT 
USING (is_active = true);