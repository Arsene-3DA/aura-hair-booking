import { useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useRoleAuth } from '@/hooks/useRoleAuth';
import { useAvailability } from '@/hooks/useAvailability';
import { CalendarIcon, Clock, Euro, User, ArrowLeft } from 'lucide-react';
import { format, addDays, setHours, setMinutes } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import PageHeader from '@/components/PageHeader';

interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number;
}

interface Stylist {
  id: string;
  name: string;
  email: string;
}

const ReservePage = () => {
  const { serviceId } = useParams<{ serviceId: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const stylistId = searchParams.get('stylist');
  const { user, isAuthenticated } = useRoleAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [notes, setNotes] = useState('');

  // Utiliser le même hook que le calendrier professionnel
  const { availabilities, loading: availabilitiesLoading } = useAvailability(stylistId || '');

  // Récupérer les réservations existantes pour ce styliste
  const { data: existingReservations = [], isLoading: reservationsLoading } = useQuery({
    queryKey: ['stylist-reservations', stylistId, selectedDate?.toDateString()],
    queryFn: async () => {
      if (!stylistId || !selectedDate) return [];
      
      const startOfDay = new Date(selectedDate);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(selectedDate);
      endOfDay.setHours(23, 59, 59, 999);
      
      const { data, error } = await supabase
        .from('new_reservations')
        .select('scheduled_at, status')
        .eq('stylist_user_id', stylistId)
        .gte('scheduled_at', startOfDay.toISOString())
        .lte('scheduled_at', endOfDay.toISOString())
        .in('status', ['pending', 'confirmed']);
        
      if (error) throw error;
      return data || [];
    },
    enabled: !!stylistId && !!selectedDate,
  });

  // Récupérer le service (TOUS LES HOOKS DOIVENT ÊTRE APPELÉS AVANT TOUT RETURN)
  const { data: service, isLoading: serviceLoading } = useQuery({
    queryKey: ['service', serviceId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('id', serviceId)
        .single();
      if (error) throw error;
      return data as Service;
    },
    enabled: !!serviceId,
  });

  // Récupérer la liste des stylistes
  const { data: stylists = [], isLoading: stylistsLoading } = useQuery({
    queryKey: ['stylists'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, full_name')
        .eq('role', 'coiffeur');
      if (error) throw error;
      return data.map(p => ({ id: p.user_id, name: p.full_name || 'Styliste' })) as Stylist[];
    },
  });

  // Mutation pour créer la réservation
  const createReservation = useMutation({
    mutationFn: async (data: {
      stylist_user_id: string;
      service_id: string;
      scheduled_at: string;
      notes?: string;
    }) => {
      // Vérifier la session au moment de l'appel
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Vous devez être connecté pour faire une réservation');
      }

      // Vérifier que le styliste existe dans profiles
      const { data: stylistProfile } = await supabase
        .from('profiles')
        .select('user_id, role')
        .eq('user_id', data.stylist_user_id)
        .eq('role', 'coiffeur')
        .single();

      if (!stylistProfile) {
        throw new Error('Styliste non trouvé ou inactif');
      }

      const { error } = await supabase
        .from('new_reservations')
        .insert({
          client_user_id: session.user.id,
          stylist_user_id: data.stylist_user_id,
          service_id: data.service_id,
          scheduled_at: data.scheduled_at,
          notes: data.notes,
        });
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: '✅ Réservation créée',
        description: 'Votre réservation a été créée avec succès',
      });
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
      navigate('/app/bookings');
    },
    onError: (error) => {
      toast({
        title: '❌ Erreur',
        description: 'Impossible de créer la réservation',
        variant: 'destructive',
      });
      console.error('Erreur réservation:', error);
    },
  });

  // Rediriger vers login si non authentifié (APRÈS tous les hooks)
  if (!isAuthenticated) {
    const nextUrl = `/reserve/${serviceId}${stylistId ? `?stylist=${stylistId}` : ''}`;
    navigate(`/auth?next=${encodeURIComponent(nextUrl)}`);
    return null;
  }


  const handleSubmit = () => {
    if (!selectedDate || !selectedTime || !stylistId || !serviceId) {
      toast({
        title: '⚠️ Informations manquantes',
        description: 'Veuillez sélectionner une date, une heure et un styliste',
        variant: 'destructive',
      });
      return;
    }

    const [hours, minutes] = selectedTime.split(':').map(Number);
    const scheduledAt = setMinutes(setHours(selectedDate, hours), minutes);

    createReservation.mutate({
      stylist_user_id: stylistId,
      service_id: serviceId,
      scheduled_at: scheduledAt.toISOString(),
      notes,
    });
  };

  // Générer les créneaux disponibles en temps réel basés sur les disponibilités du professionnel
  const generateAvailableTimeSlots = () => {
    if (!selectedDate) return [];
    
    const slots = [];
    const startHour = 9;
    const endHour = 21;
    const intervalMinutes = 30;

    for (let hour = startHour; hour <= endHour; hour++) {
      for (let minute = 0; minute < 60; minute += intervalMinutes) {
        if (hour === endHour && minute > 30) break;
        
        const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const slotDateTime = new Date(selectedDate);
        slotDateTime.setHours(hour, minute, 0, 0);
        
        // Vérifier si ce créneau est dans le passé
        if (slotDateTime <= new Date()) {
          continue; // Ignorer les créneaux passés
        }
        
        // Trouver la disponibilité correspondante
        const availability = availabilities.find(avail => {
          const availStart = new Date(avail.start_at);
          return Math.abs(availStart.getTime() - slotDateTime.getTime()) < 30 * 60 * 1000;
        });

        // Vérifier les réservations existantes
        const isBooked = existingReservations.some(reservation => {
          const reservationTime = new Date(reservation.scheduled_at);
          return Math.abs(reservationTime.getTime() - slotDateTime.getTime()) < 30 * 60 * 1000;
        });
        
        if (isBooked) {
          continue; // Ignorer les créneaux déjà réservés
        }
        
        // Déterminer si le créneau est disponible
        let isAvailable = true;
        
        if (availability) {
          // Si le professionnel a défini ce créneau comme indisponible ou occupé
          isAvailable = availability.status === 'available';
        }
        // Sinon, par défaut, le créneau est disponible

        if (isAvailable) {
          slots.push({
            time: timeStr,
            datetime: slotDateTime,
            availabilityId: availability?.id
          });
        }
      }
    }
    return slots;
  };

  const availableTimeSlots = generateAvailableTimeSlots();

  if (serviceLoading || stylistsLoading || availabilitiesLoading || reservationsLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="text-center p-6">
            <p className="text-muted-foreground">Service non trouvé</p>
            <Button onClick={() => navigate('/')} className="mt-4">
              Retour à l'accueil
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const selectedStylist = stylists.find(s => s.id === stylistId);

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <PageHeader
          title="Réserver un rendez-vous"
          description={selectedStylist ? `Prenez rendez-vous avec ${selectedStylist.name}` : "Sélectionnez votre créneau préféré"}
          icon={<CalendarIcon className="h-8 w-8" />}
          showBackButton={true}
        />

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Réserver un rendez-vous</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Informations du service */}
            <div className="p-4 bg-muted rounded-lg">
              <h3 className="font-semibold text-lg mb-2">{service.name}</h3>
              {service.description && (
                <p className="text-muted-foreground mb-3">{service.description}</p>
              )}
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <Euro className="h-4 w-4" />
                  <span>{service.price}€</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{service.duration} min</span>
                </div>
              </div>
            </div>

            {/* Styliste sélectionné */}
            {selectedStylist && (
              <div className="p-4 bg-muted rounded-lg">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span className="font-medium">Styliste: {selectedStylist.name}</span>
                </div>
              </div>
            )}

            {/* Sélection de la date */}
            <div className="space-y-2">
              <Label>Date de rendez-vous</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !selectedDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, "PPP", { locale: fr }) : "Choisir une date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    disabled={(date) => date < addDays(new Date(), 0)}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Sélection de l'heure - Créneaux en temps réel */}
            <div className="space-y-2">
              <Label>Heure de rendez-vous</Label>
              {selectedDate ? (
                <div className="space-y-4">
                  {availableTimeSlots.length > 0 ? (
                    <>
                      <p className="text-sm text-muted-foreground">
                        {availableTimeSlots.length} créneaux disponibles pour le {format(selectedDate, 'EEEE d MMMM', { locale: fr })}
                      </p>
                      <div className="grid grid-cols-4 gap-2">
                        {availableTimeSlots.map((slot) => (
                          <Button
                            key={slot.time}
                            variant={selectedTime === slot.time ? "default" : "outline"}
                            size="sm"
                            onClick={() => setSelectedTime(slot.time)}
                            className={cn(
                              "transition-all",
                              selectedTime === slot.time && "ring-2 ring-primary"
                            )}
                          >
                            <Clock className="h-3 w-3 mr-1" />
                            {slot.time}
                          </Button>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>Aucun créneau disponible pour cette date</p>
                      <p className="text-sm">Le professionnel n'a pas défini de créneaux disponibles ou ils sont tous réservés</p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground py-4">
                  Veuillez d'abord sélectionner une date
                </p>
              )}
            </div>

            {/* Notes optionnelles */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (optionnel)</Label>
              <Textarea
                id="notes"
                placeholder="Précisions sur votre demande..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>

            {/* Bouton de confirmation */}
            <Button
              onClick={handleSubmit}
              disabled={!selectedDate || !selectedTime || !stylistId || createReservation.isPending}
              className="w-full"
              size="lg"
            >
              {createReservation.isPending ? "Création..." : "Confirmer la réservation"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ReservePage;