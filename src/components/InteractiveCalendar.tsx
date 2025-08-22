import { useState, useCallback, useMemo } from 'react';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';
import { EventInput, DateSelectArg, EventClickArg } from '@fullcalendar/core';
import { useAvailability, Availability } from '@/hooks/useAvailability';
import { useWeeklyCalendar } from '@/hooks/useWeeklyCalendar';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, User } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import '@/styles/30min-calendar.css';

interface InteractiveCalendarProps {
  stylistId: string;
  selectedWeek: Date;
}

const InteractiveCalendar = ({ stylistId, selectedWeek }: InteractiveCalendarProps) => {
  const { availabilities, updateAvailability, createAvailability } = useAvailability(stylistId);
  const { events } = useWeeklyCalendar(stylistId, selectedWeek);
  const [showModal, setShowModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<DateSelectArg | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const isMobile = useIsMobile();

  // Transformer les données pour FullCalendar avec système de couleurs cohérent
  const calendarEvents: EventInput[] = useMemo(() => {
    const availabilityEvents = availabilities.map((avail: Availability) => ({
      id: avail.id,
      title: avail.status === 'available' ? 'Disponible' : 'Bloqué',
      start: avail.start_at,
      end: avail.end_at,
      backgroundColor: avail.status === 'available' 
        ? 'hsl(var(--slot-available))' 
        : 'hsl(var(--slot-busy))',
      borderColor: avail.status === 'available' 
        ? 'hsl(var(--slot-available))' 
        : 'hsl(var(--slot-busy))',
      extendedProps: {
        type: 'availability',
        status: avail.status,
        availabilityId: avail.id
      }
    }));

    const eventData = events
      .filter(event => event.type === 'booking' || event.type === 'reservation')
      .map(event => {
        let color = '#EA5455'; // Rouge par défaut pour les réservations
        let title = event.title;

        // Code couleur selon le type et statut avec système cohérent
        if (event.type === 'reservation') {
          switch (event.status) {
            case 'confirmed':
              color = 'hsl(var(--slot-booked))'; // Violet pour réservé confirmé
              title = `✅ ${event.title}`;
              break;
            case 'pending':
              color = 'hsl(var(--warning))'; // Orange pour en attente
              title = `⏳ ${event.title}`;
              break;
            case 'declined':
              color = 'hsl(var(--slot-unavailable))'; // Rouge pour refusé
              title = `❌ ${event.title}`;
              break;
            default:
              color = 'hsl(var(--slot-booked))';
          }
        }

        return {
          id: event.id,
          title,
          start: event.start,
          end: event.end,
          backgroundColor: color,
          borderColor: color,
          className: `fc-event-${event.type}`,
          extendedProps: {
            type: event.type,
            status: event.status,
            clientName: event.client_name
          }
        };
      });

    return [...availabilityEvents, ...eventData];
  }, [availabilities, events]);

  const handleDateSelect = useCallback((selectInfo: DateSelectArg) => {
    setSelectedSlot(selectInfo);
    setSelectedEvent(null);
    setShowModal(true);
  }, []);

  const handleEventClick = useCallback((clickInfo: EventClickArg) => {
    if (clickInfo.event.extendedProps.type === 'availability') {
      setSelectedEvent(clickInfo.event);
      setSelectedSlot(null);
      setShowModal(true);
    }
  }, []);

  const handleCreateAvailability = async (status: 'available' | 'busy') => {
    if (!selectedSlot) return;

    console.log('🎯 Creating specific availability slot:', selectedSlot.startStr, 'to', selectedSlot.endStr, 'with status:', status);

    await createAvailability({
      start_at: selectedSlot.startStr,
      end_at: selectedSlot.endStr,
      status
    });

    setShowModal(false);
    setSelectedSlot(null);
  };

  const handleUpdateAvailability = async (status: 'available' | 'busy') => {
    if (!selectedEvent) return;

    console.log('🎯 Updating specific availability slot:', selectedEvent.extendedProps.availabilityId, 'to status:', status);

    await updateAvailability({
      id: selectedEvent.extendedProps.availabilityId,
      status
    });

    setShowModal(false);
    setSelectedEvent(null);
  };

  // Fonction pour créer des créneaux de test de 30 minutes
  const createTestSlots = async () => {
    if (!stylistId) return;
    
    const today = new Date();
    const slots = [
      // Créneaux de 30 minutes pour aujourd'hui
      {
        start_at: new Date(today.getTime() + (9 * 60 * 60 * 1000)).toISOString(), // 9h00
        end_at: new Date(today.getTime() + (9.5 * 60 * 60 * 1000)).toISOString(), // 9h30
        status: 'available' as const
      },
      {
        start_at: new Date(today.getTime() + (9.5 * 60 * 60 * 1000)).toISOString(), // 9h30
        end_at: new Date(today.getTime() + (10 * 60 * 60 * 1000)).toISOString(), // 10h00
        status: 'available' as const
      },
      {
        start_at: new Date(today.getTime() + (14 * 60 * 60 * 1000)).toISOString(), // 14h00
        end_at: new Date(today.getTime() + (14.5 * 60 * 60 * 1000)).toISOString(), // 14h30
        status: 'busy' as const
      },
      // Créneaux pour demain
      {
        start_at: new Date(today.getTime() + (24 * 60 * 60 * 1000) + (10 * 60 * 60 * 1000)).toISOString(), // 10h00 demain
        end_at: new Date(today.getTime() + (24 * 60 * 60 * 1000) + (10.5 * 60 * 60 * 1000)).toISOString(), // 10h30 demain
        status: 'available' as const
      }
    ];
    
    for (const slot of slots) {
      await createAvailability(slot);
    }
  };

  return (
    <>
      <div className="bg-card rounded-xl border shadow-lg overflow-hidden">
        {/* Bouton de test temporaire */}
        <div className="p-4 bg-muted/50 border-b">
          <Button 
            onClick={createTestSlots}
            className="mr-4 bg-green-600 hover:bg-green-700"
          >
            🧪 Créer des créneaux de test
          </Button>
          <span className="text-sm text-muted-foreground">
            Stylist ID: {stylistId} | Events: {calendarEvents.length}
          </span>
        </div>
        <FullCalendar
          plugins={[timeGridPlugin, listPlugin, interactionPlugin]}
          initialView={isMobile ? 'listWeek' : 'timeGridWeek'}
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: isMobile ? 'listWeek' : 'timeGridWeek'
          }}
          businessHours={{
            startTime: '09:00',
            endTime: '22:00'
          }}
          slotMinTime="09:00:00"
          slotMaxTime="22:00:00"
          slotDuration="00:30:00"           // CRÉNEAUX DE 30 MINUTES
          snapDuration="00:30:00"           // SNAP SUR 30 MINUTES
          slotLabelInterval="00:30:00"      // AFFICHAGE TOUTES LES 30 MIN
          slotLabelFormat={{
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
          }}
          slotLabelClassNames={() => "fc-timegrid-slot-label-enhanced"}
          dayHeaderClassNames={() => "fc-col-header-enhanced"}
          allDaySlot={false}
          selectable={true}
          selectMirror={true}
          selectOverlap={false}
          dayMaxEvents={true}
          weekends={true}
          events={calendarEvents}
          select={handleDateSelect}
          eventClick={handleEventClick}
          height="600px"
          locale="fr"
          expandRows={false}
          stickyHeaderDates={true}
          nowIndicator={true}
          scrollTime="09:00:00"
          eventDisplay="block"
          eventBackgroundColor="transparent"
          eventClassNames={(arg) => {
            const status = arg.event.extendedProps.status;
            const type = arg.event.extendedProps.type;
            
            if (type === 'availability') {
              return status === 'available' ? 'fc-event-available-enhanced' : 'fc-event-busy-enhanced';
            }
            return 'fc-event-booking-enhanced';
          }}
          selectConstraint={{
            start: '09:00',
            end: '22:00'
          }}
          eventConstraint={{
            start: '09:00',
            end: '22:00'
          }}
          // FORCER L'AFFICHAGE DES HEURES
          dayHeaderContent={(arg) => {
            return {
              html: `<div class="fc-col-header-content">${arg.text}</div>`
            };
          }}
          slotLabelContent={(arg) => {
            return {
              html: `<div class="fc-timegrid-slot-label-cushion fc-scrollgrid-sync-inner" style="color: #333; font-weight: 600; font-size: 14px;">${arg.text}</div>`
            };
          }}
        />
      </div>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedSlot ? (
                <>
                  <Calendar className="h-5 w-5" />
                  Créer une disponibilité
                </>
              ) : (
                <>
                  <Clock className="h-5 w-5" />
                  Modifier la disponibilité
                </>
              )}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {selectedSlot && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">
                    {new Date(selectedSlot.startStr).toLocaleDateString('fr-FR', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long'
                    })}
                  </Badge>
                  <Badge variant="outline">
                    {new Date(selectedSlot.startStr).toLocaleTimeString('fr-FR', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })} - {new Date(selectedSlot.endStr).toLocaleTimeString('fr-FR', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </Badge>
                </div>
                
                <Label>Choisissez le statut :</Label>
                <div className="flex gap-2">
                  <Button 
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    onClick={() => handleCreateAvailability('available')}
                  >
                    Disponible
                  </Button>
                  <Button 
                    className="flex-1 bg-red-600 hover:bg-red-700"
                    onClick={() => handleCreateAvailability('busy')}
                  >
                    Occupé
                  </Button>
                </div>
              </div>
            )}

            {selectedEvent && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Badge variant={selectedEvent.extendedProps.status === 'available' ? 'default' : 'destructive'}>
                    {selectedEvent.extendedProps.status === 'available' ? 'Disponible' : 'Occupé'}
                  </Badge>
                  <Badge variant="outline">
                    {new Date(selectedEvent.startStr).toLocaleDateString('fr-FR', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long'
                    })}
                  </Badge>
                </div>
                
                <Label>Modifier le statut :</Label>
                <div className="flex gap-2">
                  <Button 
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    onClick={() => handleUpdateAvailability('available')}
                    disabled={selectedEvent.extendedProps.status === 'available'}
                  >
                    Disponible
                  </Button>
                  <Button 
                    className="flex-1 bg-red-600 hover:bg-red-700"
                    onClick={() => handleUpdateAvailability('busy')}
                    disabled={selectedEvent.extendedProps.status === 'busy'}
                  >
                    Occupé
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default InteractiveCalendar;