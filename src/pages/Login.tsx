
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useEffect } from 'react';

const Login = () => {
  const navigate = useNavigate();
  const { login, user, isAuthenticated, loading } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Rediriger si déjà connecté
  useEffect(() => {
    if (!loading && isAuthenticated) {
      if (user?.user_type === 'admin') {
        navigate('/admin');
      } else if (user?.user_type === 'coiffeur') {
        navigate('/hairdresser');
      } else {
        navigate('/');
      }
    }
  }, [user, isAuthenticated, loading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    
    try {
      const result = await login(formData.email, formData.password);
      
      if (result.success) {
        // La redirection sera gérée par useEffect
      }
    } catch (error) {
      console.error('Erreur de connexion:', error);
    } finally {
      setIsLoggingIn(false);
    }
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
            Connexion au Salon
          </CardTitle>
          <p className="text-sm text-gray-600 mt-2">
            Connectez-vous pour accéder à votre espace
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required
                placeholder="votre@email.com"
              />
            </div>

            <div>
              <Label htmlFor="password">Mot de passe</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                required
                placeholder="••••••••"
              />
            </div>

            <Button 
              type="submit" 
              className="w-full bg-gradient-gold text-white" 
              disabled={isLoggingIn}
            >
              {isLoggingIn ? "Connexion..." : "Se connecter"}
            </Button>
          </form>

          <div className="mt-6 space-y-3">
            <div className="text-center text-sm text-gray-600">
              <p className="font-medium">Comptes de test :</p>
            </div>
            <div className="space-y-2 text-xs bg-gray-50 p-3 rounded-lg">
              <div>
                <strong>Admin :</strong> admin@salon.fr / admin123
              </div>
              <div>
                <strong>Coiffeurs :</strong> [email du coiffeur] / coiffeur123
              </div>
              <div>
                <strong>Clients :</strong> Créés automatiquement lors des réservations
              </div>
            </div>
          </div>

          <div className="mt-6 text-center">
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

export default Login;
