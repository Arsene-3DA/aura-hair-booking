-- Fonction pour supprimer tous les utilisateurs de démonstration
CREATE OR REPLACE FUNCTION public.cleanup_demo_users()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  demo_emails text[] := ARRAY['admin@salon.com', 'marie@salon.com', 'pierre@salon.com', 'client@email.com'];
  deleted_count integer := 0;
  auth_user_id uuid;
  demo_email text;
BEGIN
  -- Vérifier que seul un admin peut exécuter cette fonction
  IF get_current_user_role() != 'admin' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Seuls les administrateurs peuvent supprimer les données de démonstration');
  END IF;

  -- Pour chaque email de démonstration
  FOREACH demo_email IN ARRAY demo_emails
  LOOP
    -- Trouver l'ID auth de l'utilisateur
    SELECT id INTO auth_user_id 
    FROM auth.users 
    WHERE email = demo_email;
    
    IF auth_user_id IS NOT NULL THEN
      -- Supprimer de toutes les tables liées d'abord
      DELETE FROM public.reviews WHERE client_id = auth_user_id OR stylist_id = auth_user_id;
      DELETE FROM public.new_reservations WHERE client_user_id = auth_user_id OR stylist_user_id = auth_user_id;
      DELETE FROM public.bookings WHERE client_auth_id = auth_user_id OR stylist_id = auth_user_id;
      DELETE FROM public.hairdressers WHERE auth_id = auth_user_id;
      DELETE FROM public.portfolio WHERE stylist_id = auth_user_id;
      DELETE FROM public.notifications WHERE user_id = auth_user_id;
      DELETE FROM public.messages WHERE sender_id = auth_user_id OR receiver_id = auth_user_id;
      DELETE FROM public.contact_requests WHERE client_id = auth_user_id;
      DELETE FROM public.professional_clients WHERE professional_id = auth_user_id OR client_id = auth_user_id;
      DELETE FROM public.profiles WHERE user_id = auth_user_id;
      DELETE FROM public.users WHERE auth_id = auth_user_id;
      
      -- Log de l'action
      INSERT INTO public.system_logs (event_type, message, metadata, created_at)
      VALUES (
        'demo_user_cleanup',
        'Utilisateur de démonstration supprimé: ' || demo_email,
        jsonb_build_object(
          'deleted_user_email', demo_email,
          'deleted_user_id', auth_user_id,
          'deleted_by', auth.uid()
        ),
        now()
      );
      
      deleted_count := deleted_count + 1;
    END IF;
  END LOOP;

  RETURN jsonb_build_object(
    'success', true,
    'message', 'Nettoyage terminé',
    'deleted_count', deleted_count
  );
END;
$$;