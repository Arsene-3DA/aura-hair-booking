
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
  const [connectionStatus, setConnectionStatus] = useState('');

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
    setConnectionStatus('Connexion en cours...');
    
    try {
      console.log('Tentative de connexion avec:', { email: formData.email, password: '***' });
      const result = await login(formData.email.trim(), formData.password);
      
      if (result.success) {
        setConnectionStatus('Connexion réussie ! Redirection...');
      } else {
        setConnectionStatus(`Échec: ${result.error || 'Erreur inconnue'}`);
      }
    } catch (error) {
      console.error('Erreur de connexion:', error);
      setConnectionStatus('Erreur de connexion');
    } finally {
      setIsLoggingIn(false);
      setTimeout(() => setConnectionStatus(''), 3000);
    }
  };

  const fillTestAccount = (email: string, password: string) => {
    setFormData({ email, password });
    setConnectionStatus('Compte de test sélectionné');
    setTimeout(() => setConnectionStatus(''), 2000);
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
          {connectionStatus && (
            <div className={`text-sm p-2 rounded mt-2 ${
              connectionStatus.includes('réussie') 
                ? 'bg-green-100 text-green-700' 
                : connectionStatus.includes('Échec') || connectionStatus.includes('Erreur')
                ? 'bg-red-100 text-red-700'
                : 'bg-blue-100 text-blue-700'
            }`}>
              {connectionStatus}
            </div>
          )}
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
                disabled={isLoggingIn}
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
                disabled={isLoggingIn}
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
              <p className="font-medium">Comptes de test disponibles :</p>
            </div>
            
            {/* Comptes clients */}
            <div className="space-y-2 text-xs bg-blue-50 p-3 rounded-lg border border-blue-200">
              <div className="font-medium text-blue-800 mb-2">👤 Comptes Clients :</div>
              <div className="grid grid-cols-1 gap-1">
                <button 
                  type="button"
                  onClick={() => fillTestAccount('marie.dubois@client.fr', 'client123')}
                  className="text-left hover:bg-blue-100 p-1 rounded text-blue-700 transition-colors"
                  disabled={isLoggingIn}
                >
                  marie.dubois@client.fr / client123
                </button>
                <button 
                  type="button"
                  onClick={() => fillTestAccount('pierre.martin@client.fr', 'client123')}
                  className="text-left hover:bg-blue-100 p-1 rounded text-blue-700 transition-colors"
                  disabled={isLoggingIn}
                >
                  pierre.martin@client.fr / client123
                </button>
                <button 
                  type="button"
                  onClick={() => fillTestAccount('sophie.lefebvre@client.fr', 'client123')}
                  className="text-left hover:bg-blue-100 p-1 rounded text-blue-700 transition-colors"
                  disabled={isLoggingIn}
                >
                  sophie.lefebvre@client.fr / client123
                </button>
              </div>
            </div>

            {/* Comptes coiffeurs */}
            <div className="space-y-2 text-xs bg-green-50 p-3 rounded-lg border border-green-200">
              <div className="font-medium text-green-800 mb-2">✂️ Comptes Coiffeurs :</div>
              <div className="grid grid-cols-1 gap-1">
                <button 
                  type="button"
                  onClick={() => fillTestAccount('marie.dupont@coiffeur.fr', 'coiffeur123')}
                  className="text-left hover:bg-green-100 p-1 rounded text-green-700 transition-colors"
                  disabled={isLoggingIn}
                >
                  marie.dupont@coiffeur.fr / coiffeur123
                </button>
                <button 
                  type="button"
                  onClick={() => fillTestAccount('jean.martin@coiffeur.fr', 'coiffeur123')}
                  className="text-left hover:bg-green-100 p-1 rounded text-green-700 transition-colors"
                  disabled={isLoggingIn}
                >
                  jean.martin@coiffeur.fr / coiffeur123
                </button>
              </div>
            </div>

            {/* Compte admin */}
            <div className="space-y-2 text-xs bg-purple-50 p-3 rounded-lg border border-purple-200">
              <div className="font-medium text-purple-800 mb-2">👑 Compte Admin :</div>
              <button 
                type="button"
                onClick={() => fillTestAccount('admin@salon.fr', 'admin123')}
                className="text-left hover:bg-purple-100 p-1 rounded text-purple-700 w-full transition-colors"
                disabled={isLoggingIn}
              >
                admin@salon.fr / admin123
              </button>
            </div>
          </div>

          <div className="mt-6 text-center">
            <Button
              variant="link"
              onClick={() => navigate('/')}
              className="text-gold-600 hover:text-gold-700"
              disabled={isLoggingIn}
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
