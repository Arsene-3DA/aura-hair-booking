-- Fix the infinite recursion by completely removing problematic admin policy
-- and using the existing security definer function properly

-- Drop the problematic admin policy
DROP POLICY IF EXISTS "Admin full access to profiles" ON public.profiles;

-- Recreate admin policy using the existing get_current_user_role function
CREATE POLICY "Admin full access to profiles" 
ON public.profiles 
FOR ALL 
USING (get_current_user_role() = 'admin')
WITH CHECK (get_current_user_role() = 'admin');

-- Also ensure the get_current_user_role function is properly defined
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role::text FROM public.profiles WHERE user_id = auth.uid() LIMIT 1;
$$;