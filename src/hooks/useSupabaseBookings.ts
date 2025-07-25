
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/hooks/use-toast";

interface CreateBookingData {
  stylist_id: string;
  client_id?: string;
  client_name: string;
  client_email: string;
  client_phone: string;
  service: string;
  scheduled_at: string;
  comments?: string;
}

interface Booking {
  id: string;
  hairdresser_id: string;
  stylist_id?: string;
  client_id?: string;
  client_name: string;
  client_email: string;
  client_phone: string;
  service: string;
  booking_date: string;
  booking_time: string;
  scheduled_at: string;
  status: 'pending' | 'confirmed' | 'declined' | 'completed';
  comments?: string;
  created_at: string;
  updated_at: string;
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

      const scheduledDate = new Date(bookingData.scheduled_at);
      const bookingDate = scheduledDate.toISOString().split('T')[0];
      const bookingTime = scheduledDate.toTimeString().slice(0, 8);

      const { data, error } = await supabase
        .from('bookings')
        .insert({
          hairdresser_id: bookingData.stylist_id,
          client_id: bookingData.client_id,
          client_auth_id: bookingData.client_id, // Add the auth reference
          client_name: bookingData.client_name,
          client_email: bookingData.client_email,
          client_phone: bookingData.client_phone,
          service: bookingData.service,
          booking_date: bookingDate,
          booking_time: bookingTime,
          scheduled_at: bookingData.scheduled_at,
          comments: bookingData.comments,
          status: 'pending'
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

      return data;
    } catch (error) {
      toast({
        title: "❌ Erreur",
        description: "Impossible de charger les réservations",
        variant: "destructive",
      });
      return [];
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
        'confirmed': '✅ Réservation confirmée',
        'declined': '❌ Réservation refusée',
        'completed': '✅ Réservation terminée'
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
