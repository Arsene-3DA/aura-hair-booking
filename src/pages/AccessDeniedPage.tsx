import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import { useRoleAuth } from '@/hooks/useRoleAuth';
import { AlertTriangle, ArrowLeft } from 'lucide-react';

const AccessDeniedPage = () => {
  const navigate = useNavigate();
  const { userProfile: profile, signOut, loading, isAuthenticated } = useRoleAuth();

  // SECURITY FIX: Debug logging pour comprendre le problème d'accès
  useEffect(() => {
    console.log('=== ACCESS DENIED PAGE DEBUG ===');
    console.log('Loading:', loading);
    console.log('IsAuthenticated:', isAuthenticated);
    console.log('Profile:', profile);
    console.log('Current URL:', window.location.href);
    console.log('Previous page:', document.referrer);
    console.log('================================');
  }, [loading, isAuthenticated, profile]);

  const handleGoHome = () => {
    if (profile) {
      // Rediriger vers le dashboard approprié selon le rôle
      switch (profile.role) {
        case 'admin':
          navigate('/admin');
          break;
        case 'coiffeur':
          navigate('/stylist');
          break;
        case 'client':
        default:
          navigate('/client');
          break;
      }
    } else {
      navigate('/');
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-foreground">
            Accès refusé
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">
            Vous n'avez pas les permissions nécessaires pour accéder à cette page.
          </p>
          
          {profile && (
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm">
                <strong>Votre rôle actuel :</strong> {profile.role}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Contactez un administrateur pour modifier vos permissions.
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Button
              onClick={() => window.history.back()}
              variant="outline"
              className="w-full"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
            
            <Button
              onClick={handleGoHome}
              className="w-full"
            >
              Retour à mon espace
            </Button>
            
            <Button
              onClick={handleSignOut}
              variant="outline"
              className="w-full"
            >
              Se déconnecter
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AccessDeniedPage;