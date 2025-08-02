-- Create automated review system
-- First, check if we need to adapt the reviews table structure
-- Add missing columns if needed and create the automation

-- Add reservation_id to reviews table if not exists (link to new_reservations)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'reviews' AND column_name = 'reservation_id') THEN
    ALTER TABLE reviews ADD COLUMN reservation_id UUID REFERENCES new_reservations(id);
  END IF;
END $$;

-- Add professional_id as alias for stylist_id if needed
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'reviews' AND column_name = 'professional_id') THEN
    ALTER TABLE reviews ADD COLUMN professional_id UUID;
    -- Update existing records
    UPDATE reviews SET professional_id = stylist_id WHERE stylist_id IS NOT NULL;
  END IF;
END $$;

-- Add review_token for secure review submission
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'reviews' AND column_name = 'review_token') THEN
    ALTER TABLE reviews ADD COLUMN review_token UUID DEFAULT gen_random_uuid();
  END IF;
END $$;

-- Add status to track review lifecycle
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'reviews' AND column_name = 'status') THEN
    ALTER TABLE reviews ADD COLUMN status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'expired'));
  END IF;
END $$;

-- Add email_sent_at to track when review request was sent
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'reviews' AND column_name = 'email_sent_at') THEN
    ALTER TABLE reviews ADD COLUMN email_sent_at TIMESTAMPTZ;
  END IF;
END $$;

-- Function to automatically create review request when reservation is completed
CREATE OR REPLACE FUNCTION create_review_request()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
    review_token UUID;
BEGIN
    -- Only trigger when status changes to 'completed'
    IF OLD.status != 'completed' AND NEW.status = 'completed' THEN
        -- Generate a unique token for this review
        review_token := gen_random_uuid();
        
        -- Create a review request
        INSERT INTO reviews (
            reservation_id,
            client_id, 
            stylist_id,
            professional_id,
            review_token,
            status,
            created_at
        ) VALUES (
            NEW.id,
            NEW.client_user_id,
            NEW.stylist_user_id,
            NEW.stylist_user_id,
            review_token,
            'pending',
            NOW()
        ) ON CONFLICT DO NOTHING; -- Prevent duplicates
        
        -- Create notification for the client
        INSERT INTO notifications (
            user_id,
            title,
            body,
            created_at
        ) VALUES (
            NEW.client_user_id,
            'Évaluez votre prestation',
            'Votre rendez-vous est terminé. Partagez votre expérience en laissant une note et un commentaire.',
            NOW()
        ) ON CONFLICT DO NOTHING;
        
    END IF;
    
    RETURN NEW;
END;
$$;

-- Create trigger for automatic review request
DROP TRIGGER IF EXISTS trigger_create_review_request ON new_reservations;
CREATE TRIGGER trigger_create_review_request
    AFTER UPDATE ON new_reservations
    FOR EACH ROW
    EXECUTE FUNCTION create_review_request();

-- Function to get pending review by token (for secure review submission)
CREATE OR REPLACE FUNCTION get_review_by_token(token UUID)
RETURNS TABLE (
    id UUID,
    reservation_id UUID,
    client_id UUID,
    professional_id UUID,
    status TEXT,
    created_at TIMESTAMPTZ,
    client_name TEXT,
    professional_name TEXT,
    service_name TEXT,
    scheduled_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        r.id,
        r.reservation_id,
        r.client_id,
        r.professional_id,
        r.status,
        r.created_at,
        cp.full_name as client_name,
        pp.full_name as professional_name,
        s.name as service_name,
        res.scheduled_at
    FROM reviews r
    LEFT JOIN profiles cp ON r.client_id = cp.user_id
    LEFT JOIN profiles pp ON r.professional_id = pp.user_id
    LEFT JOIN new_reservations res ON r.reservation_id = res.id
    LEFT JOIN services s ON res.service_id = s.id
    WHERE r.review_token = token
    AND r.status = 'pending'
    AND r.created_at > NOW() - INTERVAL '7 days'; -- Review expires after 7 days
END;
$$;

-- Function to submit review
CREATE OR REPLACE FUNCTION submit_review(
    token UUID,
    rating INTEGER,
    comment_text TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
    review_record RECORD;
    result JSONB;
BEGIN
    -- Validate rating
    IF rating < 1 OR rating > 5 THEN
        RETURN jsonb_build_object('success', false, 'error', 'La note doit être entre 1 et 5');
    END IF;
    
    -- Find the review by token
    SELECT * INTO review_record
    FROM reviews 
    WHERE review_token = token 
    AND status = 'pending'
    AND created_at > NOW() - INTERVAL '7 days';
    
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Lien d''évaluation invalide ou expiré');
    END IF;
    
    -- Update the review
    UPDATE reviews 
    SET 
        rating = submit_review.rating,
        comment = comment_text,
        status = 'completed',
        updated_at = NOW()
    WHERE review_token = token;
    
    -- Update professional's rating
    PERFORM update_stylist_rating_for_user(review_record.professional_id);
    
    RETURN jsonb_build_object('success', true, 'message', 'Merci pour votre évaluation !');
END;
$$;

-- Helper function to update stylist rating
CREATE OR REPLACE FUNCTION update_stylist_rating_for_user(user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
    avg_rating NUMERIC;
BEGIN
    -- Calculate average rating for this stylist
    SELECT COALESCE(AVG(rating::numeric), 0.0) INTO avg_rating
    FROM reviews 
    WHERE professional_id = user_id 
    AND status = 'completed'
    AND is_approved = true;
    
    -- Update hairdressers table if exists
    UPDATE hairdressers 
    SET rating = avg_rating,
        updated_at = NOW()
    WHERE auth_id = user_id;
END;
$$;