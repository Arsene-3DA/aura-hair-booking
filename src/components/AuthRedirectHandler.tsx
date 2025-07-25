import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRoleAuth } from '@/hooks/useRoleAuth';
import { useProfileRole } from '@/hooks/useProfileRole';

interface AuthRedirectHandlerProps {
  children: React.ReactNode;
}

const AuthRedirectHandler = ({ children }: AuthRedirectHandlerProps) => {
  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading, user } = useRoleAuth();
  const { data: role, isLoading: roleLoading } = useProfileRole(user?.id);

  useEffect(() => {
    // Attendre que l'authentification et le rôle soient chargés
    if (!authLoading && !roleLoading && isAuthenticated && role) {
      // Rediriger selon le rôle
      switch (role) {
        case 'admin':
          navigate('/admin');
          break;
        case 'coiffeur':
          navigate('/stylist');
          break;
        case 'client':
        default:
          navigate('/app');
          break;
      }
    }
  }, [authLoading, roleLoading, isAuthenticated, role, navigate]);

  // Afficher un loader pendant le chargement
  if (authLoading || (isAuthenticated && roleLoading)) {
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