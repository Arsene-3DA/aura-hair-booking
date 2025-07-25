import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface QuickReserveData {
  stylist_id: string;
  service: string;
  scheduled_at: string;
  comments?: string;
}

export const useQuickReserve = (clientId?: string) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const createReservation = async (data: QuickReserveData) => {
    if (!clientId) {
      throw new Error('Client ID required');
    }

    try {
      setLoading(true);

      // For now, we'll use new_reservations table instead
      const { data: booking, error } = await supabase
        .from('new_reservations')
        .insert({
          client_user_id: clientId,
          stylist_user_id: data.stylist_id,
          service_id: null, // Will need to be mapped to actual service
          scheduled_at: data.scheduled_at,
          status: 'pending',
          notes: data.comments,
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Votre demande de réservation a été envoyée !",
      });

      return booking;
    } catch (error) {
      console.error('Error creating reservation:', error);
      toast({
        title: "Erreur",
        description: "Impossible de créer la réservation",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    createReservation,
    loading,
  };
};