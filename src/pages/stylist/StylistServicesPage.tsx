import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Scissors, Plus, Edit, Trash2, Clock, Euro, Loader2, AlertTriangle } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useStylistServicesManagement, type CreateServiceData } from '@/hooks/useStylistServicesManagement';
import { useAuth } from '@/hooks/useAuth';
const StylistServicesPage = () => {
  const {
    user
  } = useAuth();
  const stylistId = user?.id || '';

  // Utiliser le hook avec persistance
  const {
    services,
    loading,
    addService,
    updateService,
    deleteService,
    toggleServiceStatus
  } = useStylistServicesManagement(stylistId);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<any>(null);
  const [formData, setFormData] = useState<CreateServiceData>({
    name: '',
    description: '',
    duration: 60,
    price: 0
  });
  const [submitting, setSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<{
    name?: string;
    description?: string;
    duration?: string;
    price?: string;
  }>({});
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState<string | null>(null);

  // Validation du formulaire
  const validateForm = () => {
    const errors: typeof formErrors = {};
    if (!formData.name.trim()) {
      errors.name = 'Le nom du service est requis';
    } else if (formData.name.trim().length < 2) {
      errors.name = 'Le nom doit contenir au moins 2 caractères';
    }
    if (!formData.description.trim()) {
      errors.description = 'La description est requise';
    } else if (formData.description.trim().length < 10) {
      errors.description = 'La description doit contenir au moins 10 caractères';
    }
    if (!formData.duration || formData.duration < 15) {
      errors.duration = 'La durée doit être d\'au moins 15 minutes';
    } else if (formData.duration > 480) {
      errors.duration = 'La durée ne peut pas dépasser 8 heures (480 minutes)';
    }
    if (!formData.price || formData.price <= 0) {
      errors.price = 'Le prix doit être supérieur à 0';
    } else if (formData.price > 1000) {
      errors.price = 'Le prix ne peut pas dépasser 1000$ CAD';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  const handleAddService = () => {
    setEditingService(null);
    setFormData({
      name: '',
      description: '',
      duration: 60,
      price: 0
    });
    setFormErrors({});
    setIsDialogOpen(true);
  };
  const handleEditService = (service: any) => {
    setEditingService(service);
    setFormData({
      name: service.name,
      description: service.description,
      duration: service.duration,
      price: service.price
    });
    setFormErrors({});
    setIsDialogOpen(true);
  };
  const handleSaveService = async () => {
    // Valider le formulaire avant la soumission
    if (!validateForm()) {
      return;
    }
    try {
      setSubmitting(true);
      if (editingService) {
        // Modifier un service existant
        await updateService(editingService.id, formData);
      } else {
        // Ajouter un nouveau service
        await addService(formData);
      }

      // Fermer le dialog et réinitialiser le formulaire
      setIsDialogOpen(false);
      setEditingService(null);
      setFormData({
        name: '',
        description: '',
        duration: 60,
        price: 0
      });
      setFormErrors({});
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      // L'erreur est déjà gérée dans le hook avec un toast
    } finally {
      setSubmitting(false);
    }
  };
  const handleDeleteService = (serviceId: string) => {
    setServiceToDelete(serviceId);
    setDeleteConfirmOpen(true);
  };
  const confirmDeleteService = async () => {
    if (!serviceToDelete) return;
    try {
      await deleteService(serviceToDelete);
      setDeleteConfirmOpen(false);
      setServiceToDelete(null);
    } catch (error) {
      // L'erreur est déjà gérée dans le hook
    }
  };
  const handleToggleServiceStatus = (serviceId: string) => {
    toggleServiceStatus(serviceId);
  };

  // Afficher un loader pendant le chargement initial
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          <p className="text-muted-foreground">Chargement de vos services...</p>
        </div>
      </div>;
  }
  return <div className="space-y-8 max-w-7xl mx-auto p-4 sm:p-6">
      {/* Header amélioré */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-gradient-to-r from-primary/5 to-secondary/5 p-6 rounded-xl border border-primary/20">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-3">
            <Scissors className="h-8 w-8" />
            Gestion de mes Services
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Créez et gérez vos prestations • Visibles par vos clients • Sauvegarde automatique
          </p>
        </div>
        <Button onClick={handleAddService} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Ajouter un service
        </Button>
      </div>

      {/* Services Grid - Amélioré */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {services.map(service => <Card key={service.id} className="relative hover:shadow-lg transition-all duration-300 group">
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
                    <span className="text-xl font-bold text-primary">${service.price} CAD</span>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col gap-2">
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleEditService(service)} className="flex-1 hover:bg-primary/10">
                    <Edit className="h-3 w-3 mr-1" />
                    Modifier
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleToggleServiceStatus(service.id)} className="flex-1 hover:bg-secondary/10">
                    {service.isActive ? 'Désactiver' : 'Activer'}
                  </Button>
                </div>
                <Button variant="destructive" size="sm" onClick={() => handleDeleteService(service.id)} className="w-full">
                  <Trash2 className="h-3 w-3 mr-1" />
                  Supprimer
                </Button>
              </div>
            </CardContent>
          </Card>)}
      </div>

      {/* Add/Edit Service Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingService ? 'Modifier le service' : 'Ajouter un service'}
            </DialogTitle>
            <DialogDescription>
              {editingService ? 'Modifiez les informations de votre service' : 'Ajoutez un nouveau service à votre catalogue'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Formulaire */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="name" className="block mb-2 text-sm font-medium">Nom du service</Label>
                <Input id="name" value={formData.name} onChange={e => {
                setFormData(prev => ({
                  ...prev,
                  name: e.target.value
                }));
                if (formErrors.name) setFormErrors(prev => ({
                  ...prev,
                  name: undefined
                }));
              }} placeholder="ex: Coupe femme" className={formErrors.name ? "border-destructive" : ""} />
                {formErrors.name && <p className="text-destructive text-sm mt-1">{formErrors.name}</p>}
              </div>
              
              <div>
                <Label htmlFor="description" className="block mb-2 text-sm font-medium">Description</Label>
                <Textarea id="description" value={formData.description} onChange={e => {
                setFormData(prev => ({
                  ...prev,
                  description: e.target.value
                }));
                if (formErrors.description) setFormErrors(prev => ({
                  ...prev,
                  description: undefined
                }));
              }} placeholder="Décrivez brièvement ce service..." rows={3} className={formErrors.description ? "border-destructive" : ""} />
                {formErrors.description && <p className="text-destructive text-sm mt-1">{formErrors.description}</p>}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="duration" className="block mb-2 text-sm font-medium bg-slate-500">Durée (minutes)</Label>
                  <Input id="duration" type="number" value={formData.duration} onChange={e => {
                  setFormData(prev => ({
                    ...prev,
                    duration: parseInt(e.target.value) || 0
                  }));
                  if (formErrors.duration) setFormErrors(prev => ({
                    ...prev,
                    duration: undefined
                  }));
                }} min="15" step="15" className={formErrors.duration ? "border-destructive" : ""} />
                  {formErrors.duration && <p className="text-destructive text-sm mt-1">{formErrors.duration}</p>}
                </div>
                
                <div>
                  <Label htmlFor="price" className="block mb-2 text-sm font-medium bg-gray-500">Prix ($CAD)</Label>
                  <Input id="price" type="number" value={formData.price} onChange={e => {
                  setFormData(prev => ({
                    ...prev,
                    price: parseFloat(e.target.value) || 0
                  }));
                  if (formErrors.price) setFormErrors(prev => ({
                    ...prev,
                    price: undefined
                  }));
                }} min="0" step="0.50" className={formErrors.price ? "border-destructive" : ""} />
                  {formErrors.price && <p className="text-destructive text-sm mt-1">{formErrors.price}</p>}
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
                          ${formData.price || 0} CAD
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
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="flex-1" disabled={submitting}>
              Annuler
            </Button>
            <Button onClick={handleSaveService} className="flex-1" disabled={submitting}>
              {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editingService ? 'Modifier' : 'Ajouter'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirmation de suppression */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Confirmer la suppression
            </AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer ce service ? Cette action est irréversible.
              <br />
              <span className="font-medium text-foreground mt-2 block">
                • Le service ne sera plus visible pour vos clients
              </span>
              <span className="font-medium text-foreground">
                • Les réservations existantes ne seront pas affectées
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteService} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Supprimer définitivement
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {services.length === 0 && <Card className="border-dashed border-2">
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
        </Card>}
    </div>;
};
export default StylistServicesPage;