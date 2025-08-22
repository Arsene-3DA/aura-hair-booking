import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { format, parseISO, isSameDay } from 'date-fns';
import { formatTimeToFrench } from '@/utils/timeFormatter';

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
  console.log('🕒 useTimeSlotAvailability - Start:', { stylistId, selectedDate: selectedDate?.toISOString() });
  const generateSlotsFromWorkingHours = async (date: Date, hairdresserId: string) => {
    try {
      // Utiliser la nouvelle fonction de disponibilité publique
      const dateStr = format(date, 'yyyy-MM-dd');
      console.log('🔍 Trying public availability function with auth_id:', hairdresserId);
      
      const { data: availabilityData, error } = await supabase
        .rpc('get_public_professional_availability', {
          professional_auth_id: hairdresserId,
          check_date: dateStr
        });

      console.log('📊 Public availability result:', { availabilityData, error });

      if (!error && availabilityData && availabilityData.length > 0) {
        return availabilityData.map((slot: any) => ({
          time: formatTimeToFrench(slot.time_slot),
          available: slot.is_available,
        }));
      }

      // Fallback: utiliser l'ancienne méthode avec RPC
      console.log('🔄 Falling back to old method');
      const { data: professionalData, error: profError } = await supabase
        .rpc('get_professional_by_auth_id', { auth_user_id: hairdresserId });

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
          time: formatTimeToFrench(timeString),
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
        { time: formatTimeToFrench(`${hour.toString().padStart(2, '0')}:00`), available: true },
        { time: formatTimeToFrench(`${hour.toString().padStart(2, '0')}:30`), available: true }
      );
    }
    return slots;
  };

  const fetchAvailabilityData = async (date: Date) => {
    console.log('🕒 fetchAvailabilityData - Start:', { stylistId, date: date.toISOString() });
    
    if (!stylistId) {
      console.log('❌ No stylistId provided');
      setTimeSlots([]);
      return;
    }

    try {
      setLoading(true);
      const dateStr = format(date, 'yyyy-MM-dd');
      
      // D'abord, vérifier si le professionnel est actif et publié
      const { data: professionalCheck } = await supabase
        .from('hairdressers')
        .select('id, is_active')
        .eq('auth_id', stylistId)
        .eq('is_active', true)
        .single();

      if (!professionalCheck) {
        console.log('❌ Professional not found or inactive:', { stylistId, professionalCheck });
        setTimeSlots([]); // Professionnel non actif ou non publié
        return;
      }

      // Récupérer les données du professionnel
      const { data: professionalData } = await supabase
        .rpc('get_professional_by_auth_id', { auth_user_id: stylistId });

      let hairdresserId = professionalCheck.id;
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
        console.log('❌ No working slots generated for date:', { date, hairdresserId });
        setTimeSlots([]);
        return;
      }
      const today = new Date();
      const isToday = isSameDay(date, today);
      const currentTime = new Date();

      // Récupérer aussi les réservations en attente pour éviter les conflits
      const { data: pendingBookings, error: pendingError } = await supabase
        .from('new_reservations')
        .select('scheduled_at')
        .eq('stylist_user_id', stylistId)
        .eq('status', 'pending')
        .gte('scheduled_at', `${dateStr}T00:00:00`)
        .lt('scheduled_at', `${dateStr}T23:59:59`);

      if (pendingError) throw pendingError;

      const slotsWithStatus: TimeSlot[] = workingSlots.map(slot => {
        const time = slot.time;
        // Parser le format "10h00" pour extraire les heures et minutes
        const match = time.match(/(\d+)h(\d+)/);
        if (!match) return slot; // Fallback si le format n'est pas reconnu
        
        const hours = parseInt(match[1], 10);
        const minutes = parseInt(match[2], 10);
        const slotDateTime = new Date(date);
        slotDateTime.setHours(hours, minutes, 0, 0);

        let available = true;
        let unavailable = false;
        let booked = false;

        // Si c'est aujourd'hui, vérifier si le créneau est dans le passé
        // Ajouter un buffer de 30 minutes pour permettre les réservations de dernière minute
        if (isToday) {
          const bufferTime = new Date(currentTime);
          bufferTime.setMinutes(bufferTime.getMinutes() + 30);
          
          if (slotDateTime <= bufferTime) {
            available = false;
          }
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
        const isConfirmedBooking = confirmedBookings?.some(booking => {
          const bookingTime = parseISO(booking.scheduled_at);
          return isSameDay(bookingTime, slotDateTime) && 
                 bookingTime.getHours() === hours && 
                 bookingTime.getMinutes() === minutes;
        });

        if (isConfirmedBooking) {
          available = false;
          booked = true;
        }

        // Empêcher la double-réservation en vérifiant aussi les réservations pending
        const isPendingBooking = pendingBookings?.some(booking => {
          const bookingTime = parseISO(booking.scheduled_at);
          return isSameDay(bookingTime, slotDateTime) && 
                 bookingTime.getHours() === hours && 
                 bookingTime.getMinutes() === minutes;
        });

        if (isPendingBooking) {
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

      console.log('✅ Time slots generated:', { 
        totalSlots: slotsWithStatus.length, 
        availableSlots: slotsWithStatus.filter(s => s.available).length,
        date: dateStr
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

  // Écouter les modifications en temps réel des horaires du professionnel
  useEffect(() => {
    if (!stylistId) return;

    console.log('🔄 Setting up real-time subscription for stylist:', stylistId);
    
    const channel = supabase
      .channel('stylist-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'hairdressers',
          filter: `auth_id=eq.${stylistId}`
        },
        (payload) => {
          console.log('🔄 Working hours updated for stylist:', payload);
          if (selectedDate) {
            fetchAvailabilityData(selectedDate);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'availabilities',
          filter: `stylist_id=eq.${stylistId}`
        },
        (payload) => {
          console.log('🔄 Availability updated for stylist:', payload);
          if (selectedDate) {
            fetchAvailabilityData(selectedDate);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'new_reservations',
          filter: `stylist_user_id=eq.${stylistId}`
        },
        (payload) => {
          console.log('🔄 Reservation updated for stylist:', payload);
          if (selectedDate) {
            fetchAvailabilityData(selectedDate);
          }
        }
      )
      .subscribe();

    return () => {
      console.log('🔄 Cleaning up subscription for stylist:', stylistId);
      supabase.removeChannel(channel);
    };
  }, [stylistId]);

  return {
    timeSlots,
    loading,
    refetch: () => selectedDate && fetchAvailabilityData(selectedDate)
  };
};