import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRoleAuth } from '@/hooks/useRoleAuth';
import { useToast } from "@/hooks/use-toast";
import { Loader2, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import salonHeroImage from '@/assets/salon-professionals-hero.jpg';

const ModernAuthPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { signIn, signUp, isAuthenticated, loading, userProfile } = useRoleAuth();
  const { toast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Gérer la redirection après authentification
  useEffect(() => {
    if (isAuthenticated && userProfile) {
      const returnTo = searchParams.get('returnTo');
      if (returnTo) {
        navigate(decodeURIComponent(returnTo), { replace: true });
      } else {
        // Rediriger vers le dashboard approprié selon le rôle
        switch (userProfile.role) {
          case 'admin':
            navigate('/admin', { replace: true });
            break;
          case 'coiffeur':
          case 'coiffeuse':
          case 'cosmetique':
            navigate('/stylist', { replace: true });
            break;
          case 'client':
          default:
            navigate('/app', { replace: true });
            break;
        }
      }
    }
  }, [isAuthenticated, userProfile, navigate, searchParams]);

  const handleSubmit = async (isSignUp: boolean) => {
    if (!email || !password) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive"
      });
      return;
    }

    if (isSignUp && password !== confirmPassword) {
      toast({
        title: "Erreur",
        description: "Les mots de passe ne correspondent pas",
        variant: "destructive"
      });
      return;
    }

    if (isSignUp && !fullName.trim()) {
      toast({
        title: "Erreur", 
        description: "Veuillez entrer votre nom complet",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      if (isSignUp) {
        const result = await signUp(email, password, { name: fullName });
        if (result.success) {
          toast({
            title: "Inscription réussie",
            description: "Vérifiez votre email pour confirmer votre compte"
          });
        } else {
          toast({
            title: "Erreur d'inscription",
            description: result.error || "Une erreur s'est produite",
            variant: "destructive"
          });
        }
      } else {
        const result = await signIn(email, password);
        if (result.success) {
          toast({
            title: "Connexion réussie",
            description: "Vous êtes maintenant connecté"
          });
        } else {
          toast({
            title: "Erreur de connexion",
            description: result.error || "Email ou mot de passe incorrect",
            variant: "destructive"
          });
        }
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur inattendue s'est produite",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white relative">
      {/* Bouton de retour en haut */}
      <div className="absolute top-4 left-4 z-20">
        <div className="relative">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/')}
            className="flex items-center space-x-2 text-black bg-white hover:bg-gray-100 rounded-2xl px-4 py-2 shadow-md border-2 border-black"
          >
            <span className="font-medium">Accueil</span>
          </Button>
          {/* Petit triangle pour effet bulle */}
          <div className="absolute -bottom-2 left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-black"></div>
          <div className="absolute -bottom-1 left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-white"></div>
        </div>
      </div>

      <div className="min-h-screen flex bg-white">
        {/* Section gauche - Image et contenu */}
        <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-luxury-black">
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${salonHeroImage})` }}
          >
            <div className="absolute inset-0 bg-luxury-black/40" />
          </div>
          
          <div className="relative z-10 flex flex-col justify-center px-12 text-white">
            <h1 className="text-5xl font-bold mb-6 leading-tight">
              TROUVEZ DES<br />
              COIFFEURS<br />
              <span className="text-luxury-gold-400">EXCEPTIONNELS...</span>
            </h1>
            <p className="text-xl mb-8 text-gray-200 max-w-md">
              Créez un compte et prenez rendez-vous<br />
              facilement avec des stylistes talentueux.
            </p>
            <Button 
              onClick={() => navigate('/professionals')}
              className="w-fit bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8 py-3 rounded-full transition-all duration-300 hover:scale-105"
            >
              DÉCOUVRIR
            </Button>
          </div>
        </div>

        {/* Section droite - Formulaire */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8" style={{ backgroundColor: '#F4DC7C' }}>
          <div className="w-full max-w-md">
            <Card className="border-0 shadow-none bg-white/95 backdrop-blur-sm rounded-3xl">
              <div className="p-8">
                <h2 className="text-3xl font-bold text-center mb-8 text-luxury-black">
                  Connexion à la plateforme
                </h2>

                <Tabs defaultValue="login" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-6 bg-gray-100">
                    <TabsTrigger value="login" className="data-[state=active]:bg-white">
                      Connexion
                    </TabsTrigger>
                    <TabsTrigger value="signup" className="data-[state=active]:bg-white">
                      Inscription
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="login" className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-email" className="text-luxury-black font-medium">
                        Email
                      </Label>
                      <Input
                        id="login-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="votre@email.com"
                        className="h-12 border-gray-300 focus:border-primary rounded-3xl px-4 bg-black text-white placeholder:text-gray-400"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="login-password" className="text-luxury-black font-medium">
                        Mot de passe
                      </Label>
                      <div className="relative">
                        <Input
                          id="login-password"
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          className="h-12 border-gray-300 focus:border-primary rounded-3xl px-4 pr-12 bg-black text-white placeholder:text-gray-400"
                          required
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4 text-gray-400" />
                          ) : (
                            <Eye className="h-4 w-4 text-gray-400" />
                          )}
                        </Button>
                      </div>
                    </div>

                    <Button
                      onClick={() => handleSubmit(false)}
                      disabled={isSubmitting}
                      className="w-full h-12 bg-luxury-black hover:bg-luxury-charcoal text-white font-bold rounded-3xl transition-all duration-300 hover:scale-105"
                    >
                      {isSubmitting ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : null}
                      LOGIN
                    </Button>

                    <div className="text-center">
                      <Button
                        variant="ghost"
                        className="text-luxury-black/70 hover:text-luxury-black underline"
                      >
                        Mot de passe oublié ?
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="signup" className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-name" className="text-luxury-black font-medium">
                        Nom complet
                      </Label>
                      <Input
                        id="signup-name"
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Votre nom complet"
                        className="h-12 border-gray-300 focus:border-primary rounded-3xl px-4 bg-black text-white placeholder:text-gray-400"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-email" className="text-luxury-black font-medium">
                        Email
                      </Label>
                      <Input
                        id="signup-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="votre@email.com"
                        className="h-12 border-gray-300 focus:border-primary rounded-3xl px-4 bg-black text-white placeholder:text-gray-400"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-password" className="text-luxury-black font-medium">
                        Mot de passe
                      </Label>
                      <div className="relative">
                        <Input
                          id="signup-password"
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          className="h-12 border-gray-300 focus:border-primary rounded-3xl px-4 pr-12 bg-black text-white placeholder:text-gray-400"
                          required
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4 text-gray-400" />
                          ) : (
                            <Eye className="h-4 w-4 text-gray-400" />
                          )}
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-confirm-password" className="text-luxury-black font-medium">
                        Confirmer le mot de passe
                      </Label>
                      <div className="relative">
                        <Input
                          id="signup-confirm-password"
                          type={showConfirmPassword ? "text" : "password"}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="••••••••"
                          className="h-12 border-gray-300 focus:border-primary rounded-3xl px-4 pr-12 bg-black text-white placeholder:text-gray-400"
                          required
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 hover:bg-transparent"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-4 w-4 text-gray-400" />
                          ) : (
                            <Eye className="h-4 w-4 text-gray-400" />
                          )}
                        </Button>
                      </div>
                    </div>

                    <Button
                      onClick={() => handleSubmit(true)}
                      disabled={isSubmitting}
                      className="w-full h-12 bg-luxury-black hover:bg-luxury-charcoal text-white font-bold rounded-3xl transition-all duration-300 hover:scale-105"
                    >
                      {isSubmitting ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : null}
                      S'INSCRIRE
                    </Button>
                  </TabsContent>
                </Tabs>
              </div>
            </Card>

            {/* Bouton retour à l'accueil pour mobile */}
            <div className="text-center mt-6 lg:hidden">
              <Button
                variant="ghost"
                onClick={() => navigate('/')}
                className="text-white hover:text-white/80"
              >
                ← Retour à l'accueil
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModernAuthPage;