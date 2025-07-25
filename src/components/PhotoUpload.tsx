import React, { useState } from 'react';
import { Camera, Upload, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useGoogleAuth } from '@/contexts/GoogleAuthContext';

interface PhotoUploadProps {
  currentAvatarUrl?: string | null;
  onAvatarUpdate: (url: string) => void;
}

export const PhotoUpload = ({ currentAvatarUrl, onAvatarUpdate }: PhotoUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();
  const { profile } = useGoogleAuth();

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const uploadPhoto = async (file: File) => {
    if (!profile) return;

    try {
      setUploading(true);
      
      const slug = generateSlug(profile.full_name || 'stylist');
      const fileName = `${profile.id}/${slug}.jpg`;

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('stylists')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (error) throw error;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('stylists')
        .getPublicUrl(fileName);

      // Update profile with new avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', profile.id);

      if (updateError) throw updateError;

      onAvatarUpdate(publicUrl);
      
      toast({
        title: "Photo mise à jour",
        description: "Votre photo de profil a été mise à jour avec succès.",
      });
    } catch (error: any) {
      console.error('Error uploading photo:', error);
      toast({
        title: "Erreur d'upload",
        description: error.message || "Impossible de télécharger la photo",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const deletePhoto = async () => {
    if (!profile || !currentAvatarUrl) return;

    try {
      setUploading(true);
      
      const slug = generateSlug(profile.full_name || 'stylist');
      const fileName = `${profile.id}/${slug}.jpg`;

      // Delete from Supabase Storage
      const { error } = await supabase.storage
        .from('stylists')
        .remove([fileName]);

      if (error) throw error;

      // Update profile to remove avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: null })
        .eq('id', profile.id);

      if (updateError) throw updateError;

      onAvatarUpdate('');
      
      toast({
        title: "Photo supprimée",
        description: "Votre photo de profil a été supprimée.",
      });
    } catch (error: any) {
      console.error('Error deleting photo:', error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de supprimer la photo",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Format invalide",
        description: "Veuillez sélectionner une image.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Fichier trop volumineux",
        description: "La taille maximale autorisée est de 5MB.",
        variant: "destructive",
      });
      return;
    }

    uploadPhoto(file);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="h-5 w-5" />
          Photo de Profil
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Photo Preview */}
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            {currentAvatarUrl ? (
              <img
                src={currentAvatarUrl}
                alt="Photo de profil"
                className="w-32 h-32 rounded-full object-cover border-4 border-border"
              />
            ) : (
              <div className="w-32 h-32 rounded-full bg-muted flex items-center justify-center border-4 border-border">
                <Camera className="h-8 w-8 text-muted-foreground" />
              </div>
            )}
          </div>

          {/* Upload Controls */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              disabled={uploading}
              className="relative"
            >
              <Upload className="h-4 w-4 mr-2" />
              {uploading ? 'Upload...' : 'Changer'}
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                disabled={uploading}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </Button>

            {currentAvatarUrl && (
              <Button
                variant="outline"
                size="icon"
                onClick={deletePhoto}
                disabled={uploading}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>

          <p className="text-sm text-muted-foreground text-center">
            Format recommandé : JPG/PNG, max 5MB<br />
            Dimensions optimales : 400x400px
          </p>
        </div>
      </CardContent>
    </Card>
  );
};