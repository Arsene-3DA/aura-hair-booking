import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from 'react-router-dom';
import { useRoleAuth } from '@/hooks/useRoleAuth';
import { usePasswordPolicy } from '@/hooks/usePasswordPolicy';
import { useProfileRole } from '@/hooks/useProfileRole';
import AdminPasswordChangeModal from '@/components/AdminPasswordChangeModal';
import InitializeDataButton from '@/components/InitializeDataButton';
import AuthRedirectHandler from '@/components/AuthRedirectHandler';
import ScissorsTransition from '@/components/ScissorsTransition';

const RoleAuthPage = () => {
  const navigate = useNavigate();
  const { signIn, signUp, signInWithGoogle, loading, isAuthenticated, user, showTransition, handleTransitionComplete } = useRoleAuth();
  const { needsPasswordChange, checkPasswordChangeRequired } = usePasswordPolicy();
  const { data: profileRole } = useProfileRole(user?.id);
  
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

  // Redirection si déjà connecté selon le rôle du profil
  useEffect(() => {
    if (!loading && isAuthenticated && profileRole) {
      switch (profileRole) {
        case 'admin':
          navigate('/admin');
          break;
        case 'coiffeur':
          navigate('/stylist');
          break;
        case 'client':
        default:
          navigate('/app');
          break;
      }
    }
  }, [isAuthenticated, profileRole, loading, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    const result = await signIn(loginData.email.trim(), loginData.password);
    
    if (result.success && result.user) {
      // Vérifier si un changement de mot de passe est requis
      await checkPasswordChangeRequired(result.user.id);
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

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    await signInWithGoogle();
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
    <AuthRedirectHandler>
      <div className="min-h-screen bg-gradient-to-br from-gold-50 to-orange-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <CardTitle className="text-2xl font-bold gradient-text">
                  ✂️ Salon de Coiffure
                </CardTitle>
                <p className="text-sm text-gray-600 mt-2">
                  Connectez-vous ou créez votre compte
                </p>
              </div>
              <InitializeDataButton />
            </div>
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

                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800 font-medium mb-1">
                    Comptes de test disponibles :
                  </p>
                  <div className="text-xs text-blue-700 space-y-1">
                    <div>👑 Admin: admin@salon.com / admin123</div>
                    <div>✂️ Coiffeur: marie@salon.com / marie123</div>
                    <div>✂️ Coiffeur: pierre@salon.com / pierre123</div>
                    <div>👤 Client: client@email.com / client123</div>
                  </div>
                  <p className="text-xs text-blue-600 mt-2">
                    💡 Utilisez le bouton "Initialiser" pour créer automatiquement ces comptes
                  </p>
                </div>
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

            {/* Séparateur */}
            <div className="flex items-center my-6">
              <div className="flex-1 border-t border-gray-200"></div>
              <span className="px-4 text-sm text-gray-500">ou</span>
              <div className="flex-1 border-t border-gray-200"></div>
            </div>

            {/* Connexion Google */}
            <Button 
              onClick={handleGoogleSignIn}
              variant="outline"
              className="w-full border-2 hover:bg-gray-50"
              disabled={isLoading}
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continuer avec Google
            </Button>

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

      {/* Modal de changement de mot de passe obligatoire */}
      <AdminPasswordChangeModal 
        isOpen={needsPasswordChange}
      />

      {/* Animation de transition avec ciseaux */}
      <ScissorsTransition 
        isActive={showTransition}
        onComplete={handleTransitionComplete}
      />
    </AuthRedirectHandler>
  );
};

export default RoleAuthPage;
