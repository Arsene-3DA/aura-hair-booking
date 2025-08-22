import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBookings } from '@/hooks/useBookings';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { TimeSlotSelector } from './TimeSlotSelector';
import { 
  ArrowLeft, 
  ArrowRight, 
  User, 
  Search, 
  DollarSign, 
  Clock,
  Calendar as CalendarIcon,
  Check,
  Star,
  MapPin
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import PriceDisplay from '@/components/ui/price-display';

interface Stylist {
  id: string;
  full_name: string;
  avatar_url?: string;
  specialties?: string[];
  role?: 'coiffeur' | 'coiffeuse' | 'cosmetique';
}

interface Service {
  id: string;
  name: string;
  description?: string;
  price: number;
  duration: number;
}

const timeSlots = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00'
];

export const BookingWizard = () => {
  const navigate = useNavigate();
  const { createBooking, loading } = useBookings();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedStylist, setSelectedStylist] = useState<Stylist | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState<string>('');
  
  const [stylists, setStylists] = useState<Stylist[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingData, setLoadingData] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<'coiffeur' | 'coiffeuse' | 'cosmetique' | 'all'>('all');

  // Load stylists with proper categorization
  const loadStylists = async () => {
    setLoadingData(true);
    try {
      const { data } = await supabase
        .from('profiles')
        .select('user_id, full_name, avatar_url, role')
        .in('role', ['coiffeur', 'coiffeuse', 'cosmetique'])
        .limit(50);
      
      if (data) {
        setStylists(data.map(p => ({ 
          id: p.user_id, 
          full_name: p.full_name, 
          avatar_url: p.avatar_url,
          specialties: [],
          role: p.role as 'coiffeur' | 'coiffeuse' | 'cosmetique'
        })));
      }
    } catch (error) {
      console.error('Error loading stylists:', error);
    } finally {
      setLoadingData(false);
    }
  };

  // Load services for the selected stylist
  const loadServices = async (stylistId?: string) => {
    if (!stylistId) {
      setServices([]);
      return;
    }

    setLoadingData(true);
    try {
      // D'abord récupérer l'ID du hairdresser basé sur auth_id
      const { data: hairdresserData, error: hairdresserError } = await supabase
        .from('hairdressers')
        .select('id')
        .eq('auth_id', stylistId)
        .eq('is_active', true)
        .single();

      if (hairdresserError || !hairdresserData) {
        console.error('Styliste non trouvé:', hairdresserError);
        setServices([]);
        return;
      }
      
      // Ensuite récupérer les services pour ce styliste
      const { data, error } = await supabase
        .from('hairdresser_services')
        .select(`
          services (
            id,
            name,
            description,
            price,
            duration,
            category
          )
        `)
        .eq('hairdresser_id', hairdresserData.id);

      if (error) {
        console.error('Error loading services:', error);
        setServices([]);
      } else {
        // Extraire les services de la réponse
        const servicesList = data?.map((item: any) => item.services).filter(Boolean) || [];
        setServices(servicesList);
      }
    } catch (error) {
      console.error('Error loading services:', error);
      setServices([]);
    } finally {
      setLoadingData(false);
    }
  };

  // Initialize data on mount
  useEffect(() => {
    loadStylists();
  }, []);

  // Load services when stylist is selected
  const handleStylistSelection = async (stylist: Stylist) => {
    setSelectedStylist(stylist);
    setSelectedService(null); // Reset service selection
    setSelectedDate(undefined); // Reset date selection
    setSelectedTime(''); // Reset time selection
    
    await loadServices(stylist.id);

    // Écouter les changements en temps réel pour les services du styliste sélectionné
    const channel = supabase
      .channel('stylist-services-changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Écouter tous les changements (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'hairdresser_services'
        },
        () => {
          // Recharger les services quand il y a un changement
          loadServices(stylist.id);
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'services'
        },
        () => {
          // Recharger aussi si les services sont modifiés
          loadServices(stylist.id);
        }
      )
      .subscribe();

    // Nettoyer la subscription précédente s'il y en a une
    return () => {
      supabase.removeChannel(channel);
    };
  };

  const filteredStylists = stylists.filter(stylist => {
    const matchesSearch = stylist.full_name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || stylist.role === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const nextStep = () => setCurrentStep(prev => Math.min(4, prev + 1));
  const prevStep = () => setCurrentStep(prev => Math.max(1, prev - 1));

  const canProceed = () => {
    switch (currentStep) {
      case 1: return selectedStylist !== null;
      case 2: 
        // Permettre de continuer même sans service sélectionné si le professionnel n'en a pas
        return services.length === 0 || selectedService !== null;
      case 3: return selectedDate && selectedTime;
      case 4: return true;
      default: return false;
    }
  };

  const handleConfirm = async () => {
    if (!selectedStylist || !selectedDate || !selectedTime) return;
    
    // Permettre la réservation même sans service si le professionnel n'en a pas configuré

    const scheduledAt = new Date(selectedDate);
    // Parser le format "14h30" pour extraire les heures et minutes
    const timeMatch = selectedTime.match(/(\d+)h(\d+)/);
    if (timeMatch) {
      const [, hours, minutes] = timeMatch;
      scheduledAt.setHours(parseInt(hours), parseInt(minutes));
    } else {
      // Fallback pour le format "14:30"
      const [hours, minutes] = selectedTime.split(':');
      scheduledAt.setHours(parseInt(hours), parseInt(minutes));
    }

    const result = await createBooking({
      stylist_id: selectedStylist.id,
      service_id: selectedService?.id || null, // Null si aucun service sélectionné
      scheduled_at: scheduledAt.toISOString()
    });

    if (result.success) {
      navigate('/app');
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-2">Choisir un coiffeur</h2>
              <p className="text-muted-foreground">Sélectionnez le professionnel de votre choix</p>
            </div>

            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher un professionnel..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Category filters */}
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant={selectedCategory === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory('all')}
                >
                  Tous
                </Button>
                <Button
                  variant={selectedCategory === 'coiffeur' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory('coiffeur')}
                  className="bg-blue-500 hover:bg-blue-600 text-white"
                >
                  Coiffeurs
                </Button>
                <Button
                  variant={selectedCategory === 'coiffeuse' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory('coiffeuse')}
                  className="bg-yellow-500 hover:bg-yellow-600 text-black"
                >
                  Coiffeuses
                </Button>
                <Button
                  variant={selectedCategory === 'cosmetique' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory('cosmetique')}
                  className="bg-purple-500 hover:bg-purple-600 text-white"
                >
                  Cosmétique
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
              {loadingData ? (
                [...Array(4)].map((_, i) => <Skeleton key={i} className="h-24" />)
              ) : (
                filteredStylists.map((stylist) => (
                  <Card 
                    key={stylist.id}
                    className={cn(
                      "cursor-pointer transition-all hover:shadow-md",
                      selectedStylist?.id === stylist.id && "ring-2 ring-primary"
                    )}
                    onClick={() => handleStylistSelection(stylist)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                          {stylist.avatar_url ? (
                            <img 
                              src={stylist.avatar_url} 
                              alt={stylist.full_name} 
                              className="w-12 h-12 rounded-full object-cover"
                            />
                          ) : (
                            stylist.full_name?.charAt(0) || 'S'
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium">{stylist.full_name}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge 
                              variant="secondary" 
                              className={cn(
                                "text-xs",
                                stylist.role === 'coiffeur' && "bg-blue-100 text-blue-800",
                                stylist.role === 'coiffeuse' && "bg-yellow-100 text-yellow-800",
                                stylist.role === 'cosmetique' && "bg-purple-100 text-purple-800"
                              )}
                            >
                              {stylist.role === 'coiffeur' ? 'Coiffeur' : 
                               stylist.role === 'coiffeuse' ? 'Coiffeuse' : 
                               'Cosmétique'}
                            </Badge>
                            <div className="flex items-center gap-1">
                              <Star className="h-3 w-3 text-yellow-400 fill-current" />
                              <span className="text-xs text-muted-foreground">4.8</span>
                            </div>
                          </div>
                        </div>
                        {selectedStylist?.id === stylist.id && (
                          <Check className="h-5 w-5 text-primary" />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            {/* Informations du professionnel sélectionné */}
            {selectedStylist && (
              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                      {selectedStylist.avatar_url ? (
                        <img 
                          src={selectedStylist.avatar_url} 
                          alt={selectedStylist.full_name} 
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        selectedStylist.full_name?.charAt(0) || 'S'
                      )}
                    </div>
                    <div>
                      <h3 className="font-medium">{selectedStylist.full_name}</h3>
                      <Badge variant="outline" className="text-xs">
                        {selectedStylist.role === 'coiffeur' ? 'Coiffeur' : 
                         selectedStylist.role === 'coiffeuse' ? 'Coiffeuse' : 
                         'Cosmétique'}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <div>
              <h2 className="text-xl font-semibold mb-2">Choisir un service</h2>
              <p className="text-muted-foreground">Sélectionnez le service souhaité</p>
            </div>

            <div className="grid grid-cols-1 gap-4 max-h-96 overflow-y-auto">
              {loadingData ? (
                [...Array(3)].map((_, i) => <Skeleton key={i} className="h-20" />)
              ) : services.length === 0 ? (
                <Card className="border-dashed">
                  <CardContent className="p-6 text-center">
                    <p className="text-muted-foreground mb-2">
                      Ce professionnel n'a pas encore configuré de services spécifiques.
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Vous pouvez continuer la réservation pour un service général.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                services.map((service) => (
                  <Card 
                    key={service.id}
                    className={cn(
                      "cursor-pointer transition-all hover:shadow-md",
                      selectedService?.id === service.id && "ring-2 ring-primary"
                    )}
                    onClick={() => setSelectedService(service)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium">{service.name}</h3>
                          {service.description && (
                            <p className="text-sm text-muted-foreground">{service.description}</p>
                          )}
                          <div className="flex gap-2 mt-2">
                            <Badge variant="secondary" className="flex items-center gap-1">
                              <DollarSign className="w-3 h-3" />
                              <PriceDisplay amount={service.price} size="sm" />
                            </Badge>
                            <Badge variant="outline" className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {service.duration} min
                            </Badge>
                          </div>
                        </div>
                        {selectedService?.id === service.id && (
                          <Check className="h-5 w-5 text-primary" />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            {/* Récapitulatif professionnel et service */}
            {selectedStylist && (
              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                        {selectedStylist.avatar_url ? (
                          <img 
                            src={selectedStylist.avatar_url} 
                            alt={selectedStylist.full_name} 
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          selectedStylist.full_name?.charAt(0) || 'S'
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{selectedStylist.full_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {selectedStylist.role === 'coiffeur' ? 'Coiffeur' : 
                           selectedStylist.role === 'coiffeuse' ? 'Coiffeuse' : 
                           'Cosmétique'}
                        </p>
                      </div>
                    </div>
                    <div>
                      <p className="font-medium text-sm">
                        {selectedService ? selectedService.name : 'Service général'}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        {selectedService ? (
                          <>
                            <Badge variant="secondary" className="text-xs">
                              <PriceDisplay amount={selectedService.price} size="sm" />
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {selectedService.duration} min
                            </Badge>
                          </>
                        ) : (
                          <Badge variant="outline" className="text-xs">
                            Prix et durée à définir
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <div>
              <h2 className="text-xl font-semibold mb-2">Choisir date et heure</h2>
              <p className="text-muted-foreground">Sélectionnez votre créneau préféré</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium mb-3">Date</h3>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  disabled={(date) => {
                    // Empêcher la sélection des dates passées (mais autoriser aujourd'hui)
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    const checkDate = new Date(date);
                    checkDate.setHours(0, 0, 0, 0);
                    
                    // Désactiver les dimanches et les dates passées (mais pas aujourd'hui)
                    return checkDate < today || date.getDay() === 0;
                  }}
                  locale={fr}
                  className="rounded-md border"
                />
              </div>

              {selectedDate && selectedStylist && (
                <div>
                  <h3 className="font-medium mb-3">
                    Créneaux disponibles - {format(selectedDate, 'EEEE d MMMM', { locale: fr })}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Basé sur les horaires réels de {selectedStylist.full_name}
                  </p>
                  <TimeSlotSelector
                     stylistId={selectedStylist?.id || ''}
                     selectedDate={selectedDate}
                     selectedTime={selectedTime}
                     onTimeSelect={setSelectedTime}
                   />
                </div>
              )}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-2">Récapitulatif</h2>
              <p className="text-muted-foreground">Vérifiez les détails de votre réservation</p>
            </div>

            <Card>
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Coiffeur</p>
                    <p className="text-sm text-muted-foreground">{selectedStylist?.full_name}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="h-5 w-5 bg-primary rounded flex items-center justify-center">
                    <div className="h-2 w-2 bg-primary-foreground rounded" />
                  </div>
                  <div>
                    <p className="font-medium">Service</p>
                    <p className="text-sm text-muted-foreground">
                      {selectedService?.name} - <PriceDisplay amount={selectedService?.price} size="sm" /> ({selectedService?.duration} min)
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <CalendarIcon className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Date et heure</p>
                    <p className="text-sm text-muted-foreground">
                      {selectedDate && format(selectedDate, 'dd MMMM yyyy', { locale: fr })} à {selectedTime}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">Nouvelle réservation</h1>
          <p className="text-muted-foreground">Étape {currentStep} sur 4</p>
        </div>
      </div>

      {/* Progress */}
      <Progress value={(currentStep / 4) * 100} className="w-full" />

      {/* Content */}
      <Card>
        <CardContent className="p-6">
          {renderStepContent()}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={prevStep}
          disabled={currentStep === 1}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour
        </Button>

        {currentStep < 4 ? (
          <Button 
            onClick={nextStep}
            disabled={!canProceed()}
            className="flex items-center gap-2"
          >
            Suivant
            <ArrowRight className="w-4 h-4" />
          </Button>
        ) : (
          <Button 
            onClick={handleConfirm}
            disabled={!canProceed() || loading}
            className="flex items-center gap-2"
          >
            {loading ? 'Confirmation...' : 'Confirmer'}
            <Check className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
};