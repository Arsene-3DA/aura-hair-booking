
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";
import { Users, Plus, Settings, LogOut, Upload, User, Mail, Phone, Activity, Edit, Calendar, Eye } from 'lucide-react';
import HairdresserActivityTable from '../components/HairdresserActivityTable';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedHairdresser, setSelectedHairdresser] = useState(null);
  
  const [newHairdresser, setNewHairdresser] = useState({
    name: '',
    email: '',
    phone: '',
    specialties: '',
    experience: '',
    gender: '',
    location: '',
    image: null as File | null
  });

  // Données des coiffeurs avec état local pour la gestion
  const [hairdressers, setHairdressers] = useState([
    {
      id: 1,
      name: 'Anna Martin',
      email: 'anna.martin@salon.com',
      phone: '06 12 34 56 78',
      specialties: ['Coupe Femme', 'Couleur', 'Balayage'],
      experience: '8 ans',
      gender: 'female',
      location: 'Paris 15ème',
      status: 'active',
      image: 'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=400&h=400&fit=crop&crop=face',
      totalBookings: 156,
      monthlyBookings: 28,
      weeklyBookings: 7
    },
    {
      id: 2,
      name: 'Julie Dubois',
      email: 'julie.dubois@salon.com',
      phone: '06 98 76 54 32',
      specialties: ['Soins', 'Extensions', 'Coiffage'],
      experience: '6 ans',
      gender: 'female',
      location: 'Paris 8ème',
      status: 'active',
      image: 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=400&h=400&fit=crop&crop=face',
      totalBookings: 134,
      monthlyBookings: 22,
      weeklyBookings: 5
    },
    {
      id: 3,
      name: 'Marc Rousseau',
      email: 'marc.rousseau@salon.com',
      phone: '06 55 44 33 22',
      specialties: ['Coupe Homme', 'Barbe', 'Styling'],
      experience: '12 ans',
      gender: 'male',
      location: 'Paris 11ème',
      status: 'active',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
      totalBookings: 189,
      monthlyBookings: 31,
      weeklyBookings: 8
    }
  ]);

  const handleCreateHairdresser = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newHairdresser.name || !newHairdresser.email || !newHairdresser.gender) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive"
      });
      return;
    }
    
    const username = newHairdresser.name.toLowerCase().replace(' ', '.');
    const password = Math.random().toString(36).slice(-8);
    
    const newHairdresserData = {
      id: hairdressers.length + 1,
      name: newHairdresser.name,
      email: newHairdresser.email,
      phone: newHairdresser.phone,
      specialties: newHairdresser.specialties.split(',').map(s => s.trim()).filter(s => s),
      experience: newHairdresser.experience,
      gender: newHairdresser.gender,
      location: newHairdresser.location,
      status: 'active',
      image: newHairdresser.image ? URL.createObjectURL(newHairdresser.image) : 
             (newHairdresser.gender === 'female' ? 
              'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=400&h=400&fit=crop&crop=face' :
              'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face'),
      totalBookings: 0,
      monthlyBookings: 0,
      weeklyBookings: 0
    };

    setHairdressers([...hairdressers, newHairdresserData]);
    
    toast({
      title: "Coiffeur créé avec succès!",
      description: `Identifiants: ${username} / ${password}`
    });

    // Réinitialiser le formulaire
    setNewHairdresser({
      name: '',
      email: '',
      phone: '',
      specialties: '',
      experience: '',
      gender: '',
      location: '',
      image: null
    });
    setIsCreateModalOpen(false);
  };

  const handleEditHairdresser = (hairdresser) => {
    setSelectedHairdresser(hairdresser);
    setNewHairdresser({
      name: hairdresser.name,
      email: hairdresser.email,
      phone: hairdresser.phone,
      specialties: hairdresser.specialties.join(', '),
      experience: hairdresser.experience,
      gender: hairdresser.gender,
      location: hairdresser.location,
      image: null
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateHairdresser = (e: React.FormEvent) => {
    e.preventDefault();
    
    const updatedHairdressers = hairdressers.map(h => 
      h.id === selectedHairdresser.id ? {
        ...h,
        name: newHairdresser.name,
        email: newHairdresser.email,
        phone: newHairdresser.phone,
        specialties: newHairdresser.specialties.split(',').map(s => s.trim()).filter(s => s),
        experience: newHairdresser.experience,
        gender: newHairdresser.gender,
        location: newHairdresser.location,
        image: newHairdresser.image ? URL.createObjectURL(newHairdresser.image) : h.image
      } : h
    );
    
    setHairdressers(updatedHairdressers);
    
    toast({
      title: "Profil mis à jour",
      description: "Les modifications ont été enregistrées"
    });
    
    setIsEditModalOpen(false);
    setSelectedHairdresser(null);
  };

  const handleViewSchedule = (hairdresser) => {
    toast({
      title: "Planning de " + hairdresser.name,
      description: "Ouverture du planning..."
    });
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
                  <p className="text-2xl font-bold text-green-600">
                    {hairdressers.reduce((sum, h) => sum + h.weeklyBookings, 0)}
                  </p>
                </div>
                <Calendar className="h-8 w-8 text-green-500" />
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
                <Activity className="h-8 w-8 text-blue-500" />
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

        {/* Onglets */}
        <Tabs defaultValue="hairdressers" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="hairdressers">Gestion des Coiffeurs</TabsTrigger>
            <TabsTrigger value="activity">Activité des Coiffeurs</TabsTrigger>
          </TabsList>

          <TabsContent value="hairdressers">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center">
                    <Users className="h-5 w-5 mr-2 text-gold-500" />
                    Gestion des Coiffeurs ({hairdressers.length})
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
                          <Label htmlFor="gender">Genre *</Label>
                          <Select value={newHairdresser.gender} onValueChange={(value) => setNewHairdresser({...newHairdresser, gender: value})}>
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionner le genre" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="male">Coiffeur (Homme)</SelectItem>
                              <SelectItem value="female">Coiffeuse (Femme)</SelectItem>
                            </SelectContent>
                          </Select>
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
                          <Label htmlFor="location">Localisation</Label>
                          <Input
                            id="location"
                            value={newHairdresser.location}
                            onChange={(e) => setNewHairdresser({...newHairdresser, location: e.target.value})}
                            placeholder="Paris 15ème"
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
                            placeholder="5 ans"
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
                          <Badge variant={hairdresser.gender === 'male' ? 'default' : 'secondary'} className="text-xs">
                            {hairdresser.gender === 'male' ? 'Coiffeur' : 'Coiffeuse'}
                          </Badge>
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
                            {hairdresser.experience} - {hairdresser.location}
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-1 mt-2">
                          {hairdresser.specialties.map((specialty) => (
                            <Badge key={specialty} variant="secondary" className="text-xs">
                              {specialty}
                            </Badge>
                          ))}
                        </div>

                        <div className="flex gap-4 mt-2 text-xs text-gray-500">
                          <span>Total: {hairdresser.totalBookings}</span>
                          <span>Ce mois: {hairdresser.monthlyBookings}</span>
                          <span>Cette semaine: {hairdresser.weeklyBookings}</span>
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleEditHairdresser(hairdresser)}>
                          <Edit className="h-3 w-3 mr-1" />
                          Modifier
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleViewSchedule(hairdresser)}>
                          <Calendar className="h-3 w-3 mr-1" />
                          Planning
                        </Button>
                        <Button size="sm" variant="outline">
                          <Eye className="h-3 w-3 mr-1" />
                          Détails
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity">
            <HairdresserActivityTable />
          </TabsContent>
        </Tabs>
      </div>

      {/* Modal de modification */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Modifier le profil</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleUpdateHairdresser} className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Nom complet *</Label>
              <Input
                id="edit-name"
                value={newHairdresser.name}
                onChange={(e) => setNewHairdresser({...newHairdresser, name: e.target.value})}
                required
              />
            </div>

            <div>
              <Label htmlFor="edit-gender">Genre *</Label>
              <Select value={newHairdresser.gender} onValueChange={(value) => setNewHairdresser({...newHairdresser, gender: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Coiffeur (Homme)</SelectItem>
                  <SelectItem value="female">Coiffeuse (Femme)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="edit-email">Email *</Label>
              <Input
                id="edit-email"
                type="email"
                value={newHairdresser.email}
                onChange={(e) => setNewHairdresser({...newHairdresser, email: e.target.value})}
                required
              />
            </div>

            <div>
              <Label htmlFor="edit-phone">Téléphone</Label>
              <Input
                id="edit-phone"
                type="tel"
                value={newHairdresser.phone}
                onChange={(e) => setNewHairdresser({...newHairdresser, phone: e.target.value})}
              />
            </div>

            <div>
              <Label htmlFor="edit-location">Localisation</Label>
              <Input
                id="edit-location"
                value={newHairdresser.location}
                onChange={(e) => setNewHairdresser({...newHairdresser, location: e.target.value})}
              />
            </div>

            <div>
              <Label htmlFor="edit-specialties">Spécialités</Label>
              <Input
                id="edit-specialties"
                value={newHairdresser.specialties}
                onChange={(e) => setNewHairdresser({...newHairdresser, specialties: e.target.value})}
              />
            </div>

            <div>
              <Label htmlFor="edit-experience">Expérience</Label>
              <Input
                id="edit-experience"
                value={newHairdresser.experience}
                onChange={(e) => setNewHairdresser({...newHairdresser, experience: e.target.value})}
              />
            </div>

            <div>
              <Label htmlFor="edit-image">Nouvelle photo de profil</Label>
              <Input
                id="edit-image"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
              />
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)} className="flex-1">
                Annuler
              </Button>
              <Button type="submit" className="flex-1 bg-gradient-gold text-white">
                Sauvegarder
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;
