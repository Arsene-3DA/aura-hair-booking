import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export type UserRole = 'client' | 'coiffeur' | 'coiffeuse' | 'cosmetique' | 'admin';

interface RoleChangeResult {
  success: boolean;
  message?: string;
  error?: string;
  oldRole?: string;
  newRole?: string;
  old_role?: string; // Backward compatibility
  new_role?: string; // Backward compatibility
}

export const useDynamicRoleManagement = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Fonction pour créer automatiquement un profil professionnel
  const createProfessionalProfile = async (targetUserId: string, newRole: UserRole) => {
    try {
      // Vérifier si un profil existe déjà
      const { data: existingProfile } = await supabase
        .from('hairdressers')
        .select('id')
        .eq('auth_id', targetUserId)
        .single();

      if (existingProfile) {
        console.log('Profil professionnel existe déjà');
        return;
      }

      // Récupérer les infos utilisateur
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('user_id', targetUserId)
        .single();

      // Créer le profil professionnel
      await supabase
        .from('hairdressers')
        .insert({
          auth_id: targetUserId,
          name: profile?.full_name || 'Nouveau professionnel',
          email: '', // sera rempli par le professionnel
          gender: newRole === 'coiffeuse' ? 'femme' : 'homme',
          is_active: true,
          rating: 5.0
        });

      console.log('Profil professionnel créé avec succès');
    } catch (error) {
      console.error('Erreur lors de la création du profil professionnel:', error);
    }
  };

  const changeUserRole = async (targetUserId: string, newRole: UserRole): Promise<RoleChangeResult> => {
    setLoading(true);
    try {
      // SECURITY FIX: Use the new secure role change function
      const { data, error } = await supabase
        .rpc('secure_change_user_role', {
          target_user_id: targetUserId,
          new_role: newRole
        });

      if (error) {
        console.error('Erreur changement de rôle:', error);
        throw error;
      }

      const result = (data as unknown) as RoleChangeResult;
      
      if (result.success) {
        toast({
          title: '✅ Rôle modifié',
          description: `Rôle changé de ${result.oldRole || 'inconnu'} vers ${result.newRole || newRole}`,
        });
        
        // Déclencher un événement personnalisé pour les mises à jour en temps réel
        window.dispatchEvent(new CustomEvent('userRoleChanged', {
          detail: { userId: targetUserId, newRole, oldRole: result.oldRole || result.old_role }
        }));
        
        // Déclencher également un événement pour rafraîchir les listes de professionnels
        window.dispatchEvent(new CustomEvent('refreshProfessionals', {
          detail: { userId: targetUserId, newRole, oldRole: result.oldRole || result.old_role }
        }));

        // Créer automatiquement le profil professionnel si nécessaire
        if (['coiffeur', 'coiffeuse', 'cosmetique'].includes(newRole)) {
          await createProfessionalProfile(targetUserId, newRole);
        }

        // Envoyer une notification à l'utilisateur cible
        await supabase
          .from('notifications')
          .insert({
            user_id: targetUserId,
            title: 'Changement de rôle',
            body: `Votre rôle a été modifié en ${newRole}. Reconnectez-vous pour voir les changements.`,
          });
        
        return result;
      } else {
        throw new Error(result.error || 'Erreur inconnue');
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Erreur lors du changement de rôle';
      toast({
        title: '❌ Erreur',
        description: errorMessage,
        variant: 'destructive',
      });
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const batchChangeRoles = async (changes: Array<{ userId: string; newRole: UserRole }>) => {
    setLoading(true);
    const results = [];
    
    for (const change of changes) {
      const result = await changeUserRole(change.userId, change.newRole);
      results.push({ ...change, result });
    }
    
    const successCount = results.filter(r => r.result.success).length;
    const failCount = results.length - successCount;
    
    toast({
      title: `Changements terminés`,
      description: `${successCount} succès, ${failCount} échecs`,
      variant: failCount > 0 ? 'destructive' : 'default',
    });
    
    setLoading(false);
    return results;
  };

  const getRolePermissions = (role: UserRole) => {
    const permissions = {
      client: {
        canBook: true,
        canManageProfile: true,
        canViewBookings: true,
        canReview: true,
        canChat: true,
      },
      coiffeur: {
        canBook: true,
        canManageProfile: true,
        canViewBookings: true,
        canReview: true,
        canChat: true,
        canManageSchedule: true,
        canViewClientInfo: true,
        canManageServices: true,
        canViewEarnings: true,
      },
      coiffeuse: {
        canBook: true,
        canManageProfile: true,
        canViewBookings: true,
        canReview: true,
        canChat: true,
        canManageSchedule: true,
        canViewClientInfo: true,
        canManageServices: true,
        canViewEarnings: true,
      },
      cosmetique: {
        canBook: true,
        canManageProfile: true,
        canViewBookings: true,
        canReview: true,
        canChat: true,
        canManageSchedule: true,
        canViewClientInfo: true,
        canManageServices: true,
        canViewEarnings: true,
      },
      admin: {
        canBook: true,
        canManageProfile: true,
        canViewBookings: true,
        canReview: true,
        canChat: true,
        canManageSchedule: true,
        canViewClientInfo: true,
        canManageServices: true,
        canViewEarnings: true,
        canManageUsers: true,
        canViewAnalytics: true,
        canManageSystem: true,
        canViewLogs: true,
      }
    };
    
    return permissions[role] || permissions.client;
  };

  const canPerformAction = (userRole: UserRole, action: string): boolean => {
    const permissions = getRolePermissions(userRole);
    return (permissions as any)[action] || false;
  };

  return {
    changeUserRole,
    batchChangeRoles,
    getRolePermissions,
    canPerformAction,
    loading,
  };
};