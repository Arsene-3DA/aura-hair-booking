import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { PhotoUpload } from '@/components/PhotoUpload';
import { User, MapPin, Phone, Mail, Globe, Instagram, Save, Loader2 } from 'lucide-react';
import { useStylistProfile, type StylistProfile } from '@/hooks/useStylistProfile';
import { useRoleAuth } from '@/hooks/useRoleAuth';

interface ProfileSectionProps {
  onProfileUpdate?: () => void;
}

const ProfileSection = ({ onProfileUpdate }: ProfileSectionProps) => {
  const { userProfile } = useRoleAuth();
  const { profile, loading, updateProfile } = useStylistProfile(userProfile?.user_id);
  const [formData, setFormData] = useState<Partial<StylistProfile>>({});
  const [saving, setSaving] = useState(false);

  // Initialize form data when profile loads
  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        salon_address: profile.salon_address || '',
        phone: profile.phone || '',
        bio: profile.bio || '',
        website: profile.website || '',
        instagram: profile.instagram || '',
      });
    }
  }, [profile]);

  const handleSave = async () => {
    try {
      setSaving(true);
      await updateProfile(formData);
      onProfileUpdate?.();
    } catch (error) {
      // Error is handled in the hook
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpdate = () => {
    // Refresh profile after avatar update
    onProfileUpdate?.();
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
      {/* Photo de profil */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Photo de profil
          </CardTitle>
        </CardHeader>
        <CardContent>
          <PhotoUpload 
            currentAvatarUrl={profile?.image_url}
            onAvatarUpdate={handleAvatarUpdate}
          />
        </CardContent>
      </Card>

      {/* Informations personnelles */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Informations personnelles
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Nom complet</Label>
              <Input
                id="name"
                value={formData.name || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Votre nom complet"
              />
            </div>
            <div>
              <Label htmlFor="phone">Téléphone</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="phone"
                  value={formData.phone || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="Votre numéro de téléphone"
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="salon_address">Adresse du salon</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="salon_address"
                value={formData.salon_address || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, salon_address: e.target.value }))}
                placeholder="Adresse complète de votre salon"
                className="pl-10"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="bio">Présentation</Label>
            <Textarea
              id="bio"
              value={formData.bio || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
              placeholder="Présentez-vous et votre salon en quelques mots..."
              rows={4}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="website">Site web</Label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="website"
                  value={formData.website || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                  placeholder="https://votre-site.com"
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="instagram">Instagram</Label>
              <div className="relative">
                <Instagram className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="instagram"
                  value={formData.instagram || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, instagram: e.target.value }))}
                  placeholder="@votre_compte"
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          <Button 
            onClick={handleSave} 
            disabled={saving}
            className="w-full md:w-auto"
          >
            {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            <Save className="h-4 w-4 mr-2" />
            Sauvegarder les modifications
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileSection;