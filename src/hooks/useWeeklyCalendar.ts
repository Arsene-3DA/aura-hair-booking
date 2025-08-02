import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { format, startOfWeek, endOfWeek } from 'date-fns';

export interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  type: 'booking' | 'availability';
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

      // Fetch bookings
      console.log('🔍 Fetching bookings...');
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

      console.log('✅ Bookings fetched:', bookings?.length || 0, 'items');

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
      console.log('📊 Raw availabilities:', availabilities);

      // Transform to calendar events
      const calendarEvents: CalendarEvent[] = [
        ...(bookings || []).map(booking => ({
          id: booking.id,
          title: `${booking.client_name} - ${booking.service}`,
          start: booking.scheduled_at,
          end: booking.scheduled_at, // Add duration logic here
          type: 'booking' as const,
          status: booking.status,
          client_name: booking.client_name,
        })),
        ...(availabilities || []).map(avail => ({
          id: avail.id,
          title: avail.status === 'available' ? 'Disponible' : 'Occupé',
          start: avail.start_at,
          end: avail.end_at,
          type: 'availability' as const,
          status: avail.status,
        })),
      ];

      console.log('📅 Final calendar events:', calendarEvents?.length || 0, 'items');
      console.log('🎯 Calendar events detail:', calendarEvents);
      setEvents(calendarEvents);
    } catch (error) {
      console.error('💥 Error fetching weekly data:', error);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeeklyData();
  }, [stylistId, selectedWeek]);

  return {
    events,
    loading,
    refetch: fetchWeeklyData,
  };
};