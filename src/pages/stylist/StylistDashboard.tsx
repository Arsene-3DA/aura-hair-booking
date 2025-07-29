import React, { useState, useEffect } from 'react';
import { useRoleAuth } from '@/hooks/useRoleAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { PhotoUpload } from '@/components/PhotoUpload';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  User, 
  MapPin, 
  Phone, 
  Mail,
  Clock, 
  Plus, 
  X, 
  Save,
  Trash2,
  Star
} from 'lucide-react';
import { StylistReviewsSection } from '@/components/StylistReviewsSection';

interface HairdresserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  location?: string;
  specialties: string[];
  experience?: string;
  image_url?: string;
  rating: number;
}

interface Service {
  id: string;
  name: string;
  duration: number;
  price: number;
  description: string;
}

const StylistDashboard = () => {
  const { userProfile: profile, loadUserProfile: refreshProfile } = useRoleAuth();
  const { toast } = useToast();
  
  const [hairdresserProfile, setHairdresserProfile] = useState<HairdresserProfile | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form states
  const [profileForm, setProfileForm] = useState({
    name: '',
    phone: '',
    location: '',
    experience: '',
    specialties: [] as string[]
  });
  
  const [newService, setNewService] = useState({
    name: '',
    duration: 60,
    price: 0,
    description: ''
  });
  
  const [newSpecialty, setNewSpecialty] = useState('');

  // Load hairdresser data
  useEffect(() => {
    loadHairdresserData();
  }, [profile]);

  const loadHairdresserData = async () => {
    if (!profile?.id) return;
    
    try {
      setLoading(true);
      
      // Load hairdresser profile
      const { data: hairdresserData, error: hairdresserError } = await supabase
        .from('hairdressers')
        .select('*')
        .eq('auth_id', profile.id)
        .maybeSingle();

      if (hairdresserError && hairdresserError.code !== 'PGRST116') {
        throw hairdresserError;
      }

      if (hairdresserData) {
        setHairdresserProfile(hairdresserData);
        setProfileForm({
          name: hairdresserData.name || '',
          phone: hairdresserData.phone || '',
          location: hairdresserData.location || '',
          experience: hairdresserData.experience || '',
          specialties: hairdresserData.specialties || []
        });
      } else {
        // Create hairdresser profile if it doesn't exist
        await createHairdresserProfile();
      }

      // Load services (mock for now - you can create a services table later)
      setServices([
        { id: '1', name: 'Coupe Femme', duration: 60, price: 45, description: 'Coupe et brushing' },
        { id: '2', name: 'Coupe Homme', duration: 30, price: 25, description: 'Coupe classique' },
        { id: '3', name: 'Coloration', duration: 120, price: 80, description: 'Coloration complète' }
      ]);
      
    } catch (error: any) {
      console.error('Error loading hairdresser data:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger vos données",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createHairdresserProfile = async () => {
    if (!profile) return;

    try {
      const { data, error } = await supabase
        .from('hairdressers')
        .insert({
          auth_id: profile.id,
          name: profile.full_name || 'Coiffeur',
          email: profile.id, // This should be replaced with actual email
          specialties: [],
          rating: 0.0,
          is_active: true
        })
        .select()
        .single();

      if (error) throw error;
      
      setHairdresserProfile(data);
      
      toast({
        title: "Profil créé",
        description: "Votre profil coiffeur a été créé avec succès",
      });
    } catch (error: any) {
      console.error('Error creating hairdresser profile:', error);
      toast({
        title: "Erreur",
        description: "Impossible de créer votre profil",
        variant: "destructive",
      });
    }
  };

  const updateProfile = async () => {
    if (!hairdresserProfile?.id) return;

    try {
      const { error } = await supabase
        .from('hairdressers')
        .update({
          name: profileForm.name,
          phone: profileForm.phone,
          location: profileForm.location,
          experience: profileForm.experience,
          specialties: profileForm.specialties
        })
        .eq('id', hairdresserProfile.id);

      if (error) throw error;

      setHairdresserProfile(prev => prev ? {
        ...prev,
        ...profileForm
      } : null);

      toast({
        title: "Profil mis à jour",
        description: "Vos informations ont été sauvegardées",
      });
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour votre profil",
        variant: "destructive",
      });
    }
  };

  const addSpecialty = () => {
    if (!newSpecialty.trim()) return;
    
    setProfileForm(prev => ({
      ...prev,
      specialties: [...prev.specialties, newSpecialty.trim()]
    }));
    setNewSpecialty('');
  };

  const removeSpecialty = (index: number) => {
    setProfileForm(prev => ({
      ...prev,
      specialties: prev.specialties.filter((_, i) => i !== index)
    }));
  };

  const addService = () => {
    if (!newService.name.trim()) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Le nom du service est requis",
      });
      return;
    }

    const service: Service = {
      ...newService,
      id: Date.now().toString(),
    };

    setServices(prev => [...prev, service]);
    setNewService({ name: '', duration: 60, price: 0, description: '' });
    
    toast({
      title: "Service ajouté",
      description: `${service.name} a été ajouté à vos services`,
    });
  };

  const removeService = (id: string) => {
    setServices(prev => prev.filter(service => service.id !== id));
    toast({
      title: "Service supprimé",
      description: "Le service a été retiré de votre liste",
    });
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6 animate-pulse">
        <div className="h-8 bg-muted rounded w-64"></div>
        <div className="h-96 bg-muted rounded"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Mon Dashboard</h1>
          <p className="text-muted-foreground">Gérez votre profil et vos services</p>
        </div>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile">Mon Profil</TabsTrigger>
          <TabsTrigger value="services">Mes Services</TabsTrigger>
          <TabsTrigger value="reviews">Mes Avis</TabsTrigger>
          <TabsTrigger value="photo">Photo de Profil</TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Informations Personnelles
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nom complet</Label>
                  <Input
                    id="name"
                    value={profileForm.name}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Votre nom complet"
                  />
                </div>
                
                <div>
                  <Label htmlFor="phone">Téléphone</Label>
                  <Input
                    id="phone"
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="06 12 34 56 78"
                  />
                </div>
                
                <div>
                  <Label htmlFor="location">Localisation</Label>
                  <Input
                    id="location"
                    value={profileForm.location}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="Ville, quartier..."
                  />
                </div>
                
                <div>
                  <Label htmlFor="experience">Expérience</Label>
                  <Input
                    id="experience"
                    value={profileForm.experience}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, experience: e.target.value }))}
                    placeholder="5 ans d'expérience"
                  />
                </div>
              </div>

              {/* Specialties */}
              <div>
                <Label>Spécialités</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    value={newSpecialty}
                    onChange={(e) => setNewSpecialty(e.target.value)}
                    placeholder="Ajouter une spécialité"
                    onKeyDown={(e) => e.key === 'Enter' && addSpecialty()}
                  />
                  <Button onClick={addSpecialty} size="icon">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="flex flex-wrap gap-2 mt-3">
                  {profileForm.specialties.map((specialty, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {specialty}
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => removeSpecialty(index)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>

              <Separator />
              
              <Button onClick={updateProfile} className="flex items-center gap-2">
                <Save className="h-4 w-4" />
                Sauvegarder
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Services Tab */}
        <TabsContent value="services" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Mes Services</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Add New Service */}
                <div className="p-4 border rounded-lg bg-muted/50">
                  <h4 className="font-medium mb-3">Ajouter un service</h4>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <Input
                      placeholder="Nom du service"
                      value={newService.name}
                      onChange={(e) => setNewService(prev => ({ ...prev, name: e.target.value }))}
                    />
                    <Input
                      type="number"
                      placeholder="Durée (min)"
                      value={newService.duration}
                      onChange={(e) => setNewService(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                    />
                    <Input
                      type="number"
                      placeholder="Prix (€)"
                      value={newService.price}
                      onChange={(e) => setNewService(prev => ({ ...prev, price: parseFloat(e.target.value) }))}
                    />
                    <Button onClick={addService} className="flex items-center gap-2">
                      <Plus className="h-4 w-4" />
                      Ajouter
                    </Button>
                  </div>
                  <Textarea
                    placeholder="Description du service"
                    value={newService.description}
                    onChange={(e) => setNewService(prev => ({ ...prev, description: e.target.value }))}
                    className="mt-3"
                  />
                </div>

                {/* Existing Services */}
                <div className="space-y-3">
                  {services.map((service) => (
                    <div key={service.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium">{service.name}</h4>
                        <p className="text-sm text-muted-foreground">{service.description}</p>
                        <div className="flex gap-4 mt-2">
                          <Badge variant="outline">{service.duration} min</Badge>
                          <Badge variant="outline">{service.price} €</Badge>
                        </div>
                      </div>
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => removeService(service.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reviews Tab */}
        <TabsContent value="reviews" className="space-y-4">
          <StylistReviewsSection />
        </TabsContent>

        {/* Photo Tab */}
        <TabsContent value="photo" className="space-y-4">
          <PhotoUpload 
            currentAvatarUrl={hairdresserProfile?.image_url}
            onAvatarUpdate={async (url: string) => {
              if (hairdresserProfile?.id) {
                await supabase
                  .from('hairdressers')
                  .update({ image_url: url })
                  .eq('id', hairdresserProfile.id);
                
                setHairdresserProfile(prev => prev ? { ...prev, image_url: url } : null);
              }
              refreshProfile();
            }}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StylistDashboard;
