-- Portfolio coiffeur - tables et storage

-- Table portfolio
CREATE TABLE IF NOT EXISTS public.portfolio (
  id uuid primary key default gen_random_uuid(),
  stylist_id uuid references auth.users(id) on delete cascade,
  service_id uuid references public.services(id),
  image_url text,
  hairstyle_name text,
  created_at timestamptz default now(),
  CONSTRAINT unique_stylist_service UNIQUE (stylist_id, service_id)
);

-- Storage bucket pour portfolio images
INSERT INTO storage.buckets (id, name, public)
VALUES ('portfolio', 'portfolio', true)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS
ALTER TABLE portfolio ENABLE ROW LEVEL SECURITY;

-- RLS Policy pour portfolio
CREATE POLICY "stylist_owns_portfolio" ON portfolio
  FOR ALL USING (stylist_id = auth.uid());

-- Storage policies pour portfolio
CREATE POLICY "Portfolio images public read" ON storage.objects
  FOR SELECT USING (bucket_id = 'portfolio');

CREATE POLICY "Stylists can upload portfolio images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'portfolio' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Stylists can update their portfolio images" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'portfolio' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Stylists can delete their portfolio images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'portfolio' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );