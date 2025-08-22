-- Corriger la fonction pour récupérer les professionnels par rôle
CREATE OR REPLACE FUNCTION public.get_professionals_by_role(role_filter text DEFAULT NULL)
RETURNS TABLE(
    id uuid,
    auth_id uuid,
    name text,
    email text,
    phone text,
    rating numeric,
    location text,
    bio text,
    website text,
    instagram text,
    experience text,
    image_url text,
    gender text,
    is_active boolean,
    working_hours jsonb,
    specialties text[],
    salon_address text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    role text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        h.id,
        h.auth_id,
        h.name,
        CASE 
            WHEN auth.uid() IS NOT NULL THEN h.email
            ELSE NULL
        END as email,
        CASE 
            WHEN auth.uid() IS NOT NULL THEN h.phone
            ELSE NULL
        END as phone,
        h.rating,
        h.location,
        h.bio,
        h.website,
        h.instagram,
        h.experience,
        h.image_url,
        h.gender,
        h.is_active,
        h.working_hours,
        h.specialties,
        h.salon_address,
        h.created_at,
        h.updated_at,
        p.role::text as role
    FROM public.hairdressers h
    INNER JOIN public.profiles p ON h.auth_id = p.user_id
    WHERE h.is_active = true
    AND (role_filter IS NULL OR p.role = role_filter::user_role)
    AND p.role IN ('coiffeur', 'coiffeuse', 'cosmetique')
    ORDER BY h.rating DESC, h.created_at DESC;
END;
$$;