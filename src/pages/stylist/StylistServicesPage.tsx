import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Scissors, Plus, Edit, Trash2, Clock, Euro } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

interface Service {
  id: string;
  name: string;
  description: string;
  duration: number;
  price: number;
  isActive: boolean;
}

const StylistServicesPage = () => {
  const [services, setServices] = useState<Service[]>([
    {
      id: '1',
      name: 'Coupe femme',
      description: 'Coupe et brushing pour femme',
      duration: 60,
      price: 35,
      isActive: true,
    },
    {
      id: '2',
      name: 'Coloration',
      description: 'Coloration complète avec soin',
      duration: 120,
      price: 85,
      isActive: true,
    },
    {
      id: '3',
      name: 'Mèches',
      description: 'Mèches avec décoloration',
      duration: 90,
      price: 65,
      isActive: true,
    },
  ]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    duration: 60,
    price: 0,
  });

  const { toast } = useToast();

  const handleAddService = () => {
    setEditingService(null);
    setFormData({ name: '', description: '', duration: 60, price: 0 });
    setIsDialogOpen(true);
  };

  const handleEditService = (service: Service) => {
    setEditingService(service);
    setFormData({
      name: service.name,
      description: service.description,
      duration: service.duration,
      price: service.price,
    });
    setIsDialogOpen(true);
  };

  const handleSaveService = () => {
    if (!formData.name.trim()) {
      toast({
        title: "Erreur",
        description: "Le nom du service est requis",
        variant: "destructive",
      });
      return;
    }

    if (editingService) {
      // Update existing service
      setServices(prev => 
        prev.map(service => 
          service.id === editingService.id
            ? { ...service, ...formData }
            : service
        )
      );
      toast({
        title: "Succès",
        description: "Service modifié avec succès",
      });
    } else {
      // Add new service
      const newService: Service = {
        id: Date.now().toString(),
        ...formData,
        isActive: true,
      };
      setServices(prev => [...prev, newService]);
      toast({
        title: "Succès",
        description: "Service ajouté avec succès",
      });
    }

    setIsDialogOpen(false);
    setEditingService(null);
    setFormData({ name: '', description: '', duration: 60, price: 0 });
  };

  const handleDeleteService = (serviceId: string) => {
    setServices(prev => prev.filter(service => service.id !== serviceId));
    toast({
      title: "Succès",
      description: "Service supprimé",
    });
  };

  const toggleServiceStatus = (serviceId: string) => {
    setServices(prev => 
      prev.map(service => 
        service.id === serviceId
          ? { ...service, isActive: !service.isActive }
          : service
      )
    );
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto p-4 sm:p-6">
      {/* Header amélioré */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-gradient-to-r from-primary/5 to-secondary/5 p-6 rounded-xl border border-primary/20">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-3">
            <Scissors className="h-8 w-8" />
            Mes Services
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Gérez vos prestations et tarifs
          </p>
        </div>
        <Button onClick={handleAddService} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Ajouter un service
        </Button>
      </div>

      {/* Services Grid - Amélioré */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {services.map((service) => (
          <Card key={service.id} className="relative hover:shadow-lg transition-all duration-300 group">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg group-hover:text-primary transition-colors">{service.name}</CardTitle>
                <Badge variant={service.isActive ? "default" : "secondary"}>
                  {service.isActive ? "Actif" : "Inactif"}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2">{service.description}</p>
            </CardHeader>
            <CardContent className="pt-0 space-y-4">
              <div className="bg-muted/50 p-4 rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{service.duration} min</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Euro className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xl font-bold text-primary">{service.price}€</span>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col gap-2">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditService(service)}
                    className="flex-1 hover:bg-primary/10"
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    Modifier
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleServiceStatus(service.id)}
                    className="flex-1 hover:bg-secondary/10"
                  >
                    {service.isActive ? 'Désactiver' : 'Activer'}
                  </Button>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDeleteService(service.id)}
                  className="w-full"
                >
                  <Trash2 className="h-3 w-3 mr-1" />
                  Supprimer
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add/Edit Service Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingService ? 'Modifier le service' : 'Ajouter un service'}
            </DialogTitle>
            <DialogDescription>
              {editingService 
                ? 'Modifiez les informations de votre service'
                : 'Ajoutez un nouveau service à votre catalogue'
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Formulaire */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Nom du service</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="ex: Coupe femme"
                  className="bg-background/50 border-primary/20"
                />
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Décrivez brièvement ce service..."
                  rows={3}
                  className="bg-background/50 border-primary/20"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="duration">Durée (minutes)</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={formData.duration}
                    onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) || 0 }))}
                    min="15"
                    step="15"
                    className="bg-background/50 border-primary/20"
                  />
                </div>
                
                <div>
                  <Label htmlFor="price">Prix (€)</Label>
                  <Input
                    id="price"
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                    min="0"
                    step="0.50"
                    className="bg-background/50 border-primary/20"
                  />
                </div>
              </div>
            </div>

            {/* Aperçu en temps réel */}
            <div className="lg:sticky lg:top-4">
              <Label className="text-sm font-medium text-muted-foreground">Aperçu du service</Label>
              <Card className="mt-2 border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">
                      {formData.name || 'Nom du service'}
                    </CardTitle>
                    <Badge variant="default">Actif</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {formData.description || 'Description du service...'}
                  </p>
                </CardHeader>
                <CardContent className="pt-0 space-y-4">
                  <div className="bg-background/60 p-4 rounded-lg border border-primary/10">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">
                          {formData.duration || 0} min
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Euro className="h-4 w-4 text-muted-foreground" />
                        <span className="text-xl font-bold text-primary">
                          {formData.price || 0}€
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-xs text-muted-foreground bg-muted/30 p-3 rounded-lg">
                    <div className="flex items-center gap-1 mb-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>Aperçu mis à jour en temps réel</span>
                    </div>
                    C'est ainsi que votre service apparaîtra aux clients
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
          
          <div className="flex gap-2 mt-6">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="flex-1">
              Annuler
            </Button>
            <Button onClick={handleSaveService} className="flex-1">
              {editingService ? 'Modifier' : 'Ajouter'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {services.length === 0 && (
        <Card className="border-dashed border-2">
          <CardContent className="text-center py-12">
            <Scissors className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Aucun service configuré
            </h3>
            <p className="text-muted-foreground mb-6">
              Commencez par ajouter vos premiers services pour que vos clients puissent réserver
            </p>
            <Button onClick={handleAddService} size="lg">
              <Plus className="h-4 w-4 mr-2" />
              Ajouter mon premier service
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default StylistServicesPage;