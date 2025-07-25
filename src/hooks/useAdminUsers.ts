import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@/hooks/useUsers';

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
      
      const { data, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) {
        console.error('Error fetching users:', fetchError);
        setError(fetchError.message);
        return;
      }

      setUsers(data || []);
    } catch (err) {
      console.error('Unexpected error:', err);
      setError('Une erreur inattendue est survenue');
    } finally {
      setLoading(false);
    }
  };

  const promoteUser = async (userId: string, newRole: string) => {
    try {
      // Update user role in profiles table directly for now
      // The RPC function might not be available yet
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole as 'client' | 'coiffeur' | 'admin' })
        .eq('user_id', userId);

      if (error) {
        console.error('Error promoting user:', error);
        throw new Error('Impossible de modifier le rôle de l\'utilisateur');
      }

      // Update local state optimistically
      setUsers(prev => 
        prev.map(user => 
          user.id === userId ? { ...user, role: newRole as any } : user
        )
      );
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

    // Set up real-time subscription
    const channel = supabase
      .channel('admin-users')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, (payload) => {
        console.log('User change detected:', payload);
        
        if (payload.eventType === 'INSERT') {
          setUsers(prev => [payload.new as User, ...prev]);
        } else if (payload.eventType === 'UPDATE') {
          setUsers(prev => 
            prev.map(user => 
              user.id === payload.new.id ? { ...user, ...payload.new } : user
            )
          );
        } else if (payload.eventType === 'DELETE') {
          setUsers(prev => prev.filter(user => user.id !== payload.old.id));
        }
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