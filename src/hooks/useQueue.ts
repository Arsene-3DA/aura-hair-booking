import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { validateUUID } from '@/utils/validateUUID';
import { useToast } from '@/hooks/use-toast';

export interface QueueItem {
  id: string;
  client_name: string;
  client_email: string;
  client_phone: string;
  service: string;
  scheduled_at: string;
  booking_date?: string;
  booking_time?: string;
  created_at?: string;
  status: 'pending' | 'confirmed' | 'declined' | 'completed' | 'no_show';
  comments?: string;
}

export interface UseQueueReturn {
  queue: QueueItem[];
  loading: boolean;
  error?: string;
  updateBookingStatus: (bookingId: string, status: 'confirmed' | 'declined' | 'completed') => Promise<void>;
  approveBooking: (bookingId: string) => Promise<void>;
  rejectBooking: (bookingId: string) => Promise<void>;
  refetch: () => Promise<void>;
}

export const useQueue = (stylistId?: string): UseQueueReturn => {
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  const { toast } = useToast();

  const fetchQueue = async () => {
    if (!validateUUID(stylistId)) return;

    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('stylist_id', stylistId)
        .in('status', ['pending', 'confirmed'])
        .order('scheduled_at', { ascending: true });

      if (error) throw error;
      setQueue(data || []);
    } catch (error) {
      console.error('Error fetching queue:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger la file d'attente",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateBookingStatus = async (bookingId: string, status: 'confirmed' | 'declined' | 'completed') => {
    if (!validateUUID(bookingId)) {
      toast({
        title: "Erreur",
        description: "ID de réservation invalide",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status })
        .eq('id', bookingId);

      if (error) throw error;

      toast({
        title: "Succès",
        description: `Réservation ${status === 'confirmed' ? 'confirmée' : status === 'declined' ? 'refusée' : 'terminée'}`,
      });

      await fetchQueue();
    } catch (error) {
      console.error('Error updating booking status:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour la réservation",
        variant: "destructive",
      });
    }
  };

  const approveBooking = async (bookingId: string) => {
    await updateBookingStatus(bookingId, 'confirmed');
  };

  const rejectBooking = async (bookingId: string) => {
    await updateBookingStatus(bookingId, 'declined');
  };

  useEffect(() => {
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
          filter: `stylist_id=eq.${stylistId}`,
        },
        () => {
          fetchQueue();
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
    updateBookingStatus,
    approveBooking,
    rejectBooking,
    refetch: fetchQueue,
  };
};