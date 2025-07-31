-- Corriger la contrainte de clé étrangère pour hairdresser_id
-- qui doit référencer public.profiles(id) au lieu de public.hairdressers(id)
ALTER TABLE public.bookings
  DROP CONSTRAINT IF EXISTS bookings_hairdresser_id_fkey,
  ADD CONSTRAINT bookings_hairdresser_id_fkey
      FOREIGN KEY (hairdresser_id)
      REFERENCES public.profiles(id)
      ON DELETE CASCADE;