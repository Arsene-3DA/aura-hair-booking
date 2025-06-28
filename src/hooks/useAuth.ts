
import { useState, useEffect } from 'react';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { useToast } from "@/hooks/use-toast";

// Ce hook est maintenant un wrapper autour de useSupabaseAuth pour la compatibilité
export const useAuth = () => {
  const supabaseAuth = useSupabaseAuth();
  const { toast } = useToast();

  // Adapter l'interface pour la compatibilité avec l'ancien code
  const adaptedAuth = {
    user: supabaseAuth.user ? {
      id: supabaseAuth.user.id,
      email: supabaseAuth.user.email || '',
      user_type: (supabaseAuth.user.user_metadata?.role || 'client') as 'client' | 'hairdresser' | 'admin',
      first_name: supabaseAuth.user.user_metadata?.name?.split(' ')[0] || '',
      last_name: supabaseAuth.user.user_metadata?.name?.split(' ').slice(1).join(' ') || '',
      phone: supabaseAuth.user.user_metadata?.phone || '',
      is_active: true
    } : null,
    loading: supabaseAuth.loading,
    isAuthenticated: supabaseAuth.isAuthenticated,
    
    login: async (email: string, password: string) => {
      const result = await supabaseAuth.signIn(email, password);
      return { success: result.success, error: result.error };
    },
    
    logout: async () => {
      const result = await supabaseAuth.signOut();
      return result;
    },
    
    createCoiffeurUser: async (userData: {
      email: string;
      password: string;
      first_name: string;
      last_name?: string;
      phone?: string;
      hairdresser_id: string;
    }) => {
      try {
        // Créer le compte avec Supabase Auth
        const result = await supabaseAuth.signUp(userData.email, userData.password, {
          role: 'hairdresser',
          name: `${userData.first_name} ${userData.last_name || ''}`.trim(),
          phone: userData.phone
        });

        if (result.success) {
          toast({
            title: "✅ Compte coiffeur créé",
            description: `Le compte pour ${userData.first_name} a été créé avec succès`
          });
        }

        return result;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Erreur lors de la création du compte';
        toast({
          title: "❌ Erreur",
          description: errorMessage,
          variant: "destructive"
        });
        return { success: false, error: errorMessage };
      }
    },
    
    checkCurrentUser: supabaseAuth.signIn
  };

  return adaptedAuth;
};
