import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ProfessionalReview {
  id: string;
  rating: number;
  comment: string;
  created_at: string;
  client_name?: string;
  service_name?: string;
  is_approved: boolean;
}

export const useProfessionalReviews = (professionalId?: string) => {
  const [reviews, setReviews] = useState<ProfessionalReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const { toast } = useToast();

  const fetchReviews = async () => {
    if (!professionalId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          id,
          rating,
          comment,
          created_at,
          is_approved,
          client_id,
          reservation_id
        `)
        .eq('professional_id', professionalId)
        .eq('status', 'completed')
        .eq('is_approved', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Récupérer les noms des clients et services séparément
      const clientIds = [...new Set((data || []).map(r => r.client_id).filter(Boolean))];
      const reservationIds = [...new Set((data || []).map(r => r.reservation_id).filter(Boolean))];
      
      const [clientsData, reservationsData] = await Promise.all([
        clientIds.length > 0 ? supabase
          .from('profiles')
          .select('user_id, full_name')
          .in('user_id', clientIds) : Promise.resolve({ data: [] }),
        reservationIds.length > 0 ? supabase
          .from('new_reservations')
          .select('id, service_id, services(name)')
          .in('id', reservationIds) : Promise.resolve({ data: [] })
      ]);

      const clientsMap = new Map(
        (clientsData.data || []).map(client => [client.user_id, client.full_name])
      );
      
      const reservationsMap = new Map(
        (reservationsData.data || []).map(res => [res.id, res.services?.name])
      );

      const formattedReviews = (data || []).map(review => ({
        id: review.id,
        rating: review.rating,
        comment: review.comment,
        created_at: review.created_at,
        is_approved: review.is_approved,
        client_name: clientsMap.get(review.client_id) || 'Client',
        service_name: reservationsMap.get(review.reservation_id) || 'Service'
      }));

      setReviews(formattedReviews);
      setTotalReviews(formattedReviews.length);
      
      // Calculate average rating
      if (formattedReviews.length > 0) {
        const sum = formattedReviews.reduce((acc, review) => acc + review.rating, 0);
        setAverageRating(sum / formattedReviews.length);
      } else {
        setAverageRating(0);
      }

    } catch (err: any) {
      const errorMessage = err.message || 'Erreur lors du chargement des avis';
      setError(errorMessage);
      toast({
        title: "❌ Erreur",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const approveReview = async (reviewId: string) => {
    try {
      const { error } = await supabase
        .from('reviews')
        .update({ is_approved: true })
        .eq('id', reviewId);

      if (error) throw error;

      await fetchReviews(); // Refresh data
      toast({
        title: "✅ Avis approuvé",
        description: "L'avis a été approuvé avec succès",
      });
    } catch (err: any) {
      toast({
        title: "❌ Erreur",
        description: err.message || "Impossible d'approuver l'avis",
        variant: "destructive",
      });
    }
  };

  const rejectReview = async (reviewId: string) => {
    try {
      const { error } = await supabase
        .from('reviews')
        .update({ is_approved: false })
        .eq('id', reviewId);

      if (error) throw error;

      await fetchReviews(); // Refresh data
      toast({
        title: "✅ Avis rejeté",
        description: "L'avis a été rejeté",
      });
    } catch (err: any) {
      toast({
        title: "❌ Erreur",
        description: err.message || "Impossible de rejeter l'avis",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [professionalId]);

  return {
    reviews,
    loading,
    error,
    averageRating,
    totalReviews,
    fetchReviews,
    approveReview,
    rejectReview
  };
};