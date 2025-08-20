-- Supprimer TOUTES les politiques existantes puis les recréer proprement

-- Supprimer toutes les politiques profiles
DROP POLICY IF EXISTS "Users can view own profile clean" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile clean" ON public.profiles;
DROP POLICY IF EXISTS "Users can create profiles clean" ON public.profiles;
DROP POLICY IF EXISTS "Admin access profiles clean" ON public.profiles;
DROP POLICY IF EXISTS "Public can view professional profiles clean" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile simple" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile simple" ON public.profiles;
DROP POLICY IF EXISTS "Users can create profiles simple" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile - no role changes" ON public.profiles;
DROP POLICY IF EXISTS "Users can create profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;

-- Supprimer toutes les politiques hairdressers problématiques
DROP POLICY IF EXISTS "Authenticated users view hairdressers clean" ON public.hairdressers;
DROP POLICY IF EXISTS "Public can view active hairdressers" ON public.hairdressers;
DROP POLICY IF EXISTS "Authenticated users only access to hairdressers" ON public.hairdressers;

-- Recréer les politiques essentielles de façon simple
CREATE POLICY "profile_select_own" 
ON public.profiles 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "profile_update_own" 
ON public.profiles 
FOR UPDATE 
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "profile_insert_own" 
ON public.profiles 
FOR INSERT 
WITH CHECK (user_id = auth.uid());

-- Politique admin sans récursion
CREATE POLICY "profile_admin_all" 
ON public.profiles 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.id = auth.uid() 
    AND auth.users.email = 'admin@tchiix.ca'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.id = auth.uid() 
    AND auth.users.email = 'admin@tchiix.ca'
  )
);

-- Politique publique pour voir les profils professionnels
CREATE POLICY "profile_public_professionals" 
ON public.profiles 
FOR SELECT 
USING (role IN ('coiffeur', 'coiffeuse', 'cosmetique'));

-- Politique hairdressers publique simple
CREATE POLICY "hairdresser_public_active" 
ON public.hairdressers 
FOR SELECT 
USING (is_active = true);