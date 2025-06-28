
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';

interface NewAuthenticatedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'client' | 'hairdresser' | 'admin';
}

const NewAuthenticatedRoute = ({ children, requiredRole }: NewAuthenticatedRouteProps) => {
  const { user, loading, getUserRole } = useSupabaseAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate('/auth');
        return;
      }

      if (requiredRole) {
        const userRole = getUserRole();
        if (userRole !== requiredRole) {
          navigate('/auth');
          return;
        }
      }
    }
  }, [loading, user, requiredRole, navigate, getUserRole]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Vérification de votre session...</p>
        </div>
      </div>
    );
  }

  if (!user || (requiredRole && getUserRole() !== requiredRole)) {
    return null;
  }

  return <>{children}</>;
};

export default NewAuthenticatedRoute;
