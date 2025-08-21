import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@/hooks/useUsers';

interface UseAdminUsersSecureReturn {
  users: User[];
  loading: boolean;
  error: string | null;
  promoteUser: (userId: string, newRole: string) => Promise<void>;
  suspendUser: (userId: string) => Promise<void>;
  resetPassword: (userId: string) => Promise<void>;
  refetch: () => Promise<void>;
}

export const useAdminUsersSecure = (): UseAdminUsersSecureReturn => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Try using the RPC function first
      try {
        const { data: rpcData, error: rpcError } = await supabase.rpc('get_all_users_for_admin');
        
        if (!rpcError && rpcData) {
          const transformedUsers = rpcData.map((userRecord: any) => ({
            id: userRecord.id,
            auth_id: userRecord.auth_id,
            email: userRecord.email || 'N/A',
            nom: userRecord.nom || 'N/A',
            prenom: userRecord.prenom || 'N/A',
            role: userRecord.role || 'client',
            status: userRecord.status || 'actif',
            created_at: userRecord.created_at,
            updated_at: userRecord.updated_at,
            telephone: userRecord.telephone || null
          }));
          
          setUsers(transformedUsers);
          console.log('Users fetched via RPC:', transformedUsers.length);
          return;
        }
      } catch (rpcErr) {
        console.warn('RPC function failed, trying edge function:', rpcErr);
      }

      // Fallback to edge function
      const { data: edgeData, error: edgeError } = await supabase.functions.invoke('admin-users', {
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (edgeError) {
        console.error('Edge function error:', edgeError);
        setError('Impossible de récupérer les utilisateurs');
        return;
      }

      if (edgeData?.users) {
        const transformedUsers = edgeData.users.map((userRecord: any) => ({
          id: userRecord.id,
          auth_id: userRecord.auth_id,
          email: userRecord.email || 'N/A',
          nom: userRecord.nom || 'N/A',
          prenom: userRecord.prenom || 'N/A',
          role: userRecord.role || 'client',
          status: userRecord.status || 'actif',
          created_at: userRecord.created_at,
          updated_at: userRecord.updated_at,
          telephone: userRecord.telephone || null
        }));
        
        setUsers(transformedUsers);
        console.log('Users fetched via edge function:', transformedUsers.length);
      } else {
        setUsers([]);
        console.log('No users returned from edge function');
      }
      
    } catch (err) {
      console.error('Unexpected error:', err);
      setError('Une erreur inattendue est survenue');
    } finally {
      setLoading(false);
    }
  };

  const promoteUser = async (userId: string, newRole: string) => {
    try {
      const user = users.find(u => u.id === userId);
      if (!user) {
        throw new Error('Utilisateur non trouvé');
      }

      const { data, error } = await supabase.rpc('secure_change_user_role', {
        target_user_id: user.auth_id,
        new_role: newRole
      });

      if (error) {
        console.error('Error promoting user:', error);
        throw new Error(error.message || 'Impossible de modifier le rôle de l\'utilisateur');
      }

      const result = data as { success: boolean; message?: string; error?: string };
      
      if (!result.success) {
        throw new Error(result.error || 'Changement de rôle échoué');
      }

      await fetchUsers();
      
    } catch (error) {
      throw error;
    }
  };

  const suspendUser = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ status: 'bloque' })
        .eq('id', userId);

      if (error) {
        console.error('Error suspending user:', error);
        throw new Error('Impossible de suspendre l\'utilisateur');
      }

      setUsers(prev => 
        prev.map(user => 
          user.id === userId ? { ...user, status: 'bloque' } : user
        )
      );
    } catch (error) {
      throw error;
    }
  };

  const resetPassword = async (userId: string) => {
    try {
      console.log('Password reset triggered for user:', userId);
    } catch (error) {
      throw new Error('Impossible d\'envoyer l\'email de réinitialisation');
    }
  };

  useEffect(() => {
    fetchUsers();

    // Set up real-time subscription
    const channel = supabase
      .channel('admin-users-secure')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => {
        fetchUsers();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, () => {
        fetchUsers();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    users,
    loading,
    error,
    promoteUser,
    suspendUser,
    resetPassword,
    refetch: fetchUsers,
  };
};