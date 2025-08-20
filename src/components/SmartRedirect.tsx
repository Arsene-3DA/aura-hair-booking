import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRoleAuth } from '@/hooks/useRoleAuth';

interface SmartRedirectProps {
  children: React.ReactNode;
}

export const SmartRedirect = ({ children }: SmartRedirectProps) => {
  const { user, userProfile, loading, isAuthenticated } = useRoleAuth();
  const navigate = useNavigate();

  useEffect(() => {
    console.log('🔄 SmartRedirect Check:', {
      loading,
      isAuthenticated,
      userProfile,
      role: userProfile?.role,
      currentPath: window.location.pathname
    });

    if (!loading && isAuthenticated && userProfile?.role) {
      const currentPath = window.location.pathname;
      
      // Ne pas rediriger les pages publiques
      const publicPaths = ['/', '/professionals', '/services', '/tarifs', '/contact', '/auth'];
      const isPublicPath = publicPaths.some(path => currentPath === path || currentPath.startsWith(path));
      
      if (isPublicPath) {
        console.log('🌐 Sur une page publique, pas de redirection');
        return;
      }

      // Logique de redirection selon le rôle
      let targetPath = '';
      
      switch (userProfile.role) {
        case 'admin':
          if (!currentPath.startsWith('/admin')) {
            targetPath = '/admin';
          }
          break;
        case 'coiffeur':
        case 'coiffeuse':
        case 'cosmetique':
        case 'stylist':
          if (!currentPath.startsWith('/stylist')) {
            targetPath = '/stylist';
          }
          break;
        case 'client':
          if (!currentPath.startsWith('/app') && !currentPath.startsWith('/client')) {
            targetPath = '/app';
          }
          break;
      }

      if (targetPath) {
        console.log(`🎯 Redirection ${userProfile.role}: ${currentPath} → ${targetPath}`);
        navigate(targetPath, { replace: true });
      } else {
        console.log('✅ Utilisateur sur le bon dashboard');
      }
    }
  }, [loading, isAuthenticated, userProfile, navigate]);

  return <>{children}</>;
};