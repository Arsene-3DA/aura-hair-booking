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
import { CalendarIcon, Clock, Euro, User, ArrowLeft } from 'lucide-react';
import { format, addDays, setHours, setMinutes } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';

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
      const { error } = await supabase
        .from('new_reservations')
        .insert({
          client_user_id: user!.id,
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

  const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'
  ];

  if (serviceLoading || stylistsLoading) {
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
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour
        </Button>

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

            {/* Sélection de l'heure */}
            <div className="space-y-2">
              <Label>Heure de rendez-vous</Label>
              <div className="grid grid-cols-4 gap-2">
                {timeSlots.map((time) => (
                  <Button
                    key={time}
                    variant={selectedTime === time ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedTime(time)}
                  >
                    {time}
                  </Button>
                ))}
              </div>
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