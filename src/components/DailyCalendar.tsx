import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { format, addDays, subDays, isSameDay, startOfDay, endOfDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useAvailability } from '@/hooks/useAvailability';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface DailyCalendarProps {
  stylistId: string;
}

interface TimeSlot {
  time: string;
  datetime: Date;
  status: 'available' | 'busy' | 'booked' | 'unavailable';
  availabilityId?: string;
}

export const DailyCalendar = ({ stylistId }: DailyCalendarProps) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [bookings, setBookings] = useState<any[]>([]);
  const { availabilities, loading, createAvailability, updateAvailability, deleteAvailability } = useAvailability(stylistId);
  const { toast } = useToast();

  // Générer les créneaux de 9h à 22h par intervalles de 30 minutes
  const generateTimeSlots = (): TimeSlot[] => {
    const slots: TimeSlot[] = [];
    const baseDate = startOfDay(selectedDate);
    
    for (let hour = 9; hour < 22; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const datetime = new Date(baseDate);
        datetime.setHours(hour, minute, 0, 0);
        
        const timeString = format(datetime, 'HH:mm');
        
        // Vérifier si ce créneau est réservé
        const isBooked = bookings.some(booking => {
          const bookingTime = new Date(booking.scheduled_at);
          return isSameDay(bookingTime, selectedDate) && 
                 format(bookingTime, 'HH:mm') === timeString;
        });

        if (isBooked) {
          slots.push({
            time: timeString,
            datetime,
            status: 'booked'
          });
          continue;
        }

        // Vérifier la disponibilité
        const availability = availabilities.find(avail => {
          const startTime = new Date(avail.start_at);
          const endTime = new Date(avail.end_at);
          return datetime >= startTime && datetime < endTime;
        });

        if (availability) {
          slots.push({
            time: timeString,
            datetime,
            status: availability.status === 'available' ? 'available' : 'busy',
            availabilityId: availability.id
          });
        } else {
          // Créneau dans le passé = indisponible
          const now = new Date();
          if (datetime < now) {
            slots.push({
              time: timeString,
              datetime,
              status: 'unavailable'
            });
          } else {
            slots.push({
              time: timeString,
              datetime,
              status: 'unavailable'
            });
          }
        }
      }
    }
    
    return slots;
  };

  const timeSlots = useMemo(() => generateTimeSlots(), [selectedDate, availabilities, bookings]);

  // Charger les réservations pour la date sélectionnée
  useEffect(() => {
    const fetchBookings = async () => {
      const startDate = startOfDay(selectedDate);
      const endDate = endOfDay(selectedDate);
      
      const { data, error } = await supabase
        .from('new_reservations')
        .select('*')
        .eq('stylist_user_id', stylistId)
        .eq('status', 'confirmed')
        .gte('scheduled_at', startDate.toISOString())
        .lte('scheduled_at', endDate.toISOString());

      if (error) {
        console.error('Erreur lors du chargement des réservations:', error);
        return;
      }

      setBookings(data || []);
    };

    fetchBookings();
  }, [selectedDate, stylistId]);

  const handleSlotClick = async (slot: TimeSlot) => {
    if (slot.status === 'booked') {
      toast({
        title: "Créneau réservé",
        description: "Ce créneau est déjà réservé par un client",
        variant: "destructive",
      });
      return;
    }

    const endTime = new Date(slot.datetime);
    endTime.setMinutes(endTime.getMinutes() + 30);

    try {
      if (slot.status === 'unavailable') {
        // Créer une nouvelle disponibilité
        await createAvailability({
          start_at: slot.datetime.toISOString(),
          end_at: endTime.toISOString(),
          status: 'available'
        });
      } else if (slot.status === 'available') {
        // Marquer comme occupé
        if (slot.availabilityId) {
          await updateAvailability({
            id: slot.availabilityId,
            status: 'busy'
          });
        }
      } else if (slot.status === 'busy') {
        // Supprimer la disponibilité (retour à indisponible)
        if (slot.availabilityId) {
          await deleteAvailability(slot.availabilityId);
        }
      }
    } catch (error) {
      console.error('Erreur lors de la modification du créneau:', error);
    }
  };

  const getSlotColor = (status: TimeSlot['status']) => {
    switch (status) {
      case 'available': return 'bg-green-500 hover:bg-green-600 text-white border-green-600';
      case 'busy': return 'bg-gray-500 hover:bg-gray-600 text-white border-gray-600';
      case 'booked': return 'bg-red-500 text-white border-red-600 cursor-not-allowed';
      case 'unavailable': return 'bg-gray-200 hover:bg-gray-300 text-gray-600 border-gray-300';
      default: return 'bg-gray-200';
    }
  };

  const goToPreviousDay = () => setSelectedDate(prev => subDays(prev, 1));
  const goToNextDay = () => setSelectedDate(prev => addDays(prev, 1));
  const goToToday = () => setSelectedDate(new Date());

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            {format(selectedDate, "EEEE d MMMM yyyy", { locale: fr })}
          </CardTitle>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={goToPreviousDay}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="default" size="sm" onClick={goToToday}>
              Aujourd'hui
            </Button>
            <Button variant="outline" size="sm" onClick={goToNextDay}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-6">
        {/* Légende */}
        <div className="flex flex-wrap gap-4 mb-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded border-2 border-green-600"></div>
            <span>🟢 Disponible</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded border-2 border-red-600"></div>
            <span>🔴 Réservé</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-500 rounded border-2 border-gray-600"></div>
            <span>⚫ Bloqué</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-200 rounded border-2 border-gray-300"></div>
            <span>⚪ Indisponible</span>
          </div>
        </div>

        {/* Grille des créneaux */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {timeSlots.map((slot) => (
            <Button
              key={slot.time}
              variant="outline"
              size="sm"
              className={`h-12 transition-all duration-200 ${getSlotColor(slot.status)}`}
              onClick={() => handleSlotClick(slot)}
              disabled={slot.status === 'booked'}
            >
              {slot.time}
            </Button>
          ))}
        </div>

        {/* Instructions */}
        <div className="mt-6 p-4 bg-muted rounded-lg text-sm text-muted-foreground">
          <p className="font-medium mb-2">Instructions :</p>
          <ul className="space-y-1">
            <li>• Cliquez sur un créneau indisponible (⚪) pour le rendre disponible (🟢)</li>
            <li>• Cliquez sur un créneau disponible (🟢) pour le bloquer (⚫)</li>
            <li>• Cliquez sur un créneau bloqué (⚫) pour le rendre indisponible (⚪)</li>
            <li>• Les créneaux réservés (🔴) ne peuvent pas être modifiés</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};