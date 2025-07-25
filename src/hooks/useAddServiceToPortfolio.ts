import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useUploadImage } from './useUploadImage';

interface AddServiceData {
  serviceId: string;
  hairstyleName?: string;
  imageFile: File;
}

export const useAddServiceToPortfolio = (stylistId?: string) => {
  const [adding, setAdding] = useState(false);
  const { toast } = useToast();
  const { uploadImage } = useUploadImage();

  const addServiceToPortfolio = async (data: AddServiceData) => {
    if (!stylistId) {
      throw new Error('Stylist ID required');
    }

    try {
      setAdding(true);

      // First upload the image
      const imageUrl = await uploadImage(data.imageFile, stylistId);
      if (!imageUrl) {
        throw new Error('Erreur lors du téléchargement de l\'image');
      }

      // Then add to portfolio
      const { error } = await supabase
        .from('portfolio')
        .insert({
          stylist_id: stylistId,
          service_id: data.serviceId,
          image_url: imageUrl,
          hairstyle_name: data.hairstyleName,
        });

      if (error) {
        // If portfolio insert fails, try to clean up the uploaded image
        try {
          const url = new URL(imageUrl);
          const pathSegments = url.pathname.split('/');
          const filePath = pathSegments.slice(-2).join('/');
          await supabase.storage.from('portfolio').remove([filePath]);
        } catch (cleanupError) {
          console.error('Error cleaning up image after portfolio insert failure:', cleanupError);
        }
        throw error;
      }

      toast({
        title: "Succès",
        description: "Service ajouté au portfolio avec succès",
      });

      return true;
    } catch (error) {
      console.error('Error adding service to portfolio:', error);
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Impossible d'ajouter le service",
        variant: "destructive",
      });
      throw error;
    } finally {
      setAdding(false);
    }
  };

  return {
    addServiceToPortfolio,
    adding,
  };
};