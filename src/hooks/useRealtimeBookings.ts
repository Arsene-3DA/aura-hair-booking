import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface RealtimeBooking {
  id: string;
  booking_date: string;
  booking_time: string;
  service: string;
  status: string;
  hairdresser_id: string;
  client_name: string;
  client_email: string;
  client_phone: string;
  comments?: string;
  created_at: string;
}

interface UseRealtimeBookingsReturn {
  bookings: RealtimeBooking[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useRealtimeBookings = (userId?: string): UseRealtimeBookingsReturn => {
  const [bookings, setBookings] = useState<RealtimeBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBookings = async () => {
    if (!userId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const { data, error: fetchError } = await supabase
        .from('bookings')
        .select('*')
        .eq('client_auth_id', userId)
        .order('booking_date', { ascending: true })
        .order('booking_time', { ascending: true });

      if (fetchError) {
        console.error('Error fetching bookings:', fetchError);
        setError(fetchError.message);
        return;
      }

      setBookings(data || []);
    } catch (err) {
      console.error('Unexpected error:', err);
      setError('Une erreur inattendue est survenue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    // Initial fetch
    fetchBookings();

    // Set up real-time subscription
    const channel = supabase
      .channel('bookings-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookings',
          filter: `client_auth_id=eq.${userId}`,
        },
        (payload) => {
          console.log('Booking change detected:', payload);
          
          if (payload.eventType === 'INSERT') {
            setBookings(prev => [...prev, payload.new as RealtimeBooking]);
          } else if (payload.eventType === 'UPDATE') {
            setBookings(prev => 
              prev.map(booking => 
                booking.id === payload.new.id 
                  ? { ...booking, ...payload.new }
                  : booking
              )
            );
          } else if (payload.eventType === 'DELETE') {
            setBookings(prev => 
              prev.filter(booking => booking.id !== payload.old.id)
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  return {
    bookings,
    loading,
    error,
    refetch: fetchBookings,
  };
};