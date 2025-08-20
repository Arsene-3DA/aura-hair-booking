-- Fix infinite recursion in profiles RLS policies
-- Drop problematic policies first
DROP POLICY IF EXISTS "Public can view professional info only" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins manage all profiles" ON public.profiles;

-- Create simple, non-recursive policies
CREATE POLICY "Users can view own profile simple" 
ON public.profiles 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users can update own profile simple" 
ON public.profiles 
FOR UPDATE 
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can create profiles simple" 
ON public.profiles 
FOR INSERT 
WITH CHECK (user_id = auth.uid());

-- Allow public access to professional profiles (no recursion)
CREATE POLICY "Public can view professional profiles" 
ON public.profiles 
FOR SELECT 
USING (
  role IN ('coiffeur', 'coiffeuse', 'cosmetique') 
  AND EXISTS (
    SELECT 1 FROM public.hairdressers h 
    WHERE h.auth_id = profiles.user_id 
    AND h.is_active = true
  )
);

-- Simple admin policy using direct auth check
CREATE POLICY "Admin full access to profiles" 
ON public.profiles 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles admin_profile 
    WHERE admin_profile.user_id = auth.uid() 
    AND admin_profile.role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles admin_profile 
    WHERE admin_profile.user_id = auth.uid() 
    AND admin_profile.role = 'admin'
  )
);