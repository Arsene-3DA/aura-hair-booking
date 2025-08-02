import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { format, parseISO, isSameDay } from 'date-fns';

export interface TimeSlot {
  time: string;
  available: boolean;
  unavailable?: boolean; // Marqué comme indisponible par le coiffeur
  booked?: boolean; // Occupé par une réservation confirmée
}

export const useTimeSlotAvailability = (stylistId: string, selectedDate: Date | null) => {
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);

  // Créneaux par défaut: 9h à 21h30 par pas de 30min
  const generateDefaultSlots = (): string[] => {
    const slots: string[] = [];
    for (let hour = 9; hour <= 21; hour++) {
      if (hour === 21) {
        slots.push('21:00', '21:30');
        break;
      }
      slots.push(`${hour.toString().padStart(2, '0')}:00`, `${hour.toString().padStart(2, '0')}:30`);
    }
    return slots;
  };

  const fetchAvailabilityData = async (date: Date) => {
    if (!stylistId) return;

    try {
      setLoading(true);
      const dateStr = format(date, 'yyyy-MM-dd');
      
      // Récupérer les créneaux marqués comme indisponibles par le coiffeur
      const { data: unavailableSlots, error: availError } = await supabase
        .from('availabilities')
        .select('start_at, end_at, status')
        .eq('stylist_id', stylistId)
        .eq('status', 'busy')
        .gte('start_at', `${dateStr}T00:00:00`)
        .lt('start_at', `${dateStr}T23:59:59`);

      if (availError) throw availError;

      // Récupérer les réservations confirmées pour cette date
      const { data: confirmedBookings, error: bookingError } = await supabase
        .from('new_reservations')
        .select('scheduled_at')
        .eq('stylist_user_id', stylistId)
        .eq('status', 'confirmed')
        .gte('scheduled_at', `${dateStr}T00:00:00`)
        .lt('scheduled_at', `${dateStr}T23:59:59`);

      if (bookingError) throw bookingError;

      // Générer les créneaux avec leur statut
      const defaultSlots = generateDefaultSlots();
      const today = new Date();
      const isToday = isSameDay(date, today);
      const currentTime = new Date();

      const slotsWithStatus: TimeSlot[] = defaultSlots.map(time => {
        const [hours, minutes] = time.split(':').map(Number);
        const slotDateTime = new Date(date);
        slotDateTime.setHours(hours, minutes, 0, 0);

        let available = true;
        let unavailable = false;
        let booked = false;

        // Si c'est aujourd'hui, vérifier si le créneau est dans le passé
        if (isToday && slotDateTime <= currentTime) {
          available = false;
        }

        // Vérifier si le créneau est marqué comme indisponible par le coiffeur
        const isUnavailable = unavailableSlots?.some(slot => {
          const startTime = parseISO(slot.start_at);
          const endTime = parseISO(slot.end_at);
          return slotDateTime >= startTime && slotDateTime < endTime;
        });

        if (isUnavailable) {
          available = false;
          unavailable = true;
        }

        // Vérifier si le créneau est occupé par une réservation confirmée
        const isBooked = confirmedBookings?.some(booking => {
          const bookingTime = parseISO(booking.scheduled_at);
          return isSameDay(bookingTime, slotDateTime) && 
                 bookingTime.getHours() === hours && 
                 bookingTime.getMinutes() === minutes;
        });

        if (isBooked) {
          available = false;
          booked = true;
        }

        return {
          time,
          available,
          unavailable,
          booked
        };
      });

      setTimeSlots(slotsWithStatus);
    } catch (error) {
      console.error('Error fetching availability data:', error);
      setTimeSlots([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedDate) {
      fetchAvailabilityData(selectedDate);
    }
  }, [stylistId, selectedDate]);

  return {
    timeSlots,
    loading,
    refetch: () => selectedDate && fetchAvailabilityData(selectedDate)
  };
};