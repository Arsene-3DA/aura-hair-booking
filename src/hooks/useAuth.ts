
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/hooks/use-toast";

interface User {
  id: string;
  email: string;
  user_type: 'client' | 'coiffeur' | 'admin';
  first_name?: string;
  last_name?: string;
  phone?: string;
  is_active: boolean;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    isAuthenticated: false
  });
  const { toast } = useToast();

  useEffect(() => {
    checkCurrentUser();
  }, []);

  const checkCurrentUser = async () => {
    try {
      const sessionToken = localStorage.getItem('session_token');
      if (!sessionToken) {
        setAuthState({ user: null, loading: false, isAuthenticated: false });
        return;
      }

      const { data, error } = await supabase
        .from('user_sessions')
        .select(`
          user_id,
          expires_at,
          users!inner(*)
        `)
        .eq('session_token', sessionToken)
        .gt('expires_at', new Date().toISOString())
        .single();

      if (error || !data) {
        console.log('Session invalide ou expirée:', error);
        localStorage.removeItem('session_token');
        setAuthState({ user: null, loading: false, isAuthenticated: false });
        return;
      }

      const userData = data.users as any;
      setAuthState({
        user: {
          id: userData.id,
          email: userData.email,
          user_type: userData.user_type as 'client' | 'coiffeur' | 'admin',
          first_name: userData.first_name,
          last_name: userData.last_name,
          phone: userData.phone,
          is_active: userData.is_active
        },
        loading: false,
        isAuthenticated: true
      });
    } catch (error) {
      console.error('Erreur lors de la vérification de l\'utilisateur:', error);
      setAuthState({ user: null, loading: false, isAuthenticated: false });
    }
  };

  const login = async (email: string, password: string) => {
    try {
      console.log('Tentative de connexion pour:', email);
      
      // D'abord, vérifier si l'utilisateur existe sans hash
      let { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email.toLowerCase().trim())
        .eq('is_active', true)
        .single();

      if (error && error.code === 'PGRST116') {
        // Utilisateur non trouvé
        console.error('Utilisateur non trouvé:', error);
        throw new Error('Email ou mot de passe incorrect');
      }

      if (!user) {
        throw new Error('Email ou mot de passe incorrect');
      }

      // Vérifier le mot de passe hashé
      const { data: hashedPassword, error: hashError } = await supabase.rpc('hash_password', { password });
      
      if (hashError) {
        console.error('Erreur de hashage:', hashError);
        throw new Error('Erreur lors du traitement du mot de passe');
      }

      if (user.password_hash !== hashedPassword) {
        console.error('Mot de passe incorrect');
        throw new Error('Email ou mot de passe incorrect');
      }

      // Nettoyer les anciennes sessions de cet utilisateur
      const { error: deleteError } = await supabase
        .from('user_sessions')
        .delete()
        .eq('user_id', user.id);

      console.log('Nettoyage des anciennes sessions:', deleteError || 'OK');

      // Créer une nouvelle session
      const sessionToken = crypto.randomUUID();
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24); // 24h

      // Insérer directement sans RLS pour éviter les problèmes de permissions
      const { error: sessionError } = await supabase
        .from('user_sessions')
        .insert({
          user_id: user.id,
          session_token: sessionToken,
          expires_at: expiresAt.toISOString()
        });

      if (sessionError) {
        console.error('Erreur création session:', sessionError);
        // Essayer une approche alternative si RLS bloque
        try {
          // Utiliser rpc pour créer la session si les politiques RLS bloquent
          const { error: rpcError } = await supabase.rpc('create_user_session', {
            p_user_id: user.id,
            p_session_token: sessionToken,
            p_expires_at: expiresAt.toISOString()
          });
          
          if (rpcError) {
            throw rpcError;
          }
        } catch (rpcFallbackError) {
          console.error('Erreur avec RPC fallback:', rpcFallbackError);
          throw new Error('Erreur lors de la création de la session');
        }
      }

      localStorage.setItem('session_token', sessionToken);

      setAuthState({
        user: {
          id: user.id,
          email: user.email,
          user_type: user.user_type as 'client' | 'coiffeur' | 'admin',
          first_name: user.first_name,
          last_name: user.last_name,
          phone: user.phone,
          is_active: user.is_active
        },
        loading: false,
        isAuthenticated: true
      });

      toast({
        title: "✅ Connexion réussie",
        description: `Bienvenue ${user.first_name || user.email}!`
      });

      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur de connexion';
      console.error('Erreur complète de connexion:', error);
      
      toast({
        title: "❌ Erreur de connexion",
        description: errorMessage,
        variant: "destructive"
      });
      return { success: false, error: errorMessage };
    }
  };

  const logout = async () => {
    try {
      const sessionToken = localStorage.getItem('session_token');
      if (sessionToken) {
        await supabase
          .from('user_sessions')
          .delete()
          .eq('session_token', sessionToken);
      }

      localStorage.removeItem('session_token');
      setAuthState({ user: null, loading: false, isAuthenticated: false });

      toast({
        title: "Déconnexion",
        description: "À bientôt !"
      });
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  const createCoiffeurUser = async (userData: {
    email: string;
    password: string;
    first_name: string;
    last_name?: string;
    phone?: string;
    hairdresser_id: string;
  }) => {
    try {
      const { data: hashedPassword } = await supabase.rpc('hash_password', { password: userData.password });

      const { data: newUser, error: userError } = await supabase
        .from('users')
        .insert({
          email: userData.email,
          password_hash: hashedPassword,
          user_type: 'coiffeur',
          first_name: userData.first_name,
          last_name: userData.last_name,
          phone: userData.phone
        })
        .select()
        .single();

      if (userError) {
        if (userError.code === '23505') {
          throw new Error('Un utilisateur avec cet email existe déjà');
        }
        throw userError;
      }

      // Créer le profil coiffeur
      const { error: profileError } = await supabase
        .from('coiffeur_profiles')
        .insert({
          user_id: newUser.id,
          hairdresser_id: userData.hairdresser_id
        });

      if (profileError) {
        throw profileError;
      }

      toast({
        title: "✅ Compte coiffeur créé",
        description: `Le compte pour ${userData.first_name} a été créé avec succès`
      });

      return { success: true };
    } catch (error) {
      const errorMessage = error instance of Error ? error.message : 'Erreur lors de la création du compte';
      toast({
        title: "❌ Erreur",
        description: errorMessage,
        variant: "destructive"
      });
      return { success: false, error: errorMessage };
    }
  };

  return {
    ...authState,
    login,
    logout,
    createCoiffeurUser,
    checkCurrentUser
  };
};
