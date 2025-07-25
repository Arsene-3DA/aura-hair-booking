import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Settings, 
  Database, 
  Globe, 
  Mail, 
  Shield,
  Clock,
  Users,
  AlertTriangle 
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface PlatformSettings {
  siteName: string;
  siteDescription: string;
  contactEmail: string;
  maintenanceMode: boolean;
  maxBookingsPerDay: number;
  bookingAdvanceDays: number;
  allowGuestBookings: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
}

const PlatformSettings = () => {
  const [settings, setSettings] = useState<PlatformSettings>({
    siteName: 'Salon Beauty',
    siteDescription: 'Votre salon de beauté de confiance',
    contactEmail: 'contact@salonbeauty.fr',
    maintenanceMode: false,
    maxBookingsPerDay: 50,
    bookingAdvanceDays: 30,
    allowGuestBookings: true,
    emailNotifications: true,
    smsNotifications: false,
  });

  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: 'Paramètres sauvegardés',
        description: 'Les paramètres de la plateforme ont été mis à jour',
      });
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de sauvegarder les paramètres',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const systemStats = {
    uptime: '99.9%',
    responseTime: '245ms',
    storage: '2.4 GB / 10 GB',
    bandwidth: '156 MB / 1 GB',
    connections: '23 / 100',
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Paramètres de la plateforme</h1>
          <p className="text-muted-foreground">Configuration générale et système</p>
        </div>
        <Button onClick={handleSave} disabled={loading}>
          <Settings className="w-4 h-4 mr-2" />
          {loading ? 'Sauvegarde...' : 'Sauvegarder'}
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* General Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5" />
              Paramètres généraux
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="siteName">Nom du site</Label>
              <Input
                id="siteName"
                value={settings.siteName}
                onChange={(e) => setSettings({...settings, siteName: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="siteDescription">Description</Label>
              <Textarea
                id="siteDescription"
                value={settings.siteDescription}
                onChange={(e) => setSettings({...settings, siteDescription: e.target.value})}
                rows={3}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="contactEmail">Email de contact</Label>
              <Input
                id="contactEmail"
                type="email"
                value={settings.contactEmail}
                onChange={(e) => setSettings({...settings, contactEmail: e.target.value})}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Mode maintenance</Label>
                <p className="text-sm text-muted-foreground">
                  Désactiver l'accès public au site
                </p>
              </div>
              <Switch
                checked={settings.maintenanceMode}
                onCheckedChange={(checked) => 
                  setSettings({...settings, maintenanceMode: checked})
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Booking Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Paramètres de réservation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="maxBookings">Réservations max par jour</Label>
              <Input
                id="maxBookings"
                type="number"
                value={settings.maxBookingsPerDay}
                onChange={(e) => setSettings({
                  ...settings, 
                  maxBookingsPerDay: parseInt(e.target.value)
                })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="advanceDays">Jours d'avance maximum</Label>
              <Input
                id="advanceDays"
                type="number"
                value={settings.bookingAdvanceDays}
                onChange={(e) => setSettings({
                  ...settings, 
                  bookingAdvanceDays: parseInt(e.target.value)
                })}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Réservations invités</Label>
                <p className="text-sm text-muted-foreground">
                  Autoriser les réservations sans compte
                </p>
              </div>
              <Switch
                checked={settings.allowGuestBookings}
                onCheckedChange={(checked) => 
                  setSettings({...settings, allowGuestBookings: checked})
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Notifications email</Label>
                <p className="text-sm text-muted-foreground">
                  Envoyer des emails automatiques
                </p>
              </div>
              <Switch
                checked={settings.emailNotifications}
                onCheckedChange={(checked) => 
                  setSettings({...settings, emailNotifications: checked})
                }
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Notifications SMS</Label>
                <p className="text-sm text-muted-foreground">
                  Envoyer des SMS automatiques
                </p>
              </div>
              <Switch
                checked={settings.smsNotifications}
                onCheckedChange={(checked) => 
                  setSettings({...settings, smsNotifications: checked})
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* System Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              État du système
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Uptime</span>
                <Badge variant="default">{systemStats.uptime}</Badge>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Temps de réponse</span>
                <Badge variant="secondary">{systemStats.responseTime}</Badge>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Stockage utilisé</span>
                <Badge variant="outline">{systemStats.storage}</Badge>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Bande passante</span>
                <Badge variant="outline">{systemStats.bandwidth}</Badge>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Connexions actives</span>
                <Badge variant="outline">{systemStats.connections}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Sécurité
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="space-y-2">
              <Label>Authentification à deux facteurs</Label>
              <p className="text-sm text-muted-foreground">
                Obligatoire pour les administrateurs
              </p>
              <Badge variant="default">Activé</Badge>
            </div>
            
            <div className="space-y-2">
              <Label>Chiffrement des données</Label>
              <p className="text-sm text-muted-foreground">
                SSL/TLS activé
              </p>
              <Badge variant="default">Activé</Badge>
            </div>
            
            <div className="space-y-2">
              <Label>Sauvegarde automatique</Label>
              <p className="text-sm text-muted-foreground">
                Toutes les 6 heures
              </p>
              <Badge variant="default">Activé</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Supabase Quotas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Quotas Supabase
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Requêtes DB</span>
                  <span className="text-sm font-medium">2.4M / 5M</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div className="bg-primary h-2 rounded-full" style={{width: '48%'}}></div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Stockage DB</span>
                  <span className="text-sm font-medium">156 MB / 500 MB</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div className="bg-primary h-2 rounded-full" style={{width: '31%'}}></div>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Auth Users</span>
                  <span className="text-sm font-medium">47 / 50K</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div className="bg-primary h-2 rounded-full" style={{width: '1%'}}></div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Realtime</span>
                  <span className="text-sm font-medium">8 / 200</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div className="bg-primary h-2 rounded-full" style={{width: '4%'}}></div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PlatformSettings;