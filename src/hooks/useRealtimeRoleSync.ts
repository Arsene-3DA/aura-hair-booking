import { useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useRoleAuth } from '@/hooks/useRoleAuth';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

export const useRealtimeRoleSync = () => {
  const { user, userRole, loadUserProfile } = useRoleAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Gérer les changements de rôle en temps réel
  const handleRoleChange = useCallback(async () => {
    if (!user) return;
    
    // Recharger le profil pour obtenir le nouveau rôle
    await loadUserProfile();
    
    // Afficher une notification
    toast({
      title: '🔄 Rôle mis à jour',
      description: 'Votre rôle a été modifié. Redirection en cours...',
    });
    
    // Rediriger après un délai avec navigation SPA
    setTimeout(async () => {
      await loadUserProfile();
      // Le userRole sera mis à jour après loadUserProfile, on doit le récupérer différemment
      // Naviguer selon le rôle par défaut ou rafraîchir la page
      window.location.href = '/';
    }, 2000);
  }, [user, loadUserProfile, toast, navigate]);

  // Écouter les changements dans la table profiles
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('user-role-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('Profile updated:', payload);
          // Vérifier si le rôle a changé
          if (payload.new.role !== payload.old?.role) {
            handleRoleChange();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, handleRoleChange]);

  // Écouter les notifications pour ce type de changement
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('user-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const notification = payload.new;
          if (notification.title === 'Changement de rôle') {
            handleRoleChange();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, handleRoleChange]);

  // Écouter les événements personnalisés de changement de rôle
  useEffect(() => {
    const handleCustomRoleChange = (event: CustomEvent) => {
      if (event.detail.userId === user?.id) {
        handleRoleChange();
      }
    };

    window.addEventListener('userRoleChanged', handleCustomRoleChange as EventListener);
    
    return () => {
      window.removeEventListener('userRoleChanged', handleCustomRoleChange as EventListener);
    };
  }, [user, handleRoleChange]);

  return {
    currentRole: userRole,
    syncRole: loadUserProfile,
  };
};