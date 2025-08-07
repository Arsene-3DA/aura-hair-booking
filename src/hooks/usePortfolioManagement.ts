import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface PortfolioItem {
  id: string;
  stylist_id: string;
  service_id?: string;
  image_url: string;
  hairstyle_name?: string;
  is_featured: boolean;
  display_order: number;
  created_at: string;
  service?: {
    id: string;
    name: string;
  };
}

export const usePortfolioManagement = (stylistId?: string) => {
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchPortfolio = async () => {
    if (!stylistId) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('portfolio')
        .select(`
          *,
          services(id, name)
        `)
        .eq('stylist_id', stylistId)
        .order('display_order', { ascending: true })
        .order('created_at', { ascending: false });

      if (error) throw error;

      const transformedData = (data || []).map(item => ({
        ...item,
        service: item.services
      }));

      setPortfolio(transformedData);
    } catch (error) {
      console.error('Error fetching portfolio:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de charger votre portfolio",
      });
    } finally {
      setLoading(false);
    }
  };

  const addPortfolioItem = async (
    serviceId: string,
    imageFile: File,
    hairstyleName?: string
  ) => {
    if (!stylistId) return;

    try {
      // Upload image to Supabase Storage
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${stylistId}-${Date.now()}.${fileExt}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('portfolio')
        .upload(fileName, imageFile);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('portfolio')
        .getPublicUrl(fileName);

      // Get next display order
      const nextOrder = portfolio.length;

      const { data, error } = await supabase
        .from('portfolio')
        .insert({
          stylist_id: stylistId,
          service_id: serviceId,
          image_url: publicUrl,
          hairstyle_name: hairstyleName,
          display_order: nextOrder,
          is_featured: portfolio.length === 0 // First image is featured
        })
        .select(`
          *,
          services(id, name)
        `)
        .single();

      if (error) throw error;

      const newItem = {
        ...data,
        service: data.services
      };

      setPortfolio(prev => [...prev, newItem]);
      
      toast({
        title: "Image ajoutée",
        description: "Votre réalisation a été ajoutée au portfolio",
      });

      return newItem;
    } catch (error) {
      console.error('Error adding portfolio item:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible d'ajouter l'image au portfolio",
      });
      throw error;
    }
  };

  const removePortfolioItem = async (itemId: string, imageUrl: string) => {
    try {
      // Delete from database
      const { error } = await supabase
        .from('portfolio')
        .delete()
        .eq('id', itemId);

      if (error) throw error;

      // Delete image from storage
      const imagePath = imageUrl.split('/').pop();
      if (imagePath) {
        await supabase.storage
          .from('portfolio')
          .remove([imagePath]);
      }

      setPortfolio(prev => prev.filter(item => item.id !== itemId));
      
      toast({
        title: "Image supprimée",
        description: "L'image a été retirée de votre portfolio",
      });
    } catch (error) {
      console.error('Error removing portfolio item:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de supprimer l'image",
      });
      throw error;
    }
  };

  const updatePortfolioOrder = async (items: PortfolioItem[]) => {
    try {
      const updates = items.map((item, index) => ({
        id: item.id,
        display_order: index
      }));

      for (const update of updates) {
        const { error } = await supabase
          .from('portfolio')
          .update({ display_order: update.display_order })
          .eq('id', update.id);

        if (error) throw error;
      }

      setPortfolio(items);
    } catch (error) {
      console.error('Error updating portfolio order:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de réorganiser le portfolio",
      });
    }
  };

  const toggleFeatured = async (itemId: string) => {
    try {
      const item = portfolio.find(p => p.id === itemId);
      if (!item) return;

      const { error } = await supabase
        .from('portfolio')
        .update({ is_featured: !item.is_featured })
        .eq('id', itemId);

      if (error) throw error;

      setPortfolio(prev => 
        prev.map(p => 
          p.id === itemId 
            ? { ...p, is_featured: !p.is_featured }
            : p
        )
      );

      toast({
        title: item.is_featured ? "Retirée des mises en avant" : "Mise en avant",
        description: item.is_featured 
          ? "L'image n'est plus mise en avant" 
          : "L'image est maintenant mise en avant",
      });
    } catch (error) {
      console.error('Error toggling featured:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de modifier le statut de mise en avant",
      });
    }
  };

  useEffect(() => {
    fetchPortfolio();

    // Set up real-time subscription
    const channel = supabase
      .channel(`portfolio-${stylistId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'portfolio',
          filter: `stylist_id=eq.${stylistId}`,
        },
        () => {
          fetchPortfolio();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [stylistId]);

  return {
    portfolio,
    loading,
    addPortfolioItem,
    removePortfolioItem,
    updatePortfolioOrder,
    toggleFeatured,
    refetch: fetchPortfolio,
  };
};