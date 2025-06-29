
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/hooks/use-toast";

export type UserRole = 'client' | 'coiffeur' | 'admin';
export type UserStatus = 'actif' | 'bloque' | 'inactif';

export interface User {
  id: string;
  auth_id?: string;
  email: string;
  nom: string;
  prenom: string;
  telephone?: string;
  role: UserRole;
  status: UserStatus;
  created_at: string;
  updated_at: string;
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

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('auth_id', authUser.id)
        .single();

      if (error) {
        console.error('Erreur lors de la récupération du profil:', error);
        return null;
      }

      setCurrentUser(data);
      return data;
    } catch (error) {
      console.error('Erreur:', error);
      return null;
    }
  };

  const getAllUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
      return data || [];
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
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('role', 'coiffeur')
        .eq('status', 'actif')
        .order('nom');

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
