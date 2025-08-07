import { useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useRoleAuth } from '@/hooks/useRoleAuth';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

export const useRealtimeRoleSync = () => {
  const { user, userRole, loadUserProfile } = useRoleAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Gérer les changements de rôle en temps réel avec redirection automatique
  const handleRoleChange = useCallback(async () => {
    if (!user) return;
    
    // Recharger le profil pour obtenir le nouveau rôle
    await loadUserProfile();
    
    // Afficher une notification
    toast({
      title: '🔄 Rôle mis à jour',
      description: 'Votre rôle a été modifié. Redirection automatique...',
    });
    
    // Attendre un peu que le profil soit rechargé, puis naviguer
    setTimeout(async () => {
      try {
        // Recharger encore une fois pour s'assurer d'avoir le bon rôle
        await loadUserProfile();
        
        // Récupérer le nouveau rôle depuis le profil
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('user_id', user.id)
          .single();
        
        if (profile?.role) {
          // Rediriger selon le nouveau rôle
          switch (profile.role) {
            case 'admin':
              navigate('/admin', { replace: true });
              break;
            case 'coiffeur':
            case 'coiffeuse':
            case 'cosmetique':
              navigate('/stylist', { replace: true });
              break;
            case 'client':
            default:
              navigate('/app', { replace: true });
              break;
          }
        }
      } catch (error) {
        console.error('Erreur lors de la redirection automatique:', error);
        // Fallback vers la page d'accueil
        navigate('/', { replace: true });
      }
    }, 1000);
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