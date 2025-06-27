
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/hooks/use-toast";

export const useSupabaseAuth = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const getCoiffeurByUserId = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('coiffeur_profiles')
        .select(`
          hairdresser_id,
          hairdressers!inner(*)
        `)
        .eq('user_id', userId)
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

  const getBookingsForCoiffeur = async (hairdresserId: string) => {
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

  const updateBookingStatus = async (bookingId: string, status: 'confirmé' | 'refusé' | 'terminé') => {
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

  return {
    getCoiffeurByUserId,
    getBookingsForCoiffeur,
    updateBookingStatus,
    loading
  };
};
