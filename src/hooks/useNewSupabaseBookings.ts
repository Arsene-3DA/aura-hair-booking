
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/hooks/use-toast";

export const useNewSupabaseBookings = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const getHairdresserByAuthId = async (authId: string) => {
    try {
      const { data, error } = await supabase
        .from('hairdressers')
        .select('*')
        .eq('auth_id', authId)
        .single();

      if (error) {
        console.error('Erreur lors de la récupération du profil coiffeur:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Erreur:', error);
      return null;
    }
  };

  const getBookingsForHairdresser = async (hairdresserId: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('hairdresser_id', hairdresserId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erreur lors du chargement des réservations:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      toast({
        title: "❌ Erreur",
        description: "Impossible de charger les réservations",
        variant: "destructive",
      });
      return [];
    } finally {
      setLoading(false);
    }
  };

  const updateBookingStatus = async (bookingId: string, status: 'confirmed' | 'declined' | 'completed') => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status })
        .eq('id', bookingId);

      if (error) {
        console.error('Erreur lors de la mise à jour du statut:', error);
        throw error;
      }

      const statusMessages = {
        'confirmé': '✅ Réservation confirmée',
        'refusé': '❌ Réservation refusée',
        'terminé': '✅ Réservation terminée'
      };

      toast({
        title: statusMessages[status],
        description: `La réservation a été ${status}e avec succès`,
      });
    } catch (error) {
      toast({
        title: "❌ Erreur",
        description: "Impossible de mettre à jour le statut",
        variant: "destructive",
      });
      throw error;
    }
  };

  const createBooking = async (bookingData: {
    hairdresser_id: string;
    client_name: string;
    client_email: string;
    client_phone: string;
    booking_date: string;
    booking_time: string;
    service: string;
    comments?: string;
    client_auth_id?: string;
  }) => {
    try {
      // Calculer la date d'expiration (30 minutes)
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 30);

      const { data, error } = await supabase
        .from('bookings')
        .insert({
          ...bookingData,
          expires_at: expiresAt.toISOString(),
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "✅ Réservation créée",
        description: "Votre réservation a été enregistrée avec succès"
      });

      return { success: true, data };
    } catch (error: any) {
      const errorMessage = error.message || 'Erreur lors de la création de la réservation';
      toast({
        title: "❌ Erreur",
        description: errorMessage,
        variant: "destructive"
      });
      return { success: false, error: errorMessage };
    }
  };

  return {
    getHairedresserByAuthId: getHairdresserByAuthId, // Garder l'ancienne typo pour la compatibilité
    getHairdresserByAuthId,
    getBookingsForHairdresser,
    updateBookingStatus,
    createBooking,
    loading
  };
};
