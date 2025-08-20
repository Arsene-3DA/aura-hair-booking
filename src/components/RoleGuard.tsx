import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRoleAuth, UserRole } from '@/hooks/useRoleAuth';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Shield, AlertTriangle } from 'lucide-react';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
  redirectTo?: string;
}

const RoleGuard = ({ 
  children, 
  allowedRoles, 
  redirectTo = '/post-login' 
}: RoleGuardProps) => {
  const navigate = useNavigate();
  const { user, userProfile, loading, isAuthenticated } = useRoleAuth();

  useEffect(() => {
    // Rediriger si pas authentifié
    if (!loading && !isAuthenticated) {
      console.log('🔒 RoleGuard: Not authenticated, redirecting to /auth');
      navigate('/auth', { replace: true });
      return;
    }

    // Vérifier les permissions une fois le profil chargé
    if (!loading && isAuthenticated && userProfile) {
      const userRole = userProfile.role;
      const hasPermission = allowedRoles.includes(userRole);
      
      console.log('🛡️ RoleGuard: Checking access', {
        userRole,
        allowedRoles,
        hasPermission
      });

      if (!hasPermission) {
        console.log('❌ RoleGuard: Access denied, redirecting to', redirectTo);
        navigate(redirectTo, { replace: true });
        return;
      }
    }
  }, [loading, isAuthenticated, userProfile, allowedRoles, navigate, redirectTo]);

  // Afficher un écran de chargement pendant la vérification
  if (loading || !userProfile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              
              <div className="space-y-2">
                <h2 className="text-xl font-semibold">Vérification des permissions</h2>
                <p className="text-muted-foreground">
                  Nous vérifions vos droits d'accès...
                </p>
              </div>
              
              <div className="flex items-center justify-center space-x-2">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                <span className="text-sm text-muted-foreground">
                  Chargement en cours...
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Bloquer l'accès si pas les bonnes permissions
  if (!isAuthenticated || !allowedRoles.includes(userProfile.role)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center">
                <AlertTriangle className="h-8 w-8 text-destructive" />
              </div>
              
              <div className="space-y-2">
                <h2 className="text-xl font-semibold">Accès refusé</h2>
                <p className="text-muted-foreground">
                  Vous n'avez pas les permissions nécessaires pour accéder à cette section.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
};

export default RoleGuard;