-- Nettoyer et synchroniser les disponibilités de sharepoint.arsene selon son dashboard
-- Supprimer les anciennes configurations
DELETE FROM public.availabilities 
WHERE stylist_id = '92f3cf72-7b23-441d-8d55-229dfd2d7155' 
  AND start_at::date = '2025-08-22';

-- Ajouter les nouvelles configurations selon le dashboard
-- 09:00-10:30: Bloqué (busy)
INSERT INTO public.availabilities (stylist_id, start_at, end_at, status) VALUES
('92f3cf72-7b23-441d-8d55-229dfd2d7155', '2025-08-22 09:00:00+00', '2025-08-22 11:00:00+00', 'busy');

-- 11:00-12:30: Indisponible (unavailable)  
INSERT INTO public.availabilities (stylist_id, start_at, end_at, status) VALUES
('92f3cf72-7b23-441d-8d55-229dfd2d7155', '2025-08-22 11:00:00+00', '2025-08-22 13:00:00+00', 'unavailable');

-- 13:00-21:30: Disponible (available) - explicitement marqué
INSERT INTO public.availabilities (stylist_id, start_at, end_at, status) VALUES
('92f3cf72-7b23-441d-8d55-229dfd2d7155', '2025-08-22 13:00:00+00', '2025-08-22 21:30:00+00', 'available');