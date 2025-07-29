-- Améliorer la fonction de changement de rôle pour être plus sécurisée
CREATE OR REPLACE FUNCTION public.change_user_role(target_user_id uuid, new_role text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  calling_user_role text;
  target_user_data jsonb;
  result jsonb;
BEGIN
  -- Vérifier que l'utilisateur appelant est admin
  SELECT get_current_user_role() INTO calling_user_role;
  IF calling_user_role != 'admin' THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Seuls les administrateurs peuvent modifier les rôles'
    );
  END IF;

  -- Valider le nouveau rôle
  IF new_role NOT IN ('client', 'coiffeur', 'admin') THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Rôle invalide: ' || new_role
    );
  END IF;

  -- Vérifier que l'utilisateur cible existe
  SELECT jsonb_build_object(
    'id', id,
    'user_id', user_id,
    'full_name', full_name,
    'current_role', role
  ) INTO target_user_data
  FROM public.profiles 
  WHERE user_id = target_user_id;
  
  IF target_user_data IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Utilisateur non trouvé'
    );
  END IF;

  -- Empêcher l'auto-modification
  IF target_user_id = auth.uid() THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Impossible de modifier son propre rôle'
    );
  END IF;

  -- Mettre à jour le rôle
  UPDATE public.profiles 
  SET role = new_role::user_role,
      updated_at = now()
  WHERE user_id = target_user_id;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Échec de la mise à jour'
    );
  END IF;

  -- Log de sécurité
  INSERT INTO public.system_logs (event_type, message, metadata, created_at)
  VALUES (
    'role_change',
    'Changement de rôle utilisateur',
    jsonb_build_object(
      'target_user_id', target_user_id,
      'target_user_name', target_user_data->>'full_name',
      'old_role', target_user_data->>'current_role',
      'new_role', new_role,
      'changed_by', auth.uid(),
      'ip_address', inet_client_addr()
    ),
    now()
  );

  -- Déclencher une notification pour l'utilisateur cible
  INSERT INTO public.notifications (user_id, title, body, created_at)
  VALUES (
    target_user_id,
    'Changement de rôle',
    'Votre rôle a été modifié en ' || new_role || '. Reconnectez-vous pour voir les changements.',
    now()
  )
  ON CONFLICT DO NOTHING;

  RETURN jsonb_build_object(
    'success', true,
    'message', 'Rôle modifié avec succès',
    'old_role', target_user_data->>'current_role',
    'new_role', new_role
  );
END;
$function$;

-- Fonction pour forcer la déconnexion d'un utilisateur (optionnel)
CREATE OR REPLACE FUNCTION public.force_user_logout(target_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Vérifier que l'utilisateur appelant est admin
  IF get_current_user_role() != 'admin' THEN
    RAISE EXCEPTION 'Seuls les administrateurs peuvent forcer la déconnexion';
  END IF;

  -- Log de sécurité
  INSERT INTO public.system_logs (event_type, message, metadata, created_at)
  VALUES (
    'force_logout',
    'Déconnexion forcée',
    jsonb_build_object(
      'target_user_id', target_user_id,
      'forced_by', auth.uid(),
      'ip_address', inet_client_addr()
    ),
    now()
  );
END;
$function$;