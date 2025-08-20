-- Corriger les politiques RLS sur la table profiles
-- D'abord, supprimer les anciennes policies problématiques
DROP POLICY IF EXISTS "Users can read their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

-- Créer des policies correctes et plus simples
CREATE POLICY "profiles_select_own" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "profiles_update_own" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "profiles_insert_own" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- S'assurer qu'il y a un profil pour cet utilisateur
INSERT INTO public.profiles (user_id, role, full_name)
VALUES ('92f3cf72-7b23-441d-8d55-229dfd2d7155', 'coiffeur', 'Dissi Djine Duplex Arsene')
ON CONFLICT (user_id) DO UPDATE SET 
  role = EXCLUDED.role,
  full_name = EXCLUDED.full_name,
  updated_at = now();