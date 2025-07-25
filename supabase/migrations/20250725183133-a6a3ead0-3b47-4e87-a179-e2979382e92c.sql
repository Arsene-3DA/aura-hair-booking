-- Créer la vue pour les rapports administrateurs
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

-- Accorder les permissions de lecture sur la vue aux admins
GRANT SELECT ON v_admin_reports TO authenticated;

-- Créer une policy RLS pour la vue (même si les vues héritent des policies des tables sous-jacentes)
-- On s'assure que seuls les admins peuvent accéder aux rapports
CREATE POLICY "Admin only access to reports view" ON v_admin_reports
FOR SELECT USING (get_current_user_role() = 'admin');