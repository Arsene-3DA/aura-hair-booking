
import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from 'react-router-dom';
import { useUsers, UserRole } from './useUsers';

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAuthenticated: boolean;
  userProfile: any | null;
  userRole: UserRole | null;
  showTransition: boolean;
}

export const useRoleAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
    isAuthenticated: false,
    userProfile: null,
    userRole: null,
    showTransition: false
  });
  const { toast } = useToast();
  const navigate = useNavigate();
  const { getCurrentUser } = useUsers();

  useEffect(() => {
    // Vérifier la session existante
    supabase.auth.getSession().then(({ data: { session } }) => {
      setAuthState(prev => ({
        ...prev,
        user: session?.user ?? null,
        session,
        loading: false,
        isAuthenticated: !!session
      }));

      // Charger le profil utilisateur si connecté
      if (session?.user) {
        loadUserProfile();
      }
    });

    // Écouter les changements d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        setAuthState(prev => ({
          ...prev,
          user: session?.user ?? null,
          session,
          loading: false,
          isAuthenticated: !!session
        }));

        if (session?.user) {
          setTimeout(() => {
            loadUserProfile();
          }, 100);
        } else {
          setAuthState(prev => ({
            ...prev,
            userProfile: null,
            userRole: null
          }));
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const loadUserProfile = async () => {
    try {
      const profile = await getCurrentUser();
      if (profile) {
        setAuthState(prev => ({
          ...prev,
          userProfile: profile,
          userRole: profile.role
        }));
      }
    } catch (error) {
      console.error('Erreur lors du chargement du profil:', error);
    }
  };

  const signUp = async (email: string, password: string, userData: {
    nom: string;
    prenom: string;
    role?: UserRole;
    telephone?: string;
  }) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            nom: userData.nom,
            prenom: userData.prenom,
            role: userData.role || 'client'
          }
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

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      // Déclencher l'animation de transition
      setAuthState(prev => ({ ...prev, showTransition: true }));

      toast({
        title: "✅ Connexion réussie",
        description: `Bienvenue !`
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
    return authState.userRole === role;
  };

  const hasAnyRole = (roles: UserRole[]) => {
    return authState.userRole ? roles.includes(authState.userRole) : false;
  };

  const handleTransitionComplete = () => {
    setAuthState(prev => ({ ...prev, showTransition: false }));
    
    // Redirection selon le rôle
    if (authState.userRole === 'admin') {
      navigate('/admin');
    } else if (authState.userRole === 'coiffeur') {
      navigate('/stylist');
    } else {
      navigate('/app');
    }
  };

  return {
    ...authState,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    hasRole,
    hasAnyRole,
    loadUserProfile,
    handleTransitionComplete
  };
};
