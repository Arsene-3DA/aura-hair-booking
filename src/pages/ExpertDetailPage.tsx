import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft, 
  Star, 
  MapPin, 
  Calendar, 
  Clock, 
  Phone, 
  Mail,
  CheckCircle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface ExpertDetail {
  id: string;
  name: string;
  email: string;
  phone?: string;
  specialties: string[];
  rating: number;
  image_url: string;
  experience: string;
  location: string;
  auth_id: string;
  role: string;
  services?: Array<{
    id: string;
    name: string;
    price: number;
    duration: number;
  }>;
}

const ExpertDetailPage = () => {
  const { expertId } = useParams<{ expertId: string }>();
  const navigate = useNavigate();

  const { data: expert, isLoading, error } = useQuery({
    queryKey: ['expert', expertId],
    queryFn: async () => {
      if (!expertId) throw new Error('ID expert manquant');

      // Récupérer les données de l'expert
      const { data: expertData, error: expertError } = await supabase
        .from('hairdressers')
        .select(`
          id,
          auth_id,
          name,
          email,
          phone,
          specialties,
          rating,
          experience,
          location,
          image_url,
          is_active
        `)
        .eq('auth_id', expertId)
        .eq('is_active', true)
        .single();

      if (expertError) throw expertError;
      if (!expertData) throw new Error('Expert non trouvé');

      // Récupérer les services de l'expert
      const { data: servicesData } = await supabase
        .from('hairdresser_services')
        .select(`
          services (
            id,
            name,
            price,
            duration
          )
        `)
        .eq('hairdresser_id', expertData.auth_id);

      const services = servicesData?.map(item => item.services).filter(Boolean) || [];

      return {
        id: expertData.id,
        name: expertData.name,
        email: expertData.email,
        phone: expertData.phone,
        specialties: expertData.specialties || [],
        rating: expertData.rating || 4.5,
        image_url: expertData.image_url || '/placeholder.svg',
        experience: expertData.experience || '',
        location: expertData.location || '',
        auth_id: expertData.auth_id,
        role: 'coiffeur', // Par défaut
        services
      } as ExpertDetail;
    },
    enabled: !!expertId
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement du profil...</p>
        </div>
      </div>
    );
  }

  if (error || !expert) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Expert non trouvé</h2>
          <p className="text-muted-foreground mb-6">
            L'expert que vous recherchez n'existe pas ou n'est plus disponible.
          </p>
          <Button onClick={() => navigate('/experts')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour aux experts
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Navigation */}
      <Button 
        variant="outline" 
        onClick={() => navigate('/experts')}
        className="mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Retour aux experts
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profil de l'expert */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader className="text-center">
              <Avatar className="h-32 w-32 mx-auto mb-4">
                <AvatarImage src={expert.image_url} alt={expert.name} />
                <AvatarFallback className="text-2xl">
                  {expert.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <CardTitle className="text-2xl">{expert.name}</CardTitle>
              <div className="flex items-center justify-center gap-1">
                <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                <span className="font-medium">{expert.rating}/5</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {expert.experience && (
                <div>
                  <h4 className="font-medium mb-2">Expérience</h4>
                  <p className="text-sm text-muted-foreground">{expert.experience}</p>
                </div>
              )}

              {expert.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{expert.location}</span>
                </div>
              )}

              {expert.email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{expert.email}</span>
                </div>
              )}

              {expert.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{expert.phone}</span>
                </div>
              )}

              {expert.specialties && expert.specialties.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Spécialités</h4>
                  <div className="flex flex-wrap gap-1">
                    {expert.specialties.map((specialty, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {specialty}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Services et réservation */}
        <div className="lg:col-span-2 space-y-6">
          {/* Services disponibles */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Services disponibles
              </CardTitle>
            </CardHeader>
            <CardContent>
              {expert.services && expert.services.length > 0 ? (
                <div className="grid gap-4">
                  {expert.services.map((service) => (
                    <div key={service.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{service.name}</h4>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {service.duration} min
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-lg">{service.price}€</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>Aucun service spécifique configuré</p>
                  <p className="text-sm">Contactez directement le professionnel pour plus d'informations</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Bouton de réservation */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Réserver un rendez-vous
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Prêt à réserver votre rendez-vous avec {expert.name} ? 
                Sélectionnez votre service, date et heure préférés.
              </p>
              <Button asChild size="lg" className="w-full">
                <Link to={`/bookings/new?expert=${expertId}`}>
                  <Calendar className="h-4 w-4 mr-2" />
                  Réserver maintenant
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ExpertDetailPage;