-- Désactiver temporairement RLS pour diagnostiquer
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- Vérifier que l'utilisateur a bien un profil
SELECT user_id, role, full_name FROM public.profiles WHERE user_id = '92f3cf72-7b23-441d-8d55-229dfd2d7155';

-- Réactiver RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Supprimer toutes les anciennes politiques problématiques
DROP POLICY IF EXISTS "Users can read their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
DROP POLICY IF EXISTS "profile_admin_all" ON public.profiles;
DROP POLICY IF EXISTS "profile_insert_own" ON public.profiles;
DROP POLICY IF EXISTS "profile_select_own" ON public.profiles;
DROP POLICY IF EXISTS "profile_update_own" ON public.profiles;
DROP POLICY IF EXISTS "Public can view professional profiles" ON public.profiles;

-- Créer des politiques RLS simples et fonctionnelles
CREATE POLICY "allow_authenticated_users_to_select_own_profile" 
ON public.profiles FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

CREATE POLICY "allow_authenticated_users_to_update_own_profile" 
ON public.profiles FOR UPDATE 
TO authenticated 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "allow_authenticated_users_to_insert_own_profile" 
ON public.profiles FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);