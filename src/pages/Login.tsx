
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    userType: 'hairdresser' // 'hairdresser' ou 'admin'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simulation de connexion (à remplacer par une vraie authentification)
    if (formData.username && formData.password) {
      toast({
        title: "Connexion réussie",
        description: `Bienvenue ${formData.username}!`
      });
      
      // Redirection selon le type d'utilisateur
      if (formData.userType === 'admin') {
        navigate('/admin');
      } else {
        navigate('/hairdresser');
      }
    } else {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gold-50 to-orange-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold gradient-text">
            Connexion
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Type de compte</Label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant={formData.userType === 'hairdresser' ? 'default' : 'outline'}
                  onClick={() => setFormData({...formData, userType: 'hairdresser'})}
                  className={formData.userType === 'hairdresser' ? 'bg-gradient-gold text-white' : ''}
                >
                  Coiffeur
                </Button>
                <Button
                  type="button"
                  variant={formData.userType === 'admin' ? 'default' : 'outline'}
                  onClick={() => setFormData({...formData, userType: 'admin'})}
                  className={formData.userType === 'admin' ? 'bg-gradient-gold text-white' : ''}
                >
                  Admin
                </Button>
              </div>
            </div>

            <div>
              <Label htmlFor="username">Nom d'utilisateur</Label>
              <Input
                id="username"
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({...formData, username: e.target.value})}
                required
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
              />
            </div>

            <Button type="submit" className="w-full bg-gradient-gold text-white">
              Se connecter
            </Button>
          </form>

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
