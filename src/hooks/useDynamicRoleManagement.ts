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
}

export const useDynamicRoleManagement = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

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
          description: `Rôle changé de ${result.oldRole} vers ${result.newRole}`,
        });
        
        // Déclencher un événement personnalisé pour les mises à jour en temps réel
        window.dispatchEvent(new CustomEvent('userRoleChanged', {
          detail: { userId: targetUserId, newRole, oldRole: result.oldRole }
        }));
        
        // Déclencher également un événement pour rafraîchir les listes de professionnels
        window.dispatchEvent(new CustomEvent('refreshProfessionals', {
          detail: { userId: targetUserId, newRole, oldRole: result.oldRole }
        }));
        
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