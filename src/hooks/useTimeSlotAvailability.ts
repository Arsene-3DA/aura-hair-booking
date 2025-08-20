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

  // Generate slots based on stylist working hours using new public functions
  const generateSlotsFromWorkingHours = async (date: Date, hairdresserId: string) => {
    try {
      // Utiliser la nouvelle fonction de disponibilité
      const dateStr = format(date, 'yyyy-MM-dd');
      const { data: availabilityData, error } = await supabase
        .rpc('get_professional_availability_by_id', {
          hairdresser_id: hairdresserId,
          check_date: dateStr
        });

      if (!error && availabilityData && availabilityData.length > 0) {
        return availabilityData.map((slot: any) => ({
          time: slot.time_slot,
          available: slot.is_available,
        }));
      }

      // Fallback: utiliser l'ancienne méthode avec RPC
      const { data: professionalData, error: profError } = await supabase
        .rpc('get_professional_by_auth_id', { auth_user_id: stylistId });

      if (profError || !professionalData?.[0]?.working_hours) {
        console.log('⚠️ No working hours found, using default slots');
        return generateDefaultTimeSlots();
      }

      const dayOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][date.getDay()];
      const workingHours = professionalData[0].working_hours[dayOfWeek];

      if (!workingHours?.isOpen) {
        return []; // Salon fermé ce jour
      }

      const slots: TimeSlot[] = [];
      const [openHour, openMinute] = (workingHours.open || '09:00').split(':').map(Number);
      const [closeHour, closeMinute] = (workingHours.close || '18:00').split(':').map(Number);
      
      const startTime = openHour * 60 + openMinute;
      const endTime = closeHour * 60 + closeMinute;
      
      for (let time = startTime; time < endTime; time += 30) {
        const hour = Math.floor(time / 60);
        const minute = time % 60;
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        
        slots.push({
          time: timeString,
          available: true,
        });
      }
      
      return slots;
    } catch (error) {
      console.error('Error generating slots from working hours:', error);
      return generateDefaultTimeSlots();
    }
  };

  // Créneaux par défaut: 9h à 18h par pas de 30min
  const generateDefaultTimeSlots = (): TimeSlot[] => {
    const slots: TimeSlot[] = [];
    for (let hour = 9; hour <= 18; hour++) {
      if (hour === 18) break; // S'arrêter à 18h
      slots.push(
        { time: `${hour.toString().padStart(2, '0')}:00`, available: true },
        { time: `${hour.toString().padStart(2, '0')}:30`, available: true }
      );
    }
    return slots;
  };

  const fetchAvailabilityData = async (date: Date) => {
    if (!stylistId) return;

    try {
      setLoading(true);
      const dateStr = format(date, 'yyyy-MM-dd');
      
      // D'abord, essayer de récupérer l'ID du hairdresser pour ce stylist
      const { data: professionalData } = await supabase
        .rpc('get_professional_by_auth_id', { auth_user_id: stylistId });

      let hairdresserId = null;
      if (professionalData && professionalData.length > 0) {
        hairdresserId = professionalData[0].id;
      }

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

      // Générer les créneaux basés sur les horaires du salon
      const workingSlots = hairdresserId 
        ? await generateSlotsFromWorkingHours(date, hairdresserId)
        : await generateSlotsFromWorkingHours(date, stylistId); // fallback
        
      if (workingSlots.length === 0) {
        setTimeSlots([]);
        return;
      }
      const today = new Date();
      const isToday = isSameDay(date, today);
      const currentTime = new Date();

      const slotsWithStatus: TimeSlot[] = workingSlots.map(slot => {
        const time = slot.time;
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