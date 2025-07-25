-- Create materialized view for stylists with aggregated rating and stats
CREATE MATERIALIZED VIEW stylists_with_rating AS
SELECT 
  h.id,
  h.name,
  h.email,
  h.phone,
  h.location,
  h.specialties,
  h.experience,
  h.image_url,
  h.is_active,
  h.created_at,
  h.updated_at,
  COALESCE(h.rating, 0) as base_rating,
  COALESCE(rating_stats.avg_rating, h.rating, 0) as computed_rating,
  COALESCE(rating_stats.review_count, 0) as review_count,
  COALESCE(booking_stats.total_bookings, 0) as total_bookings,
  COALESCE(booking_stats.completed_bookings, 0) as completed_bookings,
  COALESCE(booking_stats.this_month_bookings, 0) as this_month_bookings
FROM hairdressers h
LEFT JOIN (
  -- Future: when you add a reviews table
  -- SELECT 
  --   hairdresser_id,
  --   AVG(rating) as avg_rating,
  --   COUNT(*) as review_count
  -- FROM reviews 
  -- GROUP BY hairdresser_id
  SELECT 
    h2.id as hairdresser_id,
    h2.rating as avg_rating,
    0 as review_count
  FROM hairdressers h2
) rating_stats ON h.id = rating_stats.hairdresser_id
LEFT JOIN (
  SELECT 
    b.hairdresser_id,
    COUNT(*) as total_bookings,
    COUNT(*) FILTER (WHERE b.status = 'terminé') as completed_bookings,
    COUNT(*) FILTER (WHERE b.created_at >= date_trunc('month', CURRENT_DATE)) as this_month_bookings
  FROM bookings b
  GROUP BY b.hairdresser_id
) booking_stats ON h.id = booking_stats.hairdresser_id
WHERE h.is_active = true
ORDER BY computed_rating DESC, review_count DESC, total_bookings DESC;

-- Create unique index for faster queries
CREATE UNIQUE INDEX idx_stylists_with_rating_id ON stylists_with_rating (id);

-- Create additional indexes for common queries
CREATE INDEX idx_stylists_with_rating_location ON stylists_with_rating (location);
CREATE INDEX idx_stylists_with_rating_specialties ON stylists_with_rating USING GIN (specialties);
CREATE INDEX idx_stylists_with_rating_computed ON stylists_with_rating (computed_rating DESC, review_count DESC);

-- Function to refresh the materialized view
CREATE OR REPLACE FUNCTION refresh_stylists_rating()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY stylists_with_rating;
  
  -- Log the refresh
  INSERT INTO public.system_logs (event_type, message, created_at)
  VALUES ('materialized_view_refresh', 'stylists_with_rating refreshed', NOW())
  ON CONFLICT DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create system_logs table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.system_logs (
  id SERIAL PRIMARY KEY,
  event_type TEXT NOT NULL,
  message TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create triggers to auto-refresh the view when relevant data changes
CREATE OR REPLACE FUNCTION trigger_refresh_stylists_rating()
RETURNS trigger AS $$
BEGIN
  -- Use pg_notify to trigger async refresh
  PERFORM pg_notify('refresh_stylists_rating', '');
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Triggers on tables that affect the materialized view
CREATE TRIGGER hairdressers_refresh_stylists_rating
  AFTER INSERT OR UPDATE OR DELETE ON hairdressers
  FOR EACH ROW EXECUTE FUNCTION trigger_refresh_stylists_rating();

CREATE TRIGGER bookings_refresh_stylists_rating
  AFTER INSERT OR UPDATE OR DELETE ON bookings
  FOR EACH ROW EXECUTE FUNCTION trigger_refresh_stylists_rating();

-- Grant permissions
GRANT SELECT ON stylists_with_rating TO authenticated;
GRANT EXECUTE ON FUNCTION refresh_stylists_rating() TO authenticated;