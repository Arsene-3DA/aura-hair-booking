import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ChevronLeft, ChevronRight, Calendar, Clock, CheckCircle, XCircle, MinusCircle } from 'lucide-react';
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
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { availabilities, loading, createAvailability, updateAvailability, deleteAvailability } = useAvailability(stylistId);
  const { toast } = useToast();

  // Charger les réservations pour la date sélectionnée
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

  // Écouter les changements en temps réel
  useEffect(() => {
    const channel = supabase
      .channel('availability-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'availabilities',
          filter: `stylist_id=eq.${stylistId}`
        },
        () => {
          // Refresh sera appelé automatiquement par useAvailability
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'new_reservations',
          filter: `stylist_user_id=eq.${stylistId}`
        },
        () => {
          fetchBookings();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [stylistId]);

  useEffect(() => {
    fetchBookings();
  }, [selectedDate, stylistId]);

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
          // Créneau dans le passé = indisponible, sinon disponible par défaut
          const now = new Date();
          if (datetime < now) {
            slots.push({
              time: timeString,
              datetime,
              status: 'unavailable'
            });
          } else {
            // Par défaut, les créneaux sont disponibles
            slots.push({
              time: timeString,
              datetime,
              status: 'available'
            });
          }
        }
      }
    }
    
    return slots;
  };

  const timeSlots = useMemo(() => generateTimeSlots(), [selectedDate, availabilities, bookings]);

  const handleSlotClick = (slot: TimeSlot) => {
    if (slot.status === 'booked') {
      toast({
        title: "Créneau réservé",
        description: "Ce créneau est déjà réservé par un client et ne peut pas être modifié",
        variant: "destructive",
      });
      return;
    }

    // Vérifier si le créneau est dans le passé
    const now = new Date();
    if (slot.datetime < now) {
      toast({
        title: "Créneau passé",
        description: "Impossible de modifier un créneau dans le passé",
        variant: "destructive",
      });
      return;
    }

    setSelectedSlot(slot);
    setIsModalOpen(true);
  };

  const handleStatusChange = async (newStatus: 'available' | 'busy' | 'unavailable') => {
    if (!selectedSlot) return;

    const endTime = new Date(selectedSlot.datetime);
    endTime.setMinutes(endTime.getMinutes() + 30);

    try {
      if (newStatus === 'unavailable') {
        // Supprimer la disponibilité existante
        if (selectedSlot.availabilityId) {
          await deleteAvailability(selectedSlot.availabilityId);
        }
        toast({
          title: "Créneau mis à jour",
          description: "Le créneau a été marqué comme indisponible",
        });
      } else {
        if (selectedSlot.availabilityId) {
          // Mettre à jour la disponibilité existante
          await updateAvailability({
            id: selectedSlot.availabilityId,
            status: newStatus
          });
        } else {
          // Créer une nouvelle disponibilité
          await createAvailability({
            start_at: selectedSlot.datetime.toISOString(),
            end_at: endTime.toISOString(),
            status: newStatus
          });
        }
        
        toast({
          title: "Créneau mis à jour",
          description: `Le créneau a été marqué comme ${newStatus === 'available' ? 'disponible' : 'bloqué'}`,
        });
      }
    } catch (error) {
      console.error('Erreur lors de la modification du créneau:', error);
      toast({
        title: "Erreur",
        description: "Impossible de modifier le créneau",
        variant: "destructive",
      });
    }

    setIsModalOpen(false);
    setSelectedSlot(null);
  };

  const getSlotColor = (status: TimeSlot['status']) => {
    switch (status) {
      case 'available': return 'bg-green-500 hover:bg-green-600 text-white border-green-600 shadow-md';
      case 'busy': return 'bg-gray-500 hover:bg-gray-600 text-white border-gray-600 shadow-md';
      case 'booked': return 'bg-red-500 text-white border-red-600 cursor-not-allowed shadow-md';
      case 'unavailable': return 'bg-orange-500 hover:bg-orange-600 text-white border-orange-600 shadow-md';
      default: return 'bg-gray-200 shadow-md';
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
    <Card className="shadow-xl border-2 border-primary/20">
      <CardHeader className="bg-gradient-to-r from-primary/10 to-secondary/10 border-b border-primary/20">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-xl font-bold">
            <Calendar className="h-6 w-6" />
            {format(selectedDate, "EEEE d MMMM yyyy", { locale: fr })}
          </CardTitle>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={goToPreviousDay} className="hover:scale-105 transition-transform">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="default" size="sm" onClick={goToToday} className="font-bold px-4">
              Aujourd'hui
            </Button>
            <Button variant="outline" size="sm" onClick={goToNextDay} className="hover:scale-105 transition-transform">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-8">
        {/* Légende - Design simplifié comme dans l'image */}
        <div className="flex flex-wrap justify-center gap-8 mb-8 p-4 bg-muted/30 rounded-xl">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-green-500 rounded-full border-2 border-green-700 shadow-sm"></div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-red-500 rounded-full border-2 border-red-700 shadow-sm"></div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-gray-500 rounded-full border-2 border-gray-700 shadow-sm"></div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-orange-500 rounded-full border-2 border-orange-700 shadow-sm"></div>
          </div>
        </div>

        {/* Grille des créneaux - Améliorée */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
          {timeSlots.map((slot) => (
            <Button
              key={slot.time}
              variant="outline"
              size="lg"
              className={`h-14 text-base font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg ${getSlotColor(slot.status)}`}
              onClick={() => handleSlotClick(slot)}
              disabled={slot.status === 'booked'}
            >
              {slot.time}
            </Button>
          ))}
        </div>

        {/* Instructions simplifiées */}
        <div className="mt-8 p-6 bg-gradient-to-r from-muted/50 to-muted/30 rounded-xl border border-primary/10">
          <p className="text-center text-muted-foreground font-medium">
            💡 Cliquez sur un créneau pour modifier sa disponibilité
          </p>
        </div>
      </CardContent>

      {/* Modal de sélection du statut */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Modifier le créneau {selectedSlot?.time}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {selectedSlot && format(selectedSlot.datetime, "EEEE d MMMM yyyy 'à' HH:mm", { locale: fr })}
            </p>
            
            <div className="grid gap-3">
              <Button
                variant="outline"
                size="lg"
                className="justify-start gap-3 h-auto p-4 bg-green-50 hover:bg-green-100 border-green-200"
                onClick={() => handleStatusChange('available')}
              >
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div className="text-left">
                  <div className="font-medium text-green-700">Disponible</div>
                  <div className="text-sm text-green-600">Les clients peuvent réserver ce créneau</div>
                </div>
              </Button>
              
              <Button
                variant="outline"
                size="lg"
                className="justify-start gap-3 h-auto p-4 bg-gray-50 hover:bg-gray-100 border-gray-200"
                onClick={() => handleStatusChange('busy')}
              >
                <MinusCircle className="h-5 w-5 text-gray-600" />
                <div className="text-left">
                  <div className="font-medium text-gray-700">Bloqué</div>
                  <div className="text-sm text-gray-600">Créneau occupé, indisponible pour réservation</div>
                </div>
              </Button>
              
              <Button
                variant="outline"
                size="lg"
                className="justify-start gap-3 h-auto p-4 bg-red-50 hover:bg-red-100 border-red-200"
                onClick={() => handleStatusChange('unavailable')}
              >
                <XCircle className="h-5 w-5 text-red-600" />
                <div className="text-left">
                  <div className="font-medium text-red-700">Indisponible</div>
                  <div className="text-sm text-red-600">Retirer ce créneau de votre planning</div>
                </div>
              </Button>
            </div>
            
            <Button variant="outline" onClick={() => setIsModalOpen(false)} className="w-full">
              Annuler
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
};