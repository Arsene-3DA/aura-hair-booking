import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

export interface StylistStats {
  totalToday: number;
  confirmed: number;
  pending: number;
  noShow30d: number;
  loading: boolean;
  error: string | null;
}

export const useStylistStats = (stylistId?: string): StylistStats => {
  const [stats, setStats] = useState<StylistStats>({
    totalToday: 0,
    confirmed: 0,
    pending: 0,
    noShow30d: 0,
    loading: true,
    error: null,
  });

  useEffect(() => {
    if (!stylistId) {
      setStats(prev => ({ ...prev, loading: false }));
      return;
    }

    let isMounted = true;

    const fetchStats = async () => {
      try {
        if (!isMounted) return;
        setStats(prev => ({ ...prev, loading: true, error: null }));
        
        const today = format(new Date(), 'yyyy-MM-dd');
        const thirtyDaysAgo = format(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd');

        // Get today's bookings
        const { data: todayBookings, error: todayError } = await supabase
          .from('bookings')
          .select('status')
          .eq('hairdresser_id', stylistId)
          .eq('booking_date', today);

        if (todayError) throw todayError;

        // Get no-shows from last 30 days
        const { data: noShowBookings, error: noShowError } = await supabase
          .from('bookings')
          .select('id')
          .eq('hairdresser_id', stylistId)
          .eq('status', 'declined')
          .gte('booking_date', thirtyDaysAgo);

        if (noShowError) throw noShowError;

        const totalToday = todayBookings?.length || 0;
        const confirmed = todayBookings?.filter(b => b.status === 'confirmed').length || 0;
        const pending = todayBookings?.filter(b => b.status === 'pending').length || 0;
        const noShow30d = noShowBookings?.length || 0;

        if (isMounted) {
          setStats({
            totalToday,
            confirmed,
            pending,
            noShow30d,
            loading: false,
            error: null,
          });
        }

      } catch (error) {
        console.error('Error fetching stylist stats:', error);
        if (isMounted) {
          setStats(prev => ({
            ...prev,
            loading: false,
            error: error instanceof Error ? error.message : 'Erreur inconnue',
          }));
        }
      }
    };

    fetchStats();

    // Set up real-time subscription for today's bookings
    const channel = supabase
      .channel(`stylist-stats-${stylistId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookings',
          filter: `hairdresser_id=eq.${stylistId}`,
        },
        () => {
          if (isMounted) {
            console.log('Booking change detected, refreshing stats');
            fetchStats();
          }
        }
      )
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, [stylistId]);

  return stats;
};