import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useGoogleAuth } from '@/contexts/GoogleAuthContext';

const PostAuthPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, loading, isAuthenticated, profile } = useGoogleAuth();

  useEffect(() => {
    console.log('🔍 PostAuthPage - État auth:', { 
      loading, 
      isAuthenticated, 
      userId: user?.id, 
      profileRole: profile?.role,
      userEmail: user?.email 
    });

    if (!loading) {
      if (!isAuthenticated) {
        console.log('❌ Pas authentifié, redirection vers /auth');
        navigate('/auth');
        return;
      }

      // Vérifier s'il y a un paramètre next
      const nextUrl = searchParams.get('next');
      if (nextUrl) {
        console.log('🔀 Redirection vers nextUrl:', nextUrl);
        navigate(nextUrl, { replace: true });
        return;
      }

      if (profile?.role) {
        console.log('✅ Profil trouvé, rôle:', profile.role);
        // Rediriger selon le rôle
        switch (profile.role) {
          case 'admin':
            console.log('🚀 Redirection vers /admin');
            navigate('/admin');
            break;
          case 'coiffeur':
            console.log('🚀 Redirection vers /stylist');
            navigate('/stylist');
            break;
          case 'client':
          default:
            console.log('🚀 Redirection vers /app');
            navigate('/app');
            break;
        }
      } else if (user) {
        console.log('⏳ Utilisateur connecté mais profil en cours de chargement...');
      } else {
        console.log('🔄 En attente des données utilisateur...');
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