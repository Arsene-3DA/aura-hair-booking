
import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useRoleAuth } from '@/hooks/useRoleAuth';
import { GoogleLoginButton } from '@/components/GoogleLoginButton';
import { EmailAuthForm } from '@/components/EmailAuthForm';

const AuthPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isAuthenticated } = useRoleAuth();
  
  // Gérer la redirection après authentification
  useEffect(() => {
    if (isAuthenticated) {
      const returnTo = searchParams.get('returnTo');
      if (returnTo) {
        // Décoder et rediriger vers l'URL de retour
        navigate(decodeURIComponent(returnTo), { replace: true });
      } else {
        // Redirection par défaut vers l'accueil
        navigate('/', { replace: true });
      }
    }
  }, [isAuthenticated, navigate, searchParams]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-primary">
              Salon de Coiffure
            </CardTitle>
            <p className="text-muted-foreground">
              Connectez-vous ou créez un compte
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <GoogleLoginButton />
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Ou continuer avec
                </span>
              </div>
            </div>

            <EmailAuthForm />
          </CardContent>
        </Card>

        <div className="text-center">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="text-muted-foreground hover:text-foreground"
          >
            ← Retour à l'accueil
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
