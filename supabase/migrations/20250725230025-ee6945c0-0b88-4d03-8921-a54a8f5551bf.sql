-- Vérifier et compléter le schéma reviews
ALTER TABLE public.reviews DROP CONSTRAINT IF EXISTS reviews_booking_id_key;
ALTER TABLE public.reviews ADD CONSTRAINT reviews_booking_id_unique UNIQUE (booking_id);

-- Vérifier que la table notifications a la bonne structure
ALTER TABLE public.notifications 
  ALTER COLUMN title SET NOT NULL,
  ALTER COLUMN body SET NOT NULL;

-- Ajouter une policy pour que les stylistes voient leurs reviews
DROP POLICY IF EXISTS "stylist sees own reviews" ON public.reviews;
CREATE POLICY "stylist sees own reviews" 
ON public.reviews FOR SELECT
USING (stylist_id = auth.uid());

-- Policy pour les admins sur reviews
DROP POLICY IF EXISTS "admin manages reviews" ON public.reviews;
CREATE POLICY "admin manages reviews" 
ON public.reviews FOR ALL
USING (get_current_user_role() = 'admin');