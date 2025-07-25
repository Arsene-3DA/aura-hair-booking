import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface PastBooking {
  id: string;
  service: string;
  scheduled_at: string;
  status: string;
  stylist_name?: string;
  stylist_id?: string;
  comments?: string;
  has_review?: boolean;
}

interface UsePastBookingsOptions {
  page?: number;
  limit?: number;
}

export const usePastBookings = (clientId?: string, options: UsePastBookingsOptions = {}) => {
  const { page = 1, limit = 10 } = options;
  const [bookings, setBookings] = useState<PastBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);

  const fetchPastBookings = async () => {
    if (!clientId) return;

    try {
      setLoading(true);
      const now = new Date().toISOString();
      const offset = (page - 1) * limit;

      const { data, error } = await supabase
        .from('bookings')
        .select(`
          id,
          service,
          scheduled_at,
          status,
          stylist_id,
          comments,
          reviews!left(id)
        `)
        .eq('client_id', clientId)
        .in('status', ['completed', 'declined'])
        .lt('scheduled_at', now)
        .order('scheduled_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      const processedBookings = (data || []).map(booking => ({
        ...booking,
        has_review: Array.isArray(booking.reviews) && booking.reviews.length > 0,
      }));

      setBookings(processedBookings);
      setHasMore(data?.length === limit);
    } catch (error) {
      console.error('Error fetching past bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPastBookings();
  }, [clientId, page]);

  return {
    bookings,
    loading,
    hasMore,
    refetch: fetchPastBookings,
  };
};