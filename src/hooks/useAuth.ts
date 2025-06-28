
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
      console.log('=== DÉBUT DIAGNOSTIC CONNEXION ===');
      console.log('1. Email fourni:', email);
      console.log('2. Email nettoyé:', email.toLowerCase().trim());
      
      // Première étape : vérifier tous les utilisateurs pour diagnostic
      console.log('3. Récupération de tous les utilisateurs pour diagnostic...');
      const { data: allUsers, error: allUsersError } = await supabase
        .from('users')
        .select('email, user_type, is_active');
      
      if (allUsersError) {
        console.error('Erreur récupération tous les utilisateurs:', allUsersError);
      } else {
        console.log('4. Tous les utilisateurs trouvés:', allUsers);
        const userExists = allUsers?.find(u => u.email === email.toLowerCase().trim());
        console.log('5. Utilisateur correspondant trouvé:', userExists);
      }

      // Deuxième étape : chercher l'utilisateur spécifique
      console.log('6. Recherche utilisateur spécifique...');
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email.toLowerCase().trim())
        .eq('is_active', true)
        .single();

      console.log('7. Résultat recherche utilisateur:', { user, error });

      if (error) {
        console.error('8. Erreur lors de la recherche utilisateur:', error);
        if (error.code === 'PGRST116') {
          throw new Error('Aucun utilisateur actif trouvé avec cet email. Vérifiez que les données de test ont été correctement insérées.');
        }
        throw new Error(`Erreur de base de données: ${error.message}`);
      }

      if (!user) {
        throw new Error('Utilisateur non trouvé après recherche');
      }

      console.log('9. Utilisateur trouvé avec succès:', { 
        id: user.id, 
        email: user.email, 
        type: user.user_type,
        active: user.is_active 
      });

      // Troisième étape : vérifier le mot de passe
      console.log('10. Vérification du mot de passe...');
      const { data: hashedPassword, error: hashError } = await supabase.rpc('hash_password', { password });
      
      if (hashError) {
        console.error('11. Erreur de hashage:', hashError);
        throw new Error('Erreur lors du traitement du mot de passe');
      }

      console.log('12. Mot de passe hashé:', hashedPassword);
      console.log('13. Hash stocké en base:', user.password_hash);
      console.log('14. Les hash correspondent-ils?', user.password_hash === hashedPassword);

      if (user.password_hash !== hashedPassword) {
        console.error('15. ÉCHEC: Les mots de passe ne correspondent pas');
        throw new Error('Mot de passe incorrect');
      }

      console.log('16. SUCCESS: Mot de passe vérifié avec succès');

      // Quatrième étape : nettoyer les anciennes sessions
      console.log('17. Nettoyage des anciennes sessions...');
      const { error: deleteError } = await supabase
        .from('user_sessions')
        .delete()
        .eq('user_id', user.id);

      if (deleteError) {
        console.log('18. Erreur nettoyage sessions (non bloquant):', deleteError);
      } else {
        console.log('18. Anciennes sessions nettoyées avec succès');
      }

      // Cinquième étape : créer une nouvelle session
      const sessionToken = crypto.randomUUID();
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);

      console.log('19. Création nouvelle session...', {
        user_id: user.id,
        session_token: sessionToken.substring(0, 8) + '...',
        expires_at: expiresAt.toISOString()
      });

      const { error: sessionError } = await supabase
        .from('user_sessions')
        .insert({
          user_id: user.id,
          session_token: sessionToken,
          expires_at: expiresAt.toISOString()
        });

      if (sessionError) {
        console.error('20. ÉCHEC création session:', sessionError);
        throw new Error(`Erreur création session: ${sessionError.message}`);
      }

      console.log('21. SUCCESS: Session créée avec succès');

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

      console.log('22. SUCCESS: État utilisateur mis à jour');
      console.log('=== FIN DIAGNOSTIC CONNEXION ===');

      toast({
        title: "✅ Connexion réussie",
        description: `Bienvenue ${user.first_name || user.email}!`
      });

      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur de connexion inconnue';
      console.error('=== ÉCHEC CONNEXION ===');
      console.error('Erreur complète:', error);
      console.error('Message d\'erreur:', errorMessage);
      
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
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors de la création du compte';
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
