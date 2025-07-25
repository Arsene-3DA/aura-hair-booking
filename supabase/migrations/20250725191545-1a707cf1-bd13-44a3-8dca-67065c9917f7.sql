-- Fix security issues by adding SET search_path to functions
CREATE OR REPLACE FUNCTION public.update_hairdresser_rating()
RETURNS trigger 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  UPDATE public.hairdressers 
  SET rating = (
    SELECT COALESCE(AVG(rating::numeric), 0.0)
    FROM public.reviews 
    WHERE stylist_id = COALESCE(NEW.stylist_id, OLD.stylist_id) 
    AND is_approved = true
  )
  WHERE auth_id = COALESCE(NEW.stylist_id, OLD.stylist_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE OR REPLACE FUNCTION public.notify_review_request()
RETURNS trigger 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Only trigger when booking status changes to completed
  IF OLD.status != 'completed' AND NEW.status = 'completed' THEN
    INSERT INTO public.notifications (user_id, title, body)
    VALUES (
      NEW.client_id,
      'Évaluez votre prestation',
      'Votre rendez-vous est terminé. Partagez votre expérience en laissant une note et un commentaire.'
    );
  END IF;
  
  RETURN NEW;
END;
$$;