import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { format, isAfter } from 'date-fns';

export interface UpcomingBooking {
  id: string;
  service: string;
  scheduled_at: string;
  status: string;
  stylist_name?: string;
  stylist_id?: string;
  comments?: string;
}

export const useUpcomingBookings = (clientId?: string) => {
  const [bookings, setBookings] = useState<UpcomingBooking[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUpcomingBookings = async () => {
    if (!clientId) return;

    try {
      setLoading(true);
      const now = new Date().toISOString();

      const { data, error } = await supabase
        .from('bookings')
        .select(`
          id,
          service,
          scheduled_at,
          status,
          stylist_id,
          comments
        `)
        .eq('client_id', clientId)
        .in('status', ['pending', 'confirmed'])
        .gte('scheduled_at', now)
        .order('scheduled_at', { ascending: true })
        .limit(3);

      if (error) throw error;

      setBookings(data || []);
    } catch (error) {
      console.error('Error fetching upcoming bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const cancelBooking = async (bookingId: string) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: 'declined' })
        .eq('id', bookingId);

      if (error) throw error;

      // Remove from local state
      setBookings(prev => prev.filter(booking => booking.id !== bookingId));
    } catch (error) {
      console.error('Error canceling booking:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchUpcomingBookings();

    // Set up real-time subscription
    const channel = supabase
      .channel(`upcoming-bookings-${clientId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookings',
          filter: `client_id=eq.${clientId}`,
        },
        () => {
          fetchUpcomingBookings();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [clientId]);

  return {
    bookings,
    loading,
    cancelBooking,
    refetch: fetchUpcomingBookings,
  };
};