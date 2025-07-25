import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import { useGoogleAuth } from '@/contexts/GoogleAuthContext';
import { FaGoogle } from 'react-icons/fa';
import { Loader2, User, Shield, UserCheck } from 'lucide-react';

const LoginPage = () => {
  const navigate = useNavigate();
  const { signInWithGoogle, loading, isAuthenticated } = useGoogleAuth();

  // Rediriger si déjà connecté
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/post-auth');
    }
  }, [isAuthenticated, navigate]);

  const handleGoogleLogin = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('Erreur de connexion:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-primary">
            Salon Aura
          </CardTitle>
          <p className="text-muted-foreground mt-2">
            Connectez-vous à votre espace personnel
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Bouton de connexion Google */}
          <Button
            onClick={handleGoogleLogin}
            className="w-full bg-white text-gray-700 border border-input hover:bg-accent flex items-center justify-center gap-3 py-6 text-lg"
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <FaGoogle className="text-red-500 text-lg" />
            )}
            Se connecter avec Google
          </Button>

          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-4">
              Connexion sécurisée via Google OAuth
            </p>
            
            {/* Informations sur les rôles */}
            <div className="bg-muted/30 rounded-lg p-4 text-left space-y-3">
              <h4 className="font-semibold text-foreground mb-3 text-center">Rôles disponibles</h4>
              
              <div className="flex items-center gap-3 text-sm">
                <User className="h-4 w-4 text-blue-500 flex-shrink-0" />
                <div>
                  <strong className="text-foreground">Client :</strong>
                  <span className="text-muted-foreground ml-1">Réservation de rendez-vous</span>
                </div>
              </div>
              
              <div className="flex items-center gap-3 text-sm">
                <UserCheck className="h-4 w-4 text-green-500 flex-shrink-0" />
                <div>
                  <strong className="text-foreground">Styliste :</strong>
                  <span className="text-muted-foreground ml-1">Gestion des rendez-vous</span>
                </div>
              </div>
              
              <div className="flex items-center gap-3 text-sm">
                <Shield className="h-4 w-4 text-purple-500 flex-shrink-0" />
                <div>
                  <strong className="text-foreground">Admin :</strong>
                  <span className="text-muted-foreground ml-1">Administration complète</span>
                </div>
              </div>
              
              <p className="text-xs text-muted-foreground mt-3 text-center bg-muted/50 rounded p-2">
                💡 Nouveaux utilisateurs = rôle <strong>Client</strong> par défaut
              </p>
            </div>
          </div>

          <div className="text-center">
            <Button
              variant="link"
              onClick={() => navigate('/')}
              className="text-primary hover:text-primary/80"
            >
              ← Retour à l'accueil
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;