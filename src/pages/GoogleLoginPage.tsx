import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import { useGoogleAuth } from '@/contexts/GoogleAuthContext';
import { FaGoogle } from 'react-icons/fa';

const GoogleLoginPage = () => {
  const navigate = useNavigate();
  const { signInWithGoogle, loading, isAuthenticated } = useGoogleAuth();

  // Rediriger si déjà connecté
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/post-auth');
    }
  }, [isAuthenticated, navigate]);

  const handleGoogleLogin = async () => {
    await signInWithGoogle();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gold-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gold-50 to-orange-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold gradient-text">
            Salon de Coiffure Aura
          </CardTitle>
          <p className="text-sm text-gray-600 mt-2">
            Connectez-vous pour accéder à votre espace
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Bouton de connexion Google */}
          <Button
            onClick={handleGoogleLogin}
            className="w-full bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 flex items-center justify-center gap-3 py-3"
            disabled={loading}
          >
            <FaGoogle className="text-red-500 text-lg" />
            Se connecter avec Google
          </Button>

          <div className="text-center">
            <p className="text-sm text-gray-500 mb-4">
              Connexion sécurisée via Google OAuth
            </p>
            
            {/* Informations sur les rôles */}
            <div className="bg-blue-50 rounded-lg p-4 text-left">
              <h4 className="font-semibold text-blue-800 mb-2">Rôles disponibles :</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li><strong>Client :</strong> Réservation de rendez-vous</li>
                <li><strong>Stylist :</strong> Gestion des rendez-vous</li>
                <li><strong>Admin :</strong> Administration complète</li>
              </ul>
              <p className="text-xs text-blue-600 mt-2">
                Nouveaux utilisateurs = rôle Client par défaut
              </p>
            </div>
          </div>

          <div className="text-center">
            <Button
              variant="link"
              onClick={() => navigate('/')}
              className="text-gold-600 hover:text-gold-700"
            >
              Retour à l'accueil
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GoogleLoginPage;