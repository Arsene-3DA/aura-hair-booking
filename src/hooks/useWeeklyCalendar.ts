import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { format, startOfWeek, endOfWeek, addMinutes } from 'date-fns';

export interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  type: 'booking' | 'availability' | 'reservation';
  status?: string;
  client_name?: string;
}

export const useWeeklyCalendar = (stylistId?: string, selectedWeek: Date = new Date()) => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWeeklyData = async () => {
    if (!stylistId) {
      console.log('❌ No stylistId provided to useWeeklyCalendar');
      return;
    }

    console.log('📅 Fetching weekly calendar data for:', { stylistId, selectedWeek });
    
    try {
      setLoading(true);
      const weekStart = startOfWeek(selectedWeek, { weekStartsOn: 1 });
      const weekEnd = endOfWeek(selectedWeek, { weekStartsOn: 1 });

      console.log('📅 Week range:', { weekStart, weekEnd });

      // Fetch new reservations (clients bookings)
      console.log('🔍 Fetching client reservations...');
      const { data: reservations, error: reservationsError } = await supabase
        .from('new_reservations')
        .select(`
          *
        `)
        .eq('stylist_user_id', stylistId)
        .gte('scheduled_at', weekStart.toISOString())
        .lte('scheduled_at', weekEnd.toISOString());

      if (reservationsError) {
        console.error('❌ Reservations error:', reservationsError);
        throw reservationsError;
      }

      console.log('✅ Reservations fetched:', reservations?.length || 0, 'items');

      // Fetch client profiles for reservations
      const clientIds = [...new Set(reservations?.map(r => r.client_user_id).filter(Boolean) || [])];
      const { data: clientProfiles } = await supabase
        .from('profiles')
        .select('user_id, full_name')
        .in('user_id', clientIds);

      // Fetch services for reservations
      const serviceIds = [...new Set(reservations?.map(r => r.service_id).filter(Boolean) || [])];
      const { data: services } = await supabase
        .from('services')
        .select('id, name, duration')
        .in('id', serviceIds);

      console.log('✅ Client profiles fetched:', clientProfiles?.length || 0, 'items');
      console.log('✅ Services fetched:', services?.length || 0, 'items');

      // Fetch old bookings for compatibility
      console.log('🔍 Fetching legacy bookings...');
      const { data: bookings, error: bookingsError } = await supabase
        .from('bookings')
        .select('*')
        .eq('stylist_id', stylistId)
        .gte('scheduled_at', weekStart.toISOString())
        .lte('scheduled_at', weekEnd.toISOString());

      if (bookingsError) {
        console.error('❌ Bookings error:', bookingsError);
        throw bookingsError;
      }

      console.log('✅ Legacy bookings fetched:', bookings?.length || 0, 'items');

      // Fetch availabilities
      console.log('🔍 Fetching availabilities...');
      const { data: availabilities, error: availError } = await supabase
        .from('availabilities')
        .select('*')
        .eq('stylist_id', stylistId)
        .gte('start_at', weekStart.toISOString())
        .lte('end_at', weekEnd.toISOString());

      if (availError) {
        console.error('❌ Availabilities error:', availError);
        throw availError;
      }

      console.log('✅ Availabilities fetched:', availabilities?.length || 0, 'items');

      // Transform to calendar events
      const calendarEvents: CalendarEvent[] = [
        // New reservations (clients bookings)
        ...(reservations || []).map(reservation => {
          const service = services?.find(s => s.id === reservation.service_id);
          const client = clientProfiles?.find(c => c.user_id === reservation.client_user_id);
          const duration = service?.duration || 60; // Default 60 minutes
          const startDate = new Date(reservation.scheduled_at);
          const endDate = addMinutes(startDate, duration);
          
          return {
            id: reservation.id,
            title: `${client?.full_name || 'Client'} - ${service?.name || 'Service'}`,
            start: reservation.scheduled_at,
            end: endDate.toISOString(),
            type: 'reservation' as const,
            status: reservation.status,
            client_name: client?.full_name,
          };
        }),
        // Legacy bookings
        ...(bookings || []).map(booking => ({
          id: booking.id,
          title: `${booking.client_name} - ${booking.service}`,
          start: booking.scheduled_at,
          end: booking.scheduled_at, // Add duration logic here
          type: 'booking' as const,
          status: booking.status,
          client_name: booking.client_name,
        })),
        // Availabilities (stylist set slots)
        ...(availabilities || []).map(avail => ({
          id: avail.id,
          title: avail.status === 'available' ? 'Disponible' : 'Bloqué',
          start: avail.start_at,
          end: avail.end_at,
          type: 'availability' as const,
          status: avail.status,
        })),
      ];

      console.log('📅 Final calendar events:', calendarEvents?.length || 0, 'items');
      setEvents(calendarEvents);
    } catch (error) {
      console.error('💥 Error fetching weekly data:', error);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  // SYNCHRONISATION TEMPS RÉEL
  useEffect(() => {
    if (!stylistId) return;

    console.log('🔄 Setting up real-time subscriptions for stylist:', stylistId);

    // Channel pour les nouvelles réservations
    const reservationsChannel = supabase
      .channel('stylist-reservations')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'new_reservations',
          filter: `stylist_user_id=eq.${stylistId}`,
        },
        (payload) => {
          console.log('🔄 Real-time reservation update:', payload);
          fetchWeeklyData(); // Refresh data when reservations change
        }
      )
      .subscribe();

    // Channel pour les disponibilités
    const availabilitiesChannel = supabase
      .channel('stylist-availabilities')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'availabilities',
          filter: `stylist_id=eq.${stylistId}`,
        },
        (payload) => {
          console.log('🔄 Real-time availability update:', payload);
          fetchWeeklyData(); // Refresh data when availabilities change
        }
      )
      .subscribe();

    // Initial fetch
    fetchWeeklyData();

    // Cleanup subscriptions
    return () => {
      console.log('🧹 Cleaning up real-time subscriptions');
      supabase.removeChannel(reservationsChannel);
      supabase.removeChannel(availabilitiesChannel);
    };
  }, [stylistId, selectedWeek]);

  return {
    events,
    loading,
    refetch: fetchWeeklyData,
  };
};