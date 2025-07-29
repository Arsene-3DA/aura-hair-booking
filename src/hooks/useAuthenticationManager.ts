import { useState, useEffect, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export type UserRole = 'client' | 'coiffeur' | 'admin' | 'stylist';

interface UserProfile {
  id: string;
  user_id: string;
  role: UserRole;
  full_name?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

interface AuthState {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  loading: boolean;
  isAuthenticated: boolean;
}

export const useAuthenticationManager = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    profile: null,
    loading: true,
    isAuthenticated: false
  });
  
  const { toast } = useToast();

  const loadUserProfile = useCallback(async (userId?: string) => {
    const targetUserId = userId || authState.user?.id;
    if (!targetUserId) return null;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', targetUserId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Erreur lors du chargement du profil:', error);
        return null;
      }

      // Créer un profil par défaut si il n'existe pas
      if (!data) {
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert({
            user_id: targetUserId,
            role: 'client',
            full_name: authState.user?.email || 'Nouvel utilisateur'
          })
          .select()
          .single();

        if (!createError && newProfile) {
          setAuthState(prev => ({ ...prev, profile: newProfile }));
          return newProfile;
        }
      } else {
        setAuthState(prev => ({ ...prev, profile: data }));
        return data;
      }
    } catch (error) {
      console.error('Erreur lors du chargement du profil:', error);
    }
    return null;
  }, [authState.user?.id]);

  useEffect(() => {
    // Configurer l'écouteur d'état d'auth AVANT de vérifier la session
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        
        setAuthState(prev => ({
          ...prev,
          user: session?.user ?? null,
          session,
          isAuthenticated: !!session
        }));

        if (session?.user) {
          // Utiliser setTimeout pour éviter les deadlocks
          setTimeout(async () => {
            await loadUserProfile(session.user.id);
            setAuthState(prev => ({ ...prev, loading: false }));
          }, 0);
        } else {
          setAuthState(prev => ({
            ...prev,
            profile: null,
            loading: false
          }));
        }
      }
    );

    // Vérifier la session existante APRÈS avoir configuré l'écouteur
    supabase.auth.getSession().then(({ data: { session } }) => {
      setAuthState(prev => ({
        ...prev,
        user: session?.user ?? null,
        session,
        isAuthenticated: !!session
      }));

      if (session?.user) {
        setTimeout(async () => {
          await loadUserProfile(session.user.id);
          setAuthState(prev => ({ ...prev, loading: false }));
        }, 0);
      } else {
        setAuthState(prev => ({ ...prev, loading: false }));
      }
    });

    return () => subscription.unsubscribe();
  }, [loadUserProfile]);

  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/post-auth`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) throw error;
      return { success: true };
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

  const signInWithPassword = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      toast({
        title: "✅ Connexion réussie",
        description: "Bienvenue !"
      });

      return { success: true, user: data.user };
    } catch (error: any) {
      const errorMessage = error.message || 'Erreur de connexion';
      toast({
        title: "❌ Erreur de connexion",
        description: errorMessage,
        variant: "destructive"
      });
      return { success: false, error: errorMessage };
    }
  };

  const signUp = async (email: string, password: string, userData?: {
    nom?: string;
    prenom?: string;
    role?: UserRole;
  }) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: userData ? {
            nom: userData.nom,
            prenom: userData.prenom,
            role: userData.role || 'client'
          } : undefined
        }
      });

      if (error) throw error;

      toast({
        title: "✅ Inscription réussie",
        description: "Votre compte a été créé avec succès"
      });

      return { success: true, user: data.user };
    } catch (error: any) {
      const errorMessage = error.message || 'Erreur lors de l\'inscription';
      toast({
        title: "❌ Erreur d'inscription",
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
    userRole: authState.profile?.role || null,
    signInWithGoogle,
    signInWithPassword,
    signUp,
    signOut,
    hasRole,
    hasAnyRole,
    loadUserProfile,
    refreshProfile: () => loadUserProfile()
  };
};