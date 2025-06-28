import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  
  const [signupData, setSignupData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: ''
  });
  
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isSigningUp, setIsSigningUp] = useState(false);
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

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSigningUp(true);
    setConnectionStatus('Création du compte en cours...');
    
    if (signupData.password !== signupData.confirmPassword) {
      setConnectionStatus('Les mots de passe ne correspondent pas');
      setIsSigningUp(false);
      setTimeout(() => setConnectionStatus(''), 3000);
      return;
    }
    
    try {
      // Pour l'instant, on simule la création de compte
      // En production, vous devriez créer une fonction pour l'inscription
      setConnectionStatus('Fonctionnalité d\'inscription à implémenter');
      setTimeout(() => setConnectionStatus(''), 3000);
    } catch (error) {
      console.error('Erreur d\'inscription:', error);
      setConnectionStatus('Erreur lors de la création du compte');
    } finally {
      setIsSigningUp(false);
      setTimeout(() => setConnectionStatus(''), 3000);
    }
  };

  const fillTestAccount = (email: string, password: string) => {
    setLoginData({ email, password });
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
            Espace Client
          </CardTitle>
          <p className="text-sm text-gray-600 mt-2">
            Connectez-vous ou créez votre compte
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
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Se connecter</TabsTrigger>
              <TabsTrigger value="signup">S'inscrire</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login" className="space-y-4">
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
            </TabsContent>
            
            <TabsContent value="signup" className="space-y-4">
              <form onSubmit={handleSignupSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="signup-firstname">Prénom</Label>
                    <Input
                      id="signup-firstname"
                      type="text"
                      value={signupData.firstName}
                      onChange={(e) => setSignupData({...signupData, firstName: e.target.value})}
                      required
                      placeholder="Prénom"
                      disabled={isSigningUp}
                    />
                  </div>
                  <div>
                    <Label htmlFor="signup-lastname">Nom</Label>
                    <Input
                      id="signup-lastname"
                      type="text"
                      value={signupData.lastName}
                      onChange={(e) => setSignupData({...signupData, lastName: e.target.value})}
                      required
                      placeholder="Nom"
                      disabled={isSigningUp}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    value={signupData.email}
                    onChange={(e) => setSignupData({...signupData, email: e.target.value})}
                    required
                    placeholder="votre@email.com"
                    disabled={isSigningUp}
                  />
                </div>

                <div>
                  <Label htmlFor="signup-phone">Téléphone</Label>
                  <Input
                    id="signup-phone"
                    type="tel"
                    value={signupData.phone}
                    onChange={(e) => setSignupData({...signupData, phone: e.target.value})}
                    placeholder="06 12 34 56 78"
                    disabled={isSigningUp}
                  />
                </div>

                <div>
                  <Label htmlFor="signup-password">Mot de passe</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    value={signupData.password}
                    onChange={(e) => setSignupData({...signupData, password: e.target.value})}
                    required
                    placeholder="••••••••"
                    disabled={isSigningUp}
                  />
                </div>

                <div>
                  <Label htmlFor="signup-confirm-password">Confirmer le mot de passe</Label>
                  <Input
                    id="signup-confirm-password"
                    type="password"
                    value={signupData.confirmPassword}
                    onChange={(e) => setSignupData({...signupData, confirmPassword: e.target.value})}
                    required
                    placeholder="••••••••"
                    disabled={isSigningUp}
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-gradient-gold text-white" 
                  disabled={isSigningUp}
                >
                  {isSigningUp ? "Création..." : "Créer mon compte"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

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
              disabled={isLoggingIn || isSigningUp}
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
