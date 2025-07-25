import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/hooks/use-toast";

export type UserRole = 'client' | 'admin' | 'coiffeur' | 'stylist';

interface UserProfile {
  id: string;
  user_id: string;
  role: UserRole;
  full_name?: string;
  avatar_url?: string;
}

interface AuthState {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  loading: boolean;
  isAuthenticated: boolean;
}

export const useUnifiedAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    profile: null,
    loading: true,
    isAuthenticated: false
  });
  
  const { toast } = useToast();

  useEffect(() => {
    // Obtenir la session initiale
    supabase.auth.getSession().then(({ data: { session } }) => {
      setAuthState(prev => ({
        ...prev,
        user: session?.user ?? null,
        session,
        isAuthenticated: !!session,
        loading: !session
      }));

      if (session?.user) {
        loadUserProfile(session.user.id);
      } else {
        setAuthState(prev => ({ ...prev, loading: false }));
      }
    });

    // Écouter les changements d'auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setAuthState(prev => ({
          ...prev,
          user: session?.user ?? null,
          session,
          isAuthenticated: !!session
        }));

        if (session?.user) {
          await loadUserProfile(session.user.id);
        } else {
          setAuthState(prev => ({
            ...prev,
            profile: null,
            loading: false
          }));
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const loadUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Erreur lors du chargement du profil:', error);
        // Créer un profil par défaut si il n'existe pas
        if (error.code === 'PGRST116') {
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert({
              user_id: userId,
              role: 'client',
              full_name: authState.user?.email || 'Utilisateur'
            })
            .select()
            .single();

          if (!createError && newProfile) {
            setAuthState(prev => ({
              ...prev,
              profile: newProfile,
              loading: false
            }));
          }
        } else {
          setAuthState(prev => ({ ...prev, loading: false }));
        }
        return;
      }

      setAuthState(prev => ({
        ...prev,
        profile: data,
        loading: false
      }));
    } catch (error) {
      console.error('Erreur lors du chargement du profil:', error);
      setAuthState(prev => ({ ...prev, loading: false }));
    }
  };

  const signInWithGoogle = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/post-auth`
        }
      });

      if (error) throw error;
      return { success: true, data };
    } catch (error: any) {
      const errorMessage = error.message || 'Erreur de connexion avec Google';
      toast({
        title: "❌ Erreur de connexion Google",
        description: errorMessage,
        variant: "destructive"
      });
      return { success: false, error: errorMessage };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      toast({
        title: "Déconnexion",
        description: "À bientôt !"
      });
      
      return { success: true };
    } catch (error: any) {
      console.error('Erreur lors de la déconnexion:', error);
      return { success: false, error: error.message };
    }
  };

  const hasRole = (role: UserRole) => {
    return authState.profile?.role === role;
  };

  const hasAnyRole = (roles: UserRole[]) => {
    return authState.profile?.role ? roles.includes(authState.profile.role) : false;
  };

  return {
    ...authState,
    signInWithGoogle,
    signOut,
    hasRole,
    hasAnyRole,
    refreshProfile: () => authState.user && loadUserProfile(authState.user.id)
  };
};