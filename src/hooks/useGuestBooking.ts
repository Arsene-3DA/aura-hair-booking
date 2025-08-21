import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/hooks/use-toast";

interface GuestBookingData {
  hairdresserId: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  serviceId?: string;
  scheduledDateTime: string;
  notes?: string;
}

export const useGuestBooking = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const createGuestBooking = async (bookingData: GuestBookingData) => {
    try {
      setLoading(true);

      // Valider les données côté client
      if (!bookingData.clientName.trim()) {
        throw new Error('Le nom du client est requis');
      }

      if (!bookingData.clientEmail.trim()) {
        throw new Error('L\'email du client est requis');
      }

      if (!bookingData.clientPhone.trim()) {
        throw new Error('Le téléphone du client est requis');
      }

      const { data, error } = await supabase.rpc('create_guest_booking', {
        p_hairdresser_id: bookingData.hairdresserId,
        p_client_name: bookingData.clientName,
        p_client_email: bookingData.clientEmail,
        p_client_phone: bookingData.clientPhone,
        p_scheduled_datetime: bookingData.scheduledDateTime,
        p_service_id: bookingData.serviceId || null,
        p_notes: bookingData.notes || null
      });

      if (error) {
        console.error('Erreur lors de la création de la réservation:', error);
        throw error;
      }

      const result = data as any;
      if (!result?.success) {
        throw new Error(result?.error || 'Erreur inconnue lors de la création de la réservation');
      }

      toast({
        title: "✅ Réservation créée",
        description: "Votre demande de réservation a été envoyée ! Vous recevrez une confirmation par email."
      });

      return { success: true, bookingId: result.booking_id };

    } catch (error: any) {
      const errorMessage = error.message || 'Erreur lors de la création de la réservation';
      toast({
        title: "❌ Erreur",
        description: errorMessage,
        variant: "destructive"
      });
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  return {
    createGuestBooking,
    loading
  };
};