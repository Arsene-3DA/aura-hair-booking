-- Create storage bucket for stylist photos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('stylists', 'stylists', true);

-- Create storage policies for stylist photos
CREATE POLICY "Anyone can view stylist photos" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'stylists');

CREATE POLICY "Stylists can upload their own photos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'stylists' 
  AND (storage.foldername(name))[1] = (
    SELECT id::text 
    FROM profiles 
    WHERE user_id = auth.uid() 
    AND role = 'stylist'
  )
);

CREATE POLICY "Stylists can update their own photos" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'stylists' 
  AND (storage.foldername(name))[1] = (
    SELECT id::text 
    FROM profiles 
    WHERE user_id = auth.uid() 
    AND role = 'stylist'
  )
);

CREATE POLICY "Stylists can delete their own photos" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'stylists' 
  AND (storage.foldername(name))[1] = (
    SELECT id::text 
    FROM profiles 
    WHERE user_id = auth.uid() 
    AND role = 'stylist'
  )
);