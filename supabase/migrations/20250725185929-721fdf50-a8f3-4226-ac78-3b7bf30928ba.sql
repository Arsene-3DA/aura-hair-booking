-- Tables pour dashboard client complet

-- Table avis
CREATE TABLE IF NOT EXISTS public.reviews (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid references public.bookings(id) on delete cascade,
  client_id uuid references auth.users(id) on delete cascade,
  stylist_id uuid references auth.users(id),
  rating int check (rating between 1 and 5),
  comment text,
  created_at timestamptz default now(),
  unique (booking_id) -- un seul avis par prestation
);

-- Table promotions
CREATE TABLE IF NOT EXISTS public.promotions (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  discount_percentage numeric,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- Table notifications
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  title text not null,
  body text,
  is_read boolean default false,
  created_at timestamptz default now()
);

-- Enable RLS
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies pour reviews
CREATE POLICY "client_owns_review" ON reviews
  FOR ALL USING (client_id = auth.uid());

CREATE POLICY "stylist_read_reviews" ON reviews
  FOR SELECT USING (stylist_id = auth.uid());

-- RLS Policies pour promotions
CREATE POLICY "promotions_public_read" ON promotions
  FOR SELECT USING (true);

CREATE POLICY "admin_manage_promotions" ON promotions
  FOR ALL USING (get_current_user_role() = 'admin');

-- RLS Policies pour notifications
CREATE POLICY "user_owns_notifications" ON notifications
  FOR ALL USING (user_id = auth.uid());