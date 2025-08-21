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
      
      // Récupérer TOUS les utilisateurs depuis la table users (source principale)
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (usersError) {
        console.error('Error fetching users:', usersError);
        setError(usersError.message);
        return;
      }

      // Récupérer les profils pour les données supplémentaires
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*');

      if (profilesError) {
        console.warn('Warning fetching profiles:', profilesError);
      }
      
      // Afficher TOUS les vrais comptes utilisateurs (clients et professionnels)
      console.log('Raw users data:', usersData?.length, 'users');
      console.log('Users data:', usersData?.map(u => ({ email: u.email, nom: u.nom, prenom: u.prenom, role: u.role })));
      
      const transformedUsers = usersData
        ?.filter(userRecord => {
          // Exclure UNIQUEMENT les comptes de test/démonstration évidents
          const isDemoAccount = 
            // Emails de test spécifiques
            userRecord.email?.toLowerCase() === 'admin@salon.com' ||
            userRecord.email?.toLowerCase() === 'marie@salon.com' ||
            userRecord.email?.toLowerCase() === 'pierre@salon.com' ||
            userRecord.email?.toLowerCase() === 'client@email.com' ||
            // Domaines de test
            userRecord.email?.toLowerCase().includes('@salon.com') ||
            userRecord.email?.toLowerCase().includes('example.com') ||
            userRecord.email?.toLowerCase().includes('demo') ||
            userRecord.email?.toLowerCase().includes('test@') ||
            // Noms de test génériques
            (userRecord.nom?.toLowerCase() === 'marie' && userRecord.prenom?.toLowerCase() === 'dupont') ||
            (userRecord.nom?.toLowerCase() === 'pierre' && userRecord.prenom?.toLowerCase() === 'martin') ||
            (userRecord.nom?.toLowerCase() === 'sophie' && userRecord.prenom?.toLowerCase() === 'durand') ||
            userRecord.nom?.toLowerCase().includes('système') ||
            userRecord.nom?.toLowerCase().includes('demo') ||
            userRecord.prenom?.toLowerCase().includes('demo') ||
            (userRecord.nom?.toLowerCase() === 'test' && userRecord.prenom?.toLowerCase() === 'test');
          
          const hasValidEmail = userRecord.email && userRecord.email.trim() !== '';
          
          // Récupérer le profil pour les informations supplémentaires
          const profile = profilesData?.find(p => p.user_id === userRecord.auth_id);
          const userRole = userRecord.role || profile?.role;
          
          console.log(`User ${userRecord.email}: isDemoAccount=${isDemoAccount}, hasValidEmail=${hasValidEmail}, role=${userRole}`);
          
          // Garder TOUS les vrais comptes avec email valide (clients, professionnels, et même admin réels)
          return !isDemoAccount && hasValidEmail;
        })
        ?.map(userRecord => {
          const profile = profilesData?.find(p => p.user_id === userRecord.auth_id);
          
          return {
            id: userRecord.id,
            auth_id: userRecord.auth_id,
            email: userRecord.email || 'N/A',
            nom: userRecord.nom || profile?.full_name?.split(' ')[0] || 'N/A',
            prenom: userRecord.prenom || profile?.full_name?.split(' ').slice(1).join(' ') || 'N/A',
            role: userRecord.role || profile?.role || 'client',
            status: userRecord.status || 'actif',
            created_at: userRecord.created_at,
            updated_at: userRecord.updated_at,
            telephone: userRecord.telephone || null
          };
        }) || [];
      
      setUsers(transformedUsers);
      console.log('Admin users visible:', transformedUsers.length, 'users');
      console.log('Visible users:', transformedUsers.map(u => ({ email: u.email, nom: u.nom, prenom: u.prenom, role: u.role })));
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

      // SECURITY FIX: Use the secure role change function with auth_id
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

      // Refetch data to ensure consistency
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