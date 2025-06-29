
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRoleAuth } from '@/hooks/useRoleAuth';
import { UserRole } from '@/hooks/useUsers';

interface RoleProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
  redirectTo?: string;
}

const RoleProtectedRoute = ({ 
  children, 
  allowedRoles, 
  redirectTo = '/auth' 
}: RoleProtectedRouteProps) => {
  const { loading, isAuthenticated, userRole, hasAnyRole } = useRoleAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        navigate(redirectTo);
        return;
      }

      if (!hasAnyRole(allowedRoles)) {
        navigate(redirectTo);
        return;
      }
    }
  }, [loading, isAuthenticated, userRole, allowedRoles, navigate, redirectTo, hasAnyRole]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Vérification de vos permissions...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !hasAnyRole(allowedRoles)) {
    return null;
  }

  return <>{children}</>;
};

export default RoleProtectedRoute;
