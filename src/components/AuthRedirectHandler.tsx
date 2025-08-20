import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRoleAuth } from '@/hooks/useRoleAuth';
import { useProfileRole } from '@/hooks/useProfileRole';

interface AuthRedirectHandlerProps {
  children: React.ReactNode;
}

const AuthRedirectHandler = ({ children }: AuthRedirectHandlerProps) => {
  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading, user, userProfile } = useRoleAuth();

  useEffect(() => {
    console.log('🔄 AuthRedirectHandler:', {
      authLoading,
      isAuthenticated,
      user: user?.email,
      userProfile,
      role: userProfile?.role
    });

    // Attendre que l'authentification et le profil soient chargés
    if (!authLoading && isAuthenticated && userProfile?.role) {
      console.log(`🎯 Redirection automatique pour le rôle: ${userProfile.role}`);
      
      // Rediriger selon le rôle vers le dashboard approprié
      switch (userProfile.role) {
        case 'admin':
          console.log('👨‍💼 Redirection vers dashboard admin');
          navigate('/admin', { replace: true });
          break;
        case 'coiffeur':
        case 'coiffeuse':
        case 'cosmetique':
          console.log('✂️ Redirection vers dashboard professionnel');
          navigate('/stylist', { replace: true });
          break;
        case 'client':
        default:
          console.log('👤 Redirection vers dashboard client');
          navigate('/app', { replace: true });
          break;
      }
    }
  }, [authLoading, isAuthenticated, userProfile, navigate]);

  // Afficher un loader pendant le chargement
  if (authLoading || (isAuthenticated && !userProfile)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Redirection en cours...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default AuthRedirectHandler;