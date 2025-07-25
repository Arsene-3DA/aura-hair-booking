import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { PhotoUpload } from '@/components/PhotoUpload';
import { useGoogleAuth } from '@/contexts/GoogleAuthContext';
import { 
  Clock, 
  Plus, 
  X, 
  Upload, 
  Image as ImageIcon,
  Save,
  Trash2
} from 'lucide-react';

interface WorkingHour {
  id: string;
  day: string;
  start: string;
  end: string;
  active: boolean;
}

interface Service {
  id: string;
  name: string;
  duration: number;
  price: number;
  description: string;
}

interface GalleryImage {
  id: string;
  url: string;
  alt: string;
}

const SalonSettings = () => {
  const { toast } = useToast();
  const { profile, refreshProfile } = useGoogleAuth();
  
  // Working Hours State
  const [workingHours, setWorkingHours] = useState<WorkingHour[]>([
    { id: '1', day: 'Lundi', start: '09:00', end: '18:00', active: true },
    { id: '2', day: 'Mardi', start: '09:00', end: '18:00', active: true },
    { id: '3', day: 'Mercredi', start: '09:00', end: '18:00', active: true },
    { id: '4', day: 'Jeudi', start: '09:00', end: '18:00', active: true },
    { id: '5', day: 'Vendredi', start: '09:00', end: '18:00', active: true },
    { id: '6', day: 'Samedi', start: '09:00', end: '17:00', active: true },
    { id: '7', day: 'Dimanche', start: '', end: '', active: false },
  ]);

  // Services State
  const [services, setServices] = useState<Service[]>([
    { id: '1', name: 'Coupe Femme', duration: 60, price: 45, description: 'Coupe et brushing' },
    { id: '2', name: 'Coupe Homme', duration: 30, price: 25, description: 'Coupe classique' },
    { id: '3', name: 'Coloration', duration: 120, price: 80, description: 'Coloration complète' },
  ]);

  // Gallery State
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([
    { id: '1', url: '/placeholder.svg', alt: 'Coupe moderne' },
    { id: '2', url: '/placeholder.svg', alt: 'Coloration blonde' },
    { id: '3', url: '/placeholder.svg', alt: 'Salon intérieur' },
  ]);

  // Form States
  const [newService, setNewService] = useState<Omit<Service, 'id'>>({
    name: '',
    duration: 60,
    price: 0,
    description: '',
  });

  const updateWorkingHour = (id: string, field: keyof WorkingHour, value: string | boolean) => {
    setWorkingHours(prev => 
      prev.map(hour => 
        hour.id === id ? { ...hour, [field]: value } : hour
      )
    );
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

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    // Simulate image upload (in real app, would upload to Cloudinary/Supabase Storage)
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const newImage: GalleryImage = {
          id: Date.now().toString(),
          url: e.target?.result as string,
          alt: file.name,
        };
        setGalleryImages(prev => [...prev, newImage]);
      };
      reader.readAsDataURL(file);
    });

    toast({
      title: "Image ajoutée",
      description: "Votre image a été ajoutée à la galerie",
    });
  };

  const removeImage = (id: string) => {
    setGalleryImages(prev => prev.filter(img => img.id !== id));
    toast({
      title: "Image supprimée",
      description: "L'image a été retirée de votre galerie",
    });
  };

  const saveSettings = () => {
    // Simulate saving to database
    toast({
      title: "Paramètres sauvegardés",
      description: "Vos modifications ont été enregistrées avec succès",
    });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Paramètres du Salon</h1>
          <p className="text-muted-foreground">Configurez vos horaires, services et galerie</p>
        </div>
        <Button onClick={saveSettings} className="flex items-center gap-2">
          <Save className="h-4 w-4" />
          Sauvegarder
        </Button>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile">Profil</TabsTrigger>
          <TabsTrigger value="hours">Horaires</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="gallery">Galerie</TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-4">
          <PhotoUpload 
            currentAvatarUrl={profile?.avatar_url}
            onAvatarUpdate={refreshProfile}
          />
        </TabsContent>

        {/* Working Hours Tab */}
        <TabsContent value="hours" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Horaires d'ouverture
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {workingHours.map((hour) => (
                  <div key={hour.id} className="flex items-center gap-4 p-4 border rounded-lg">
                    <div className="w-24">
                      <Label className="font-medium">{hour.day}</Label>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={hour.active}
                        onChange={(e) => updateWorkingHour(hour.id, 'active', e.target.checked)}
                        className="rounded"
                      />
                      <Label className="text-sm">Ouvert</Label>
                    </div>

                    {hour.active && (
                      <>
                        <Input
                          type="time"
                          value={hour.start}
                          onChange={(e) => updateWorkingHour(hour.id, 'start', e.target.value)}
                          className="w-32"
                        />
                        <span className="text-muted-foreground">à</span>
                        <Input
                          type="time"
                          value={hour.end}
                          onChange={(e) => updateWorkingHour(hour.id, 'end', e.target.value)}
                          className="w-32"
                        />
                      </>
                    )}
                  </div>
                ))}
              </div>
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

        {/* Gallery Tab */}
        <TabsContent value="gallery" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5" />
                Galerie Photo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Upload Section */}
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                  <Input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                  />
                  <Label htmlFor="image-upload" className="cursor-pointer">
                    <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Cliquez pour ajouter des images à votre galerie
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Formats supportés : JPG, PNG, WebP
                    </p>
                  </Label>
                </div>

                {/* Gallery Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {galleryImages.map((image) => (
                    <div key={image.id} className="relative group">
                      <img
                        src={image.url}
                        alt={image.alt}
                        className="w-full h-32 object-cover rounded-lg border"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => removeImage(image.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                {galleryImages.length === 0 && (
                  <div className="text-center py-8">
                    <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Aucune image dans votre galerie</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SalonSettings;
