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
          rating: item.rating || 4.5,
          image_url: item.image_url || '/placeholder.svg',
          experience: item.experience || '',
          location: item.location || '',
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
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-4">Choisir un Expert</h1>
        <p className="text-lg text-muted-foreground">
          Sélectionnez votre professionnel et réservez votre rendez-vous
        </p>
      </div>

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
                  <Card key={professional.id} className="group hover:shadow-lg transition-shadow">
                    <CardHeader className="text-center pb-2">
                      <Avatar className="h-20 w-20 mx-auto mb-4">
                        <AvatarImage 
                          src={professional.image_url} 
                          alt={professional.name}
                        />
                        <AvatarFallback>
                          {professional.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <CardTitle className="text-xl">{professional.name}</CardTitle>
                      <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span>{professional.rating}/5</span>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {professional.experience && (
                        <p className="text-sm text-muted-foreground text-center">
                          {professional.experience}
                        </p>
                      )}
                      
                      {professional.location && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          <span>{professional.location}</span>
                        </div>
                      )}

                      {professional.specialties && professional.specialties.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {professional.specialties.slice(0, 3).map((specialty, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {specialty}
                            </Badge>
                          ))}
                          {professional.specialties.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{professional.specialties.length - 3}
                            </Badge>
                          )}
                        </div>
                      )}

                      <div className="space-y-2 pt-2">
                        <Button asChild className="w-full">
                          <Link to={`/experts/${professional.auth_id}`}>
                            <Calendar className="h-4 w-4 mr-2" />
                            Voir profil & réserver
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
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