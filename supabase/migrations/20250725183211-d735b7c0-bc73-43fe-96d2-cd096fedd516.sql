-- D'abord, regardons l'enum existant et ajoutons 'no_show' si nécessaire
ALTER TYPE booking_status ADD VALUE IF NOT EXISTS 'no_show';

-- Créer la vue pour les rapports administrateurs (version corrigée)
CREATE OR REPLACE VIEW v_admin_reports AS
SELECT 
    -- Données de base
    DATE(b.scheduled_at) as report_date,
    b.status,
    b.service,
    
    -- Métriques pour réservations
    COUNT(*) as total_bookings,
    COUNT(CASE WHEN b.status = 'confirmed' THEN 1 END) as confirmed_bookings,
    COUNT(CASE WHEN b.status = 'declined' THEN 1 END) as declined_bookings,
    COUNT(CASE WHEN b.status = 'pending' THEN 1 END) as pending_bookings,
    COUNT(CASE WHEN b.status = 'no_show' THEN 1 END) as no_shows,
    
    -- Métriques pour revenus (en supposant un prix moyen par service)
    COALESCE(SUM(s.price), 0) as total_revenue,
    COALESCE(AVG(s.price), 0) as avg_service_price,
    
    -- Informations sur les coiffeurs
    COUNT(DISTINCT b.stylist_id) as unique_stylists,
    
    -- Informations sur les clients  
    COUNT(DISTINCT b.client_id) as unique_clients,
    
    -- Agrégations temporelles
    EXTRACT(YEAR FROM b.scheduled_at) as year,
    EXTRACT(MONTH FROM b.scheduled_at) as month,
    EXTRACT(WEEK FROM b.scheduled_at) as week,
    EXTRACT(DOW FROM b.scheduled_at) as day_of_week

FROM bookings b
LEFT JOIN services s ON b.service_id = s.id
WHERE b.scheduled_at IS NOT NULL
GROUP BY 
    DATE(b.scheduled_at),
    b.status,
    b.service,
    EXTRACT(YEAR FROM b.scheduled_at),
    EXTRACT(MONTH FROM b.scheduled_at), 
    EXTRACT(WEEK FROM b.scheduled_at),
    EXTRACT(DOW FROM b.scheduled_at)
ORDER BY report_date DESC;