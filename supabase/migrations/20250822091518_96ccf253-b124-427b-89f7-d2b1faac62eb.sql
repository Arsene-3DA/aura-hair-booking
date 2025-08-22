-- Fonction pour forcer la déconnexion d'un utilisateur après changement de rôle
CREATE OR REPLACE FUNCTION public.force_user_session_refresh(target_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Insérer une notification spéciale pour forcer la reconnexion
  INSERT INTO public.notifications (user_id, title, body, created_at)
  VALUES (
    target_user_id,
    'SESSION_REFRESH_REQUIRED',
    'Votre rôle a été modifié. Vous allez être redirigé automatiquement.',
    now()
  );
  
  -- Log de sécurité
  INSERT INTO public.system_logs (event_type, message, metadata, created_at)
  VALUES (
    'force_session_refresh',
    'Session refresh forced after role change',
    jsonb_build_object(
      'target_user_id', target_user_id,
      'forced_by', auth.uid(),
      'ip_address', inet_client_addr()
    ),
    now()
  );
END;
$$;