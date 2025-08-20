-- Mise à jour des politiques RLS pour permettre l'affichage des professionnels sans compte utilisateur
-- et ajustement de la fonction publique

-- Mettre à jour la fonction pour inclure les professionnels même sans compte utilisateur
CREATE OR REPLACE FUNCTION public.get_public_hairdresser_data()
RETURNS TABLE(
  id uuid,
  name text,
  specialties text[],
  rating numeric,
  salon_address text,
  location text,
  bio text,
  website text,
  instagram text,
  experience text,
  working_hours jsonb,
  image_url text,
  gender text,
  is_active boolean,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  auth_id uuid
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    h.id,
    h.name,
    h.specialties,
    h.rating,
    h.salon_address,
    h.location,
    h.bio,
    h.website,
    h.instagram,
    h.experience,
    h.working_hours,
    h.image_url,
    h.gender,
    h.is_active,
    h.created_at,
    h.updated_at,
    h.auth_id
  FROM public.hairdressers h
  LEFT JOIN public.profiles p ON h.auth_id = p.user_id
  WHERE h.is_active = true
  AND (
    -- Professionnels avec compte et rôle professionnel
    (p.role IN ('coiffeur', 'coiffeuse', 'cosmetique'))
    OR 
    -- Professionnels sans compte utilisateur mais ajoutés manuellement
    (h.auth_id IS NULL OR p.role IS NULL)
  );
END;
$$;

-- Ajouter une politique RLS pour permettre l'affichage public des professionnels
DROP POLICY IF EXISTS "Public can view active hairdressers" ON public.hairdressers;

CREATE POLICY "Public can view active hairdressers" 
ON public.hairdressers 
FOR SELECT 
USING (
  is_active = true AND (
    -- Professionnels avec compte professionnel
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.user_id = hairdressers.auth_id 
      AND p.role IN ('coiffeur', 'coiffeuse', 'cosmetique')
    )
    OR 
    -- Professionnels sans compte (ajoutés manuellement)
    auth_id IS NULL
    OR
    -- Professionnels avec auth_id mais sans profil (en attente de création de compte)
    NOT EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.user_id = hairdressers.auth_id
    )
  )
);

-- Log de la mise à jour
INSERT INTO public.system_logs (event_type, message, metadata, created_at)
VALUES (
  'policy_update',
  'Mise à jour des politiques pour afficher les professionnels sans compte',
  jsonb_build_object(
    'action', 'allow_professionals_without_accounts',
    'timestamp', extract(epoch from now())
  ),
  now()
);