import { useStylistReservations } from '@/hooks/useStylistReservations';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, User, Scissors, CalendarClock, Check, X, Mail, Phone } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const StylistQueuePage = () => {
  const { reservations, loading, confirmReservation, declineReservation } = useStylistReservations();
  
  const pendingReservations = reservations.filter(r => r.status === 'pending');

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (pendingReservations.length === 0) {
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
          {pendingReservations.length} demande{pendingReservations.length > 1 ? 's' : ''} en attente de validation
        </p>
      </div>

      <div className="grid gap-4">
        {pendingReservations.map((reservation) => (
          <Card key={reservation.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <User className="h-5 w-5" />
                  {reservation.client_name || 'Client inconnu'}
                </CardTitle>
                <Badge variant="secondary">En attente</Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                {/* Client Information */}
                <div className="space-y-2">
                  {reservation.client_email && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="h-4 w-4" />
                      <span className="text-sm">{reservation.client_email}</span>
                    </div>
                  )}
                  {reservation.client_phone && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="h-4 w-4" />
                      <span className="text-sm">{reservation.client_phone}</span>
                    </div>
                  )}
                </div>

                {/* Service Information */}
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Scissors className="h-4 w-4" />
                  <div>
                    <span className="font-medium">{reservation.service_name || 'Service non spécifié'}</span>
                    {reservation.service_price && (
                      <span className="ml-2 text-sm">({reservation.service_price}€)</span>
                    )}
                    {reservation.service_duration && (
                      <span className="ml-2 text-sm">- {reservation.service_duration}min</span>
                    )}
                  </div>
                </div>

                {/* Date and Time */}
                <div className="flex items-center gap-2 text-muted-foreground">
                  <CalendarClock className="h-4 w-4" />
                  <span>
                    {format(new Date(reservation.scheduled_at), "EEEE d MMMM yyyy 'à' HH:mm", { locale: fr })}
                  </span>
                </div>

                {/* Notes */}
                {reservation.notes && (
                  <div className="mt-3 p-2 bg-muted rounded text-sm">
                    <strong>Notes:</strong> {reservation.notes}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2 pt-3">
                  <Button 
                    onClick={() => confirmReservation(reservation.id)}
                    className="flex-1"
                    size="sm"
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Confirmer
                  </Button>
                  <Button 
                    onClick={() => declineReservation(reservation.id)}
                    variant="outline"
                    className="flex-1"
                    size="sm"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Refuser
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default StylistQueuePage;