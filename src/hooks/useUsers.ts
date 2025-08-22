
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/hooks/use-toast";

export type UserRole = 'client' | 'coiffeur' | 'coiffeuse' | 'cosmetique' | 'admin' | 'stylist';
export type UserStatus = 'actif' | 'bloque' | 'inactif';
export type Gender = 'homme' | 'femme' | 'autre' | 'non_specifie';

export interface User {
  id: string;
  auth_id?: string;
  email: string;
  nom: string;
  prenom: string;
  telephone?: string | null;
  role: UserRole;
  status: UserStatus;
  created_at: string;
  updated_at: string;
  gender?: Gender;
}

export const useUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const getCurrentUser = async () => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) return null;

      // CORRECTION: Utiliser la table profiles au lieu de users
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', authUser.id)
        .single();

      if (error) {
        console.error('Erreur lors de la récupération du profil:', error);
        return null;
      }

      // Adapter pour compatibilité avec l'interface User
      const adaptedUser = {
        id: data.id,
        auth_id: data.user_id,
        email: authUser.email || '',
        nom: data.full_name?.split(' ')[0] || '',
        prenom: data.full_name?.split(' ').slice(1).join(' ') || '',
        telephone: '',
        role: data.role as UserRole,
        status: 'actif' as UserStatus,
        created_at: data.created_at,
        updated_at: data.updated_at
      };

      setCurrentUser(adaptedUser);
      return adaptedUser;
    } catch (error) {
      console.error('Erreur:', error);
      return null;
    }
  };

  const getAllUsers = async () => {
    try {
      setLoading(true);
      // Utiliser la fonction RPC qui filtre automatiquement les comptes de test
      const { data, error } = await supabase.rpc('get_all_users_for_admin');

      if (error) throw error;
      
      // Adapter les données pour compatibilité avec l'interface User
      const adaptedUsers = (data || []).map(user => ({
        id: user.id,
        auth_id: user.auth_id,
        email: user.email || '',
        nom: user.nom || '',
        prenom: user.prenom || '',
        telephone: user.telephone || '',
        role: user.role as UserRole,
        status: user.status as UserStatus,
        created_at: user.created_at,
        updated_at: user.updated_at
      }));

      setUsers(adaptedUsers);
      return adaptedUsers;
    } catch (error) {
      console.error('Erreur lors du chargement des utilisateurs:', error);
      toast({
        title: "❌ Erreur",
        description: "Impossible de charger les utilisateurs",
        variant: "destructive"
      });
      return [];
    } finally {
      setLoading(false);
    }
  };

  const createUser = async (userData: {
    email: string;
    nom: string;
    prenom: string;
    telephone?: string;
    role: UserRole;
  }) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .insert(userData)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "✅ Utilisateur créé",
        description: `${userData.prenom} ${userData.nom} a été créé avec succès`
      });

      return { success: true, data };
    } catch (error: any) {
      console.error('Erreur lors de la création:', error);
      toast({
        title: "❌ Erreur",
        description: error.message || "Erreur lors de la création de l'utilisateur",
        variant: "destructive"
      });
      return { success: false, error: error.message };
    }
  };

  const updateUser = async (userId: string, updates: Partial<User>) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "✅ Utilisateur mis à jour",
        description: "Les informations ont été mises à jour avec succès"
      });

      return { success: true, data };
    } catch (error: any) {
      console.error('Erreur lors de la mise à jour:', error);
      toast({
        title: "❌ Erreur",
        description: error.message || "Erreur lors de la mise à jour",
        variant: "destructive"
      });
      return { success: false, error: error.message };
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: "✅ Utilisateur supprimé",
        description: "L'utilisateur a été supprimé avec succès"
      });

      return { success: true };
    } catch (error: any) {
      console.error('Erreur lors de la suppression:', error);
      toast({
        title: "❌ Erreur",
        description: error.message || "Erreur lors de la suppression",
        variant: "destructive"
      });
      return { success: false, error: error.message };
    }
  };

  const blockUser = async (userId: string) => {
    return updateUser(userId, { status: 'bloque' });
  };

  const unblockUser = async (userId: string) => {
    return updateUser(userId, { status: 'actif' });
  };

  const getCoiffeurs = async () => {
    try {
      // Use the secure function for professional lookup
      const { data, error } = await supabase.rpc('get_professionals_for_booking');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erreur lors du chargement des coiffeurs:', error);
      return [];
    }
  };

  return {
    users,
    currentUser,
    loading,
    getCurrentUser,
    getAllUsers,
    createUser,
    updateUser,
    deleteUser,
    blockUser,
    unblockUser,
    getCoiffeurs
  };
};
