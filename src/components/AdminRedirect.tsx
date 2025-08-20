import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useRoleAuth } from '@/hooks/useRoleAuth';

interface AdminRedirectProps {
  children: React.ReactNode;
}

export const AdminRedirect = ({ children }: AdminRedirectProps) => {
  const { user, userProfile, loading, isAuthenticated } = useRoleAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Attendre que l'authentification et le profil soient chargés
    if (!loading && isAuthenticated && userProfile) {
      // Si l'utilisateur est admin et se trouve sur une page non-admin
      if (userProfile.role === 'admin' && !location.pathname.startsWith('/admin')) {
        // Exclure les pages publiques
        const publicPaths = ['/', '/professionals', '/services', '/tarifs', '/contact', '/auth'];
        const isOnPublicPath = publicPaths.some(path => 
          location.pathname === path || location.pathname.startsWith(path)
        );
        
        if (!isOnPublicPath) {
          // Rediriger vers le dashboard admin
          navigate('/admin', { replace: true });
        }
      }
    }
  }, [loading, isAuthenticated, userProfile, location.pathname, navigate]);

  return <>{children}</>;
};