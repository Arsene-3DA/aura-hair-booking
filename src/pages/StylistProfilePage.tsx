import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EnhancedAvatar } from '@/components/EnhancedAvatar';
import { useToast } from '@/hooks/use-toast';
import { validateId } from '@/utils/authHelper';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { usePortfolio } from '@/hooks/usePortfolio';
import { useStylistReviews } from '@/hooks/useStylistReviews';
import { 
  ArrowLeft, 
  Star, 
  MapPin, 
  Phone, 
  Mail, 
  Clock,
  Euro,
  Loader2,
  Camera,
  MessageCircle,
  BarChart3
} from 'lucide-react';

interface StylistProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  location?: string;
  specialties: string[];
  experience?: string;
  image_url?: string;
  rating: number;
  is_active: boolean;
}

interface Service {
  id: string;
  name: string;
  price: number;
  duration: number;
  description?: string;
}

const StylistProfilePage = () => {
  const { stylistId } = useParams<{ stylistId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [stylist, setStylist] = useState<StylistProfile | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Load portfolio and reviews
  const { portfolio, loading: portfolioLoading } = usePortfolio(stylistId);
  const { reviews, stats, loading: reviewsLoading } = useStylistReviews(stylistId);

  useEffect(() => {
    const loadStylistProfile = async () => {
      if (!validateId(stylistId)) {
        console.error('ID stylist invalide:', stylistId);
        toast({
          title: "Erreur",
          description: "ID du styliste manquant ou invalide",
          variant: "destructive"
        });
        navigate('/stylists');
        return;
      }

      try {
        setLoading(true);
        
        // Charger le profil du styliste depuis profiles et hairdressers
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', stylistId)
          .in('role', ['coiffeur', 'coiffeuse', 'cosmetique'])
          .single();

        let stylistData = null;
        
        if (profileData) {
          // Essayer de récupérer des infos supplémentaires depuis hairdressers
          const { data: hairdresserData } = await supabase
            .from('hairdressers')
            .select('*')
            .eq('auth_id', stylistId)
            .single();

          // Combiner les données du profil avec celles du coiffeur
          stylistData = {
            id: profileData.user_id,
            name: profileData.full_name,
            email: hairdresserData?.email || '',
            phone: hairdresserData?.phone || '',
            location: hairdresserData?.location || 'Ottawa, ON',
            specialties: hairdresserData?.specialties || ['Coiffure'],
            experience: hairdresserData?.experience || 'Professionnel expérimenté',
            image_url: profileData.avatar_url || hairdresserData?.image_url || '/placeholder.svg',
            rating: hairdresserData?.rating || 4.5,
            is_active: hairdresserData?.is_active ?? true,
            role: profileData.role
          };
        }

        const stylistError = profileError;

        if (stylistError || !stylistData) {
          console.error('Erreur lors du chargement du styliste:', stylistError);
          toast({
            title: "Erreur",
            description: "Styliste non trouvé",
            variant: "destructive"
          });
          navigate('/stylists');
          return;
        }

        setStylist(stylistData);

        // Charger les services du styliste
        const { data: servicesData, error: servicesError } = await supabase
          .from('hairdresser_services')
          .select(`
            services (
              id,
              name,
              price,
              duration,
              description
            )
          `)
          .eq('hairdresser_id', stylistId);

        if (!servicesError && servicesData) {
          const mappedServices = servicesData
            .map(item => item.services)
            .filter(Boolean) as Service[];
          setServices(mappedServices);
        }

      } catch (error) {
        console.error('Erreur lors du chargement du profil:', error);
        toast({
          title: "Erreur",
          description: "Impossible de charger le profil du styliste",
          variant: "destructive"
        });
        navigate('/stylists');
      } finally {
        setLoading(false);
      }
    };

    loadStylistProfile();
  }, [stylistId, navigate, toast]);

  const handleBooking = (preselectedService?: string) => {
    if (stylist?.id) {
      navigate(`/reservation/${stylist.id}`, {
        state: { 
          hairdresser: stylist,
          preselectedService 
        }
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center py-24">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
            <h3 className="text-lg font-semibold mb-2">Chargement...</h3>
            <p className="text-muted-foreground">Chargement du profil du styliste</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!stylist) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center py-24">
          <Card className="w-full max-w-md">
            <CardContent className="py-12 text-center">
              <h2 className="text-2xl font-bold mb-4">Styliste non trouvé</h2>
              <p className="text-muted-foreground mb-4">
                Le styliste que vous recherchez n'existe pas ou n'est plus disponible.
              </p>
              <Button onClick={() => navigate('/stylists')}>
                Voir tous les stylistes
              </Button>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="py-8">
        <div className="container mx-auto px-4">
          <Button 
            variant="outline" 
            onClick={() => window.history.back()}
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
          
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Profil principal */}
            <Card>
              <CardHeader>
                <div className="flex items-start space-x-6">
                  <EnhancedAvatar 
                    src={stylist.image_url}
                    name={stylist.name}
                    size="xl"
                    className="ring-2 ring-border"
                  />
                  
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-2xl mb-2">{stylist.name}</CardTitle>
                        
                        {stylist.experience && (
                          <p className="text-muted-foreground mb-3">
                            {stylist.experience}
                          </p>
                        )}
                        
                        {/* Rating */}
                        <div className="flex items-center gap-2 mb-4">
                          <div className="flex items-center gap-1">
                            <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                            <span className="font-medium">{stylist.rating.toFixed(1)}</span>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            ({stylist.rating >= 4.5 ? 'Excellent' : stylist.rating >= 4 ? 'Très bon' : stylist.rating >= 3 ? 'Bon' : 'Correct'})
                          </span>
                        </div>
                      </div>
                      
                      <Button 
                        onClick={() => handleBooking()}
                        size="lg"
                        className="animate-fade-in"
                      >
                        Réserver maintenant
                      </Button>
                    </div>
                    
                    {/* Contact Info */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
                      {stylist.location && (
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span>{stylist.location}</span>
                        </div>
                      )}
                      {stylist.email && (
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span>{stylist.email}</span>
                        </div>
                      )}
                      {stylist.phone && (
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span>{stylist.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Spécialités */}
            {stylist.specialties && stylist.specialties.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Spécialités</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {stylist.specialties.map((specialty, index) => (
                      <Badge 
                        key={index} 
                        variant="secondary"
                        className="animate-fade-in"
                        style={{ animationDelay: `${index * 0.1}s` }}
                      >
                        {specialty}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Services */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Services proposés</CardTitle>
              </CardHeader>
              <CardContent>
                {services.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {services.map((service, index) => (
                      <div 
                        key={service.id}
                        className="p-4 border rounded-lg hover:border-primary/50 transition-colors animate-fade-in"
                        style={{ animationDelay: `${index * 0.1}s` }}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium">{service.name}</h4>
                          <div className="flex items-center gap-1 text-primary font-semibold">
                            <Euro className="h-4 w-4" />
                            <span>{service.price}€</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                          <Clock className="h-3 w-3" />
                          <span>{service.duration} minutes</span>
                        </div>
                        
                        {service.description && (
                          <p className="text-sm text-muted-foreground mb-3">
                            {service.description}
                          </p>
                        )}
                        
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleBooking(service.name)}
                          className="w-full"
                        >
                          Réserver ce service
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4">
                      ℹ️ Les services pour ce styliste ne sont pas encore renseignés.
                    </p>
                    <p className="text-sm text-muted-foreground mb-4">
                      Vous pouvez tout de même faire une demande de réservation en décrivant le service souhaité dans les notes.
                    </p>
                    <Button 
                      onClick={() => handleBooking()}
                      variant="outline"
                    >
                      Faire une demande de réservation
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Portfolio */}
            {portfolio.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <Camera className="h-5 w-5 mr-2" />
                    Portfolio ({portfolio.length} réalisations)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {portfolio.map((item, index) => (
                      <div 
                        key={item.id}
                        className="relative group rounded-lg overflow-hidden border animate-fade-in hover:shadow-lg transition-all duration-300"
                        style={{ animationDelay: `${index * 0.1}s` }}
                      >
                        <img
                          src={item.image_url}
                          alt={item.hairstyle_name || 'Réalisation'}
                          className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = '/placeholder.svg';
                          }}
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300"></div>
                        {item.hairstyle_name && (
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                            <p className="text-white text-xs font-medium truncate">
                              {item.hairstyle_name}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Avis clients */}
            {!reviewsLoading && stats.totalReviews > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <MessageCircle className="h-5 w-5 mr-2" />
                    Avis clients ({stats.totalReviews})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Statistiques des avis */}
                  <div className="bg-muted/50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                          <span className="text-2xl font-bold">{stats.averageRating}</span>
                        </div>
                        <span className="text-muted-foreground">sur 5</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <BarChart3 className="h-4 w-4" />
                        <span>{stats.totalReviews} avis</span>
                      </div>
                    </div>
                    
                    {/* Distribution des notes */}
                    <div className="space-y-2">
                      {[5, 4, 3, 2, 1].map(rating => {
                        const count = stats.ratingDistribution[rating as keyof typeof stats.ratingDistribution];
                        const percentage = stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0;
                        
                        return (
                          <div key={rating} className="flex items-center gap-2 text-sm">
                            <span className="w-3">{rating}</span>
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            <div className="flex-1 bg-border rounded-full h-2">
                              <div 
                                className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                            <span className="w-8 text-right text-muted-foreground">{count}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Derniers avis */}
                  <div className="space-y-4">
                    <h4 className="font-medium">Derniers avis</h4>
                    {reviews.slice(0, 3).map((review, index) => (
                      <div 
                        key={review.id}
                        className="border rounded-lg p-4 animate-fade-in"
                        style={{ animationDelay: `${index * 0.1}s` }}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <Star 
                                  key={i}
                                  className={`h-4 w-4 ${
                                    i < review.rating 
                                      ? 'fill-yellow-400 text-yellow-400' 
                                      : 'text-muted-foreground'
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-sm font-medium">
                              {review.booking?.client_name?.split(' ')[0] || 'Client'}
                            </span>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {new Date(review.created_at).toLocaleDateString('fr-FR')}
                          </span>
                        </div>
                        
                        {review.comment && (
                          <p className="text-sm text-muted-foreground mb-2">
                            "{review.comment}"
                          </p>
                        )}
                        
                        {review.booking?.service && (
                          <div className="text-xs text-muted-foreground">
                            Service: {review.booking.service}
                          </div>
                        )}
                      </div>
                    ))}
                    
                    {reviews.length > 3 && (
                      <p className="text-center text-sm text-muted-foreground">
                        Et {reviews.length - 3} autres avis...
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Call to action final */}
            <Card className="text-center">
              <CardContent className="py-8">
                <h3 className="text-xl font-semibold mb-2">
                  Prêt à prendre rendez-vous ?
                </h3>
                <p className="text-muted-foreground mb-4">
                  Réservez votre créneau avec {stylist.name} en quelques clics
                </p>
                <Button 
                  onClick={() => handleBooking()}
                  size="lg"
                  className="hover-scale"
                >
                  Réserver maintenant
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default StylistProfilePage;