import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface NewBooking {
  id: string;
  client_id: string;
  stylist_id: string;
  service_id: string | null;
  scheduled_at: string;
  status: 'pending' | 'confirmed' | 'declined';
  created_at: string;
  updated_at: string;
}

export interface CreateBookingData {
  stylist_id: string;
  service_id: string;
  scheduled_at: string;
}

export const useBookings = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const createBooking = async (bookingData: CreateBookingData) => {
    setLoading(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('new_reservations')
        .insert({
          client_user_id: userData.user?.id,
          stylist_user_id: bookingData.stylist_id,
          service_id: bookingData.service_id,
          scheduled_at: bookingData.scheduled_at,
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Réservation créée",
        description: "Votre demande de réservation a été envoyée au coiffeur.",
      });

      return { success: true, data };
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de créer la réservation.",
        variant: "destructive",
      });
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const getClientBookings = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('new_reservations')
        .select(`
          *,
          services (name, price, duration),
          profiles!stylist_user_id (full_name)
        `)
        .order('scheduled_at', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible de charger vos réservations.",
        variant: "destructive",
      });
      return [];
    } finally {
      setLoading(false);
    }
  };

  const getStylistBookings = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('new_reservations')
        .select(`
          *,
          services (name, price, duration),
          profiles!client_user_id (full_name)
        `)
        .order('scheduled_at', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible de charger vos réservations.",
        variant: "destructive",
      });
      return [];
    } finally {
      setLoading(false);
    }
  };

  const updateBookingStatus = async (bookingId: string, status: 'confirmed' | 'declined') => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('new_reservations')
        .update({ status })
        .eq('id', bookingId);

      if (error) throw error;

      toast({
        title: "Statut mis à jour",
        description: `Réservation ${status === 'confirmed' ? 'confirmée' : 'refusée'}.`,
      });

      return { success: true };
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le statut.",
        variant: "destructive",
      });
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    createBooking,
    getClientBookings,
    getStylistBookings,
    updateBookingStatus
  };
};