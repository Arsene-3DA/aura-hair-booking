// SECURITY FIX: Unified secure authentication hook

import { useState, useEffect, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { validateSecureInput, logSecurityEvent, trackFailedLogin, clearFailedLoginAttempts } from '@/utils/security';
import { validateSecurityRequirements, generateCSRFToken } from '@/utils/securityMiddleware';
import { useToast } from '@/hooks/use-toast';

export type UserRole = 'client' | 'coiffeur' | 'admin';

interface SecureAuthState {
  user: User | null;
  session: Session | null;
  profile: any | null;
  loading: boolean;
  isAuthenticated: boolean;
  csrfToken: string;
}

export const useSecureAuth = () => {
  const { toast } = useToast();
  const [authState, setAuthState] = useState<SecureAuthState>({
    user: null,
    session: null,
    profile: null,
    loading: true,
    isAuthenticated: false,
    csrfToken: generateCSRFToken()
  });

  // SECURITY FIX: Load user profile with error handling
  const loadUserProfile = useCallback(async (userId: string) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (!profile) {
        // Create default profile if none exists
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert([{
            user_id: userId,
            role: 'client' as UserRole,
            full_name: authState.user?.email || 'Utilisateur'
          }])
          .select()
          .single();

        if (createError) throw createError;
        return newProfile;
      }

      return profile;
    } catch (error) {
      console.error('Error loading user profile:', error);
        await logSecurityEvent('profile_load_failed', 'Failed to load user profile', {
          userId,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      return null;
    }
  }, [authState.user?.email]);

  // SECURITY FIX: Initialize auth state with security validation
  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        // Set up auth state listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            if (!mounted) return;

            // SECURITY FIX: Log auth events
            await logSecurityEvent('auth_state_change', `Auth event: ${event}`, {
              event,
              userId: session?.user?.id
            });

            let profile = null;
            if (session?.user) {
              profile = await loadUserProfile(session.user.id);
            }

            setAuthState(prev => ({
              ...prev,
              user: session?.user ?? null,
              session,
              profile,
              loading: false,
              isAuthenticated: !!session?.user
            }));
          }
        );

        // Check for existing session
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Error getting session:', error);
          await logSecurityEvent('session_error', 'Error retrieving session', {
            error: error.message
          });
        }

        if (session?.user && mounted) {
          const profile = await loadUserProfile(session.user.id);
          setAuthState(prev => ({
            ...prev,
            user: session.user,
            session,
            profile,
            loading: false,
            isAuthenticated: true
          }));
        } else if (mounted) {
          setAuthState(prev => ({
            ...prev,
            loading: false
          }));
        }

        return () => {
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error('Auth initialization error:', error);
        if (mounted) {
          setAuthState(prev => ({
            ...prev,
            loading: false
          }));
        }
      }
    };

    initializeAuth();

    return () => {
      mounted = false;
    };
  }, [loadUserProfile]);

  // SECURITY FIX: Secure sign up with validation
  const signUp = useCallback(async (
    email: string, 
    password: string, 
    userData?: { role?: UserRole; name?: string }
  ) => {
    try {
      // SECURITY FIX: Validate inputs
      const emailValidation = validateSecureInput(email, 'email');
      const passwordValidation = validateSecureInput(password, 'password');

      if (!emailValidation.isValid) {
        throw new Error(emailValidation.errors.join(', '));
      }

      if (!passwordValidation.isValid) {
        throw new Error(passwordValidation.errors.join(', '));
      }

      // SECURITY FIX: Rate limiting
      const securityCheck = await validateSecurityRequirements({
        rateLimitKey: 'signup',
        maxAttempts: 3,
        windowMs: 300000, // 5 minutes
        logSecurity: true
      }, {
        userAgent: navigator.userAgent,
        formData: { email: emailValidation.sanitized }
      });

      if (!securityCheck.valid) {
        throw new Error(securityCheck.errors.join(', '));
      }

      await logSecurityEvent('signup_attempt', 'User signup attempt', {
        email: emailValidation.sanitized
      });

      const { data, error } = await supabase.auth.signUp({
        email: emailValidation.sanitized,
        password: passwordValidation.sanitized,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            role: userData?.role || 'client',
            name: userData?.name || emailValidation.sanitized
          }
        }
      });

      if (error) {
        await logSecurityEvent('signup_failed', 'Signup failed', {
          email: emailValidation.sanitized,
          error: error.message
        });
        throw error;
      }

      await logSecurityEvent('signup_success', 'User signup successful', {
        email: emailValidation.sanitized,
        userId: data.user?.id
      });

      return { success: true, user: data.user };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors de l\'inscription';
      toast({
        title: "Erreur d'inscription",
        description: errorMessage,
        variant: "destructive"
      });
      return { success: false, error: errorMessage };
    }
  }, [toast]);

  // SECURITY FIX: Secure sign in with brute force protection
  const signIn = useCallback(async (email: string, password: string) => {
    try {
      // SECURITY FIX: Validate inputs
      const emailValidation = validateSecureInput(email, 'email');
      
      if (!emailValidation.isValid) {
        throw new Error(emailValidation.errors.join(', '));
      }

      // SECURITY FIX: Check failed login attempts
      const failedAttempts = trackFailedLogin(emailValidation.sanitized);
      if (failedAttempts >= 5) {
        await logSecurityEvent('brute_force_detected', 'Brute force attack detected', {
          email: emailValidation.sanitized,
          attempts: failedAttempts
        });
        throw new Error('Trop de tentatives de connexion. Veuillez patienter 15 minutes.');
      }

      await logSecurityEvent('signin_attempt', 'User signin attempt', {
        email: emailValidation.sanitized,
        failedAttempts
      });

      const { data, error } = await supabase.auth.signInWithPassword({
        email: emailValidation.sanitized,
        password
      });

      if (error) {
        trackFailedLogin(emailValidation.sanitized);
        await logSecurityEvent('signin_failed', 'Signin failed', {
          email: emailValidation.sanitized,
          error: error.message
        });
        throw error;
      }

      // SECURITY FIX: Clear failed attempts on successful login
      clearFailedLoginAttempts(emailValidation.sanitized);
      
      await logSecurityEvent('signin_success', 'User signin successful', {
        email: emailValidation.sanitized,
        userId: data.user?.id
      });

      return { success: true, user: data.user };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur de connexion';
      toast({
        title: "Erreur de connexion",
        description: errorMessage,
        variant: "destructive"
      });
      return { success: false, error: errorMessage };
    }
  }, [toast]);

  // SECURITY FIX: Secure Google sign in
  const signInWithGoogle = useCallback(async () => {
    try {
      await logSecurityEvent('google_signin_attempt', 'Google signin attempt', {});

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/post-auth`
        }
      });

      if (error) {
        await logSecurityEvent('google_signin_failed', 'Google signin failed', {
          error: error.message
        });
        throw error;
      }

      return { success: true, data };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur de connexion Google';
      toast({
        title: "Erreur de connexion",
        description: errorMessage,
        variant: "destructive"
      });
      return { success: false, error: errorMessage };
    }
  }, [toast]);

  // SECURITY FIX: Secure sign out with cleanup
  const signOut = useCallback(async () => {
    try {
      await logSecurityEvent('signout_attempt', 'User signout attempt', {
        userId: authState.user?.id
      });

      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      // SECURITY FIX: Clear sensitive data from localStorage
      localStorage.removeItem('session.user_agent');
      localStorage.removeItem('lastAdminPromotion');
      
      // Generate new CSRF token
      setAuthState(prev => ({
        ...prev,
        csrfToken: generateCSRFToken()
      }));

      await logSecurityEvent('signout_success', 'User signout successful', {});

      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur de déconnexion';
      toast({
        title: "Erreur de déconnexion",
        description: errorMessage,
        variant: "destructive"
      });
      return { success: false, error: errorMessage };
    }
  }, [authState.user?.id, toast]);

  // SECURITY FIX: Role checking utilities
  const hasRole = useCallback((role: UserRole): boolean => {
    return authState.profile?.role === role;
  }, [authState.profile?.role]);

  const hasAnyRole = useCallback((roles: UserRole[]): boolean => {
    return authState.profile?.role && roles.includes(authState.profile.role);
  }, [authState.profile?.role]);

  const refreshProfile = useCallback(async () => {
    if (authState.user?.id) {
      const profile = await loadUserProfile(authState.user.id);
      setAuthState(prev => ({ ...prev, profile }));
    }
  }, [authState.user?.id, loadUserProfile]);

  return {
    ...authState,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    hasRole,
    hasAnyRole,
    refreshProfile
  };
};