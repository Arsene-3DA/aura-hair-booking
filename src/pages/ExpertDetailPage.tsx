import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
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
  CheckCircle,
  Globe,
  Instagram,
  Camera,
  Shield,
  MessageCircle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useProfessionalServices } from '@/hooks/useProfessionalServices';
import { usePortfolioManagement } from '@/hooks/usePortfolioManagement';
import { useSecureHairdresserData } from '@/hooks/useSecureHairdresserData';
import { ContactHairdresserModal } from '@/components/ContactHairdresserModal';
import { useAuth } from '@/hooks/useAuth';
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
  salon_address?: string;
  bio?: string;
  website?: string;
  instagram?: string;
  working_hours?: any;
}

interface WorkingDay {
  open: string;
  close: string;
  isOpen: boolean;
}

const ExpertDetailPage = () => {
  const { expertId } = useParams<{ expertId: string }>();
  const navigate = useNavigate();
  const [showContactModal, setShowContactModal] = useState(false);
  const { user } = useAuth();
  
  // Use secure data hook
  const { hairdresser: expert, loading: isLoading, error } = useSecureHairdresserData(expertId);

  // Récupérer les services du professionnel avec mises à jour temps réel
  const { services, loading: servicesLoading } = useProfessionalServices(expertId, true);
  
  // Récupérer le portfolio avec mises à jour temps réel
  const { portfolio } = usePortfolioManagement(expertId);

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
                <AvatarImage 
                  src={expert.image_url} 
                  alt={expert.name}
                  className="object-cover"
                  style={{ aspectRatio: '1/1' }}
                  loading="lazy" 
                />
                <AvatarFallback className="text-2xl">
                  {expert.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <CardTitle className="text-2xl">{expert.name}</CardTitle>
              <div className="flex items-center justify-center gap-1">
                <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                <span className="font-medium">{expert.rating > 0 ? expert.rating : 5.0}/5</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {expert.experience && (
                <div>
                  <h4 className="font-medium mb-2">Expérience</h4>
                  <p className="text-sm text-muted-foreground">{expert.experience}</p>
                </div>
              )}

              {expert.bio && (
                <div>
                  <h4 className="font-medium mb-2">À propos</h4>
                  <p className="text-sm text-muted-foreground">{expert.bio}</p>
                </div>
              )}

              {(expert.salon_address || expert.location) && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{expert.salon_address || expert.location}</span>
                </div>
              )}

              {/* Contact Info - Only show if authorized */}
              {expert.canViewContact ? (
                <>
                  {expert.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <a href={`mailto:${expert.email}`} className="text-sm text-primary hover:underline">
                        {expert.email}
                      </a>
                    </div>
                  )}

                  {expert.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <a href={`tel:${expert.phone}`} className="text-sm text-primary hover:underline">
                        {expert.phone}
                      </a>
                    </div>
                  )}
                </>
              ) : (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <Shield className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-blue-800">
                      <p className="font-medium mb-1">Informations protégées</p>
                      <p>Contactez ce professionnel via notre système sécurisé.</p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowContactModal(true)}
                        className="mt-2 border-blue-300 text-blue-700 hover:bg-blue-100"
                      >
                        <MessageCircle className="h-3 w-3 mr-1" />
                        Envoyer un message
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {expert.website && (
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <a href={expert.website} target="_blank" rel="noopener noreferrer" 
                     className="text-sm text-primary hover:underline">
                    Site web
                  </a>
                </div>
              )}

              {expert.instagram && (
                <div className="flex items-center gap-2">
                  <Instagram className="h-4 w-4 text-muted-foreground" />
                  <a href={`https://instagram.com/${expert.instagram.replace('@', '')}`} 
                     target="_blank" rel="noopener noreferrer" 
                     className="text-sm text-primary hover:underline">
                    {expert.instagram}
                  </a>
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

              {expert.working_hours && (
                <div>
                  <h4 className="font-medium mb-2">Horaires d'ouverture</h4>
                  <div className="space-y-1 text-sm">
                    {Object.entries(expert.working_hours as Record<string, WorkingDay>).map(([day, hours]) => {
                      const dayNames: Record<string, string> = {
                        monday: 'Lundi',
                        tuesday: 'Mardi', 
                        wednesday: 'Mercredi',
                        thursday: 'Jeudi',
                        friday: 'Vendredi',
                        saturday: 'Samedi',
                        sunday: 'Dimanche'
                      };
                      
                      return (
                        <div key={day} className="flex justify-between">
                          <span className="text-muted-foreground">{dayNames[day]}</span>
                          <span>
                            {hours.isOpen ? `${hours.open} - ${hours.close}` : 'Fermé'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Services, Portfolio et réservation */}
        <div className="lg:col-span-2 space-y-6">
          {/* Portfolio - Gallery */}
          {portfolio && portfolio.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="h-5 w-5" />
                  Portfolio ({portfolio.length} photos)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {portfolio.slice(0, 6).map((item) => (
                    <div key={item.id} className="relative group overflow-hidden rounded-lg aspect-square">
                      <img 
                        src={item.image_url} 
                        alt={item.hairstyle_name || 'Portfolio'} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        style={{ aspectRatio: '1/1' }}
                        loading="lazy"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/placeholder.svg';
                        }}
                      />
                      {item.hairstyle_name && (
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                          <p className="text-white text-xs font-medium">{item.hairstyle_name}</p>
                        </div>
                      )}
                      {item.is_featured && (
                        <div className="absolute top-2 right-2">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                {portfolio.length > 6 && (
                  <p className="text-center text-sm text-muted-foreground mt-4">
                    +{portfolio.length - 6} autres réalisations
                  </p>
                )}
              </CardContent>
            </Card>
          )}

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
                  <p>Ce professionnel n'a pas encore défini de services spécifiques.</p>
                  <p className="text-sm">Vous pouvez faire une demande de réservation et les services seront personnalisés selon vos besoins.</p>
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

      {/* Contact Modal */}
      {expert && (
        <ContactHairdresserModal
          isOpen={showContactModal}
          onClose={() => setShowContactModal(false)}
          hairdresserId={expert.id}
          hairdresserName={expert.name}
        />
      )}
    </div>
  );
};

export default ExpertDetailPage;