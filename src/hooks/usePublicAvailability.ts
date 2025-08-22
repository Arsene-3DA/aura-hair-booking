import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface AvailabilitySlot {
  time_slot: string;
  is_available: boolean;
  booking_duration: number;
}

interface UsePublicAvailabilityReturn {
  timeSlots: AvailabilitySlot[];
  loading: boolean;
  error: string | null;
  refetch: (date?: Date) => Promise<void>;
}

export const usePublicAvailability = (
  professionalId: string,
  selectedDate?: Date
): UsePublicAvailabilityReturn => {
  const [timeSlots, setTimeSlots] = useState<AvailabilitySlot[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAvailability = async (date?: Date) => {
    if (!professionalId) {
      setTimeSlots([]);
      return;
    }

    const targetDate = date || new Date();
    const dateString = targetDate.toISOString().split('T')[0];

    setLoading(true);
    setError(null);

    try {
      console.log('🔍 Fetching public availability for:', {
        professionalId,
        date: dateString,
        targetDate
      });

      const { data, error: rpcError } = await supabase.rpc(
        'get_public_professional_availability',
        {
          professional_auth_id: professionalId,
          check_date: dateString
        }
      );

      if (rpcError) {
        console.error('❌ Public availability error:', rpcError);
        setError('Erreur lors du chargement des créneaux');
        setTimeSlots([]);
        return;
      }

      console.log('✅ Public availability data:', data);

      // Filtrer les créneaux pour s'assurer qu'ils sont entre 9h et 21h
      const filteredSlots = (data || []).filter((slot: AvailabilitySlot) => {
        const hour = parseInt(slot.time_slot.split(':')[0]);
        return hour >= 9 && hour < 21;
      });

      setTimeSlots(filteredSlots);
    } catch (err) {
      console.error('❌ Fetch availability error:', err);
      setError('Erreur lors du chargement des créneaux');
      setTimeSlots([]);
    } finally {
      setLoading(false);
    }
  };

  const refetch = async (date?: Date) => {
    await fetchAvailability(date);
  };

  useEffect(() => {
    if (professionalId && selectedDate) {
      fetchAvailability(selectedDate);
    } else if (professionalId) {
      fetchAvailability(new Date());
    }
  }, [professionalId, selectedDate]);

  return {
    timeSlots,
    loading,
    error,
    refetch
  };
};