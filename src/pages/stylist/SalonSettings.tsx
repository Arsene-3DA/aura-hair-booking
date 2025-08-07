import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ProfileSection from '@/components/stylist/ProfileSection';
import WorkingHoursSection from '@/components/stylist/WorkingHoursSection';
import ServicesManagement from '@/components/stylist/ServicesManagement';
import GalleryManagement from '@/components/stylist/GalleryManagement';
import { Settings, User, Clock, Scissors, Camera } from 'lucide-react';

const SalonSettings = () => {
  const handleProfileUpdate = () => {
    // This will trigger any necessary refreshes
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-gradient-to-r from-primary/5 to-secondary/5 p-6 rounded-xl border border-primary/20">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-3">
            <Settings className="h-8 w-8" />
            Paramètres du Salon
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Configurez votre profil, horaires, services et galerie • Visible par vos clients
          </p>
        </div>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Profil
          </TabsTrigger>
          <TabsTrigger value="hours" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Horaires
          </TabsTrigger>
          <TabsTrigger value="services" className="flex items-center gap-2">
            <Scissors className="h-4 w-4" />
            Services
          </TabsTrigger>
          <TabsTrigger value="gallery" className="flex items-center gap-2">
            <Camera className="h-4 w-4" />
            Galerie
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <ProfileSection onProfileUpdate={handleProfileUpdate} />
        </TabsContent>

        <TabsContent value="hours">
          <WorkingHoursSection />
        </TabsContent>

        <TabsContent value="services">
          <ServicesManagement />
        </TabsContent>

        <TabsContent value="gallery">
          <GalleryManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SalonSettings;
