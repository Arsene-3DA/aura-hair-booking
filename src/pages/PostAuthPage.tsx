import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useGoogleAuth } from '@/contexts/GoogleAuthContext';

const PostAuthPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, loading, isAuthenticated, profile } = useGoogleAuth();

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

      if (profile?.role) {
        // Rediriger selon le rôle
        switch (profile.role) {
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
      } else if (user) {
        // Si profil pas encore chargé, attendre un peu plus
        console.log('Profil en cours de chargement...');
      }
    }
  }, [loading, isAuthenticated, profile, navigate, searchParams, user]);

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