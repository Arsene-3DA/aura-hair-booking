import { useState, useEffect } from 'react';
import { Calendar, Clock, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useAvailability } from '@/hooks/useAvailability';
import { useRoleAuth } from '@/hooks/useRoleAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { format, addDays, startOfDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

interface RealTimeAvailabilityProps {
  stylistId: string;
  showControls?: boolean;
  onTimeSelection?: (date: Date, time: string) => void;
  selectedService?: {
    id: string;
    name: string;
    price: number;
    duration: number;
    description?: string;
    category?: string;
  } | null;
}

export const RealTimeAvailability = ({ 
  stylistId, 
  showControls = false,
  onTimeSelection,
  selectedService
}: RealTimeAvailabilityProps) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [reservations, setReservations] = useState<any[]>([]);
  const { availabilities, loading } = useAvailability(stylistId);
  const { isAuthenticated, userProfile } = useRoleAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Récupérer les réservations confirmées pour la date sélectionnée
  useEffect(() => {
    const fetchReservations = async () => {
      const { data, error } = await supabase
        .from('new_reservations')
        .select('*')
        .eq('stylist_user_id', stylistId)
        .eq('status', 'confirmed')
        .gte('scheduled_at', startOfDay(selectedDate).toISOString())
        .lt('scheduled_at', addDays(startOfDay(selectedDate), 1).toISOString());

      if (!error && data) {
        setReservations(data);
      }
    };

    fetchReservations();

    // Écouter les changements en temps réel pour les réservations
    const reservationsChannel = supabase
      .channel('reservations-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'new_reservations',
          filter: `stylist_user_id=eq.${stylistId}`
        },
        () => {
          fetchReservations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(reservationsChannel);
    };
  }, [stylistId, selectedDate]);

  // Générer les créneaux pour la date sélectionnée
  const generateTimeSlots = () => {
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
        
        // Vérifier si ce créneau est déjà réservé
        const isReserved = reservations.some(reservation => {
          const reservationTime = new Date(reservation.scheduled_at);
          return Math.abs(reservationTime.getTime() - slotDateTime.getTime()) < 30 * 60 * 1000;
        });
        
        // Trouver la disponibilité correspondante
        const availability = availabilities.find(avail => {
          const availStart = new Date(avail.start_at);
          return Math.abs(availStart.getTime() - slotDateTime.getTime()) < 30 * 60 * 1000;
        });

        // Déterminer le statut
        let status: 'available' | 'busy' | 'unavailable' | 'past' | 'booked' = 'available';
        
        if (slotDateTime <= new Date()) {
          status = 'past';
        } else if (isReserved) {
          status = 'booked';
        } else if (availability) {
          status = availability.status;
        }

        slots.push({
          time: timeStr,
          datetime: slotDateTime,
          status,
          availabilityId: availability?.id,
          isReserved
        });
      }
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  const getSlotColor = (status: string, isSelected: boolean = false) => {
    if (isSelected) {
      return 'bg-yellow-400 text-black border-yellow-500 hover:bg-yellow-500';
    }
    
    switch (status) {
      case 'available':
        return 'bg-green-500 text-white border-green-600 hover:bg-green-600 cursor-pointer';
      case 'busy':
        return 'bg-gray-500 text-white border-gray-600 cursor-not-allowed';
      case 'unavailable':
        return 'bg-red-500 text-white border-red-600 cursor-not-allowed';
      case 'booked':
        return 'bg-purple-500 text-white border-purple-600 cursor-not-allowed';
      case 'past':
        return 'bg-gray-400 text-gray-200 border-gray-500 cursor-not-allowed opacity-60';
      default:
        return 'bg-green-500 text-white border-green-600 hover:bg-green-600 cursor-pointer';
    }
  };

  const handleSlotClick = (slot: any) => {
    // Empêcher la sélection des créneaux réservés, occupés ou indisponibles
    if (slot.status !== 'available' || slot.isReserved) return;
    
    if (showControls) {
      // Mode styliste - pas de réservation
      return;
    }
    
    // Mode public - sélection pour réservation
    const newTime = slot.time === selectedTime ? '' : slot.time;
    setSelectedTime(newTime);
    
    // Notifier le parent si callback fourni
    if (onTimeSelection && newTime) {
      onTimeSelection(selectedDate, newTime);
    }
  };

  const handleReservation = async () => {
    if (!selectedTime) {
      toast({
        title: "Sélection requise",
        description: "Veuillez sélectionner un créneau",
        variant: "destructive"
      });
      return;
    }

    if (!isAuthenticated) {
      const currentPath = window.location.pathname;
      navigate(`/auth?next=${encodeURIComponent(currentPath)}`);
      return;
    }

    // Validation des IDs
    if (!stylistId || stylistId === 'undefined') {
      console.error('Stylist ID manquant ou invalide:', stylistId);
      toast({
        title: "Erreur",
        description: "Identifiant du styliste manquant",
        variant: "destructive"
      });
      return;
    }

    if (!userProfile?.user_id || userProfile.user_id === 'undefined') {
      console.error('User ID manquant ou invalide:', userProfile?.user_id);
      toast({
        title: "Erreur", 
        description: "Identifiant utilisateur manquant. Reconnectez-vous.",
        variant: "destructive"
      });
      return;
    }

    try {
      const [hours, minutes] = selectedTime.split(':').map(Number);
      const scheduledAt = new Date(selectedDate);
      scheduledAt.setHours(hours, minutes, 0, 0);

      console.log('🔄 Tentative de réservation:', {
        client_user_id: userProfile.user_id,
        stylist_user_id: stylistId,
        service_id: selectedService?.id || null,
        service_name: selectedService?.name || 'Aucun service spécifique',
        scheduled_at: scheduledAt.toISOString(),
        status: 'pending'
      });

      const { error } = await supabase
        .from('new_reservations')
        .insert({
          client_user_id: userProfile.user_id,
          stylist_user_id: stylistId,
          service_id: selectedService?.id || null,
          scheduled_at: scheduledAt.toISOString(),
          status: 'pending'
        });

      if (error) {
        console.error('❌ Erreur Supabase:', error);
        
        // Gestion spécifique de l'erreur de rate limiting
        if (error.message?.includes('Trop de réservations créées récemment')) {
          toast({
            title: "Limitation temporaire",
            description: "Vous avez créé plusieurs réservations récemment. Veuillez attendre quelques minutes avant de réessayer.",
            variant: "destructive"
          });
          return;
        }
        
        throw error;
      }

      console.log('✅ Réservation créée avec succès');

      toast({
        title: "Réservation créée",
        description: "Votre demande de réservation a été envoyée avec succès",
      });

      setSelectedTime('');
      
      // Rafraîchir les réservations pour mettre à jour l'affichage
      const { data: updatedReservations } = await supabase
        .from('new_reservations')
        .select('*')
        .eq('stylist_user_id', stylistId)
        .eq('status', 'confirmed')
        .gte('scheduled_at', startOfDay(selectedDate).toISOString())
        .lt('scheduled_at', addDays(startOfDay(selectedDate), 1).toISOString());
      
      if (updatedReservations) {
        setReservations(updatedReservations);
      }
      
    } catch (error) {
      console.error('💥 Erreur réservation:', error);
      toast({
        title: "Erreur",
        description: "Impossible de créer la réservation. Vérifiez votre connexion.",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Créneaux de réservation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-2xl bg-slate-900 text-white border-slate-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Calendar className="h-5 w-5" />
          Créneaux de réservation
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Légende des statuts */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-sm text-white">Disponible</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
            <span className="text-sm text-white">Réservé</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
            <span className="text-sm text-white">Bloqué</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span className="text-sm text-white">Indisponible</span>
          </div>
        </div>

        {/* Sélection de date */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-white" />
            <h3 className="font-semibold text-white">Choisissez une date</h3>
          </div>
          
          <Popover>
            <PopoverTrigger asChild>
              <Button
                className="w-full justify-start text-left font-normal bg-blue-600 text-white border-blue-700 hover:bg-blue-700 rounded-lg h-12"
              >
                Date sélectionnée : {format(selectedDate, 'EEEE d MMMM yyyy', { locale: fr })}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <CalendarComponent
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                disabled={(date) => date < startOfDay(new Date())}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Grille des créneaux */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-white" />
            <h3 className="font-semibold text-white">Créneaux disponibles</h3>
          </div>
          
          <div className="grid grid-cols-6 gap-2">
            {timeSlots.map((slot) => {
              const isSelected = selectedTime === slot.time;
              const isClickable = slot.status === 'available' && !slot.isReserved && !showControls;
              
              return (
                <button
                  key={slot.time}
                  onClick={() => handleSlotClick(slot)}
                  disabled={!isClickable}
                  className={cn(
                    "px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 h-10 flex items-center justify-center",
                    // Couleurs selon le statut
                    slot.status === 'available' && !slot.isReserved && "bg-green-500 text-white hover:bg-green-600",
                    slot.status === 'booked' || slot.isReserved && "bg-purple-500 text-white cursor-not-allowed",
                    slot.status === 'busy' && "bg-gray-500 text-white cursor-not-allowed",
                    slot.status === 'unavailable' && "bg-red-500 text-white cursor-not-allowed",
                    slot.status === 'past' && "bg-gray-600 text-gray-400 cursor-not-allowed opacity-60",
                    // Slot sélectionné
                    isSelected && "ring-2 ring-yellow-400 bg-yellow-500 text-black",
                    // Hover effects pour les slots disponibles
                    isClickable && !isSelected && "transform hover:scale-105 cursor-pointer"
                  )}
                >
                  {slot.time}
                </button>
              );
            })}
          </div>
        </div>

        {/* Instructions et informations */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800">
            <Clock className="h-4 w-4 inline mr-2" />
            Cliquez sur un créneau pour le {showControls ? 'modifier' : 'sélectionner'} • Les créneaux passés sont 
            automatiquement bloqués • Par défaut, les créneaux futurs sont disponibles
          </p>
        </div>

        {/* Section de réservation pour la vue publique */}
        {!showControls && (
          <div>
            {!isAuthenticated ? (
              // Message pour utilisateurs non connectés
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <div className="text-center space-y-4">
                  <div className="flex justify-center">
                    <User className="h-12 w-12 text-blue-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-blue-900 mb-2">
                      Connexion requise pour réserver
                    </h3>
                    <p className="text-blue-700 leading-relaxed mb-4">
                      Pour réserver un créneau, veuillez d'abord vous connecter ou créer un compte. 
                      Une fois connecté, sélectionnez simplement votre créneau et le service souhaité, 
                      puis cliquez sur "Réserver maintenant".
                    </p>
                  </div>
                  <Button 
                    onClick={() => {
                      const currentPath = window.location.pathname;
                      navigate(`/auth?returnTo=${encodeURIComponent(currentPath)}`);
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2"
                  >
                    Se connecter / Créer un compte
                  </Button>
                </div>
              </div>
            ) : selectedTime ? (
              // Section de réservation pour utilisateurs connectés avec créneau sélectionné
              <div className="bg-blue-600 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="font-medium text-white">
                      Créneau sélectionné: {selectedTime}
                    </p>
                    <p className="text-sm text-blue-100">
                      {format(selectedDate, 'EEEE d MMMM yyyy', { locale: fr })}
                    </p>
                    {selectedService && (
                      <p className="text-sm text-blue-100">
                        Service: {selectedService.name} ({selectedService.duration} min)
                      </p>
                    )}
                  </div>
                  <Button 
                    onClick={handleReservation}
                    className="bg-yellow-500 hover:bg-yellow-600 text-yellow-900 font-semibold"
                    size="lg"
                  >
                    Réserver maintenant
                  </Button>
                </div>
                
                {selectedService && (
                  <div className="bg-blue-500/30 rounded-lg p-3 border border-blue-400/30">
                    <div className="flex items-center justify-between text-sm text-blue-100">
                      <span>Prix du service:</span>
                      <span className="font-semibold text-white">
                        {selectedService.price.toFixed(2)} $CAD
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              // Message pour sélectionner un créneau
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-center text-gray-600">
                  <Clock className="h-4 w-4 inline mr-2" />
                  Sélectionnez un créneau disponible (en vert) pour continuer
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};