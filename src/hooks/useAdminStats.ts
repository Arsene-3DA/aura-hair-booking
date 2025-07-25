import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface AdminStats {
  totalBookingsToday: number;
  totalUsers: number;
  totalRevenue: number;
  pendingBookings: number;
  bookingsLastWeek: Array<{ date: string; count: number }>;
  usersByRole: Array<{ role: string; count: number }>;
  revenueLastMonth: Array<{ date: string; revenue: number }>;
  loading: boolean;
  error: string | null;
}

export const useAdminStats = (): AdminStats => {
  const [stats, setStats] = useState<AdminStats>({
    totalBookingsToday: 0,
    totalUsers: 0,
    totalRevenue: 0,
    pendingBookings: 0,
    bookingsLastWeek: [],
    usersByRole: [],
    revenueLastMonth: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setStats(prev => ({ ...prev, loading: true, error: null }));
        
        const today = new Date().toISOString().split('T')[0];
        const lastWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        const lastMonth = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

        // Get today's bookings
        const { data: todayBookings, error: todayError } = await supabase
          .from('bookings')
          .select('id, status')
          .eq('booking_date', today);

        if (todayError) {
          console.error('Error fetching today bookings:', todayError);
          throw todayError;
        }

        // Get total users from profiles table (contains all users)
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, role');

        if (profilesError) {
          console.error('Error fetching users from profiles:', profilesError);
          throw profilesError;
        }

        // Get pending bookings
        const { data: pendingBookings, error: pendingError } = await supabase
          .from('bookings')
          .select('id, status')
          .eq('status', 'pending');

        if (pendingError) {
          console.error('Error fetching pending bookings:', pendingError);
          throw pendingError;
        }

        // Get bookings for last week (grouped by date)
        const { data: weekBookings, error: weekError } = await supabase
          .from('bookings')
          .select('booking_date, status')
          .gte('booking_date', lastWeek);

        if (weekError) {
          console.error('Error fetching week bookings:', weekError);
          throw weekError;
        }

        // Process bookings by date
        const bookingsByDate = weekBookings?.reduce((acc: Record<string, number>, booking) => {
          acc[booking.booking_date] = (acc[booking.booking_date] || 0) + 1;
          return acc;
        }, {}) || {};

        const bookingsLastWeek = Object.entries(bookingsByDate).map(([date, count]) => ({
          date,
          count: count as number,
        }));

        // Process users by role using profiles data
        const usersByRole = profiles?.reduce((acc: Record<string, number>, user) => {
          acc[user.role] = (acc[user.role] || 0) + 1;
          return acc;
        }, {}) || {};

        const userRoleStats = Object.entries(usersByRole).map(([role, count]) => ({
          role,
          count: count as number,
        }));

        // Mock revenue data (in real app, would have pricing table)
        const revenueLastMonth = Array.from({ length: 7 }, (_, i) => {
          const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
          return {
            date,
            revenue: Math.floor(Math.random() * 1000) + 500, // Mock data
          };
        }).reverse();

        setStats({
          totalBookingsToday: todayBookings?.length || 0,
          totalUsers: profiles?.length || 0,
          totalRevenue: revenueLastMonth.reduce((sum, day) => sum + day.revenue, 0),
          pendingBookings: pendingBookings?.length || 0,
          bookingsLastWeek,
          usersByRole: userRoleStats,
          revenueLastMonth,
          loading: false,
          error: null,
        });

        console.log('Admin stats updated:', {
          totalBookingsToday: todayBookings?.length || 0,
          totalUsers: profiles?.length || 0,
          pendingBookings: pendingBookings?.length || 0,
          usersByRole: userRoleStats
        });

      } catch (error) {
        console.error('Error fetching admin stats:', error);
        setStats(prev => ({
          ...prev,
          loading: false,
          error: error instanceof Error ? error.message : 'Erreur inconnue',
        }));
      }
    };

    fetchStats();

    // Set up real-time subscription for stats updates
    const channel = supabase
      .channel('admin-stats')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, (payload) => {
        console.log('Booking change detected, refreshing admin stats. Payload:', payload);
        fetchStats();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, (payload) => {
        console.log('Profile change detected, refreshing admin stats. Payload:', payload);
        fetchStats();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return stats;
};