import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAvailability } from '@/hooks/useAvailability';
import { useToast } from '@/hooks/use-toast';
import { Clock, CheckCircle, XCircle, MinusCircle } from 'lucide-react';
import { format, isSameDay, startOfDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';

interface TimeSlotGridProps {
  stylistId: string;
  selectedDate: Date;
}

interface TimeSlot {
  time: string;
  datetime: Date;
  status: 'available' | 'busy' | 'booked' | 'unavailable';
  availabilityId?: string;
}

export const TimeSlotGrid: React.FC<TimeSlotGridProps> = ({ stylistId, selectedDate }) => {
  const [bookings, setBookings] = useState<any[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { availabilities, loading, createAvailability, updateAvailability, deleteAvailability } = useAvailability(stylistId);
  const { toast } = useToast();

  // Charger les réservations pour la date sélectionnée
  const fetchBookings = async () => {
    const startDate = startOfDay(selectedDate);
    const endDate = new Date(selectedDate);
    endDate.setHours(23, 59, 59, 999);
    
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

  useEffect(() => {
    fetchBookings();
  }, [selectedDate, stylistId]);

  // Générer les créneaux de 9h à 21h30 par intervalles de 30 minutes
  const generateTimeSlots = (): TimeSlot[] => {
    const slots: TimeSlot[] = [];
    const baseDate = startOfDay(selectedDate);
    const now = new Date();
    
    for (let hour = 9; hour < 22; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const datetime = new Date(baseDate);
        datetime.setHours(hour, minute, 0, 0);
        
        const timeString = format(datetime, 'HH:mm');
        
        // RÈGLE 1: Vérifier si ce créneau est réservé par un client
        const isBooked = bookings.some(booking => {
          const bookingTime = new Date(booking.scheduled_at);
          return isSameDay(bookingTime, selectedDate) && 
                 format(bookingTime, 'HH:mm') === timeString;
        });

        if (isBooked) {
          slots.push({
            time: timeString,
            datetime,
            status: 'booked' // VIOLET 🟣 - Réservé par client
          });
          continue;
        }

        // RÈGLE 2: Vérifier si le créneau est dans le passé
        if (datetime < now) {
          slots.push({
            time: timeString,
            datetime,
            status: 'busy' // GRIS ⚫ - Automatiquement bloqué (passé)
          });
          continue;
        }

        // RÈGLE 3: Vérifier la disponibilité définie par le professionnel - MATCHING STRICT 30MIN
        const availability = availabilities.find(avail => {
          const startTime = new Date(avail.start_at);
          const endTime = new Date(avail.end_at);
          const duration = endTime.getTime() - startTime.getTime();
          const is30Minutes = duration === (30 * 60 * 1000); // Exactement 30 minutes
          
          // MATCH STRICT: même heure de début ET durée exacte de 30min
          return is30Minutes && startTime.getTime() === datetime.getTime();
        });

        if (availability) {
          // Statut défini par le professionnel
          slots.push({
            time: timeString,
            datetime,
            status: availability.status, // 'available', 'busy' ou 'unavailable'
            availabilityId: availability.id
          });
        } else {
          // RÈGLE 4: Par défaut, les créneaux futurs sont DISPONIBLES
          slots.push({
            time: timeString,
            datetime,
            status: 'available' // VERT 🟢 - Disponible par défaut
          });
        }
      }
    }
    
    return slots;
  };

  const timeSlots = useMemo(() => {
    console.log('🔍 TimeSlotGrid - Total availabilities:', availabilities.length);
    const slots = generateTimeSlots();
    console.log('📊 TimeSlotGrid - Generated slots for', format(selectedDate, 'yyyy-MM-dd'), ':', slots.length);
    return slots;
  }, [selectedDate, availabilities, bookings]);

  const handleSlotClick = (slot: TimeSlot) => {
    console.log('🎯 TimeSlotGrid - SLOT CLICKED:', {
      time: slot.time,
      status: slot.status,
      availabilityId: slot.availabilityId,
      datetime: slot.datetime.toISOString()
    });
    
    // RÈGLE: Ne pas permettre de modifier les créneaux réservés
    if (slot.status === 'booked') {
      toast({
        title: "Créneau réservé",
        description: "Ce créneau est déjà réservé par un client et ne peut pas être modifié",
        variant: "destructive",
      });
      return;
    }

    // RÈGLE: Ne pas permettre de modifier les créneaux dans le passé
    const now = new Date();
    if (slot.datetime < now) {
      toast({
        title: "Créneau passé",
        description: "Les créneaux passés sont automatiquement bloqués et ne peuvent pas être modifiés",
        variant: "destructive",
      });
      return;
    }

    setSelectedSlot(slot);
    setIsModalOpen(true);
  };

  const handleStatusChange = async (newStatus: 'available' | 'busy' | 'unavailable') => {
    if (!selectedSlot) return;

    console.log('🎯 TimeSlotGrid - STRICT UPDATE - Single Slot:', selectedSlot.time, 'to status:', newStatus);
    
    // ÉTAPE 1: NETTOYER TOUS LES AVAILABILITIES NON-30MIN POUR CE JOUR
    const problematicSlots = availabilities.filter(avail => {
      const startTime = new Date(avail.start_at);
      const endTime = new Date(avail.end_at);
      const duration = endTime.getTime() - startTime.getTime();
      return duration !== (30 * 60 * 1000) && isSameDay(startTime, selectedDate);
    });
    
    if (problematicSlots.length > 0) {
      console.log('🧹 TimeSlotGrid - AUTO-CLEANING', problematicSlots.length, 'problematic slots before modification');
      for (const slot of problematicSlots) {
        try {
          await deleteAvailability(slot.id);
          console.log('🗑️ TimeSlotGrid - Auto-deleted problematic slot:', slot.id);
        } catch (error) {
          console.error('❌ TimeSlotGrid - Error auto-deleting:', slot.id, error);
        }
      }
    }
    
    // ÉTAPE 2: FORCER une durée de 30 minutes EXACTEMENT
    const endTime = new Date(selectedSlot.datetime);
    endTime.setMinutes(endTime.getMinutes() + 30);

    try {
      if (newStatus === 'unavailable') {
        // RÈGLE: Marquer comme indisponible = créer/mettre à jour avec status 'unavailable' (ROUGE 🔴)
        if (selectedSlot.availabilityId) {
          console.log('🔄 TimeSlotGrid - Updating EXISTING slot to unavailable:', selectedSlot.availabilityId);
          await updateAvailability({
            id: selectedSlot.availabilityId,
            status: 'unavailable'
          });
        } else {
          console.log('➕ TimeSlotGrid - Creating NEW unavailable slot:', selectedSlot.datetime.toISOString(), 'to', endTime.toISOString());
          await createAvailability({
            start_at: selectedSlot.datetime.toISOString(),
            end_at: endTime.toISOString(),
            status: 'unavailable'
          });
        }
        toast({
          title: "Créneau indisponible",
          description: `SEUL le créneau ${selectedSlot.time} est indisponible (rouge)`,
        });
      } else if (newStatus === 'busy') {
        // RÈGLE: Bloquer temporairement = créer/mettre à jour avec status 'busy' (GRIS ⚫)
        if (selectedSlot.availabilityId) {
          console.log('🔄 TimeSlotGrid - Updating EXISTING slot to busy:', selectedSlot.availabilityId);
          await updateAvailability({
            id: selectedSlot.availabilityId,
            status: 'busy'
          });
        } else {
          console.log('➕ TimeSlotGrid - Creating NEW busy slot:', selectedSlot.datetime.toISOString(), 'to', endTime.toISOString());
          await createAvailability({
            start_at: selectedSlot.datetime.toISOString(),
            end_at: endTime.toISOString(),
            status: 'busy'
          });
        }
        toast({
          title: "Créneau bloqué",
          description: `SEUL le créneau ${selectedSlot.time} est bloqué (gris)`,
        });
      } else if (newStatus === 'available') {
        // RÈGLE: Rendre disponible = créer/mettre à jour avec status 'available' (VERT 🟢)
        if (selectedSlot.availabilityId) {
          console.log('🔄 TimeSlotGrid - Updating EXISTING slot to available:', selectedSlot.availabilityId);
          await updateAvailability({
            id: selectedSlot.availabilityId,
            status: 'available'
          });
        } else {
          console.log('➕ TimeSlotGrid - Creating NEW available slot:', selectedSlot.datetime.toISOString(), 'to', endTime.toISOString());
          await createAvailability({
            start_at: selectedSlot.datetime.toISOString(),
            end_at: endTime.toISOString(),
            status: 'available'
          });
        }
        toast({
          title: "Créneau disponible",
          description: `SEUL le créneau ${selectedSlot.time} est disponible (vert)`,
        });
      }
    } catch (error) {
      console.error('TimeSlotGrid - Erreur lors de la modification du créneau:', error);
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
      case 'available': return 'bg-[hsl(var(--slot-available))] hover:bg-[hsl(var(--slot-available)/0.8)] text-[hsl(var(--slot-available-foreground))] border-[hsl(var(--slot-available))] shadow-md';
      case 'busy': return 'bg-[hsl(var(--slot-busy))] hover:bg-[hsl(var(--slot-busy)/0.8)] text-[hsl(var(--slot-busy-foreground))] border-[hsl(var(--slot-busy))] shadow-md';
      case 'booked': return 'bg-[hsl(var(--slot-booked))] text-[hsl(var(--slot-booked-foreground))] border-[hsl(var(--slot-booked))] cursor-not-allowed shadow-md';
      case 'unavailable': return 'bg-[hsl(var(--slot-unavailable))] hover:bg-[hsl(var(--slot-unavailable)/0.8)] text-[hsl(var(--slot-unavailable-foreground))] border-[hsl(var(--slot-unavailable))] shadow-md';
      default: return 'bg-muted shadow-md';
    }
  };

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
        <CardTitle className="flex items-center gap-2 text-xl font-bold">
          <Clock className="h-6 w-6" />
          Gestion des Créneaux - {format(selectedDate, "EEEE d MMMM yyyy", { locale: fr })}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-8">
        {/* Bouton de nettoyage des créneaux problématiques */}
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="text-sm text-yellow-800">
              🧹 Cliquez ici si plusieurs créneaux changent en même temps (nettoyage des anciens enregistrements)
            </div>
            <Button
              variant="outline"
              size="sm"
              className="text-yellow-700 border-yellow-300 hover:bg-yellow-100"
              onClick={async () => {
                console.log('🧹 TimeSlotGrid - CLEANING PROBLEMATIC SLOTS');
                const problematicSlots = availabilities.filter(avail => {
                  const startTime = new Date(avail.start_at);
                  const endTime = new Date(avail.end_at);
                  const duration = endTime.getTime() - startTime.getTime();
                  return duration !== (30 * 60 * 1000) && isSameDay(startTime, selectedDate);
                });
                
                console.log('TimeSlotGrid - Found', problematicSlots.length, 'problematic slots to delete');
                
                for (const slot of problematicSlots) {
                  try {
                    await deleteAvailability(slot.id);
                    console.log('🗑️ TimeSlotGrid - Deleted:', slot.id);
                  } catch (error) {
                    console.error('❌ TimeSlotGrid - Error deleting:', slot.id, error);
                  }
                }
                
                toast({
                  title: "Nettoyage terminé",
                  description: `${problematicSlots.length} créneaux problématiques supprimés`,
                });
              }}
            >
              Nettoyer
            </Button>
          </div>
        </div>

        {/* Légende avec système de couleurs automatique */}
        <div className="flex flex-wrap justify-center gap-6 mb-8 p-6 bg-muted/30 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 bg-[hsl(var(--slot-available))] rounded-full border-2 border-[hsl(var(--slot-available)/0.8)] shadow-sm"></div>
            <span className="text-sm font-medium text-foreground">Disponible 🟢</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 bg-[hsl(var(--slot-booked))] rounded-full border-2 border-[hsl(var(--slot-booked)/0.8)] shadow-sm"></div>
            <span className="text-sm font-medium text-foreground">Réservé 🟣</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 bg-[hsl(var(--slot-busy))] rounded-full border-2 border-[hsl(var(--slot-busy)/0.8)] shadow-sm"></div>
            <span className="text-sm font-medium text-foreground">Bloqué ⚫</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 bg-[hsl(var(--slot-unavailable))] rounded-full border-2 border-[hsl(var(--slot-unavailable)/0.8)] shadow-sm"></div>
            <span className="text-sm font-medium text-foreground">Indisponible 🔴</span>
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

        {/* Instructions avec règles automatiques */}
        <div className="mt-8 p-6 bg-gradient-to-r from-muted/50 to-muted/30 rounded-xl border border-primary/10">
          <p className="text-center text-muted-foreground font-medium">
            💡 Cliquez sur un créneau pour le modifier • Les créneaux passés sont automatiquement bloqués • Par défaut, les créneaux futurs sont disponibles • "Indisponible" ne s'affiche que sur votre demande
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
                className="justify-start gap-3 h-auto p-4 bg-green-50 hover:bg-green-100 border-green-200 dark:bg-green-950 dark:hover:bg-green-900 dark:border-green-800"
                onClick={() => handleStatusChange('available')}
              >
                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                <div className="text-left">
                  <div className="font-medium text-green-700 dark:text-green-300">Disponible 🟢</div>
                  <div className="text-sm text-green-600 dark:text-green-400">Les clients peuvent réserver ce créneau</div>
                </div>
              </Button>
              
              <Button
                variant="outline"
                size="lg"
                className="justify-start gap-3 h-auto p-4 bg-gray-50 hover:bg-gray-100 border-gray-200 dark:bg-gray-950 dark:hover:bg-gray-900 dark:border-gray-800"
                onClick={() => handleStatusChange('busy')}
              >
                <MinusCircle className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                <div className="text-left">
                  <div className="font-medium text-gray-700 dark:text-gray-300">Bloqué ⚫</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Créneau occupé, indisponible pour réservation</div>
                </div>
              </Button>
              
              <Button
                variant="outline"
                size="lg"
                className="justify-start gap-3 h-auto p-4 bg-red-50 hover:bg-red-100 border-red-200 dark:bg-red-950 dark:hover:bg-red-900 dark:border-red-800"
                onClick={() => handleStatusChange('unavailable')}
              >
                <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                <div className="text-left">
                  <div className="font-medium text-red-700 dark:text-red-300">Indisponible 🔴</div>
                  <div className="text-sm text-red-600 dark:text-red-400">Marquer ce créneau comme indisponible définitivement</div>
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