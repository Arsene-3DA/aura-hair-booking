import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ClientReservation {
  id: string;
  scheduled_at: string;
  status: 'pending' | 'confirmed' | 'declined' | 'completed' | 'no_show';
  notes?: string;
  created_at: string;
  updated_at: string;
  stylist_profile?: {
    full_name: string;
    avatar_url?: string;
  };
  service?: {
    name: string;
    description?: string;
    price: number;
    duration: number;
    category?: string;
  };
}

export const useClientReservations = (clientId?: string) => {
  const [allReservations, setAllReservations] = useState<ClientReservation[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchReservations = async () => {
    if (!clientId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('new_reservations')
        .select(`
          id,
          scheduled_at,
          status,
          notes,
          created_at,
          updated_at,
          stylist_user_id,
          service_id,
          services (
            name,
            description,
            price,
            duration,
            category
          )
        `)
        .eq('client_user_id', clientId)
        .order('scheduled_at', { ascending: false });

      if (error) throw error;

      // Récupérer les profils des stylistes
      const stylistIds = [...new Set(data?.map(r => r.stylist_user_id).filter(Boolean))];
      const { data: stylistProfiles } = await supabase
        .from('profiles')
        .select('user_id, full_name, avatar_url')
        .in('user_id', stylistIds);

      // Combiner les données
      const reservationsWithProfiles = data?.map(reservation => ({
        ...reservation,
        stylist_profile: stylistProfiles?.find(p => p.user_id === reservation.stylist_user_id),
        service: reservation.services ? {
          name: reservation.services.name,
          description: reservation.services.description,
          price: reservation.services.price,
          duration: reservation.services.duration,
          category: reservation.services.category
        } : undefined
      })) || [];

      setAllReservations(reservationsWithProfiles);
    } catch (error) {
      console.error('Error fetching reservations:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les réservations",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const cancelReservation = async (reservationId: string) => {
    try {
      const { error } = await supabase
        .from('new_reservations')
        .update({ status: 'declined', updated_at: new Date().toISOString() })
        .eq('id', reservationId)
        .eq('client_user_id', clientId); // Sécurité supplémentaire

      if (error) throw error;

      // Mettre à jour l'état local
      setAllReservations(prev => 
        prev.map(reservation => 
          reservation.id === reservationId 
            ? { ...reservation, status: 'declined' as const }
            : reservation
        )
      );

      toast({
        title: "Réservation annulée",
        description: "Votre réservation a été annulée avec succès",
      });
    } catch (error) {
      console.error('Error canceling reservation:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'annuler la réservation",
        variant: "destructive",
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchReservations();

    // Configuration de la mise à jour en temps réel
    const channel = supabase
      .channel(`reservations-${clientId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'new_reservations',
          filter: `client_user_id=eq.${clientId}`,
        },
        () => {
          fetchReservations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [clientId]);

  // Séparer les réservations à venir et passées
  const now = new Date();
  const upcomingReservations = allReservations.filter(r => 
    new Date(r.scheduled_at) >= now && r.status !== 'declined'
  );
  const pastReservations = allReservations.filter(r => 
    new Date(r.scheduled_at) < now || r.status === 'completed' || r.status === 'declined'
  );

  return {
    allReservations,
    upcomingReservations,
    pastReservations,
    loading,
    cancelReservation,
    refetch: fetchReservations,
  };
};