
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRoleAuth } from '@/hooks/useRoleAuth';

interface RoleProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: ('client' | 'coiffeur' | 'coiffeuse' | 'cosmetique' | 'admin' | 'stylist')[];
  redirectTo?: string;
}

const RoleProtectedRoute = ({ 
  children, 
  allowedRoles, 
  redirectTo = '/auth' 
}: RoleProtectedRouteProps) => {
  const { loading, isAuthenticated, userProfile: profile } = useRoleAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        navigate(redirectTo);
        return;
      }

      if (allowedRoles.length > 0 && profile && !allowedRoles.includes(profile.role)) {
        // Au lieu de rediriger vers 403, rediriger vers le dashboard approprié
        switch (profile.role) {
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
          default:
            navigate('/403');
            break;
        }
        return;
      }
    }
  }, [loading, isAuthenticated, profile, allowedRoles, navigate, redirectTo]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Vérification de vos permissions...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || (allowedRoles.length > 0 && profile && !allowedRoles.includes(profile.role))) {
    return null;
  }

  return <>{children}</>;
};

export default RoleProtectedRoute;
