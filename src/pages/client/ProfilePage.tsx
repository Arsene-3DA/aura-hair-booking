import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { User, Bell, Lock, Mail, Phone, Save } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export default function ProfilePage() {
  const { user } = useAuth();
  const { profile, updateProfile } = useProfile(user?.id);
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [profileForm, setProfileForm] = useState({
    full_name: profile?.full_name || '',
    phone: profile?.phone || '',
    preferences: {
      notifications: profile?.preferences?.notifications ?? true,
      email_marketing: profile?.preferences?.email_marketing ?? false,
      preferred_time: profile?.preferences?.preferred_time || 'morning'
    }
  });

  const handleProfileUpdate = async () => {
    setLoading(true);
    try {
      await updateProfile(profileForm);
      toast({
        title: "✅ Profil mis à jour",
        description: "Vos informations ont été sauvegardées"
      });
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "❌ Erreur",
        description: "Les mots de passe ne correspondent pas",
        variant: "destructive"
      });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast({
        title: "❌ Erreur",
        description: "Le mot de passe doit contenir au moins 6 caractères",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      });

      if (error) throw error;

      toast({
        title: "✅ Mot de passe modifié",
        description: "Votre mot de passe a été mis à jour avec succès"
      });

      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error: any) {
      console.error('Error changing password:', error);
      toast({
        title: "❌ Erreur",
        description: error.message || "Impossible de modifier le mot de passe",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Mon profil</h1>
        <p className="text-muted-foreground">
          Gérez vos informations personnelles et préférences
        </p>
      </div>

      <Tabs defaultValue="personal" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="personal">Informations personnelles</TabsTrigger>
          <TabsTrigger value="preferences">Préférences</TabsTrigger>
          <TabsTrigger value="security">Sécurité</TabsTrigger>
        </TabsList>

        {/* Informations personnelles */}
        <TabsContent value="personal">
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
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    L'email ne peut pas être modifié
                  </p>
                </div>
                
                <div>
                  <Label htmlFor="full_name">Nom complet</Label>
                  <Input
                    id="full_name"
                    value={profileForm.full_name}
                    onChange={(e) => setProfileForm(prev => ({
                      ...prev,
                      full_name: e.target.value
                    }))}
                    placeholder="Votre nom complet"
                  />
                </div>
                
                <div>
                  <Label htmlFor="phone">Téléphone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm(prev => ({
                      ...prev,
                      phone: e.target.value
                    }))}
                    placeholder="06 12 34 56 78"
                  />
                </div>
              </div>

              <Separator />
              
              <Button onClick={handleProfileUpdate} disabled={loading}>
                <Save className="h-4 w-4 mr-2" />
                {loading ? 'Sauvegarde...' : 'Sauvegarder'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Préférences */}
        <TabsContent value="preferences">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Préférences de notification
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="notifications">Notifications push</Label>
                  <p className="text-sm text-muted-foreground">
                    Recevoir des notifications pour les confirmations de RDV
                  </p>
                </div>
                <Switch
                  id="notifications"
                  checked={profileForm.preferences.notifications}
                  onCheckedChange={(checked) => setProfileForm(prev => ({
                    ...prev,
                    preferences: { ...prev.preferences, notifications: checked }
                  }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="email_marketing">Emails promotionnels</Label>
                  <p className="text-sm text-muted-foreground">
                    Recevoir des offres spéciales et nouveautés
                  </p>
                </div>
                <Switch
                  id="email_marketing"
                  checked={profileForm.preferences.email_marketing}
                  onCheckedChange={(checked) => setProfileForm(prev => ({
                    ...prev,
                    preferences: { ...prev.preferences, email_marketing: checked }
                  }))}
                />
              </div>

              <div>
                <Label htmlFor="preferred_time">Créneau préféré</Label>
                <select
                  id="preferred_time"
                  className="w-full mt-2 p-2 border rounded-md"
                  value={profileForm.preferences.preferred_time}
                  onChange={(e) => setProfileForm(prev => ({
                    ...prev,
                    preferences: { ...prev.preferences, preferred_time: e.target.value }
                  }))}
                >
                  <option value="morning">Matin (8h-12h)</option>
                  <option value="afternoon">Après-midi (12h-17h)</option>
                  <option value="evening">Soir (17h-20h)</option>
                </select>
              </div>

              <Separator />
              
              <Button onClick={handleProfileUpdate} disabled={loading}>
                <Save className="h-4 w-4 mr-2" />
                {loading ? 'Sauvegarde...' : 'Sauvegarder les préférences'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sécurité */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Sécurité
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="current_password">Mot de passe actuel</Label>
                <Input
                  id="current_password"
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData(prev => ({
                    ...prev,
                    currentPassword: e.target.value
                  }))}
                  placeholder="Votre mot de passe actuel"
                />
              </div>
              
              <div>
                <Label htmlFor="new_password">Nouveau mot de passe</Label>
                <Input
                  id="new_password"
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData(prev => ({
                    ...prev,
                    newPassword: e.target.value
                  }))}
                  placeholder="Au moins 6 caractères"
                />
              </div>
              
              <div>
                <Label htmlFor="confirm_password">Confirmer le nouveau mot de passe</Label>
                <Input
                  id="confirm_password"
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData(prev => ({
                    ...prev,
                    confirmPassword: e.target.value
                  }))}
                  placeholder="Confirmer le mot de passe"
                />
              </div>

              <Separator />
              
              <Button 
                onClick={handlePasswordChange} 
                disabled={loading || !passwordData.newPassword || !passwordData.confirmPassword}
              >
                <Lock className="h-4 w-4 mr-2" />
                {loading ? 'Modification...' : 'Changer le mot de passe'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}