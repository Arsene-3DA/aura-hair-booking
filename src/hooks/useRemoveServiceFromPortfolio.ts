import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useUploadImage } from './useUploadImage';

export const useRemoveServiceFromPortfolio = () => {
  const [removing, setRemoving] = useState(false);
  const { toast } = useToast();
  const { deleteImage } = useUploadImage();

  const removeServiceFromPortfolio = async (portfolioId: string, imageUrl: string) => {
    try {
      setRemoving(true);

      // First delete from portfolio table
      const { error: deleteError } = await supabase
        .from('portfolio')
        .delete()
        .eq('id', portfolioId);

      if (deleteError) throw deleteError;

      // Then delete the image from storage
      await deleteImage(imageUrl);

      toast({
        title: "Succès",
        description: "Service supprimé du portfolio",
      });

      return true;
    } catch (error) {
      console.error('Error removing service from portfolio:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le service du portfolio",
        variant: "destructive",
      });
      throw error;
    } finally {
      setRemoving(false);
    }
  };

  return {
    removeServiceFromPortfolio,
    removing,
  };
};