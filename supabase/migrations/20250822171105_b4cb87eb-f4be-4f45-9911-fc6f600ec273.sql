-- Créer le bucket pour les avatars des professionnels
INSERT INTO storage.buckets (id, name, public) 
VALUES ('professional-avatars', 'professional-avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Créer les politiques RLS pour le bucket professional-avatars
CREATE POLICY "Avatar images are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'professional-avatars');

CREATE POLICY "Professionals can upload their own avatar" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'professional-avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Professionals can update their own avatar" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'professional-avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Professionals can delete their own avatar" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'professional-avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Fonction pour nettoyer les URLs d'images invalides
CREATE OR REPLACE FUNCTION clean_invalid_image_urls()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Nettoyer les URLs d'images qui pointent vers /src/assets/
  UPDATE public.hairdressers 
  SET image_url = NULL
  WHERE image_url IS NOT NULL 
    AND image_url LIKE '/src/assets/%';
    
  -- Log du nettoyage
  INSERT INTO public.system_logs (event_type, message, created_at)
  VALUES ('image_cleanup', 'Invalid image URLs cleaned from hairdressers table', NOW());
END;
$$;

-- Exécuter le nettoyage
SELECT clean_invalid_image_urls();