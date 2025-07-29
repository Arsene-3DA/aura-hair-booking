import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRoleAuth, UserRole } from '@/hooks/useRoleAuth';

interface UnifiedProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  requireAuth?: boolean;
  redirectTo?: string;
}

const UnifiedProtectedRoute = ({ 
  children, 
  allowedRoles = [], 
  requireAuth = true,
  redirectTo = '/auth' 
}: UnifiedProtectedRouteProps) => {
  const { loading, isAuthenticated, userRole, hasAnyRole } = useRoleAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      // Vérifier l'authentification
      if (requireAuth && !isAuthenticated) {
        console.warn('UnifiedProtectedRoute: Unauthenticated user blocked');
        navigate(redirectTo);
        return;
      }

      // Vérifier les rôles
      if (allowedRoles.length > 0 && !hasAnyRole(allowedRoles)) {
        console.warn(`UnifiedProtectedRoute: User role '${userRole}' not in allowed roles:`, allowedRoles);
        navigate('/403');
        return;
      }
    }
  }, [loading, isAuthenticated, userRole, allowedRoles, navigate, redirectTo, hasAnyRole, requireAuth]);

  // Afficher loading pendant la vérification
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Vérification des permissions...</p>
        </div>
      </div>
    );
  }

  // Bloquer l'accès si les conditions ne sont pas remplies
  if ((requireAuth && !isAuthenticated) || 
      (allowedRoles.length > 0 && !hasAnyRole(allowedRoles))) {
    return null;
  }

  return <>{children}</>;
};

export default UnifiedProtectedRoute;