import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AuthGuardOptions {
  requiredRole?: 'client' | 'coiffeur' | 'coiffeuse' | 'cosmetique' | 'admin';
  redirectTo?: string;
  onUnauthorized?: () => void;
}

export const useAuthGuard = (options: AuthGuardOptions = {}) => {
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [tokenExpired, setTokenExpired] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const { requiredRole, redirectTo = '/auth', onUnauthorized } = options;

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Vérifier la session actuelle
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Erreur session:', sessionError);
          setIsAuthorized(false);
          setLoading(false);
          return;
        }

        if (!session) {
          console.warn('Aucune session trouvée');
          setIsAuthorized(false);
          setLoading(false);
          if (onUnauthorized) onUnauthorized();
          else navigate(redirectTo);
          return;
        }

        // Vérifier si le token a expiré
        const now = Math.floor(Date.now() / 1000);
        if (session.expires_at && session.expires_at < now) {
          console.warn('Token expiré, tentative de refresh...');
          setTokenExpired(true);
          
          // Tenter un refresh
          const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
          
          if (refreshError || !refreshData.session) {
            console.error('Impossible de rafraîchir le token:', refreshError);
            toast({
              title: "Session expirée",
              description: "Veuillez vous reconnecter",
              variant: "destructive"
            });
            setIsAuthorized(false);
            setLoading(false);
            navigate(redirectTo);
            return;
          }
          
          setTokenExpired(false);
          setUser(refreshData.session.user);
        } else {
          setUser(session.user);
        }

        // Vérifier le rôle si requis
        if (requiredRole) {
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('role')
            .eq('user_id', session.user.id)
            .single();

          if (profileError) {
            console.error('Erreur profil:', profileError);
            toast({
              title: "Erreur d'autorisation",
              description: "Impossible de vérifier vos permissions",
              variant: "destructive"
            });
            setIsAuthorized(false);
            setLoading(false);
            return;
          }

          if (profile.role !== requiredRole) {
            console.warn(`Rôle insuffisant: ${profile.role} vs ${requiredRole}`);
            toast({
              title: "Accès refusé",
              description: `Vous n'avez pas les permissions nécessaires`,
              variant: "destructive"
            });
            setIsAuthorized(false);
            setLoading(false);
            if (onUnauthorized) onUnauthorized();
            else navigate('/403');
            return;
          }
        }

        setIsAuthorized(true);
      } catch (error) {
        console.error('Erreur auth guard:', error);
        setIsAuthorized(false);
        toast({
          title: "Erreur de sécurité",
          description: "Une erreur est survenue lors de la vérification",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    // Écouter les changements d'auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        setIsAuthorized(false);
        setUser(null);
        navigate(redirectTo);
      } else if (event === 'TOKEN_REFRESHED') {
        setTokenExpired(false);
        setUser(session?.user || null);
      }
    });

    checkAuth();

    return () => subscription.unsubscribe();
  }, [requiredRole, redirectTo, navigate, toast, onUnauthorized]);

  const refreshToken = async () => {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      if (error) throw error;
      setTokenExpired(false);
      return data.session;
    } catch (error) {
      console.error('Erreur refresh token:', error);
      setIsAuthorized(false);
      navigate(redirectTo);
      return null;
    }
  };

  return {
    isAuthorized,
    loading,
    user,
    tokenExpired,
    refreshToken
  };
};