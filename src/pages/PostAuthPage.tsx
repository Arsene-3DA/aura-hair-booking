import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRoleAuth } from '@/hooks/useRoleAuth';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, LayoutDashboard } from 'lucide-react';

const PostAuthPage = () => {
  const navigate = useNavigate();
  const { user, userProfile, loading, isAuthenticated } = useRoleAuth();

  useEffect(() => {
    // Rediriger si pas authentifié
    if (!loading && !isAuthenticated) {
      console.log('🔄 PostAuth: Not authenticated, redirecting to /auth');
      navigate('/auth', { replace: true });
      return;
    }

    // Rediriger selon le rôle une fois le profil chargé
    if (!loading && isAuthenticated && userProfile) {
      const role = userProfile.role;
      console.log('🎯 PostAuth: Redirecting user with role:', role);

      switch (role) {
        case 'admin':
          console.log('👨‍💼 Redirecting admin to /admin');
          navigate('/admin', { replace: true });
          break;
        case 'coiffeur':
        case 'coiffeuse':
        case 'cosmetique':
          console.log('✂️ Redirecting stylist to /stylist');
          navigate('/stylist', { replace: true });
          break;
        case 'client':
        default:
          console.log('👤 Redirecting client to /app');
          navigate('/app', { replace: true });
          break;
      }
    }
  }, [loading, isAuthenticated, userProfile, navigate]);

  // Afficher un écran de chargement pendant la résolution du rôle
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <LayoutDashboard className="h-8 w-8 text-primary" />
            </div>
            
            <div className="space-y-2">
              <h2 className="text-xl font-semibold">Redirection en cours...</h2>
              <p className="text-muted-foreground">
                Nous vous dirigeons vers votre espace personnel
              </p>
            </div>
            
            <div className="flex items-center justify-center space-x-2">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              <span className="text-sm text-muted-foreground">
                {loading ? 'Chargement de votre profil...' : 'Redirection...'}
              </span>
            </div>
            
            {user && (
              <div className="text-xs text-muted-foreground/75 border-t pt-3">
                Connecté en tant que: {user.email}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PostAuthPage;