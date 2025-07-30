import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRoleAuth } from '@/hooks/useRoleAuth';

interface RequireAuthProps {
  children: React.ReactNode;
  allowedRoles?: ('client' | 'stylist' | 'admin' | 'coiffeur' | 'cosmetique')[];
  redirectTo?: string;
}

const RequireAuth: React.FC<RequireAuthProps> = ({ 
  children, 
  allowedRoles = [], 
  redirectTo = '/login' 
}) => {
  const { isAuthenticated, userProfile: profile, loading } = useRoleAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      // Rediriger si non authentifié
      if (!isAuthenticated) {
        navigate(redirectTo);
        return;
      }

      // Vérifier les rôles si spécifiés
      if (allowedRoles.length > 0 && profile) {
        if (!allowedRoles.includes(profile.role)) {
          navigate('/403'); // Page d'accès refusé
          return;
        }
      }
    }
  }, [loading, isAuthenticated, profile, allowedRoles, navigate, redirectTo]);

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
  if (!isAuthenticated || (allowedRoles.length > 0 && profile && !allowedRoles.includes(profile.role))) {
    return null;
  }

  return <>{children}</>;
};

export default RequireAuth;