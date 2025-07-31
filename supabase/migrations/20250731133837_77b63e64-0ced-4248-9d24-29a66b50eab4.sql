-- Rendre service_id optionnel dans public.bookings
ALTER TABLE public.bookings
  ALTER COLUMN service_id DROP NOT NULL;

-- Mettre à jour la contrainte de clé étrangère avec ON DELETE SET NULL
ALTER TABLE public.bookings
  DROP CONSTRAINT IF EXISTS bookings_service_id_fkey,
  ADD CONSTRAINT bookings_service_id_fkey
      FOREIGN KEY (service_id)
      REFERENCES public.services(id)
      ON DELETE SET NULL;