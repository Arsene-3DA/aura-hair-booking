
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface ProfessionalRouteProps {
  children: React.ReactNode;
  requiredUserType?: 'hairdresser' | 'admin';
}

const ProfessionalRoute = ({ children, requiredUserType }: ProfessionalRouteProps) => {
  const { user, loading, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        navigate('/login');
        return;
      }

      if (requiredUserType && user?.user_type !== requiredUserType) {
        navigate('/login');
        return;
      }

      // Vérifier que l'utilisateur est bien un professionnel (hairdresser ou admin)
      if (user?.user_type !== 'hairdresser' && user?.user_type !== 'admin') {
        navigate('/login');
        return;
      }
    }
  }, [loading, isAuthenticated, user, requiredUserType, navigate]);

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

  if (!isAuthenticated || (requiredUserType && user?.user_type !== requiredUserType) || 
      (user?.user_type !== 'hairdresser' && user?.user_type !== 'admin')) {
    return null;
  }

  return <>{children}</>;
};

export default ProfessionalRoute;
