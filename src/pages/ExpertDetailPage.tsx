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
import { useProfessionalServices } from '@/hooks/useProfessionalServices';
import PriceDisplay from '@/components/ui/price-display';
import PageHeader from '@/components/PageHeader';

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
}

const ExpertDetailPage = () => {
  const { expertId } = useParams<{ expertId: string }>();
  const navigate = useNavigate();

  // Récupérer les services du professionnel avec mises à jour temps réel
  const { services, loading: servicesLoading } = useProfessionalServices(expertId, true);

  const { data: expert, isLoading, error } = useQuery({
    queryKey: ['expert', expertId],
    queryFn: async () => {
      if (!expertId) throw new Error('ID expert manquant');

      // Récupérer les données de l'expert via auth_id
      const { data: expertData, error: expertError } = await supabase
        .from('hairdressers')
        .select(`
          id,
          name,
          email,
          phone,
          specialties,
          rating,
          image_url,
          experience,
          location,
          auth_id,
          is_active
        `)
        .eq('auth_id', expertId)
        .eq('is_active', true)
        .single();

      if (expertError) {
        if (expertError.code === 'PGRST116') {
          throw new Error('Expert non trouvé');
        }
        throw expertError;
      }

      // Récupérer les informations de rôle depuis profiles
      const { data: profileData } = await supabase
        .from('profiles')
        .select('role')
        .eq('user_id', expertId)
        .single();

      return {
        ...expertData,
        role: profileData?.role || 'coiffeur'
      } as ExpertDetail;
    },
    enabled: !!expertId
  });

  if (isLoading || servicesLoading) {
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
      <PageHeader
        title={expert.name}
        description="Profil détaillé et services disponibles"
        showBackButton={true}
        backPath="/experts"
        breadcrumbs={[
          { label: 'Accueil', path: '/' },
          { label: 'Experts', path: '/experts' },
          { label: expert.name }
        ]}
      />

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
              {/* Services du professionnel */}
              {services && services.length > 0 ? (
                <div className="space-y-3">
                  {services.map((service) => (
                    <div key={service.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{service.name}</h4>
                        {service.description && (
                          <p className="text-sm text-muted-foreground">{service.description}</p>
                        )}
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {service.duration} min
                          </span>
                          {service.category && (
                            <Badge variant="outline" className="text-xs">{service.category}</Badge>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <PriceDisplay amount={service.price} size="lg" className="font-semibold" />
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