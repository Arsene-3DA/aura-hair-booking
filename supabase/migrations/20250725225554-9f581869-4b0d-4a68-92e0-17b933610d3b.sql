-- Créer une fonction pour déclencher automatiquement une demande d'avis après un booking terminé
CREATE OR REPLACE FUNCTION public.trigger_review_notification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $func$
BEGIN
  -- Déclencher seulement quand le statut passe à 'completed'
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    -- Insérer une notification pour demander un avis
    INSERT INTO public.notifications (user_id, title, body, created_at)
    VALUES (
      NEW.client_id,
      'Évaluez votre prestation',
      'Votre rendez-vous est terminé. Partagez votre expérience en laissant une note et un commentaire.',
      now()
    )
    ON CONFLICT DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$func$;

-- Créer le trigger sur la table bookings
DROP TRIGGER IF EXISTS on_booking_completed ON public.bookings;

CREATE TRIGGER on_booking_completed
AFTER UPDATE ON public.bookings
FOR EACH ROW
EXECUTE FUNCTION public.trigger_review_notification();

-- Mettre à jour automatiquement la note des stylistes quand un avis est approuvé
CREATE OR REPLACE FUNCTION public.update_stylist_rating()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $func$
DECLARE
  avg_rating numeric;
BEGIN
  -- Calculer la nouvelle note moyenne pour le styliste
  SELECT COALESCE(AVG(rating::numeric), 0.0) INTO avg_rating
  FROM public.reviews 
  WHERE stylist_id = COALESCE(NEW.stylist_id, OLD.stylist_id) 
  AND is_approved = true;
  
  -- Mettre à jour la note dans la table hairdressers
  UPDATE public.hairdressers 
  SET rating = avg_rating,
      updated_at = now()
  WHERE auth_id = COALESCE(NEW.stylist_id, OLD.stylist_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$func$;

-- Créer le trigger pour mettre à jour automatiquement les notes
DROP TRIGGER IF EXISTS on_review_approved ON public.reviews;

CREATE TRIGGER on_review_approved
AFTER INSERT OR UPDATE OR DELETE ON public.reviews
FOR EACH ROW
EXECUTE FUNCTION public.update_stylist_rating();