
import { useSupabaseBookings } from './useSupabaseBookings';
import { useBookings } from '@/contexts/BookingsContext';

export const useBookingIntegration = () => {
  const supabaseBookings = useSupabaseBookings();
  const localBookings = useBookings();

  const createBooking = async (bookingData: any) => {
    try {
      // Créer dans Supabase
      const supabaseBooking = await supabaseBookings.createBooking({
        hairdresser_id: bookingData.hairdresserId.toString(),
        client_name: bookingData.clientName,
        client_email: bookingData.email,
        client_phone: bookingData.phone,
        service: bookingData.service,
        booking_date: bookingData.bookingDate,
        booking_time: bookingData.time,
        comments: bookingData.comments
      });

      // Aussi créer dans le contexte local pour compatibilité
      localBookings.createBooking({
        ...bookingData,
        id: parseInt(supabaseBooking.id, 16) || Date.now() // Fallback ID
      });

      return supabaseBooking;
    } catch (error) {
      throw error;
    }
  };

  return {
    createBooking,
    loading: supabaseBookings.loading,
    getBookingsByHairdresser: supabaseBookings.getBookingsByHairdresser,
    updateBookingStatus: supabaseBookings.updateBookingStatus
  };
};
