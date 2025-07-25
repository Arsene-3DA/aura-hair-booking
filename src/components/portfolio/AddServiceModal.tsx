import { useState } from 'react';
import { useAddServiceToPortfolio } from '@/hooks/useAddServiceToPortfolio';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { Upload, Image as ImageIcon } from 'lucide-react';

interface Service {
  id: string;
  name: string;
}

interface AddServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onServiceAdded: () => void;
  availableServices: Service[];
  stylistId?: string;
}

const AddServiceModal = ({
  isOpen,
  onClose,
  onServiceAdded,
  availableServices,
  stylistId
}: AddServiceModalProps) => {
  const [selectedServiceId, setSelectedServiceId] = useState('');
  const [hairstyleName, setHairstyleName] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');

  const { addServiceToPortfolio, adding } = useAddServiceToPortfolio(stylistId);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedServiceId || !imageFile) {
      return;
    }

    try {
      await addServiceToPortfolio({
        serviceId: selectedServiceId,
        hairstyleName: hairstyleName.trim() || undefined,
        imageFile,
      });

      // Reset form
      setSelectedServiceId('');
      setHairstyleName('');
      setImageFile(null);
      setImagePreview('');
      
      onServiceAdded();
    } catch (error) {
      // Error is handled in the hook
    }
  };

  const handleClose = () => {
    if (!adding) {
      setSelectedServiceId('');
      setHairstyleName('');
      setImageFile(null);
      setImagePreview('');
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md" data-cy="add-service-modal">
        <DialogHeader>
          <DialogTitle>Ajouter un service au portfolio</DialogTitle>
          <DialogDescription>
            Sélectionnez un service et ajoutez une image de votre réalisation
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Service Selection */}
          <div>
            <Label htmlFor="service">Service</Label>
            <Select 
              value={selectedServiceId} 
              onValueChange={setSelectedServiceId}
              data-cy="service-select"
            >
              <SelectTrigger>
                <SelectValue placeholder="Choisissez un service" />
              </SelectTrigger>
              <SelectContent>
                {availableServices.map((service) => (
                  <SelectItem key={service.id} value={service.id} data-cy="service-option">
                    {service.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Hairstyle Name */}
          <div>
            <Label htmlFor="hairstyleName">Nom de la coiffure (optionnel)</Label>
            <Input
              id="hairstyleName"
              value={hairstyleName}
              onChange={(e) => setHairstyleName(e.target.value)}
              placeholder="ex: Coupe dégradée moderne"
              data-cy="hairstyle-name-input"
            />
          </div>

          {/* Image Upload */}
          <div>
            <Label htmlFor="image">Image de la réalisation</Label>
            <div className="mt-2">
              {imagePreview ? (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-48 object-cover rounded-lg"
                    data-cy="image-preview"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => {
                      setImageFile(null);
                      setImagePreview('');
                    }}
                  >
                    Changer
                  </Button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-muted-foreground/25 rounded-lg cursor-pointer hover:bg-muted/50">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="h-8 w-8 mb-2 text-muted-foreground" />
                    <p className="mb-2 text-sm text-muted-foreground">
                      <span className="font-semibold">Cliquez pour télécharger</span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      PNG, JPG jusqu'à 5MB
                    </p>
                  </div>
                  <input
                    id="image"
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageChange}
                    data-cy="image-upload-input"
                  />
                </label>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={adding}
              className="flex-1"
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={!selectedServiceId || !imageFile || adding}
              className="flex-1"
              data-cy="submit-service-button"
            >
              {adding ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Ajout...
                </>
              ) : (
                <>
                  <ImageIcon className="h-4 w-4 mr-2" />
                  Ajouter
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddServiceModal;