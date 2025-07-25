import { useRoleAuth } from '@/hooks/useRoleAuth';
import { useQueue } from '@/hooks/useQueue';
import { BookingDrawer } from '@/components/stylist/BookingDrawer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, User, Scissors, CalendarClock } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const StylistQueuePage = () => {
  const { userProfile } = useRoleAuth();
  const { queue, loading, refetch } = useQueue(userProfile?.user_id);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (queue.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Clock className="h-8 w-8" />
            File d'attente
          </h1>
          <p className="text-muted-foreground">
            Gérez vos demandes de rendez-vous en attente
          </p>
        </div>
        <div className="text-center py-12">
          <CalendarClock className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Aucune demande en attente
          </h3>
          <p className="text-muted-foreground">
            Toutes vos demandes de rendez-vous ont été traitées
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
          <Clock className="h-8 w-8" />
          File d'attente
        </h1>
        <p className="text-muted-foreground">
          {queue.length} demande{queue.length > 1 ? 's' : ''} en attente de validation
        </p>
      </div>

      <div className="grid gap-4">
        {queue.map((booking) => (
          <BookingDrawer
            key={booking.id}
            booking={{
              ...booking,
              scheduled_at: booking.scheduled_at || new Date().toISOString(),
            }}
            onStatusUpdate={refetch}
          >
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <User className="h-5 w-5" />
                    {booking.client_name}
                  </CardTitle>
                  <Badge variant="secondary">En attente</Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Scissors className="h-4 w-4" />
                    <span>{booking.service}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <CalendarClock className="h-4 w-4" />
                    <span>
                      {booking.scheduled_at ? format(new Date(booking.scheduled_at), "EEEE d MMMM yyyy 'à' HH:mm", { locale: fr }) : 'Date non définie'}
                    </span>
                  </div>
                  {booking.comments && (
                    <div className="mt-3 p-2 bg-muted rounded text-sm">
                      <strong>Commentaire:</strong> {booking.comments}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </BookingDrawer>
        ))}
      </div>
    </div>
  );
};

export default StylistQueuePage;