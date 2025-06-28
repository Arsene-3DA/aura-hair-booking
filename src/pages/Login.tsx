
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
  
  const [loginData, setLoginData] = useState({
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
      }
    }
  }, [user, isAuthenticated, loading, navigate]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setConnectionStatus('Connexion en cours...');
    
    try {
      console.log('Tentative de connexion avec:', { email: loginData.email, password: '***' });
      const result = await login(loginData.email.trim(), loginData.password);
      
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
    setLoginData({ email, password });
    setConnectionStatus('Compte sélectionné');
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
            Espace Professionnel
          </CardTitle>
          <p className="text-sm text-gray-600 mt-2">
            Accès réservé aux coiffeurs et administrateurs
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
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <Label htmlFor="login-email">Email</Label>
              <Input
                id="login-email"
                type="email"
                value={loginData.email}
                onChange={(e) => setLoginData({...loginData, email: e.target.value})}
                required
                placeholder="votre@email.com"
                disabled={isLoggingIn}
              />
            </div>

            <div>
              <Label htmlFor="login-password">Mot de passe</Label>
              <Input
                id="login-password"
                type="password"
                value={loginData.password}
                onChange={(e) => setLoginData({...loginData, password: e.target.value})}
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
              <p className="font-medium">Comptes disponibles :</p>
            </div>
            
            {/* Compte admin */}
            <div className="space-y-2 text-xs bg-purple-50 p-3 rounded-lg border border-purple-200">
              <div className="font-medium text-purple-800 mb-2">👑 Administrateur :</div>
              <button 
                type="button"
                onClick={() => fillTestAccount('admin.salon@salon.fr', 'admin2024')}
                className="text-left hover:bg-purple-100 p-2 rounded text-purple-700 w-full transition-colors text-sm"
                disabled={isLoggingIn}
              >
                <div className="font-medium">Admin Salon</div>
                <div className="text-xs opacity-75">admin.salon@salon.fr / admin2024</div>
              </button>
            </div>

            {/* Comptes coiffeurs */}
            <div className="space-y-2 text-xs bg-green-50 p-3 rounded-lg border border-green-200">
              <div className="font-medium text-green-800 mb-2">✂️ Coiffeurs :</div>
              <div className="grid grid-cols-1 gap-2">
                <button 
                  type="button"
                  onClick={() => fillTestAccount('anna.martin@salon.fr', 'anna123')}
                  className="text-left hover:bg-green-100 p-2 rounded text-green-700 transition-colors"
                  disabled={isLoggingIn}
                >
                  <div className="font-medium">Anna Martin</div>
                  <div className="text-xs opacity-75">anna.martin@salon.fr / anna123</div>
                </button>
                <button 
                  type="button"
                  onClick={() => fillTestAccount('julie.dubois@salon.fr', 'julie456')}
                  className="text-left hover:bg-green-100 p-2 rounded text-green-700 transition-colors"
                  disabled={isLoggingIn}
                >
                  <div className="font-medium">Julie Dubois</div>
                  <div className="text-xs opacity-75">julie.dubois@salon.fr / julie456</div>
                </button>
                <button 
                  type="button"
                  onClick={() => fillTestAccount('marc.rousseau@salon.fr', 'marc789')}
                  className="text-left hover:bg-green-100 p-2 rounded text-green-700 transition-colors"
                  disabled={isLoggingIn}
                >
                  <div className="font-medium">Marc Rousseau</div>
                  <div className="text-xs opacity-75">marc.rousseau@salon.fr / marc789</div>
                </button>
                <button 
                  type="button"
                  onClick={() => fillTestAccount('sophie.laurent@salon.fr', 'sophie321')}
                  className="text-left hover:bg-green-100 p-2 rounded text-green-700 transition-colors"
                  disabled={isLoggingIn}
                >
                  <div className="font-medium">Sophie Laurent</div>
                  <div className="text-xs opacity-75">sophie.laurent@salon.fr / sophie321</div>
                </button>
                <button 
                  type="button"
                  onClick={() => fillTestAccount('thomas.moreau@salon.fr', 'thomas654')}
                  className="text-left hover:bg-green-100 p-2 rounded text-green-700 transition-colors"
                  disabled={isLoggingIn}
                >
                  <div className="font-medium">Thomas Moreau</div>
                  <div className="text-xs opacity-75">thomas.moreau@salon.fr / thomas654</div>
                </button>
                <button 
                  type="button"
                  onClick={() => fillTestAccount('camille.petit@salon.fr', 'camille987')}
                  className="text-left hover:bg-green-100 p-2 rounded text-green-700 transition-colors"
                  disabled={isLoggingIn}
                >
                  <div className="font-medium">Camille Petit</div>
                  <div className="text-xs opacity-75">camille.petit@salon.fr / camille987</div>
                </button>
              </div>
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
