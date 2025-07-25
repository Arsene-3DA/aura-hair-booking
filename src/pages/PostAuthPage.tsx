import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useRoleAuth } from '@/hooks/useRoleAuth';
import { useProfileRole } from '@/hooks/useProfileRole';

const PostAuthPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, loading, isAuthenticated } = useRoleAuth();
  const { data: profileRole } = useProfileRole(user?.id);

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        // Si pas authentifié, rediriger vers auth
        navigate('/auth');
        return;
      }

      // Vérifier s'il y a un paramètre next
      const nextUrl = searchParams.get('next');
      if (nextUrl) {
        navigate(nextUrl, { replace: true });
        return;
      }

      if (profileRole) {
        // Rediriger selon le rôle
        switch (profileRole) {
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
    }
  }, [loading, isAuthenticated, profileRole, navigate, searchParams]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-6"></div>
        <h2 className="text-xl font-semibold text-foreground mb-2">
          Connexion en cours...
        </h2>
        <p className="text-muted-foreground">
          Redirection vers votre espace personnel
        </p>
      </div>
    </div>
  );
};

export default PostAuthPage;