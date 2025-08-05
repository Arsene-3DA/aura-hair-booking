// SECURITY ENHANCEMENT: Enhanced authentication hook with security features
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useSecurityState } from '@/components/EnhancedSecurityProvider';
import { rateLimiter, RateLimitConfigs } from '@/utils/rateLimiter';
import { validateSecureInput, logSecurityEvent, trackFailedLogin, clearFailedLoginAttempts } from '@/utils/security';
import type { User, Session } from '@supabase/supabase-js';

export type UserRole = 'client' | 'coiffeur' | 'coiffeuse' | 'cosmetique' | 'admin';

interface UserProfile {
  id: string;
  user_id: string;
  full_name?: string;
  avatar_url?: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

interface AuthState {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  loading: boolean;
  isAuthenticated: boolean;
  isTransitioning: boolean;
}

interface AuthActions {
  signIn: (email: string, password: string) => Promise<{ success: boolean; user?: User; error?: string }>;
  signUp: (email: string, password: string, userData?: { name?: string; role?: UserRole }) => Promise<{ success: boolean; user?: User; error?: string }>;
  signInWithMagicLink: (email: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<{ success: boolean; error?: string }>;
  hasRole: (role: UserRole) => boolean;
  hasAnyRole: (roles: UserRole[]) => boolean;
  refreshProfile: () => Promise<void>;
  loadUserProfile: (userId: string) => Promise<UserProfile | null>;
}

const initialState: AuthState = {
  user: null,
  session: null,
  profile: null,
  loading: true,
  isAuthenticated: false,
  isTransitioning: false
};

export const useEnhancedAuth = (): AuthState & AuthActions => {
  const [authState, setAuthState] = useState<AuthState>(initialState);
  const { toast } = useToast();
  const { validateSecureAction, csrfToken, refreshSecurityContext } = useSecurityState();

  // Load user profile with caching
  const loadUserProfile = useCallback(async (userId: string): Promise<UserProfile | null> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Profile loading error:', error);
        return null;
      }

      return data as UserProfile;
    } catch (error) {
      console.error('Profile loading error:', error);
      return null;
    }
  }, []);

  // Initialize auth state and set up listeners
  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      try {
        // Get initial session
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;

        if (mounted && session?.user) {
          const profile = await loadUserProfile(session.user.id);
          setAuthState({
            user: session.user,
            session,
            profile,
            loading: false,
            isAuthenticated: true,
            isTransitioning: false
          });
        } else if (mounted) {
          setAuthState(prev => ({
            ...prev,
            loading: false,
            isAuthenticated: false
          }));
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        if (mounted) {
          setAuthState(prev => ({
            ...prev,
            loading: false,
            isAuthenticated: false
          }));
        }
      }
    };

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        // Log auth events for security monitoring
        await logSecurityEvent('auth_state_change', `Auth event: ${event}`, {
          event,
          userId: session?.user?.id,
          timestamp: new Date().toISOString()
        });

        setAuthState(prev => ({ ...prev, isTransitioning: true }));

        if (session?.user) {
          const profile = await loadUserProfile(session.user.id);
          setAuthState({
            user: session.user,
            session,
            profile,
            loading: false,
            isAuthenticated: true,
            isTransitioning: false
          });

          // Clear failed login attempts on successful login
          if (event === 'SIGNED_IN') {
            clearFailedLoginAttempts(session.user.email || '');
            await refreshSecurityContext();
          }
        } else {
          setAuthState({
            user: null,
            session: null,
            profile: null,
            loading: false,
            isAuthenticated: false,
            isTransitioning: false
          });
        }
      }
    );

    initAuth();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [loadUserProfile, refreshSecurityContext]);

  // Enhanced sign in with security features
  const signIn = useCallback(async (email: string, password: string) => {
    try {
      // Security validation
      if (!(await validateSecureAction('login', { email }))) {
        return { success: false, error: 'Action de connexion refusée pour des raisons de sécurité' };
      }

      // Rate limiting
      const rateLimitResult = await rateLimiter.checkLimit('login', RateLimitConfigs.LOGIN);
      if (!rateLimitResult.allowed) {
        return { success: false, error: 'Trop de tentatives de connexion. Veuillez patienter.' };
      }

      // Input validation
      const emailValidation = validateSecureInput(email, 'email');
      const passwordValidation = validateSecureInput(password, 'password');

      if (!emailValidation.isValid) {
        return { success: false, error: 'Format d\'email invalide' };
      }

      if (!passwordValidation.isValid) {
        return { success: false, error: 'Format de mot de passe invalide' };
      }

      // Attempt sign in
      const { data, error } = await supabase.auth.signInWithPassword({
        email: emailValidation.sanitized,
        password
      });

      if (error) {
        // Track failed login attempt
        const failedAttempts = trackFailedLogin(email);
        await logSecurityEvent('login_failed', `Failed login attempt for ${email}`, {
          email,
          failedAttempts,
          error: error.message,
          timestamp: new Date().toISOString()
        });

        return { success: false, error: error.message };
      }

      // Log successful login
      await logSecurityEvent('login_success', `Successful login for ${email}`, {
        email,
        userId: data.user?.id,
        timestamp: new Date().toISOString()
      });

      toast({
        title: "Connexion réussie",
        description: "Vous êtes maintenant connecté",
      });

      return { success: true, user: data.user };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur de connexion';
      await logSecurityEvent('login_error', `Login error: ${errorMessage}`, {
        email,
        error: errorMessage,
        timestamp: new Date().toISOString()
      });

      return { success: false, error: errorMessage };
    }
  }, [validateSecureAction, toast]);

  // Enhanced sign up with security features
  const signUp = useCallback(async (email: string, password: string, userData?: { name?: string; role?: UserRole }) => {
    try {
      // Security validation
      if (!(await validateSecureAction('signup', { email }))) {
        return { success: false, error: 'Action d\'inscription refusée pour des raisons de sécurité' };
      }

      // Rate limiting
      const rateLimitResult = await rateLimiter.checkLimit('signup', RateLimitConfigs.LOGIN);
      if (!rateLimitResult.allowed) {
        return { success: false, error: 'Trop de tentatives d\'inscription. Veuillez patienter.' };
      }

      // Input validation
      const emailValidation = validateSecureInput(email, 'email');
      const passwordValidation = validateSecureInput(password, 'password');

      if (!emailValidation.isValid) {
        return { success: false, error: 'Format d\'email invalide' };
      }

      if (!passwordValidation.isValid) {
        return { success: false, error: 'Mot de passe ne respectant pas les critères de sécurité' };
      }

      // Prepare user metadata
      const metadata = {
        full_name: userData?.name || emailValidation.sanitized.split('@')[0],
        role: userData?.role || 'client',
        csrf_token: csrfToken
      };

      // Attempt sign up with email redirect
      const redirectUrl = `${window.location.origin}/auth`;
      const { data, error } = await supabase.auth.signUp({
        email: emailValidation.sanitized,
        password,
        options: {
          data: metadata,
          emailRedirectTo: redirectUrl
        }
      });

      if (error) {
        await logSecurityEvent('signup_failed', `Failed signup attempt for ${email}`, {
          email,
          error: error.message,
          timestamp: new Date().toISOString()
        });

        return { success: false, error: error.message };
      }

      // Log successful signup
      await logSecurityEvent('signup_success', `Successful signup for ${email}`, {
        email,
        userId: data.user?.id,
        timestamp: new Date().toISOString()
      });

      toast({
        title: "Inscription réussie",
        description: "Vérifiez votre email pour confirmer votre compte",
      });

      return { success: true, user: data.user };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur d\'inscription';
      await logSecurityEvent('signup_error', `Signup error: ${errorMessage}`, {
        email,
        error: errorMessage,
        timestamp: new Date().toISOString()
      });

      return { success: false, error: errorMessage };
    }
  }, [validateSecureAction, toast, csrfToken]);

  // Magic link sign in
  const signInWithMagicLink = useCallback(async (email: string) => {
    try {
      // Security validation
      if (!(await validateSecureAction('magic_link', { email }))) {
        return { success: false, error: 'Action refusée pour des raisons de sécurité' };
      }

      // Rate limiting
      const rateLimitResult = await rateLimiter.checkLimit('magic_link', RateLimitConfigs.PASSWORD_RESET);
      if (!rateLimitResult.allowed) {
        return { success: false, error: 'Trop de demandes de lien magique. Veuillez patienter.' };
      }

      // Input validation
      const emailValidation = validateSecureInput(email, 'email');
      if (!emailValidation.isValid) {
        return { success: false, error: 'Format d\'email invalide' };
      }

      const redirectUrl = `${window.location.origin}/auth`;
      const { error } = await supabase.auth.signInWithOtp({
        email: emailValidation.sanitized,
        options: {
          emailRedirectTo: redirectUrl
        }
      });

      if (error) {
        await logSecurityEvent('magic_link_failed', `Failed magic link for ${email}`, {
          email,
          error: error.message,
          timestamp: new Date().toISOString()
        });

        return { success: false, error: error.message };
      }

      await logSecurityEvent('magic_link_sent', `Magic link sent to ${email}`, {
        email,
        timestamp: new Date().toISOString()
      });

      toast({
        title: "Lien magique envoyé",
        description: "Vérifiez votre email pour vous connecter",
      });

      return { success: true };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur d\'envoi du lien magique';
      return { success: false, error: errorMessage };
    }
  }, [validateSecureAction, toast]);

  // Enhanced sign out
  const signOut = useCallback(async () => {
    try {
      if (!(await validateSecureAction('logout'))) {
        return { success: false, error: 'Action de déconnexion refusée' };
      }

      const { error } = await supabase.auth.signOut();

      if (error) {
        return { success: false, error: error.message };
      }

      // Clear sensitive data from localStorage
      const sensitiveKeys = Object.keys(localStorage).filter(key => 
        key.includes('auth') || key.includes('session') || key.includes('token')
      );
      sensitiveKeys.forEach(key => localStorage.removeItem(key));

      await logSecurityEvent('logout_success', 'User logged out', {
        timestamp: new Date().toISOString()
      });

      await refreshSecurityContext();

      toast({
        title: "Déconnexion réussie",
        description: "Vous avez été déconnecté en toute sécurité",
      });

      return { success: true };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur de déconnexion';
      return { success: false, error: errorMessage };
    }
  }, [validateSecureAction, toast, refreshSecurityContext]);

  // Role checking functions
  const hasRole = useCallback((role: UserRole): boolean => {
    return authState.profile?.role === role;
  }, [authState.profile]);

  const hasAnyRole = useCallback((roles: UserRole[]): boolean => {
    return authState.profile ? roles.includes(authState.profile.role) : false;
  }, [authState.profile]);

  // Refresh profile
  const refreshProfile = useCallback(async () => {
    if (authState.user) {
      const profile = await loadUserProfile(authState.user.id);
      setAuthState(prev => ({ ...prev, profile }));
    }
  }, [authState.user, loadUserProfile]);

  return {
    ...authState,
    signIn,
    signUp,
    signInWithMagicLink,
    signOut,
    hasRole,
    hasAnyRole,
    refreshProfile,
    loadUserProfile
  };
};