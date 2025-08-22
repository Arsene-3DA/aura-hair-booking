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
}

export const RealTimeAvailability = ({ 
  stylistId, 
  showControls = false 
}: RealTimeAvailabilityProps) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState<string>('');
  const { availabilities, loading } = useAvailability(stylistId);
  const { isAuthenticated, userProfile } = useRoleAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

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
        
        // Trouver la disponibilité correspondante
        const availability = availabilities.find(avail => {
          const availStart = new Date(avail.start_at);
          return Math.abs(availStart.getTime() - slotDateTime.getTime()) < 30 * 60 * 1000;
        });

        // Déterminer le statut
        let status: 'available' | 'busy' | 'unavailable' | 'past' | 'booked' = 'available';
        
        if (slotDateTime <= new Date()) {
          status = 'past';
        } else if (availability) {
          status = availability.status;
        }

        slots.push({
          time: timeStr,
          datetime: slotDateTime,
          status,
          availabilityId: availability?.id
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
    if (slot.status !== 'available') return;
    
    if (showControls) {
      // Mode styliste - pas de réservation
      return;
    }
    
    // Mode public - sélection pour réservation
    setSelectedTime(slot.time === selectedTime ? '' : slot.time);
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

    try {
      const [hours, minutes] = selectedTime.split(':').map(Number);
      const scheduledAt = new Date(selectedDate);
      scheduledAt.setHours(hours, minutes, 0, 0);

      const { error } = await supabase
        .from('new_reservations')
        .insert({
          client_user_id: userProfile?.user_id,
          stylist_user_id: stylistId,
          scheduled_at: scheduledAt.toISOString(),
          status: 'pending'
        });

      if (error) throw error;

      toast({
        title: "Réservation créée",
        description: "Votre demande de réservation a été envoyée avec succès",
      });

      setSelectedTime('');
      
    } catch (error) {
      console.error('Erreur réservation:', error);
      toast({
        title: "Erreur",
        description: "Impossible de créer la réservation",
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
    <Card className="rounded-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Créneaux de réservation
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Légende des statuts */}
        <div className="bg-gray-900 text-white p-4 rounded-lg">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>Disponible</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
              <span>Réservé</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
              <span>Bloqué</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span>Indisponible</span>
            </div>
          </div>
        </div>

        {/* Sélection de date */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="h-5 w-5" />
            <h3 className="font-semibold">Choisissez une date</h3>
          </div>
          
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal bg-blue-600 text-white border-blue-700 hover:bg-blue-700",
                )}
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
            <Clock className="h-5 w-5" />
            <h3 className="font-semibold">Créneaux disponibles</h3>
            {!showControls && selectedTime && (
              <span className="text-sm text-muted-foreground">
                • Cliquez sur un créneau disponible pour le sélectionner
              </span>
            )}
          </div>
          
            <div className="bg-gray-900 p-4 rounded-lg">
              <div className="grid grid-cols-6 gap-2">
                {timeSlots.map((slot) => {
                  const isSelected = selectedTime === slot.time;
                  const isClickable = slot.status === 'available' && !showControls;
                  
                  return (
                    <button
                      key={slot.time}
                      onClick={() => handleSlotClick(slot)}
                      disabled={!isClickable && slot.status !== 'available'}
                      className={cn(
                        "px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 border-2",
                        getSlotColor(slot.status, isSelected),
                        slot.status === 'available' && !showControls && "transform hover:scale-105"
                      )}
                    >
                      {slot.time}
                    </button>
                  );
                })}
              </div>
            </div>
        </div>

        {/* Instructions et bouton de réservation pour la vue publique */}
        {!showControls && (
          <div className="space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                <Clock className="h-4 w-4 inline mr-2" />
                Cliquez sur un créneau pour le modifier • Les créneaux passés sont 
                automatiquement bloqués • Par défaut, les créneaux futurs sont disponibles
              </p>
            </div>

            {selectedTime && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-blue-900">
                      Créneau sélectionné: {selectedTime}
                    </p>
                    <p className="text-sm text-blue-700">
                      {format(selectedDate, 'EEEE d MMMM yyyy', { locale: fr })}
                    </p>
                  </div>
                  <Button 
                    onClick={handleReservation}
                    className="bg-yellow-500 hover:bg-yellow-600 text-yellow-900 font-semibold"
                    size="lg"
                  >
                    Réserver maintenant
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};