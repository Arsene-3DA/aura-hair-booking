import { useEffect, useState, useCallback } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export type UserRole = 'client' | 'coiffeur' | 'admin' | 'cosmetique' | null;

interface UserProfile {
  id: string;
  user_id: string;
  role: UserRole;
  full_name?: string;
  nom?: string; // Compatibilité avec l'ancien système
  prenom?: string; // Compatibilité avec l'ancien système
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

interface AuthState {
  loading: boolean;
  session: Session | null;
  role: UserRole;
  userRole: UserRole; // Alias pour compatibilité
  user: User | null;
  userProfile: UserProfile | null;
  isAuthenticated: boolean;
  showTransition: boolean;
}

interface AuthActions {
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string; user?: User }>;
  signUp: (email: string, password: string, userData?: any) => Promise<{ success: boolean; error?: string; user?: User }>;
  signInWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<{ success: boolean; error?: string }>;
  hasRole: (role: UserRole) => boolean;
  hasAnyRole: (roles: UserRole[]) => boolean;
  handleTransitionComplete: () => void;
  loadUserProfile: () => Promise<void>;
}

export function useRoleAuth(): AuthState & AuthActions {
  const [state, setState] = useState<AuthState>({
    loading: true,
    session: null,
    role: null,
    userRole: null,
    user: null,
    userProfile: null,
    isAuthenticated: false,
    showTransition: false,
  });

  const { toast } = useToast();

  /* ───────── Charger le profil utilisateur ───────── */
  const loadUserProfile = useCallback(async () => {
    if (!state.session?.user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', state.session.user.id)
        .single();

      if (error) {
        // Créer un profil par défaut si il n'existe pas
        if (error.code === 'PGRST116') {
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert({
              user_id: state.session.user.id,
              role: 'client',
              full_name: state.session.user.email || 'Nouvel utilisateur'
            })
            .select()
            .single();

          if (!createError && newProfile) {
            setState(prev => ({
              ...prev,
              role: newProfile.role as UserRole,
              userRole: newProfile.role as UserRole,
              userProfile: newProfile
            }));
          }
        }
        return;
      }

      setState(prev => ({
        ...prev,
        role: data?.role as UserRole,
        userRole: data?.role as UserRole,
        userProfile: data
      }));
    } catch (err) {
      console.error('Profile loading error:', err);
    }
  }, [state.session?.user]);

  /* ───────── Init au montage ───────── */
  const init = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      setState(prev => ({
        ...prev,
        loading: false,
        session,
        user: session?.user ?? null,
        isAuthenticated: !!session
      }));

      if (session?.user) {
        // Charger le profil après avoir mis à jour la session
        setTimeout(async () => {
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', session.user.id)
            .single();

          if (!error && data) {
            setState(prev => ({
              ...prev,
              role: data.role as UserRole,
              userRole: data.role as UserRole,
              userProfile: data
            }));
          }
        }, 0);
      } else {
        setState(prev => ({
          ...prev,
          role: null,
          userRole: null,
          userProfile: null
        }));
      }
    } catch (err) {
      console.error('Auth initialization error:', err);
      setState(prev => ({ ...prev, loading: false }));
    }
  }, []);

  /* ───────── Méthodes d'authentification ───────── */
  const signIn = useCallback(async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      setState(prev => ({ ...prev, showTransition: true }));

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
  }, [toast]);

  const signUp = useCallback(async (email: string, password: string, userData?: any) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: userData
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
  }, [toast]);

  const signInWithGoogle = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/post-auth`
        }
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
  }, [toast]);

  const signOut = useCallback(async () => {
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
  }, [toast]);

  const hasRole = useCallback((role: UserRole) => {
    return state.role === role;
  }, [state.role]);

  const hasAnyRole = useCallback((roles: UserRole[]) => {
    return state.role ? roles.includes(state.role) : false;
  }, [state.role]);

  const handleTransitionComplete = useCallback(() => {
    setState(prev => ({ ...prev, showTransition: false }));
  }, []);

  /* init au premier rendu + subscribe changements */
  useEffect(() => {
    init();
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setState(prev => ({
        ...prev,
        session,
        user: session?.user ?? null,
        isAuthenticated: !!session
      }));

      if (session?.user) {
        // Charger le profil après changement d'auth
        setTimeout(async () => {
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', session.user.id)
            .single();

          if (!error && data) {
            setState(prev => ({
              ...prev,
              role: data.role as UserRole,
              userRole: data.role as UserRole,
              userProfile: data
            }));
          }
        }, 0);
      } else {
        setState(prev => ({
          ...prev,
          role: null,
          userRole: null,
          userProfile: null
        }));
      }
    });
    return () => sub.subscription.unsubscribe();
  }, [init]);

  return {
    ...state,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
    hasRole,
    hasAnyRole,
    handleTransitionComplete,
    loadUserProfile,
  };
}