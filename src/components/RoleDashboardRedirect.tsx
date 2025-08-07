import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRoleAuth } from '@/hooks/useRoleAuth';
import { useRealtimeRoleSync } from '@/hooks/useRealtimeRoleSync';

interface RoleDashboardRedirectProps {
  children: React.ReactNode;
}

const RoleDashboardRedirect = ({ children }: RoleDashboardRedirectProps) => {
  const { loading, isAuthenticated, userProfile } = useRoleAuth();
  const navigate = useNavigate();
  
  // Activer la synchronisation en temps réel des rôles
  useRealtimeRoleSync();

  useEffect(() => {
    if (!loading && isAuthenticated && userProfile?.role) {
      const currentPath = window.location.pathname;
      
      // Vérifier si l'utilisateur est sur le bon dashboard selon son rôle
      const shouldRedirect = () => {
        switch (userProfile.role) {
          case 'admin':
            return !currentPath.startsWith('/admin');
          case 'coiffeur':
          case 'coiffeuse':
          case 'cosmetique':
            return !currentPath.startsWith('/stylist');
          case 'client':
            return !currentPath.startsWith('/app') && !currentPath.startsWith('/client');
          default:
            return false;
        }
      };

      if (shouldRedirect()) {
        // Rediriger vers le dashboard approprié
        switch (userProfile.role) {
          case 'admin':
            navigate('/admin', { replace: true });
            break;
          case 'coiffeur':
          case 'coiffeuse':
          case 'cosmetique':
            navigate('/stylist', { replace: true });
            break;
          case 'client':
            navigate('/app', { replace: true });
            break;
        }
      }
    }
  }, [loading, isAuthenticated, userProfile, navigate]);

  return <>{children}</>;
};

export default RoleDashboardRedirect;