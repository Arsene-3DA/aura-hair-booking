import React from 'react';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { Loader2, Shield, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface AuthorizedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'client' | 'coiffeur' | 'coiffeuse' | 'cosmetique' | 'admin';
  fallback?: React.ReactNode;
}

export const AuthorizedRoute: React.FC<AuthorizedRouteProps> = ({
  children,
  requiredRole,
  fallback
}) => {
  const { isAuthorized, loading, tokenExpired, refreshToken } = useAuthGuard({
    requiredRole
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Vérification des autorisations...</p>
        </div>
      </div>
    );
  }

  if (tokenExpired) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Session expirée
            </CardTitle>
            <CardDescription>
              Votre session a expiré. Cliquez sur le bouton ci-dessous pour la renouveler.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={refreshToken} className="w-full">
              Renouveler la session
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isAuthorized === false) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-destructive" />
              Accès refusé
            </CardTitle>
            <CardDescription>
              Vous n'avez pas les permissions nécessaires pour accéder à cette page.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => window.location.href = '/'} variant="outline" className="w-full">
              Retour à l'accueil
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
};