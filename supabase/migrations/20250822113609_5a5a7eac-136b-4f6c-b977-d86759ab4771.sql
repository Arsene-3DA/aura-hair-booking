-- Fonction améliorée pour nettoyer tous les comptes de démonstration
CREATE OR REPLACE FUNCTION public.cleanup_all_demo_data()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  demo_emails text[] := ARRAY['admin@salon.com', 'marie@salon.com', 'pierre@salon.com', 'client@email.com'];
  deleted_count integer := 0;
  demo_email text;
  user_record RECORD;
BEGIN
  -- Vérifier que seul un admin peut exécuter cette fonction
  IF get_current_user_role() != 'admin' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Seuls les administrateurs peuvent supprimer les données de démonstration');
  END IF;

  -- Nettoyer d'abord par email (comptes de démonstration connus)
  FOREACH demo_email IN ARRAY demo_emails
  LOOP
    -- Supprimer de toutes les tables liées
    FOR user_record IN 
      SELECT auth_id, id FROM public.users WHERE email = demo_email
    LOOP
      -- Supprimer les données liées
      DELETE FROM public.reviews WHERE client_id = user_record.auth_id OR stylist_id = user_record.auth_id OR professional_id = user_record.auth_id;
      DELETE FROM public.new_reservations WHERE client_user_id = user_record.auth_id OR stylist_user_id = user_record.auth_id;
      DELETE FROM public.bookings WHERE client_auth_id = user_record.auth_id OR stylist_id = user_record.auth_id;
      DELETE FROM public.hairdressers WHERE auth_id = user_record.auth_id;
      DELETE FROM public.portfolio WHERE stylist_id = user_record.auth_id;
      DELETE FROM public.notifications WHERE user_id = user_record.auth_id;
      DELETE FROM public.messages WHERE sender_id = user_record.auth_id OR receiver_id = user_record.auth_id;
      DELETE FROM public.contact_requests WHERE client_id = user_record.auth_id;
      DELETE FROM public.professional_clients WHERE professional_id = user_record.auth_id OR client_id = user_record.auth_id;
      DELETE FROM public.profiles WHERE user_id = user_record.auth_id;
      DELETE FROM public.users WHERE id = user_record.id;
      
      deleted_count := deleted_count + 1;
      
      -- Log de l'action
      INSERT INTO public.system_logs (event_type, message, metadata, created_at)
      VALUES (
        'demo_user_cleanup',
        'Utilisateur de démonstration supprimé: ' || demo_email,
        jsonb_build_object(
          'deleted_user_email', demo_email,
          'deleted_user_id', user_record.auth_id,
          'deleted_by', auth.uid()
        ),
        now()
      );
    END LOOP;
  END LOOP;

  -- Nettoyer aussi tous les comptes marqués comme test
  FOR user_record IN 
    SELECT auth_id, id, email FROM public.users WHERE is_test = true
  LOOP
    -- Supprimer les données liées
    DELETE FROM public.reviews WHERE client_id = user_record.auth_id OR stylist_id = user_record.auth_id OR professional_id = user_record.auth_id;
    DELETE FROM public.new_reservations WHERE client_user_id = user_record.auth_id OR stylist_user_id = user_record.auth_id;
    DELETE FROM public.bookings WHERE client_auth_id = user_record.auth_id OR stylist_id = user_record.auth_id;
    DELETE FROM public.hairdressers WHERE auth_id = user_record.auth_id;
    DELETE FROM public.portfolio WHERE stylist_id = user_record.auth_id;
    DELETE FROM public.notifications WHERE user_id = user_record.auth_id;
    DELETE FROM public.messages WHERE sender_id = user_record.auth_id OR receiver_id = user_record.auth_id;
    DELETE FROM public.contact_requests WHERE client_id = user_record.auth_id;
    DELETE FROM public.professional_clients WHERE professional_id = user_record.auth_id OR client_id = user_record.auth_id;
    DELETE FROM public.profiles WHERE user_id = user_record.auth_id;
    DELETE FROM public.users WHERE id = user_record.id;
    
    deleted_count := deleted_count + 1;
    
    -- Log de l'action
    INSERT INTO public.system_logs (event_type, message, metadata, created_at)
    VALUES (
      'test_user_cleanup',
      'Compte de test supprimé: ' || user_record.email,
      jsonb_build_object(
        'deleted_user_email', user_record.email,
        'deleted_user_id', user_record.auth_id,
        'deleted_by', auth.uid()
      ),
      now()
    );
  END LOOP;

  RETURN jsonb_build_object(
    'success', true,
    'message', 'Nettoyage terminé',
    'deleted_count', deleted_count
  );
END;
$$;