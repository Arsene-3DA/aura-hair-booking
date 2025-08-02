import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface StylistReservation {
  id: string;
  scheduled_at: string;
  status: 'pending' | 'confirmed' | 'declined' | 'completed' | 'no_show';
  notes?: string;
  created_at: string;
  updated_at: string;
  // Client info
  client_name?: string;
  client_avatar?: string;
  client_email?: string;
  client_phone?: string;
  // Service info
  service_name?: string;
  service_description?: string;
  service_price?: number;
  service_duration?: number;
  service_category?: string;
}

export const useStylistReservations = () => {
  const [reservations, setReservations] = useState<StylistReservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchReservations = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase.rpc('get_stylist_reservations');

      if (error) {
        console.error('Error fetching stylist reservations:', error);
        throw error;
      }

      setReservations(data || []);
    } catch (err: any) {
      const errorMessage = err.message || 'Erreur lors du chargement des réservations';
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

  const updateReservationStatus = async (
    reservationId: string, 
    status: 'confirmed' | 'declined'
  ) => {
    try {
      // Direct update with stylist permission check via RLS
      const { error } = await supabase
        .from('new_reservations')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', reservationId);

      if (error) throw error;

      await fetchReservations(); // Refresh data
      
      const statusMessages = {
        'confirmed': '✅ Réservation confirmée',
        'declined': '❌ Réservation refusée'
      };

      toast({
        title: statusMessages[status],
        description: `La réservation a été ${status === 'confirmed' ? 'confirmée' : 'refusée'} avec succès`,
      });
    } catch (err: any) {
      toast({
        title: "❌ Erreur",
        description: err.message || "Impossible de mettre à jour le statut",
        variant: "destructive",
      });
    }
  };

  const confirmReservation = (reservationId: string) => {
    return updateReservationStatus(reservationId, 'confirmed');
  };

  const declineReservation = (reservationId: string) => {
    return updateReservationStatus(reservationId, 'declined');
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  return {
    reservations,
    loading,
    error,
    fetchReservations,
    updateReservationStatus,
    confirmReservation,
    declineReservation
  };
};