
import { useSupabaseBookings } from './useSupabaseBookings';

export const useBookingIntegration = () => {
  const supabaseBookings = useSupabaseBookings();

  const createBooking = async (bookingData: any) => {
    try {
      // Créer dans Supabase
      const supabaseBooking = await supabaseBookings.createBooking({
        stylist_id: bookingData.hairdresserId.toString(),
        client_name: bookingData.clientName,
        client_email: bookingData.email,
        client_phone: bookingData.phone,
        service: bookingData.service,
        scheduled_at: `${bookingData.bookingDate}T${bookingData.time}:00`,
        comments: bookingData.comments
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
