import { Clock, Calendar, MapPin } from 'lucide-react';
import { RealtimeBooking } from '@/hooks/useRealtimeBookings';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface UpcomingTimelineProps {
  bookings: RealtimeBooking[];
  loading?: boolean;
}

export const UpcomingTimeline = ({ bookings, loading }: UpcomingTimelineProps) => {
  // Filter and sort upcoming bookings (next 3)
  const now = new Date();
  const upcomingBookings = bookings
    .filter(booking => {
      const bookingDateTime = new Date(`${booking.booking_date}T${booking.booking_time}`);
      return bookingDateTime > now && (booking.status === 'confirmé' || booking.status === 'en_attente');
    })
    .sort((a, b) => {
      const dateA = new Date(`${a.booking_date}T${a.booking_time}`);
      const dateB = new Date(`${b.booking_date}T${b.booking_time}`);
      return dateA.getTime() - dateB.getTime();
    })
    .slice(0, 3);

  const formatRelativeTime = (date: string, time: string) => {
    try {
      const bookingDate = new Date(`${date}T${time}`);
      const diffInHours = Math.ceil((bookingDate.getTime() - now.getTime()) / (1000 * 60 * 60));
      
      if (diffInHours < 24) {
        return `Dans ${diffInHours}h`;
      } else {
        const diffInDays = Math.ceil(diffInHours / 24);
        return `Dans ${diffInDays} jour${diffInDays > 1 ? 's' : ''}`;
      }
    } catch (error) {
      return '';
    }
  };

  const formatDateTime = (date: string, time: string) => {
    try {
      const dateTime = new Date(`${date}T${time}`);
      return format(dateTime, "EEE d MMM 'à' HH:mm", { locale: fr });
    } catch (error) {
      return `${date} ${time}`;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmé':
        return 'bg-green-500';
      case 'en_attente':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Prochains rendez-vous
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="flex items-center gap-4">
                  <div className="w-3 h-3 bg-muted rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (upcomingBookings.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Prochains rendez-vous
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Aucun rendez-vous à venir</p>
            <p className="text-sm text-muted-foreground mt-1">
              Planifiez votre prochain rendez-vous dès maintenant !
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Prochains rendez-vous
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {upcomingBookings.map((booking, index) => (
            <div key={booking.id} className="relative">
              {/* Timeline connector */}
              {index < upcomingBookings.length - 1 && (
                <div className="absolute left-[6px] top-6 h-12 w-0.5 bg-border"></div>
              )}
              
              <div className="flex items-start gap-4">
                {/* Timeline dot */}
                <div className={`w-3 h-3 rounded-full mt-2 ${getStatusColor(booking.status)}`}></div>
                
                <div className="flex-1 min-w-0">
                  {/* Relative time badge */}
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className="text-xs">
                      {formatRelativeTime(booking.booking_date, booking.booking_time)}
                    </Badge>
                    {booking.status === 'en_attente' && (
                      <Badge variant="secondary" className="text-xs">
                        En attente
                      </Badge>
                    )}
                  </div>
                  
                  {/* Service name */}
                  <h4 className="font-medium text-sm leading-tight">
                    {booking.service}
                  </h4>
                  
                  {/* Date and time */}
                  <p className="text-sm text-muted-foreground mt-1">
                    {formatDateTime(booking.booking_date, booking.booking_time)}
                  </p>
                  
                  {/* Additional info */}
                  {booking.comments && (
                    <p className="text-xs text-muted-foreground mt-1 truncate">
                      {booking.comments}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* View all link */}
        <div className="mt-6 pt-4 border-t">
          <button className="text-sm text-primary hover:underline">
            Voir tous mes rendez-vous →
          </button>
        </div>
      </CardContent>
    </Card>
  );
};