import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface StylistReview {
  id: string;
  rating: number;
  comment?: string;
  created_at: string;
  booking?: {
    service: string;
    client_name: string;
  };
}

export const useStylistReviews = (stylistId?: string) => {
  const [reviews, setReviews] = useState<StylistReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    averageRating: 0,
    totalReviews: 0,
    ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  });

  const fetchReviews = async () => {
    if (!stylistId) return;

    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          bookings!inner(service, client_name)
        `)
        .eq('stylist_id', stylistId)
        .eq('is_approved', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const reviewsData = data || [];
      setReviews(reviewsData);

      // Calculate statistics
      if (reviewsData.length > 0) {
        const ratings = reviewsData.map(r => r.rating);
        const averageRating = ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;
        
        const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
        ratings.forEach(rating => {
          distribution[rating as keyof typeof distribution]++;
        });

        setStats({
          averageRating: Math.round(averageRating * 10) / 10,
          totalReviews: reviewsData.length,
          ratingDistribution: distribution
        });
      } else {
        setStats({
          averageRating: 0,
          totalReviews: 0,
          ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
        });
      }
    } catch (error) {
      console.error('Error fetching stylist reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [stylistId]);

  return {
    reviews,
    stats,
    loading,
    refetch: fetchReviews,
  };
};