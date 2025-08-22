-- Solution directe : Supprimer TOUTES les données de démonstration immédiatement
DO $$
DECLARE
  demo_emails text[] := ARRAY['admin@salon.com', 'marie@salon.com', 'pierre@salon.com', 'client@email.com'];
  demo_email text;
  user_auth_id uuid;
  user_id_val uuid;
BEGIN
  -- Log de début de nettoyage
  INSERT INTO public.system_logs (event_type, message, created_at)
  VALUES ('demo_cleanup_start', 'Début du nettoyage forcé des données de démonstration', now());

  -- Pour chaque email de démonstration
  FOREACH demo_email IN ARRAY demo_emails
  LOOP
    -- Trouver les IDs dans la table users
    FOR user_auth_id, user_id_val IN
      SELECT auth_id, id FROM public.users WHERE email = demo_email
    LOOP
      -- Supprimer TOUTES les données liées en cascade
      DELETE FROM public.reviews WHERE client_id = user_auth_id OR stylist_id = user_auth_id OR professional_id = user_auth_id;
      DELETE FROM public.new_reservations WHERE client_user_id = user_auth_id OR stylist_user_id = user_auth_id;
      DELETE FROM public.bookings WHERE client_auth_id = user_auth_id OR stylist_id = user_auth_id OR client_id = user_auth_id;
      DELETE FROM public.hairdressers WHERE auth_id = user_auth_id OR email = demo_email;
      DELETE FROM public.portfolio WHERE stylist_id = user_auth_id;
      DELETE FROM public.notifications WHERE user_id = user_auth_id;
      DELETE FROM public.messages WHERE sender_id = user_auth_id OR receiver_id = user_auth_id;
      DELETE FROM public.contact_requests WHERE client_id = user_auth_id;
      DELETE FROM public.professional_clients WHERE professional_id = user_auth_id OR client_id = user_auth_id;
      DELETE FROM public.client_notes WHERE stylist_id = user_auth_id OR client_id = user_auth_id;
      DELETE FROM public.availabilities WHERE stylist_id = user_auth_id;
      DELETE FROM public.reservations WHERE client_id = user_id_val OR coiffeur_id = user_id_val;
      DELETE FROM public.webpush_subscriptions WHERE user_id = user_auth_id;
      
      -- Supprimer de profiles et users
      DELETE FROM public.profiles WHERE user_id = user_auth_id;
      DELETE FROM public.users WHERE id = user_id_val OR auth_id = user_auth_id OR email = demo_email;
      
      -- Log de suppression
      INSERT INTO public.system_logs (event_type, message, metadata, created_at)
      VALUES (
        'demo_user_deleted',
        'Utilisateur de démonstration supprimé: ' || demo_email,
        jsonb_build_object('email', demo_email, 'auth_id', user_auth_id, 'user_id', user_id_val),
        now()
      );
    END LOOP;
  END LOOP;

  -- Supprimer aussi tous les comptes marqués is_test = true
  FOR user_auth_id, user_id_val IN
    SELECT auth_id, id FROM public.users WHERE is_test = true
  LOOP
    -- Supprimer TOUTES les données liées
    DELETE FROM public.reviews WHERE client_id = user_auth_id OR stylist_id = user_auth_id OR professional_id = user_auth_id;
    DELETE FROM public.new_reservations WHERE client_user_id = user_auth_id OR stylist_user_id = user_auth_id;
    DELETE FROM public.bookings WHERE client_auth_id = user_auth_id OR stylist_id = user_auth_id OR client_id = user_auth_id;
    DELETE FROM public.hairdressers WHERE auth_id = user_auth_id;
    DELETE FROM public.portfolio WHERE stylist_id = user_auth_id;
    DELETE FROM public.notifications WHERE user_id = user_auth_id;
    DELETE FROM public.messages WHERE sender_id = user_auth_id OR receiver_id = user_auth_id;
    DELETE FROM public.contact_requests WHERE client_id = user_auth_id;
    DELETE FROM public.professional_clients WHERE professional_id = user_auth_id OR client_id = user_auth_id;
    DELETE FROM public.client_notes WHERE stylist_id = user_auth_id OR client_id = user_auth_id;
    DELETE FROM public.availabilities WHERE stylist_id = user_auth_id;
    DELETE FROM public.reservations WHERE client_id = user_id_val OR coiffeur_id = user_id_val;
    DELETE FROM public.webpush_subscriptions WHERE user_id = user_auth_id;
    
    -- Supprimer de profiles et users
    DELETE FROM public.profiles WHERE user_id = user_auth_id;
    DELETE FROM public.users WHERE id = user_id_val;
    
    -- Log
    INSERT INTO public.system_logs (event_type, message, metadata, created_at)
    VALUES ('test_user_deleted', 'Compte test supprimé', jsonb_build_object('auth_id', user_auth_id), now());
  END LOOP;

  -- Log de fin
  INSERT INTO public.system_logs (event_type, message, created_at)
  VALUES ('demo_cleanup_complete', 'Nettoyage forcé des données de démonstration terminé', now());

END $$;