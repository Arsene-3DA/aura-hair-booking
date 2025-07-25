import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRoleAuth } from '@/hooks/useRoleAuth';
import { UserRole } from '@/hooks/useUsers';

interface SecureRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  requireAuth?: boolean;
  redirectTo?: string;
}

const SecureRoute = ({ 
  children, 
  allowedRoles = [], 
  requireAuth = true,
  redirectTo = '/role-auth' 
}: SecureRouteProps) => {
  const { loading, isAuthenticated, userRole, hasAnyRole } = useRoleAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      // Check authentication requirement
      if (requireAuth && !isAuthenticated) {
        console.warn('SecureRoute: Unauthenticated user blocked');
        navigate(redirectTo);
        return;
      }

      // Check role requirements
      if (allowedRoles.length > 0 && !hasAnyRole(allowedRoles)) {
        console.warn(`SecureRoute: User role '${userRole}' not in allowed roles:`, allowedRoles);
        navigate(redirectTo);
        return;
      }
    }
  }, [loading, isAuthenticated, userRole, allowedRoles, navigate, redirectTo, hasAnyRole, requireAuth]);

  // Show loading while checking auth
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

  // Block access if requirements not met
  if ((requireAuth && !isAuthenticated) || 
      (allowedRoles.length > 0 && !hasAnyRole(allowedRoles))) {
    return null;
  }

  return <>{children}</>;
};

export default SecureRoute;