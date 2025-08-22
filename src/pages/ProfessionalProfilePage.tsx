import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, Star, MapPin, Calendar, Clock, Phone, Mail, Globe, Instagram, Camera, ExternalLink } from 'lucide-react';
import { useProfessionalServices } from '@/hooks/useProfessionalServices';
import { usePortfolioManagement } from '@/hooks/usePortfolioManagement';
import { usePublicProfessionalData } from '@/hooks/usePublicProfessionalData';
import PriceDisplay from '@/components/ui/price-display';
import { RealTimeAvailability } from '@/components/RealTimeAvailability';
interface WorkingDay {
  open: string;
  close: string;
  isOpen: boolean;
}

const ProfessionalProfilePage = () => {
  const {
    professionalId
  } = useParams<{
    professionalId: string;
  }>();
  const navigate = useNavigate();
  const [selectedService, setSelectedService] = useState<any>(null);

  // Use existing hooks for data
  const {
    professional,
    loading: isLoading,
    error
  } = usePublicProfessionalData(professionalId);
  const {
    services,
    loading: servicesLoading
  } = useProfessionalServices(professionalId, true);
  const {
    portfolio
  } = usePortfolioManagement(professionalId);
  
  const handleReserve = () => {
    // Rediriger vers la page de réservation
    navigate(`/reservation/${professionalId}`, {
      state: {
        professional: professional
      }
    });
  };
  if (isLoading || servicesLoading) {
    return <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement du profil...</p>
        </div>
      </div>;
  }
  if (error || !professional) {
    return <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Professionnel non trouvé</h2>
          <p className="text-muted-foreground mb-6">
            Le professionnel que vous recherchez n'existe pas ou n'est plus disponible.
          </p>
          <Button onClick={() => navigate('/experts')}>
            Retour aux experts
          </Button>
        </div>
      </div>;
  }
  return <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        
        {/* Bouton Retour */}
        <div className="mb-6">
          <Button variant="outline" onClick={() => navigate(-1)} className="flex items-center gap-2 hover:bg-muted text-slate-400">
            <ArrowLeft className="h-4 w-4" />
            Retour
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[360px,1fr] gap-6">
          
          {/* Sidebar gauche - Profil */}
          <div className="md:sticky md:top-8 md:h-fit">
            <Card className="rounded-2xl shadow-lg">
              <CardContent className="p-8">
                {/* Avatar et infos principales */}
                <div className="text-center mb-6">
                  <Avatar className="h-32 w-32 mx-auto mb-4 ring-4 ring-border">
                    <AvatarImage src={professional.image_url} alt={professional.name} className="object-cover" />
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
                {professional.bio && <div className="mb-6">
                    <h3 className="font-semibold mb-3 text-lg">À propos</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {professional.bio}
                    </p>
                  </div>}

                {/* Informations de contact */}
                <div className="space-y-4 mb-6">
                  <h3 className="font-semibold text-lg">Contact</h3>
                  
                  {(professional.salon_address || professional.location) && <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-muted-foreground">
                        {professional.salon_address || professional.location}
                      </span>
                    </div>}


                  {professional.website && <div className="flex items-center gap-3">
                      <Globe className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                      <a href={professional.website} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline flex items-center gap-1">
                        Site web
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>}

                  {professional.instagram && <div className="flex items-center gap-3">
                      <Instagram className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                      <a href={`https://instagram.com/${professional.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">
                        {professional.instagram}
                      </a>
                    </div>}
                </div>

                {/* Horaires d'ouverture */}
                {professional.working_hours && <div>
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
                    return <div key={day} className="flex justify-between items-center">
                            <span className="text-sm font-medium">{dayNames[day]}</span>
                            <span className="text-sm text-muted-foreground">
                              {hours.isOpen ? `${hours.open} – ${hours.close}` : 'Fermé'}
                            </span>
                          </div>;
                  })}
                    </div>
                  </div>}
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
                {portfolio && portfolio.length > 0 ? <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {portfolio.map(item => <div key={item.id} className="relative group overflow-hidden rounded-xl aspect-square bg-muted">
                        <img src={item.image_url} alt={item.hairstyle_name || 'Portfolio'} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" onError={e => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/placeholder.svg';
                  }} />
                        {item.hairstyle_name && <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                            <p className="text-white text-xs font-medium truncate">
                              {item.hairstyle_name}
                            </p>
                          </div>}
                      </div>)}
                  </div> : <div className="border-2 border-dashed border-muted-foreground/20 rounded-xl p-12 text-center">
                    <Camera className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-2">Portfolio en construction</p>
                    <p className="text-sm text-muted-foreground/70">
                      Les réalisations seront bientôt disponibles
                    </p>
                  </div>}
              </CardContent>
            </Card>

            {/* Section de réservation intégrée */}
            <Card className="rounded-2xl border-2 border-primary/20 bg-primary/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Calendar className="h-6 w-6" />
                  Réserver un rendez-vous
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-muted-foreground leading-relaxed">
                  Prêt à transformer votre style ? Sélectionnez un service et un créneau pour réserver
                  avec <span className="font-medium">{professional.name}</span>.
                </p>

                {/* Sélection de service */}
                {services && services.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      Choisissez votre service
                    </h3>
                    <div className="grid gap-3">
                      {services.map(service => (
                        <div 
                          key={service.id}
                          onClick={() => setSelectedService(service)}
                          className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                            selectedService?.id === service.id 
                              ? 'border-primary bg-primary/10 shadow-lg' 
                              : 'border-gray-200 hover:border-primary/50 hover:bg-background'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <h4 className="font-semibold text-base mb-1">
                                {service.name}
                              </h4>
                              {service.description && (
                                <p className="text-sm text-muted-foreground mb-2">
                                  {service.description}
                                </p>
                              )}
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Clock className="h-4 w-4" />
                                  {service.duration} min
                                </span>
                                {service.category && (
                                  <Badge variant="secondary" className="text-xs">
                                    {service.category}
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <div className="text-right ml-4">
                              <PriceDisplay 
                                amount={service.price} 
                                size="lg" 
                                className="font-bold text-primary" 
                                showCAD={true} 
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {selectedService && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <p className="text-green-800 text-sm">
                          ✅ Service sélectionné : <span className="font-medium">{selectedService.name}</span>
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Message si aucun service */}
                {(!services || services.length === 0) && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-blue-800 text-sm">
                      ℹ️ Ce professionnel n'a pas encore défini de services spécifiques. 
                      Vous pourrez discuter de vos besoins lors de la réservation.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Disponibilités en temps réel avec service sélectionné */}
            <RealTimeAvailability 
              stylistId={professionalId || ''} 
              showControls={false}
              selectedService={selectedService}
              onTimeSelection={(date, time) => {
                console.log('Créneau sélectionné:', { date, time, service: selectedService });
              }}
            />

          </div>
        </div>
      </div>
    </div>;
};
export default ProfessionalProfilePage;