-- Nettoyer les données incohérentes avant d'appliquer la nouvelle contrainte
-- Supprimer les bookings avec hairdresser_id qui n'existe pas dans profiles
DELETE FROM public.bookings 
WHERE hairdresser_id NOT IN (
  SELECT id FROM public.profiles WHERE id IS NOT NULL
);

-- Maintenant appliquer la nouvelle contrainte
ALTER TABLE public.bookings
  DROP CONSTRAINT IF EXISTS bookings_hairdresser_id_fkey,
  ADD CONSTRAINT bookings_hairdresser_id_fkey
      FOREIGN KEY (hairdresser_id)
      REFERENCES public.profiles(id)
      ON DELETE CASCADE;