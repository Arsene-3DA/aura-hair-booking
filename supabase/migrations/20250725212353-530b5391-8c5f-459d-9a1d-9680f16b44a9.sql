-- Créer une fonction pour définir un super administrateur
CREATE OR REPLACE FUNCTION public.set_super_admin(user_email text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_user_id uuid;
BEGIN
  -- Trouver l'utilisateur par email
  SELECT id INTO v_user_id FROM auth.users WHERE email = user_email LIMIT 1;
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Utilisateur % introuvable', user_email;
  END IF;

  -- Mettre à jour le profil comme admin
  UPDATE public.profiles 
  SET role = 'admin', 
      full_name = COALESCE(full_name, user_email),
      updated_at = now()
  WHERE user_id = v_user_id;
  
  -- Créer le profil s'il n'existe pas
  INSERT INTO public.profiles (user_id, role, full_name, created_at, updated_at)
  VALUES (v_user_id, 'admin', user_email, now(), now())
  ON CONFLICT (user_id) DO UPDATE SET 
    role = 'admin',
    updated_at = now();

  -- Log de l'action
  INSERT INTO public.system_logs (event_type, message, metadata, created_at)
  VALUES (
    'super_admin_promotion',
    'Super administrateur défini: ' || user_email,
    jsonb_build_object(
      'user_email', user_email,
      'user_id', v_user_id,
      'promoted_at', now()
    ),
    now()
  );
END;
$function$;

-- Définir djine.arsene@gmail.com comme super administrateur
SELECT public.set_super_admin('djine.arsene@gmail.com');

-- Vérifier que l'utilisateur a bien le rôle admin
SELECT 
  p.full_name,
  p.role,
  u.email,
  u.created_at as compte_cree_le,
  p.updated_at as profil_mis_a_jour
FROM profiles p
JOIN auth.users u ON p.user_id = u.id
WHERE u.email = 'djine.arsene@gmail.com';