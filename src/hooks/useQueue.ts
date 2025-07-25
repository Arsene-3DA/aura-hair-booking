import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RealtimeBooking } from './useRealtimeBookings';

export interface QueueBooking extends RealtimeBooking {
  client_user_id?: string;
}

interface UseQueueReturn {
  queue: QueueBooking[];
  loading: boolean;
  error: string | null;
  approveBooking: (bookingId: string) => Promise<void>;
  rejectBooking: (bookingId: string) => Promise<void>;
  refetch: () => Promise<void>;
}

export const useQueue = (stylistId?: string): UseQueueReturn => {
  const [queue, setQueue] = useState<QueueBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchQueue = async () => {
    if (!stylistId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const { data, error: fetchError } = await supabase
        .from('bookings')
        .select('*')
        .eq('hairdresser_id', stylistId)
        .eq('status', 'pending')
        .order('created_at', { ascending: true });

      if (fetchError) {
        console.error('Error fetching queue:', fetchError);
        setError(fetchError.message);
        return;
      }

      setQueue(data || []);
    } catch (err) {
      console.error('Unexpected error:', err);
      setError('Une erreur inattendue est survenue');
    } finally {
      setLoading(false);
    }
  };

  const approveBooking = async (bookingId: string) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: 'confirmed' })
        .eq('id', bookingId);

      if (error) {
        console.error('Error approving booking:', error);
        throw new Error('Impossible d\'approuver la réservation');
      }

      // Remove from local queue immediately for optimistic update
      setQueue(prev => prev.filter(booking => booking.id !== bookingId));
    } catch (error) {
      throw error;
    }
  };

  const rejectBooking = async (bookingId: string) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: 'declined' })
        .eq('id', bookingId);

      if (error) {
        console.error('Error rejecting booking:', error);
        throw new Error('Impossible de refuser la réservation');
      }

      // Remove from local queue immediately for optimistic update
      setQueue(prev => prev.filter(booking => booking.id !== bookingId));
    } catch (error) {
      throw error;
    }
  };

  useEffect(() => {
    if (!stylistId) {
      setLoading(false);
      return;
    }

    // Initial fetch
    fetchQueue();

    // Set up real-time subscription
    const channel = supabase
      .channel(`queue-${stylistId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookings',
          filter: `hairdresser_id=eq.${stylistId}`,
        },
        (payload) => {
          console.log('Queue change detected:', payload);
          
          if (payload.eventType === 'INSERT' && payload.new.status === 'pending') {
            setQueue(prev => [...prev, payload.new as QueueBooking]);
          } else if (payload.eventType === 'UPDATE') {
            const updatedBooking = payload.new as QueueBooking;
            if (updatedBooking.status === 'pending') {
              setQueue(prev => 
                prev.map(booking => 
                  booking.id === updatedBooking.id ? updatedBooking : booking
                )
              );
            } else {
              // Remove from queue if status changed from pending
              setQueue(prev => 
                prev.filter(booking => booking.id !== updatedBooking.id)
              );
            }
          } else if (payload.eventType === 'DELETE') {
            setQueue(prev => 
              prev.filter(booking => booking.id !== payload.old.id)
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [stylistId]);

  return {
    queue,
    loading,
    error,
    approveBooking,
    rejectBooking,
    refetch: fetchQueue,
  };
};