import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Star, 
  MapPin, 
  Calendar, 
  Clock, 
  Phone, 
  Mail,
  Globe,
  Instagram,
  Camera,
  ExternalLink
} from 'lucide-react';
import { useProfessionalServices } from '@/hooks/useProfessionalServices';
import { usePortfolioManagement } from '@/hooks/usePortfolioManagement';
import { useSecureHairdresserData } from '@/hooks/useSecureHairdresserData';
import PriceDisplay from '@/components/ui/price-display';

interface WorkingDay {
  open: string;
  close: string;
  isOpen: boolean;
}

const ProfessionalProfilePage = () => {
  const { professionalId } = useParams<{ professionalId: string }>();
  const navigate = useNavigate();
  const [showBookingWidget, setShowBookingWidget] = useState(false);
  
  // Use existing hooks for data
  const { hairdresser: professional, loading: isLoading, error } = useSecureHairdresserData(professionalId);
  const { services, loading: servicesLoading } = useProfessionalServices(professionalId, true);
  const { portfolio } = usePortfolioManagement(professionalId);

  const handleReserve = () => {
    setShowBookingWidget(true);
    // ou navigate vers page de réservation
    // navigate(`/bookings/new?expert=${professionalId}`);
  };

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

  if (error || !professional) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Professionnel non trouvé</h2>
          <p className="text-muted-foreground mb-6">
            Le professionnel que vous recherchez n'existe pas ou n'est plus disponible.
          </p>
          <Button onClick={() => navigate('/experts')}>
            Retour aux experts
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-[360px,1fr] gap-6">
          
          {/* Sidebar gauche - Profil */}
          <div className="md:sticky md:top-8 md:h-fit">
            <Card className="rounded-2xl shadow-lg">
              <CardContent className="p-8">
                {/* Avatar et infos principales */}
                <div className="text-center mb-6">
                  <Avatar className="h-32 w-32 mx-auto mb-4 ring-4 ring-border">
                    <AvatarImage 
                      src={professional.image_url} 
                      alt={professional.name}
                      className="object-cover"
                    />
                    <AvatarFallback className="text-2xl bg-primary/10">
                      {professional.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  <h1 className="text-xl font-medium mb-2 lowercase text-muted-foreground">
                    {professional.name.toLowerCase().replace(/\s+/g, '.')}
                  </h1>
                  
                  <div className="flex items-center justify-center gap-1 mb-4">
                    <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold text-lg">{professional.rating || 5}/5</span>
                  </div>
                </div>

                {/* À propos */}
                {professional.bio && (
                  <div className="mb-6">
                    <h3 className="font-semibold mb-3 text-lg">À propos</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {professional.bio}
                    </p>
                  </div>
                )}

                {/* Informations de contact */}
                <div className="space-y-4 mb-6">
                  <h3 className="font-semibold text-lg">Contact</h3>
                  
                  {(professional.salon_address || professional.location) && (
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-muted-foreground">
                        {professional.salon_address || professional.location}
                      </span>
                    </div>
                  )}

                  {professional.email && (
                    <div className="flex items-center gap-3">
                      <Mail className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                      <a 
                        href={`mailto:${professional.email}`} 
                        className="text-sm text-primary hover:underline"
                      >
                        {professional.email}
                      </a>
                    </div>
                  )}

                  {professional.phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                      <a 
                        href={`tel:${professional.phone}`} 
                        className="text-sm text-primary hover:underline"
                      >
                        {professional.phone}
                      </a>
                    </div>
                  )}

                  {professional.website && (
                    <div className="flex items-center gap-3">
                      <Globe className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                      <a 
                        href={professional.website} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-sm text-primary hover:underline flex items-center gap-1"
                      >
                        Site web
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  )}

                  {professional.instagram && (
                    <div className="flex items-center gap-3">
                      <Instagram className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                      <a 
                        href={`https://instagram.com/${professional.instagram.replace('@', '')}`} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-sm text-primary hover:underline"
                      >
                        {professional.instagram}
                      </a>
                    </div>
                  )}
                </div>

                {/* Horaires d'ouverture */}
                {professional.working_hours && (
                  <div>
                    <h3 className="font-semibold mb-3 text-lg">Horaires d'ouverture</h3>
                    <div className="space-y-2">
                      {Object.entries(professional.working_hours as Record<string, WorkingDay>).map(([day, hours]) => {
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
                          <div key={day} className="flex justify-between items-center">
                            <span className="text-sm font-medium">{dayNames[day]}</span>
                            <span className="text-sm text-muted-foreground">
                              {hours.isOpen ? `${hours.open} – ${hours.close}` : 'Fermé'}
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

          {/* Colonne droite - Contenu principal */}
          <div className="space-y-6">
            
            {/* Portfolio */}
            <Card className="rounded-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Camera className="h-6 w-6" />
                  Portfolio ({portfolio?.length || 0} photos)
                </CardTitle>
              </CardHeader>
              <CardContent>
                {portfolio && portfolio.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {portfolio.map((item) => (
                      <div 
                        key={item.id} 
                        className="relative group overflow-hidden rounded-xl aspect-square bg-muted"
                      >
                        <img 
                          src={item.image_url} 
                          alt={item.hairstyle_name || 'Portfolio'} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = '/placeholder.svg';
                          }}
                        />
                        {item.hairstyle_name && (
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                            <p className="text-white text-xs font-medium truncate">
                              {item.hairstyle_name}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-muted-foreground/20 rounded-xl p-12 text-center">
                    <Camera className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-2">Portfolio en construction</p>
                    <p className="text-sm text-muted-foreground/70">
                      Les réalisations seront bientôt disponibles
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Services disponibles */}
            <Card className="rounded-2xl">
              <CardHeader>
                <CardTitle className="text-xl">Services disponibles</CardTitle>
              </CardHeader>
              <CardContent>
                {services && services.length > 0 ? (
                  <div className="space-y-4">
                    {services.map((service) => (
                      <Card key={service.id} className="rounded-xl border-2 hover:border-primary/20 transition-colors">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-bold text-lg uppercase tracking-wide mb-2">
                                {service.name}
                              </h4>
                              
                              {service.description && (
                                <p className="text-muted-foreground mb-3 leading-relaxed">
                                  {service.description}
                                </p>
                              )}
                              
                              <div className="flex items-center gap-4">
                                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                  <Clock className="h-4 w-4" />
                                  <span>{service.duration} min</span>
                                </div>
                                
                                {service.category && (
                                  <Badge variant="secondary" className="text-xs uppercase tracking-wide">
                                    {service.category}
                                  </Badge>
                                )}
                              </div>
                            </div>
                            
                            <div className="text-right ml-6">
                              <PriceDisplay 
                                amount={service.price} 
                                size="xl" 
                                className="font-bold text-primary" 
                                showCAD={true}
                              />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground mb-2">
                      Aucun service défini
                    </p>
                    <p className="text-sm text-muted-foreground/70">
                      Les services seront bientôt disponibles
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Réserver un rendez-vous */}
            <Card className="rounded-2xl border-2 border-primary/20 bg-primary/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Calendar className="h-6 w-6" />
                  Réserver un rendez-vous
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  Prêt à transformer votre style ? Réservez dès maintenant votre rendez-vous 
                  avec <span className="font-medium">{professional.name}</span> et découvrez 
                  une expérience de coiffure personnalisée et professionnelle.
                </p>
                
                <Button 
                  onClick={handleReserve}
                  size="lg" 
                  className="w-full h-12 text-base font-semibold rounded-xl"
                >
                  <Calendar className="h-5 w-5 mr-2" />
                  Réserver maintenant
                </Button>
              </CardContent>
            </Card>

          </div>
        </div>
      </div>

      {/* Widget de réservation (placeholder) */}
      {showBookingWidget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle>Réservation</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Widget de réservation en cours de développement
              </p>
              <Button 
                onClick={() => setShowBookingWidget(false)}
                className="w-full"
              >
                Fermer
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ProfessionalProfilePage;