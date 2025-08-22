-- Tester avec une date future pour voir la vraie logique
-- Nettoyer et ajouter les configurations pour demain (23 août 2025)
DELETE FROM public.availabilities 
WHERE stylist_id = '92f3cf72-7b23-441d-8d55-229dfd2d7155' 
  AND start_at::date = '2025-08-23';

-- Reproduire exactement le dashboard du professionnel pour le 23 août
-- 09:00-11:00: Bloqué (busy)
INSERT INTO public.availabilities (stylist_id, start_at, end_at, status) VALUES
('92f3cf72-7b23-441d-8d55-229dfd2d7155', '2025-08-23 09:00:00+00', '2025-08-23 11:00:00+00', 'busy');

-- 11:00-13:00: Indisponible (unavailable)  
INSERT INTO public.availabilities (stylist_id, start_at, end_at, status) VALUES
('92f3cf72-7b23-441d-8d55-229dfd2d7155', '2025-08-23 11:00:00+00', '2025-08-23 13:00:00+00', 'unavailable');

-- 13:00-21:30: Disponible (available)
INSERT INTO public.availabilities (stylist_id, start_at, end_at, status) VALUES
('92f3cf72-7b23-441d-8d55-229dfd2d7155', '2025-08-23 13:00:00+00', '2025-08-23 21:30:00+00', 'available');