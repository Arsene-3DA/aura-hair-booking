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
      
      console.log('🔍 Fetching reservations for stylist...');
      
      const { data, error } = await supabase
        .from('new_reservations')
        .select(`
          id,
          scheduled_at,
          status,
          notes,
          created_at,
          updated_at,
          client_user_id,
          service_id,
          services (
            name,
            description,
            price,
            duration,
            category
          )
        `)
        .order('scheduled_at', { ascending: false });

      console.log('📊 Stylist reservations query result:', { data, error });

      if (error) throw error;

      // Récupérer les profils des clients
      const clientIds = [...new Set(data?.map(r => r.client_user_id).filter(Boolean))];
      const { data: clientProfiles } = await supabase
        .from('profiles')
        .select('user_id, full_name, avatar_url')
        .in('user_id', clientIds);

      console.log('👥 Client profiles:', clientProfiles);

      // Transformer les données pour correspondre à l'interface existante
      const transformedReservations = data?.map(reservation => ({
        id: reservation.id,
        scheduled_at: reservation.scheduled_at,
        status: reservation.status as 'pending' | 'confirmed' | 'declined' | 'completed' | 'no_show',
        notes: reservation.notes,
        created_at: reservation.created_at,
        updated_at: reservation.updated_at,
        client_name: clientProfiles?.find(p => p.user_id === reservation.client_user_id)?.full_name || 'Client',
        client_avatar: clientProfiles?.find(p => p.user_id === reservation.client_user_id)?.avatar_url,
        client_email: '', // Pas d'email dans les profils pour la sécurité
        client_phone: '',
        service_name: reservation.services?.name || 'Service personnalisé',
        service_description: reservation.services?.description,
        service_price: reservation.services?.price,
        service_duration: reservation.services?.duration,
        service_category: reservation.services?.category
      })) || [];

      console.log('✅ Transformed reservations:', transformedReservations);
      setReservations(transformedReservations);
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
      console.log('🔄 Updating reservation status:', { reservationId, status });
      
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
      console.error('❌ Error updating reservation status:', err);
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

    // Configuration de la mise à jour en temps réel
    const channel = supabase
      .channel('stylist-reservations-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'new_reservations',
        },
        () => {
          console.log('🔄 Real-time update detected, refreshing reservations...');
          fetchReservations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
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