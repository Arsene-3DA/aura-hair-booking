import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface WelcomeData {
  user_name: string;
  recent_actions: Array<{
    id: string;
    type: 'booking' | 'review' | 'notification';
    message: string;
    created_at: string;
  }>;
  stats: {
    total_bookings: number;
    pending_reviews: number;
    unread_notifications: number;
  };
}

export const useWelcomeData = (uid?: string) => {
  const [data, setData] = useState<WelcomeData | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchWelcomeData = async () => {
    if (!uid) return;

    try {
      setLoading(true);

      // Récupérer le profil utilisateur
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('user_id', uid)
        .single();

      // Récupérer les réservations récentes
      const { data: recentBookings } = await supabase
        .from('bookings')
        .select('id, service, created_at, status')
        .eq('client_id', uid)
        .order('created_at', { ascending: false })
        .limit(2);

      // Récupérer les notifications récentes
      const { data: recentNotifications } = await supabase
        .from('notifications')
        .select('id, title, created_at, is_read')
        .eq('user_id', uid)
        .order('created_at', { ascending: false })
        .limit(1);

      // Construire les actions récentes
      const recent_actions = [
        ...(recentBookings || []).map(booking => ({
          id: booking.id,
          type: 'booking' as const,
          message: `Réservation ${booking.service} - ${booking.status}`,
          created_at: booking.created_at
        })),
        ...(recentNotifications || []).map(notif => ({
          id: notif.id,
          type: 'notification' as const,
          message: notif.title,
          created_at: notif.created_at
        }))
      ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
       .slice(0, 3);

      // Compter les statistiques
      const { count: totalBookings } = await supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true })
        .eq('client_id', uid);

      const { count: unreadNotifications } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', uid)
        .eq('is_read', false);

      // Compter les avis en attente (bookings completed sans review)
      const { data: completedBookings } = await supabase
        .from('bookings')
        .select(`
          id,
          reviews!left(id)
        `)
        .eq('client_id', uid)
        .eq('status', 'completed');

      const pendingReviews = completedBookings?.filter(
        booking => !booking.reviews || (Array.isArray(booking.reviews) && booking.reviews.length === 0)
      ).length || 0;

      setData({
        user_name: profile?.full_name || 'Client',
        recent_actions,
        stats: {
          total_bookings: totalBookings || 0,
          pending_reviews: pendingReviews,
          unread_notifications: unreadNotifications || 0
        }
      });
    } catch (error) {
      console.error('Error fetching welcome data:', error);
      toast({
        title: "❌ Erreur",
        description: "Impossible de charger les données d'accueil",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWelcomeData();

    // Configuration des mises à jour temps réel
    if (!uid) return;

    console.log('🔄 Setting up real-time updates for client dashboard:', uid);

    const channel = supabase
      .channel(`client-dashboard-${uid}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'new_reservations',
          filter: `client_user_id=eq.${uid}`,
        },
        () => {
          console.log('📡 Client reservations updated, refreshing dashboard');
          fetchWelcomeData();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${uid}`,
        },
        () => {
          console.log('📡 Client notifications updated, refreshing dashboard');
          fetchWelcomeData();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'reviews',
          filter: `client_id=eq.${uid}`,
        },
        () => {
          console.log('📡 Client reviews updated, refreshing dashboard');
          fetchWelcomeData();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles',
          filter: `user_id=eq.${uid}`,
        },
        (payload) => {
          console.log('📡 Client profile updated:', payload);
          fetchWelcomeData();
        }
      )
      .subscribe();

    return () => {
      console.log('🧹 Cleaning up client dashboard real-time sync');
      supabase.removeChannel(channel);
    };
  }, [uid]);

  return {
    data,
    loading,
    refetch: fetchWelcomeData
  };
};