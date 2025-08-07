import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Camera, Plus, Upload, Star, Trash2, Eye, Grid, Loader2 } from 'lucide-react';
import { usePortfolioManagement } from '@/hooks/usePortfolioManagement';
import { useStylistServices } from '@/hooks/useStylistServices';
import { useRoleAuth } from '@/hooks/useRoleAuth';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const GalleryManagement = () => {
  const { userProfile } = useRoleAuth();
  const { 
    portfolio, 
    loading, 
    addPortfolioItem, 
    removePortfolioItem, 
    toggleFeatured 
  } = usePortfolioManagement(userProfile?.user_id);
  const { services } = useStylistServices(userProfile?.user_id);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState('');
  const [hairstyleName, setHairstyleName] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [deleteItemId, setDeleteItemId] = useState<string | null>(null);

  const maxImages = 10;

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return;
    }

    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const handleAddImage = async () => {
    if (!selectedFile || !selectedService) return;

    try {
      setUploading(true);
      await addPortfolioItem(selectedService, selectedFile, hairstyleName);
      
      // Reset form
      setIsAddModalOpen(false);
      setSelectedService('');
      setHairstyleName('');
      setSelectedFile(null);
      setPreviewUrl(null);
    } catch (error) {
      // Error is handled in the hook
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteImage = async (itemId: string, imageUrl: string) => {
    try {
      await removePortfolioItem(itemId, imageUrl);
      setDeleteItemId(null);
    } catch (error) {
      // Error is handled in the hook
    }
  };

  const resetAddModal = () => {
    setIsAddModalOpen(false);
    setSelectedService('');
    setHairstyleName('');
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <Camera className="h-6 w-6" />
            Galerie et Portfolio
          </h3>
          <p className="text-muted-foreground">
            Ajoutez jusqu'à {maxImages} photos qui apparaîtront sur votre profil public
          </p>
        </div>
        <Button 
          onClick={() => setIsAddModalOpen(true)}
          disabled={portfolio.length >= maxImages}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Ajouter une photo ({portfolio.length}/{maxImages})
        </Button>
      </div>

      {/* Portfolio Grid */}
      {portfolio.length === 0 ? (
        <Card className="border-dashed border-2">
          <CardContent className="text-center py-12">
            <Camera className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h4 className="text-lg font-semibold mb-2">
              Votre galerie est vide
            </h4>
            <p className="text-muted-foreground mb-6">
              Commencez par ajouter vos premières réalisations pour présenter votre travail
            </p>
            <Button onClick={() => setIsAddModalOpen(true)} size="lg">
              <Plus className="h-4 w-4 mr-2" />
              Ajouter votre première photo
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {portfolio.map((item) => (
            <Card key={item.id} className="overflow-hidden group hover:shadow-lg transition-all">
              <div className="relative aspect-square">
                <img
                  src={item.image_url}
                  alt={item.hairstyle_name || item.service?.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button
                    variant="secondary"
                    size="icon"
                    onClick={() => toggleFeatured(item.id)}
                    className={item.is_featured ? "bg-yellow-500 hover:bg-yellow-600" : ""}
                  >
                    <Star className={`h-4 w-4 ${item.is_featured ? 'fill-current' : ''}`} />
                  </Button>
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => setDeleteItemId(item.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                {item.is_featured && (
                  <div className="absolute top-2 left-2">
                    <Badge className="bg-yellow-500 text-yellow-900">
                      <Star className="h-3 w-3 mr-1 fill-current" />
                      En vedette
                    </Badge>
                  </div>
                )}
              </div>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">
                      {item.service?.name || 'Service'}
                    </h4>
                    {item.hairstyle_name && (
                      <p className="text-sm text-muted-foreground">
                        {item.hairstyle_name}
                      </p>
                    )}
                  </div>
                  <Badge variant="outline">
                    <Eye className="h-3 w-3 mr-1" />
                    Public
                  </Badge>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}

      {/* Add Image Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={resetAddModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Ajouter une photo au portfolio</DialogTitle>
            <DialogDescription>
              Ajoutez une nouvelle réalisation à votre galerie. Cette photo sera visible sur votre profil public.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Form */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="service">Service associé</Label>
                <Select value={selectedService} onValueChange={setSelectedService}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez un service" />
                  </SelectTrigger>
                  <SelectContent>
                    {services.map((service) => (
                      <SelectItem key={service.id} value={service.id}>
                        {service.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="hairstyle">Nom de la coiffure (optionnel)</Label>
                <Input
                  id="hairstyle"
                  value={hairstyleName}
                  onChange={(e) => setHairstyleName(e.target.value)}
                  placeholder="ex: Coupe bob moderne"
                />
              </div>

              <div>
                <Label htmlFor="image">Photo</Label>
                <div className="mt-2">
                  <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/80"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Formats acceptés : JPG, PNG, WebP (max 5MB)
                  </p>
                </div>
              </div>
            </div>

            {/* Preview */}
            <div>
              <Label>Aperçu</Label>
              <div className="mt-2 aspect-square border-2 border-dashed border-muted-foreground/25 rounded-lg flex items-center justify-center bg-muted/50">
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Aperçu"
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <div className="text-center">
                    <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Sélectionnez une image pour la prévisualiser
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={resetAddModal} className="flex-1">
              Annuler
            </Button>
            <Button 
              onClick={handleAddImage} 
              disabled={!selectedFile || !selectedService || uploading}
              className="flex-1"
            >
              {uploading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Ajouter au portfolio
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteItemId} onOpenChange={() => setDeleteItemId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cette photo ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. La photo sera définitivement supprimée de votre portfolio et ne sera plus visible sur votre profil public.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                const item = portfolio.find(p => p.id === deleteItemId);
                if (item) {
                  handleDeleteImage(item.id, item.image_url);
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Info Section */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
            <div>
              <h4 className="font-medium mb-1">Synchronisation automatique</h4>
              <p className="text-sm text-muted-foreground">
                Toutes les photos ajoutées ici apparaissent automatiquement sur votre profil public et dans votre portfolio visible par les clients lors de la réservation.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GalleryManagement;