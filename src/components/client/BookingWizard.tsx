import { useState } from 'react';
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
import { 
  ArrowLeft, 
  ArrowRight, 
  User, 
  Search, 
  Euro, 
  Clock,
  Calendar as CalendarIcon,
  Check
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface Stylist {
  id: string;
  full_name: string;
  avatar_url?: string;
  specialties?: string[];
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

  // Load stylists
  const loadStylists = async () => {
    setLoadingData(true);
    try {
      const { data } = await supabase
        .from('profiles')
        .select('user_id, full_name, avatar_url')
        .eq('role', 'coiffeur')
        .limit(20);
      
      setStylists(data?.map(p => ({ id: p.user_id, full_name: p.full_name, avatar_url: p.avatar_url })) || []);
    } catch (error) {
      console.error('Error loading stylists:', error);
    } finally {
      setLoadingData(false);
    }
  };

  // Load services
  const loadServices = async () => {
    setLoadingData(true);
    try {
      const { data } = await supabase
        .from('services')
        .select('*')
        .order('price', { ascending: true });
      
      setServices(data || []);
    } catch (error) {
      console.error('Error loading services:', error);
    } finally {
      setLoadingData(false);
    }
  };

  // Initialize data on mount
  useState(() => {
    loadStylists();
    loadServices();
  });

  const filteredStylists = stylists.filter(stylist =>
    stylist.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const nextStep = () => setCurrentStep(prev => Math.min(4, prev + 1));
  const prevStep = () => setCurrentStep(prev => Math.max(1, prev - 1));

  const canProceed = () => {
    switch (currentStep) {
      case 1: return selectedStylist !== null;
      case 2: return selectedService !== null;
      case 3: return selectedDate && selectedTime;
      case 4: return true;
      default: return false;
    }
  };

  const handleConfirm = async () => {
    if (!selectedStylist || !selectedService || !selectedDate || !selectedTime) return;

    const scheduledAt = new Date(selectedDate);
    const [hours, minutes] = selectedTime.split(':');
    scheduledAt.setHours(parseInt(hours), parseInt(minutes));

    const result = await createBooking({
      stylist_id: selectedStylist.id,
      service_id: selectedService.id,
      scheduled_at: scheduledAt.toISOString()
    });

    if (result.success) {
      navigate('/app/bookings');
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

            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un coiffeur..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
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
                    onClick={() => setSelectedStylist(stylist)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                          {stylist.full_name?.charAt(0) || 'S'}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium">{stylist.full_name}</h3>
                          <p className="text-sm text-muted-foreground">Coiffeur professionnel</p>
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
            <div>
              <h2 className="text-xl font-semibold mb-2">Choisir un service</h2>
              <p className="text-muted-foreground">Sélectionnez le service souhaité</p>
            </div>

            <div className="grid grid-cols-1 gap-4 max-h-96 overflow-y-auto">
              {loadingData ? (
                [...Array(3)].map((_, i) => <Skeleton key={i} className="h-20" />)
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
                              <Euro className="w-3 h-3" />
                              {service.price}€
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
                  disabled={(date) => date < new Date() || date.getDay() === 0}
                  locale={fr}
                  className="rounded-md border"
                />
              </div>

              {selectedDate && (
                <div>
                  <h3 className="font-medium mb-3">
                    Créneaux pour le {format(selectedDate, 'dd MMMM', { locale: fr })}
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {timeSlots.map((time) => (
                      <Button
                        key={time}
                        variant={selectedTime === time ? "default" : "outline"}
                        onClick={() => setSelectedTime(time)}
                        className="w-full"
                        size="sm"
                      >
                        {time}
                      </Button>
                    ))}
                  </div>
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
                      {selectedService?.name} - {selectedService?.price}€ ({selectedService?.duration} min)
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