-- Add moderation field to reviews table
ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS is_approved boolean DEFAULT false;
ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS booking_id uuid REFERENCES public.bookings(id);

-- Update RLS policies to include moderation
DROP POLICY IF EXISTS "stylist_read_reviews" ON public.reviews;
CREATE POLICY "stylist_read_approved_reviews" ON public.reviews 
FOR SELECT 
USING (stylist_id = auth.uid() AND is_approved = true);

-- Allow admins to manage reviews (approve/reject)
CREATE POLICY "admin_manage_reviews" ON public.reviews 
FOR ALL 
USING (get_current_user_role() = 'admin');

-- Create function to update hairdresser average rating
CREATE OR REPLACE FUNCTION public.update_hairdresser_rating()
RETURNS trigger AS $$
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
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update ratings
DROP TRIGGER IF EXISTS update_hairdresser_rating_trigger ON public.reviews;
CREATE TRIGGER update_hairdresser_rating_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.update_hairdresser_rating();

-- Create function to notify client after completed booking
CREATE OR REPLACE FUNCTION public.notify_review_request()
RETURNS trigger AS $$
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
$$ LANGUAGE plpgsql;

-- Create trigger for review notifications
DROP TRIGGER IF EXISTS notify_review_request_trigger ON public.bookings;
CREATE TRIGGER notify_review_request_trigger
  AFTER UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.notify_review_request();