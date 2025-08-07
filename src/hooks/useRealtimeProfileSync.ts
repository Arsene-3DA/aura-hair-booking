import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface UseRealtimeProfileSyncOptions {
  onProfileUpdate?: (profile: any) => void;
  onServicesUpdate?: (services: any[]) => void;
  onPortfolioUpdate?: (portfolio: any[]) => void;
}

export const useRealtimeProfileSync = (
  expertId?: string,
  options: UseRealtimeProfileSyncOptions = {}
) => {
  useEffect(() => {
    if (!expertId) return;

    console.log('🔄 Setting up real-time profile sync for expert:', expertId);

    // Channel pour les mises à jour du profil principal
    const profileChannel = supabase
      .channel(`profile-sync-${expertId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'hairdressers',
          filter: `auth_id=eq.${expertId}`,
        },
        (payload) => {
          console.log('📡 Profile update received:', payload);
          if (payload.eventType === 'UPDATE' && payload.new) {
            options.onProfileUpdate?.(payload.new);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'services',
        },
        () => {
          console.log('📡 Services table updated, triggering refresh');
          // Trigger services refresh indirectly through the services hook
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'hairdresser_services',
        },
        () => {
          console.log('📡 Hairdresser services updated, triggering refresh');
          // Trigger services refresh indirectly through the services hook
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'portfolio',
          filter: `stylist_id=eq.${expertId}`,
        },
        (payload) => {
          console.log('📡 Portfolio update received:', payload);
          // Portfolio updates are handled by the portfolio hook
        }
      )
      .subscribe();

    return () => {
      console.log('🧹 Cleaning up real-time profile sync');
      supabase.removeChannel(profileChannel);
    };
  }, [expertId, options.onProfileUpdate, options.onServicesUpdate, options.onPortfolioUpdate]);
};