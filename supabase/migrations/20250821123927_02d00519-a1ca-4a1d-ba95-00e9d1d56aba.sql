-- CRITICAL SECURITY FIX: Protect customer personal data in users table

-- 1. Remove dangerous public read policies that expose sensitive customer data
DROP POLICY IF EXISTS "Public can view professional users data" ON public.users;
DROP POLICY IF EXISTS "Everyone can view professional users" ON public.users;
DROP POLICY IF EXISTS "Public read access to professional users" ON public.users;

-- 2. Create secure policies that protect customer data
-- Users can only view their own data
CREATE POLICY "Users can view own data only" 
ON public.users 
FOR SELECT 
USING (auth_id = auth.uid());

-- Users can update their own data
CREATE POLICY "Users can update own data only" 
ON public.users 
FOR UPDATE 
USING (auth_id = auth.uid())
WITH CHECK (auth_id = auth.uid());

-- Admin access for user management (existing policy should remain)
-- "Les admins peuvent voir tous les utilisateurs" - keep this
-- "Les admins peuvent modifier tous les utilisateurs" - keep this

-- 3. Create a secure public view for professional directory (business use only)
-- This shows only business-relevant information, not personal contact details
CREATE OR REPLACE VIEW public.professionals_directory AS
SELECT 
    u.id,
    u.auth_id,
    u.role,
    u.status,
    p.full_name,
    p.avatar_url,
    u.created_at
    -- Explicitly exclude email, telephone, nom, prenom
FROM public.users u
LEFT JOIN public.profiles p ON u.auth_id = p.user_id
WHERE u.role IN ('coiffeur', 'coiffeuse', 'cosmetique') 
    AND u.status = 'actif';

-- 4. Create a function for safe professional lookup (for booking purposes)
CREATE OR REPLACE FUNCTION public.get_professionals_for_booking()
RETURNS TABLE(
    id uuid,
    auth_id uuid,
    full_name text,
    avatar_url text,
    role user_role,
    status user_status
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id,
    u.auth_id,
    p.full_name,
    p.avatar_url,
    u.role,
    u.status
  FROM public.users u
  LEFT JOIN public.profiles p ON u.auth_id = p.user_id
  WHERE u.role IN ('coiffeur', 'coiffeuse', 'cosmetique') 
      AND u.status = 'actif'
      AND NOT COALESCE(u.is_test, false);
END;
$$;

-- 5. Log this critical security improvement
INSERT INTO public.system_logs (event_type, message, metadata, created_at)
VALUES (
    'critical_security_fix',
    'Customer personal data access restricted in users table',
    jsonb_build_object(
        'action', 'restrict_users_table_access',
        'affected_table', 'users',
        'security_level', 'critical_improvement',
        'data_protected', 'customer_personal_information'
    ),
    NOW()
);