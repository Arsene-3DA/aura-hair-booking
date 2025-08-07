import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star, MapPin, Calendar, Scissors, Palette, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { useProfessionalServices } from '@/hooks/useProfessionalServices';
import PageHeader from '@/components/PageHeader';

interface Professional {
  id: string;
  name: string;
  specialties: string[];
  rating: number;
  image_url: string;
  experience: string;
  location: string;
  auth_id: string;
  role: string;
}

const ProfessionalCard = ({ professional }: { professional: Professional }) => {
  const { services } = useProfessionalServices(professional.auth_id, true);
  
  return (
    <Card className="group hover:shadow-lg transition-all duration-300 overflow-hidden">
      <CardContent className="p-6">
        {/* Photo avec indicateur */}
        <div className="flex justify-center mb-4">
          <div className="relative">
            <Avatar className="h-20 w-20 border-4 border-white shadow-lg">
              <AvatarImage 
                src={professional.image_url} 
                alt={professional.name}
                className="object-cover"
              />
              <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-white text-lg font-bold">
                {professional.name.split(' ').map(n => n[0]).join('').toUpperCase()}
              </AvatarFallback>
            </Avatar>
            {/* Indicateur vert */}
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-3 border-white shadow-sm"></div>
          </div>
        </div>

        {/* Nom et titre */}
        <div className="text-center mb-4">
          <h3 className="text-xl font-bold text-foreground mb-1">{professional.name}</h3>
          <p className="text-sm text-muted-foreground">Professionnel expérimenté</p>
        </div>

        {/* Services count badge */}
        {services.length > 0 && (
          <div className="text-center mb-4">
            <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-200">
              Services ({services.length})
            </Badge>
          </div>
        )}

        {/* Services en forme carrée */}
        {services.length > 0 ? (
          <div className="mb-4">
            <div className="grid grid-cols-2 gap-2 max-h-20 overflow-hidden">
              {services.slice(0, 4).map((service) => (
                <div 
                  key={service.id} 
                  className="bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-lg p-2 text-center"
                >
                  <p className="text-xs font-medium text-primary truncate">
                    {service.name}
                  </p>
                </div>
              ))}
            </div>
            {services.length > 4 && (
              <p className="text-xs text-muted-foreground text-center mt-2">
                +{services.length - 4} autres services
              </p>
            )}
          </div>
        ) : professional.specialties && professional.specialties.length > 0 && (
          <div className="mb-4">
            <div className="grid grid-cols-2 gap-2">
              {professional.specialties.slice(0, 4).map((specialty, index) => (
                <div 
                  key={index} 
                  className="bg-gradient-to-r from-secondary/20 to-secondary/10 border border-secondary/30 rounded-lg p-2 text-center"
                >
                  <p className="text-xs font-medium text-secondary-foreground truncate">
                    {specialty}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Localisation */}
        {professional.location && (
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-4">
            <MapPin className="h-4 w-4" />
            <span className="truncate">{professional.location}</span>
          </div>
        )}

        {/* Rating - toujours 5 étoiles */}
        <div className="flex items-center justify-center gap-1 mb-6">
          <div className="flex space-x-1">
            {[...Array(5)].map((_, i) => (
              <Star 
                key={i} 
                className="h-4 w-4 text-yellow-400 fill-yellow-400" 
              />
            ))}
          </div>
          <span className="text-sm text-muted-foreground font-medium ml-1">{professional.rating.toFixed(1)}</span>
        </div>

        {/* Boutons d'action */}
        <div className="space-y-2">
          <Button variant="outline" className="w-full" asChild>
            <Link to={`/experts/${professional.auth_id}`}>
              Voir profil
            </Link>
          </Button>
          <Button className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-black font-medium" asChild>
            <Link to={`/bookings/new?expert=${professional.auth_id}`}>
              <Calendar className="h-4 w-4 mr-2" />
              Réserver maintenant
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

const ExpertsPage = () => {
  const [selectedTab, setSelectedTab] = useState('coiffeur');

  const { data: professionals = [], isLoading } = useQuery({
    queryKey: ['professionals'],
    queryFn: async () => {
      // Récupérer tous les hairdressers actifs
      const { data, error } = await supabase
        .from('hairdressers')
        .select(`
          id,
          auth_id,
          name,
          specialties,
          rating,
          experience,
          location,
          salon_address,
          image_url,
          is_active
        `)
        .eq('is_active', true);

      if (error) throw error;

      // Récupérer les rôles correspondants
      const authIds = (data || []).map(h => h.auth_id).filter(Boolean);
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('user_id, role')
        .in('user_id', authIds)
        .in('role', ['coiffeur', 'coiffeuse', 'cosmetique']);

      const roleMap = (profilesData || []).reduce((acc, profile) => {
        acc[profile.user_id] = profile.role;
        return acc;
      }, {} as Record<string, string>);

      return (data || [])
        .filter(item => item.auth_id && roleMap[item.auth_id])
        .map(item => ({
          id: item.id,
          name: item.name,
          specialties: item.specialties || [],
          rating: item.rating || 5.0, // Note par défaut de 5 étoiles
          image_url: item.image_url || '/placeholder.svg',
          experience: item.experience || '',
          location: item.salon_address || item.location || '', // Priorité à salon_address
          auth_id: item.auth_id,
          role: roleMap[item.auth_id] || 'coiffeur'
        }));
    }
  });

  const filteredProfessionals = professionals.filter(p => p.role === selectedTab);

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'coiffeur':
      case 'coiffeuse':
        return <Scissors className="h-5 w-5" />;
      case 'cosmetique':
        return <Sparkles className="h-5 w-5" />;
      default:
        return <Palette className="h-5 w-5" />;
    }
  };

  const getRoleTitle = (role: string) => {
    switch (role) {
      case 'coiffeur':
        return 'Coiffeurs';
      case 'coiffeuse':
        return 'Coiffeuses';
      case 'cosmetique':
        return 'Experts Cosmétique';
      default:
        return 'Professionnels';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement des experts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader
        title="Choisir un Expert"
        description="Sélectionnez votre professionnel et réservez votre rendez-vous"
        showBackButton={true}
        breadcrumbs={[
          { label: 'Accueil', path: '/' },
          { label: 'Experts' }
        ]}
      />

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="coiffeur" className="flex items-center gap-2">
            <Scissors className="h-4 w-4" />
            Coiffeurs
          </TabsTrigger>
          <TabsTrigger value="coiffeuse" className="flex items-center gap-2">
            <Scissors className="h-4 w-4" />
            Coiffeuses
          </TabsTrigger>
          <TabsTrigger value="cosmetique" className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Cosmétique
          </TabsTrigger>
        </TabsList>

        {['coiffeur', 'coiffeuse', 'cosmetique'].map((role) => (
          <TabsContent key={role} value={role}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProfessionals.length > 0 ? (
                filteredProfessionals.map((professional) => (
                  <ProfessionalCard key={professional.id} professional={professional} />
                ))
              ) : (
                <div className="col-span-full text-center py-8">
                  <div className="text-muted-foreground">
                    <div className="mb-4">
                      {getRoleIcon(role)}
                    </div>
                    <p className="text-lg mb-2">Aucun expert {getRoleTitle(role).toLowerCase()} disponible</p>
                    <p className="text-sm">Revenez bientôt pour découvrir nos nouveaux professionnels</p>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default ExpertsPage;