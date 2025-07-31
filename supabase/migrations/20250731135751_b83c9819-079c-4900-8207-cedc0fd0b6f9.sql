-- Nettoyage final des données orphelines dans bookings

-- 1) Supprimer les bookings avec un hairdresser_id inexistant dans profiles
DELETE FROM public.bookings
WHERE hairdresser_id NOT IN (SELECT id FROM public.profiles);

-- 2) Mettre service_id à NULL si le service n'existe plus
UPDATE public.bookings
SET service_id = NULL
WHERE service_id IS NOT NULL
  AND service_id NOT IN (SELECT id FROM public.services);