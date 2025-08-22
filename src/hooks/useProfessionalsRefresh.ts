import { useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

/**
 * Hook pour rafraîchir automatiquement les listes de professionnels
 * quand les rôles changent
 */
export const useProfessionalsRefresh = (refetchFunction?: () => void) => {
  const handleRefresh = useCallback(() => {
    if (refetchFunction) {
      console.log('🔄 Rafraîchissement des professionnels déclenché');
      refetchFunction();
    }
  }, [refetchFunction]);

  // Écouter les événements personnalisés
  useEffect(() => {
    const handleRefreshEvent = (event: CustomEvent) => {
      console.log('🔄 Événement refresh reçu:', event.detail);
      handleRefresh();
    };

    window.addEventListener('refreshProfessionals', handleRefreshEvent as EventListener);
    window.addEventListener('userRoleChanged', handleRefreshEvent as EventListener);
    
    return () => {
      window.removeEventListener('refreshProfessionals', handleRefreshEvent as EventListener);
      window.removeEventListener('userRoleChanged', handleRefreshEvent as EventListener);
    };
  }, [handleRefresh]);

  // Écouter les changements en temps réel dans la table profiles
  useEffect(() => {
    const channel = supabase
      .channel('professionals-refresh')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
        },
        (payload) => {
          console.log('👥 Profil mis à jour:', payload);
          const oldRole = payload.old?.role;
          const newRole = payload.new?.role;
          
          // Si le rôle change vers ou depuis un rôle professionnel
          const professionalRoles = ['coiffeur', 'coiffeuse', 'cosmetique'];
          if (
            (professionalRoles.includes(oldRole) || professionalRoles.includes(newRole)) &&
            oldRole !== newRole
          ) {
            console.log('🔄 Changement de rôle professionnel détecté');
            setTimeout(handleRefresh, 500); // Délai pour laisser le temps aux données de se synchroniser
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [handleRefresh]);

  // Écouter les changements dans la table hairdressers
  useEffect(() => {
    const channel = supabase
      .channel('hairdressers-refresh')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'hairdressers',
        },
        (payload) => {
          console.log('💇 Table hairdressers mise à jour:', payload);
          setTimeout(handleRefresh, 300);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [handleRefresh]);

  return { refreshProfessionals: handleRefresh };
};