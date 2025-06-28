
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from 'react-router-dom';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';

const SignupHairdresser = () => {
  const navigate = useNavigate();
  const { signUp, user, loading, createHairdresserProfile } = useSupabaseAuth();
  
  const [formData, setFormData] = useState({
    salonName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [isLoading, setIsLoading] = useState(false);

  // Redirection si déjà connecté
  useEffect(() => {
    if (!loading && user) {
      const role = user.user_metadata?.role || 'client';
      if (role === 'hairdresser') {
        navigate('/hairdresser');
      } else if (role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    }
  }, [user, loading, navigate]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      return;
    }

    setIsLoading(true);
    
    try {
      // 1. Créer le compte avec le rôle hairdresser
      const signupResult = await signUp(
        formData.email.trim(), 
        formData.password,
        { 
          role: 'hairdresser',
          name: formData.salonName
        }
      );

      if (signupResult.success && signupResult.user) {
        // 2. Créer le profil coiffeur dans la table hairdressers
        const profileResult = await createHairdresserProfile(
          formData.salonName,
          formData.email.trim()
        );

        if (profileResult.success) {
          navigate('/hairdresser');
        }
      }
    } catch (error) {
      console.error('Erreur lors de l\'inscription coiffeur:', error);
    } finally {
      setIsLoading(false);
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
            ✂️ Inscription Coiffeur
          </CardTitle>
          <p className="text-sm text-gray-600 mt-2">
            Créez votre compte professionnel
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <Label htmlFor="salon-name">Nom du salon</Label>
              <Input
                id="salon-name"
                type="text"
                value={formData.salonName}
                onChange={(e) => setFormData({...formData, salonName: e.target.value})}
                required
                placeholder="Nom de votre salon"
                disabled={isLoading}
              />
            </div>

            <div>
              <Label htmlFor="email">Email professionnel</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required
                placeholder="contact@salon.fr"
                disabled={isLoading}
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
                disabled={isLoading}
                minLength={6}
              />
            </div>

            <div>
              <Label htmlFor="confirm-password">Confirmer le mot de passe</Label>
              <Input
                id="confirm-password"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                required
                placeholder="••••••••"
                disabled={isLoading}
              />
              {formData.password !== formData.confirmPassword && formData.confirmPassword && (
                <p className="text-sm text-red-600 mt-1">Les mots de passe ne correspondent pas</p>
              )}
            </div>

            <Button 
              type="submit" 
              className="w-full bg-gradient-gold text-white" 
              disabled={isLoading || formData.password !== formData.confirmPassword}
            >
              {isLoading ? "Création du compte..." : "Créer mon compte coiffeur"}
            </Button>
          </form>

          <div className="mt-6 text-center space-y-2">
            <Button
              variant="link"
              onClick={() => navigate('/auth')}
              className="text-gold-600 hover:text-gold-700"
              disabled={isLoading}
            >
              Déjà un compte ? Se connecter
            </Button>
            <br />
            <Button
              variant="link"
              onClick={() => navigate('/')}
              className="text-gray-600 hover:text-gray-700"
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

export default SignupHairdresser;
