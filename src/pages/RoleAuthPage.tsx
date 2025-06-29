
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from 'react-router-dom';
import { useRoleAuth } from '@/hooks/useRoleAuth';

const RoleAuthPage = () => {
  const navigate = useNavigate();
  const { signIn, signUp, loading, isAuthenticated, userRole } = useRoleAuth();
  
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });

  const [signupData, setSignupData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    nom: '',
    prenom: ''
  });

  const [isLoading, setIsLoading] = useState(false);

  // Redirection si déjà connecté
  useEffect(() => {
    if (!loading && isAuthenticated && userRole) {
      if (userRole === 'admin') {
        navigate('/admin');
      } else if (userRole === 'coiffeur') {
        navigate('/coiffeur');
      } else {
        navigate('/client');
      }
    }
  }, [isAuthenticated, userRole, loading, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    const result = await signIn(loginData.email.trim(), loginData.password);
    
    if (result.success) {
      // La redirection se fera via useEffect
    }
    
    setIsLoading(false);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (signupData.password !== signupData.confirmPassword) {
      return;
    }

    setIsLoading(true);
    
    await signUp(
      signupData.email.trim(), 
      signupData.password,
      { 
        nom: signupData.nom,
        prenom: signupData.prenom,
        role: 'client'
      }
    );
    
    setIsLoading(false);
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
            ✂️ Salon de Coiffure
          </CardTitle>
          <p className="text-sm text-gray-600 mt-2">
            Connectez-vous ou créez votre compte
          </p>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Connexion</TabsTrigger>
              <TabsTrigger value="signup">Inscription</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login" className="space-y-4 mt-6">
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <Label htmlFor="login-email">Email</Label>
                  <Input
                    id="login-email"
                    type="email"
                    value={loginData.email}
                    onChange={(e) => setLoginData({...loginData, email: e.target.value})}
                    required
                    placeholder="votre@email.com"
                    disabled={isLoading}
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
                    disabled={isLoading}
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-gradient-gold text-white" 
                  disabled={isLoading}
                >
                  {isLoading ? "Connexion..." : "Se connecter"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup" className="space-y-4 mt-6">
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="signup-prenom">Prénom</Label>
                    <Input
                      id="signup-prenom"
                      type="text"
                      value={signupData.prenom}
                      onChange={(e) => setSignupData({...signupData, prenom: e.target.value})}
                      required
                      placeholder="Jean"
                      disabled={isLoading}
                    />
                  </div>
                  <div>
                    <Label htmlFor="signup-nom">Nom</Label>
                    <Input
                      id="signup-nom"
                      type="text"
                      value={signupData.nom}
                      onChange={(e) => setSignupData({...signupData, nom: e.target.value})}
                      required
                      placeholder="Dupont"
                      disabled={isLoading}
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
                    disabled={isLoading}
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
                    disabled={isLoading}
                    minLength={6}
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
                    disabled={isLoading}
                  />
                  {signupData.password !== signupData.confirmPassword && signupData.confirmPassword && (
                    <p className="text-sm text-red-600 mt-1">Les mots de passe ne correspondent pas</p>
                  )}
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-gradient-gold text-white" 
                  disabled={isLoading || signupData.password !== signupData.confirmPassword}
                >
                  {isLoading ? "Inscription..." : "S'inscrire comme client"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <div className="mt-6 text-center">
            <Button
              variant="link"
              onClick={() => navigate('/')}
              className="text-gold-600 hover:text-gold-700"
              disabled={isLoading}
            >
              Retour à l'accueil
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RoleAuthPage;
