
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/hooks/use-toast";

interface CreateBookingData {
  hairdresser_id: string;
  client_name: string;
  client_email: string;
  client_phone: string;
  service: string;
  booking_date: string;
  booking_time: string;
  comments?: string;
}

interface Booking {
  id: string;
  hairdresser_id: string;
  client_name: string;
  client_email: string;
  client_phone: string;
  service: string;
  booking_date: string;
  booking_time: string;
  status: 'en_attente' | 'confirmé' | 'refusé' | 'terminé';
  comments?: string;
  created_at: string;
  expires_at?: string;
}

export const useSupabaseBookings = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const createBooking = async (bookingData: CreateBookingData) => {
    try {
      setLoading(true);
      
      // Ajouter une expiration de 30 minutes pour la réservation
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 30);

      const { data, error } = await supabase
        .from('bookings')
        .insert({
          ...bookingData,
          expires_at: expiresAt.toISOString(),
          status: 'en_attente'
        })
        .select()
        .single();

      if (error) {
        console.error('Erreur lors de la création de la réservation:', error);
        
        if (error.code === '23505') { // Unique constraint violation
          throw new Error('Ce créneau est déjà réservé. Veuillez choisir un autre horaire.');
        }
        
        throw new Error('Erreur lors de la création de la réservation');
      }

      toast({
        title: "✅ Réservation créée !",
        description: "Votre demande de réservation a été envoyée au coiffeur",
      });

      return data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Une erreur est survenue';
      toast({
        title: "❌ Erreur",
        description: errorMessage,
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getBookingsByHairdresser = async (hairdresserId: string) => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('hairdresser_id', hairdresserId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erreur lors de la récupération des réservations:', error);
        throw error;
      }

      return data as Booking[];
    } catch (error) {
      toast({
        title: "❌ Erreur",
        description: "Impossible de charger les réservations",
        variant: "destructive",
      });
      return [];
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
    createBooking,
    getBookingsByHairdresser,
    updateBookingStatus,
    loading
  };
};
