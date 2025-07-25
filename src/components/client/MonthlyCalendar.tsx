import { useRef, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import { RealtimeBooking } from '@/hooks/useRealtimeBookings';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface MonthlyCalendarProps {
  bookings: RealtimeBooking[];
  onEventClick: (booking: RealtimeBooking) => void;
  loading?: boolean;
}

export const MonthlyCalendar = ({ bookings, onEventClick, loading }: MonthlyCalendarProps) => {
  const calendarRef = useRef<FullCalendar>(null);

  // Transform bookings to FullCalendar events
  const events = bookings.map(booking => ({
    id: booking.id,
    title: booking.service,
    start: `${booking.booking_date}T${booking.booking_time}`,
    allDay: false,
    backgroundColor: getStatusColor(booking.status),
    borderColor: getStatusColor(booking.status),
    textColor: '#ffffff',
    extendedProps: {
      booking,
    },
  }));

  function getStatusColor(status: string): string {
    switch (status) {
      case 'confirmé':
        return 'hsl(var(--primary))';
      case 'en_attente':
        return 'hsl(var(--warning))';
      case 'refusé':
        return 'hsl(var(--destructive))';
      case 'terminé':
        return 'hsl(var(--muted))';
      default:
        return 'hsl(var(--secondary))';
    }
  }

  const handleEventClick = (clickInfo: any) => {
    const booking = clickInfo.event.extendedProps.booking;
    onEventClick(booking);
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Chargement du calendrier...</p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg border p-6">
      <h2 className="text-lg font-semibold mb-4">Mes Rendez-vous</h2>
      <div className="calendar-wrapper">
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin]}
          initialView="dayGridMonth"
          events={events}
          eventClick={handleEventClick}
          locale="fr"
          height="auto"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth',
          }}
          buttonText={{
            today: "Aujourd'hui",
            month: 'Mois',
          }}
          dayHeaderFormat={{ weekday: 'short' }}
          eventDisplay="block"
          eventTimeFormat={{
            hour: '2-digit',
            minute: '2-digit',
            meridiem: false,
          }}
          dayCellClassNames={(date) => {
            const today = new Date();
            const cellDate = date.date;
            
            if (cellDate.toDateString() === today.toDateString()) {
              return ['fc-day-today-custom'];
            }
            return [];
          }}
          eventClassNames={(arg) => {
            return ['cursor-pointer', 'hover:opacity-80', 'transition-opacity'];
          }}
        />
      </div>
      
      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: getStatusColor('confirmé') }}></div>
          <span>Confirmé</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: getStatusColor('en_attente') }}></div>
          <span>En attente</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: getStatusColor('refusé') }}></div>
          <span>Refusé</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: getStatusColor('terminé') }}></div>
          <span>Terminé</span>
        </div>
      </div>

      <style>{`
        .fc-day-today-custom {
          background-color: hsl(var(--primary) / 0.1) !important;
        }
        
        .fc-event {
          font-size: 0.875rem;
          border-radius: 4px;
          padding: 2px 4px;
        }
        
        .fc-event-title {
          font-weight: 500;
        }
        
        .fc-toolbar-title {
          font-size: 1.25rem !important;
          font-weight: 600;
        }
        
        .fc-button {
          background-color: hsl(var(--primary)) !important;
          border-color: hsl(var(--primary)) !important;
          color: hsl(var(--primary-foreground)) !important;
        }
        
        .fc-button:hover {
          background-color: hsl(var(--primary) / 0.9) !important;
          border-color: hsl(var(--primary) / 0.9) !important;
        }
        
        .fc-button:disabled {
          background-color: hsl(var(--muted)) !important;
          border-color: hsl(var(--muted)) !important;
          color: hsl(var(--muted-foreground)) !important;
        }
      `}</style>
    </div>
  );
};