
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";
import { Users, Plus, Settings, LogOut, Upload, User, Mail, Phone } from 'lucide-react';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newHairdresser, setNewHairdresser] = useState({
    name: '',
    email: '',
    phone: '',
    specialties: '',
    experience: '',
    image: null as File | null
  });

  // Données simulées des coiffeurs
  const [hairdressers, setHairdressers] = useState([
    {
      id: 1,
      name: 'Anna Martin',
      email: 'anna.martin@salon.com',
      phone: '06 12 34 56 78',
      specialties: ['Coupe Femme', 'Couleur', 'Balayage'],
      experience: '8 ans',
      status: 'active',
      image: ''
    },
    {
      id: 2,
      name: 'Julie Dubois',
      email: 'julie.dubois@salon.com',
      phone: '06 98 76 54 32',
      specialties: ['Soins', 'Extensions', 'Coiffage'],
      experience: '6 ans',
      status: 'active',
      image: ''
    }
  ]);

  const handleCreateHairdresser = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Générer un nom d'utilisateur et mot de passe
    const username = newHairdresser.name.toLowerCase().replace(' ', '.');
    const password = Math.random().toString(36).slice(-8);
    
    const newHairdresserData = {
      id: hairdressers.length + 1,
      name: newHairdresser.name,
      email: newHairdresser.email,
      phone: newHairdresser.phone,
      specialties: newHairdresser.specialties.split(',').map(s => s.trim()),
      experience: newHairdresser.experience,
      status: 'active',
      image: newHairdresser.image ? URL.createObjectURL(newHairdresser.image) : ''
    };

    setHairdressers([...hairdressers, newHairdresserData]);
    
    toast({
      title: "Coiffeur créé avec succès!",
      description: `Identifiants envoyés à ${newHairdresser.email}\nLogin: ${username}\nMot de passe: ${password}`
    });

    // Réinitialiser le formulaire
    setNewHairdresser({
      name: '',
      email: '',
      phone: '',
      specialties: '',
      experience: '',
      image: null
    });
    setIsCreateModalOpen(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewHairdresser({...newHairdresser, image: file});
    }
  };

  const handleLogout = () => {
    toast({
      title: "Déconnexion",
      description: "À bientôt !"
    });
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold gradient-text">Administration</h1>
              <p className="text-gray-600">Gestion du salon de coiffure</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Paramètres
              </Button>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Déconnexion
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Coiffeurs actifs</p>
                  <p className="text-2xl font-bold text-gold-600">{hairdressers.length}</p>
                </div>
                <Users className="h-8 w-8 text-gold-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Réservations aujourd'hui</p>
                  <p className="text-2xl font-bold text-green-600">12</p>
                </div>
                <Users className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Revenus du mois</p>
                  <p className="text-2xl font-bold text-blue-600">2,450€</p>
                </div>
                <Users className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Satisfaction</p>
                  <p className="text-2xl font-bold text-purple-600">4.8/5</p>
                </div>
                <Users className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Gestion des coiffeurs */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2 text-gold-500" />
                Gestion des Coiffeurs
              </CardTitle>
              
              <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-gold text-white">
                    <Plus className="h-4 w-4 mr-2" />
                    Nouveau Coiffeur
                  </Button>
                </DialogTrigger>
                
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Créer un nouveau coiffeur</DialogTitle>
                  </DialogHeader>
                  
                  <form onSubmit={handleCreateHairdresser} className="space-y-4">
                    <div>
                      <Label htmlFor="name">Nom complet *</Label>
                      <Input
                        id="name"
                        value={newHairdresser.name}
                        onChange={(e) => setNewHairdresser({...newHairdresser, name: e.target.value})}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={newHairdresser.email}
                        onChange={(e) => setNewHairdresser({...newHairdresser, email: e.target.value})}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="phone">Téléphone</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={newHairdresser.phone}
                        onChange={(e) => setNewHairdresser({...newHairdresser, phone: e.target.value})}
                      />
                    </div>

                    <div>
                      <Label htmlFor="specialties">Spécialités (séparées par des virgules)</Label>
                      <Input
                        id="specialties"
                        value={newHairdresser.specialties}
                        onChange={(e) => setNewHairdresser({...newHairdresser, specialties: e.target.value})}
                        placeholder="Coupe, Couleur, Balayage"
                      />
                    </div>

                    <div>
                      <Label htmlFor="experience">Expérience</Label>
                      <Input
                        id="experience"
                        value={newHairdresser.experience}
                        onChange={(e) => setNewHairdresser({...newHairdresser, experience: e.target.value})}
                        placeholder="5 ans d'expérience"
                      />
                    </div>

                    <div>
                      <Label htmlFor="image" className="flex items-center">
                        <Upload className="h-4 w-4 mr-1" />
                        Photo de profil
                      </Label>
                      <Input
                        id="image"
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                      />
                    </div>

                    <div className="flex gap-4 pt-4">
                      <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)} className="flex-1">
                        Annuler
                      </Button>
                      <Button type="submit" className="flex-1 bg-gradient-gold text-white">
                        Créer le compte
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="space-y-4">
              {hairdressers.map((hairdresser) => (
                <div key={hairdresser.id} className="flex items-center gap-4 p-4 border rounded-lg hover:shadow-md transition-shadow">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={hairdresser.image} />
                    <AvatarFallback className="bg-gradient-gold text-white">
                      {hairdresser.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{hairdresser.name}</h3>
                      <Badge variant={hairdresser.status === 'active' ? 'default' : 'secondary'}>
                        {hairdresser.status === 'active' ? 'Actif' : 'Inactif'}
                      </Badge>
                    </div>
                    
                    <div className="text-sm text-gray-600 space-y-1">
                      <div className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {hairdresser.email}
                      </div>
                      <div className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {hairdresser.phone}
                      </div>
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {hairdresser.experience}
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-1 mt-2">
                      {hairdresser.specialties.map((specialty) => (
                        <Badge key={specialty} variant="secondary" className="text-xs">
                          {specialty}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      Modifier
                    </Button>
                    <Button size="sm" variant="outline">
                      Voir planning
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
