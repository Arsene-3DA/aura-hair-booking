import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, UserRole } from '@/hooks/useUsers';

interface UseAdminUsersReturn {
  users: User[];
  loading: boolean;
  error: string | null;
  promoteUser: (userId: string, newRole: string) => Promise<void>;
  suspendUser: (userId: string) => Promise<void>;
  resetPassword: (userId: string) => Promise<void>;
  refetch: () => Promise<void>;
}

export const useAdminUsers = (): UseAdminUsersReturn => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Utiliser la fonction sécurisée pour récupérer tous les utilisateurs
      const { data: usersData, error: usersError } = await supabase.rpc('get_all_users_for_admin');

      if (usersError) {
        console.error('Error fetching users:', usersError);
        setError(usersError.message);
        return;
      }

      console.log('Admin users from secure function:', usersData?.length, 'users');
      console.log('Users data:', usersData?.map(u => ({ email: u.email, nom: u.nom, prenom: u.prenom, role: u.role })));
      
      // Transformer les données pour le format attendu par l'interface
      const transformedUsers = usersData?.map(userRecord => ({
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
      })) || [];
      
      setUsers(transformedUsers);
      console.log('Final transformed users:', transformedUsers.length, 'users');
    } catch (err) {
      console.error('Unexpected error:', err);
      setError('Une erreur inattendue est survenue');
    } finally {
      setLoading(false);
    }
  };

  const promoteUser = async (userId: string, newRole: string) => {
    try {
      // Find the user's auth_id from our users array
      const user = users.find(u => u.id === userId);
      if (!user) {
        throw new Error('Utilisateur non trouvé');
      }

      // OPTIMISTIC UPDATE: Update local state immediately
      setUsers(prev => 
        prev.map(u => 
          u.id === userId ? { ...u, role: newRole as UserRole } : u
        )
      );

      // SECURITY FIX: Use the secure role change function with auth_id
      const { data, error } = await supabase.rpc('secure_change_user_role', {
        target_user_id: user.auth_id,
        new_role: newRole
      });

      if (error) {
        console.error('Error promoting user:', error);
        // Revert optimistic update on error
        setUsers(prev => 
          prev.map(u => 
            u.id === userId ? { ...u, role: user.role } : u
          )
        );
        throw new Error(error.message || 'Impossible de modifier le rôle de l\'utilisateur');
      }

      const result = data as { success: boolean; message?: string; error?: string };
      
      if (!result.success) {
        // Revert optimistic update on failure
        setUsers(prev => 
          prev.map(u => 
            u.id === userId ? { ...u, role: user.role } : u
          )
        );
        throw new Error(result.error || 'Changement de rôle échoué');
      }

      // Confirm the change worked by refetching after a short delay
      setTimeout(() => {
        fetchUsers();
      }, 1000);
      
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

      // Update local state optimistically
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
      // In real app, would trigger password reset email
      // For now, simulate the action
      console.log('Password reset triggered for user:', userId);
      
      // Could use Supabase auth admin API here
      // await supabase.auth.admin.generateLink({
      //   type: 'recovery',
      //   email: user.email
      // });
      
    } catch (error) {
      throw new Error('Impossible d\'envoyer l\'email de réinitialisation');
    }
  };

  useEffect(() => {
    fetchUsers();

    // Set up real-time subscription pour les profiles
    const channel = supabase
      .channel('admin-users')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, (payload) => {
        console.log('Profile change detected:', payload);
        // Refetch pour éviter les problèmes de synchronisation
        fetchUsers();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, (payload) => {
        console.log('User change detected:', payload);
        // Refetch pour éviter les problèmes de synchronisation
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