import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Review {
  id: string;
  booking_id: string;
  client_id: string;
  stylist_id: string;
  rating: number;
  comment?: string;
  created_at: string;
  booking?: {
    service: string;
    scheduled_at: string;
  };
}

export const useReviews = (clientId?: string) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchReviews = async () => {
    if (!clientId) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          bookings!inner(service, scheduled_at)
        `)
        .eq('client_id', clientId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReviews(data || []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const createReview = async (bookingId: string, rating: number, comment?: string) => {
    if (!clientId) return;

    try {
      const { data, error } = await supabase
        .from('reviews')
        .insert({
          booking_id: bookingId,
          client_id: clientId,
          rating,
          comment,
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Votre avis a été publié !",
      });

      await fetchReviews();
      return data;
    } catch (error) {
      console.error('Error creating review:', error);
      toast({
        title: "Erreur",
        description: "Impossible de publier l'avis",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateReview = async (reviewId: string, rating: number, comment?: string) => {
    try {
      const { error } = await supabase
        .from('reviews')
        .update({ rating, comment })
        .eq('id', reviewId);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Avis modifié avec succès",
      });

      await fetchReviews();
    } catch (error) {
      console.error('Error updating review:', error);
      toast({
        title: "Erreur",
        description: "Impossible de modifier l'avis",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteReview = async (reviewId: string) => {
    try {
      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', reviewId);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Avis supprimé",
      });

      setReviews(prev => prev.filter(review => review.id !== reviewId));
    } catch (error) {
      console.error('Error deleting review:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'avis",
        variant: "destructive",
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [clientId]);

  return {
    reviews,
    loading,
    createReview,
    updateReview,
    deleteReview,
    refetch: fetchReviews,
  };
};