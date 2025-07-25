import { useState } from 'react';
import { useQueue } from '@/hooks/useQueue';
import { useRoleAuth } from '@/hooks/useRoleAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Check, 
  X, 
  Clock, 
  User, 
  Phone, 
  Mail, 
  MessageSquare,
  Calendar
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const BookingQueue = () => {
  const { user } = useRoleAuth();
  const { queue, loading, error, approveBooking, rejectBooking } = useQueue(user?.id);
  const { toast } = useToast();
  const [processingId, setProcessingId] = useState<string | null>(null);

  const handleApprove = async (bookingId: string) => {
    setProcessingId(bookingId);
    try {
      await approveBooking(bookingId);
      toast({
        title: "Réservation confirmée",
        description: "La réservation a été confirmée avec succès.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error instanceof Error ? error.message : "Une erreur est survenue",
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (bookingId: string) => {
    setProcessingId(bookingId);
    try {
      await rejectBooking(bookingId);
      toast({
        title: "Réservation refusée",
        description: "La réservation a été refusée.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error instanceof Error ? error.message : "Une erreur est survenue",
      });
    } finally {
      setProcessingId(null);
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

  if (loading) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">File d'attente</h1>
          <p className="text-muted-foreground">Demandes de réservation en attente</p>
        </div>
        
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <div className="animate-pulse space-y-3">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                  <div className="h-8 bg-muted rounded w-24"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">File d'attente</h1>
          <p className="text-muted-foreground">Demandes de réservation en attente</p>
        </div>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <X className="h-12 w-12 text-destructive mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Erreur de chargement</h3>
              <p className="text-muted-foreground">{error}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">File d'attente</h1>
          <p className="text-muted-foreground">
            {queue.length} demande{queue.length > 1 ? 's' : ''} en attente
          </p>
        </div>
        
        {queue.length > 0 && (
          <Badge variant="secondary" className="px-3 py-1">
            <Clock className="w-3 h-3 mr-1" />
            Temps réel
          </Badge>
        )}
      </div>

      {/* Queue Items */}
      {queue.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <Check className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Aucune demande en attente</h3>
              <p className="text-muted-foreground">
                Toutes vos demandes de réservation ont été traitées !
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {queue.map((booking) => (
            <Card key={booking.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{booking.service}</CardTitle>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4 mr-1" />
                      {formatDateTime(booking.booking_date, booking.booking_time)}
                    </div>
                  </div>
                  <Badge variant="outline">
                    {format(new Date(booking.created_at), 'HH:mm')}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Client Info */}
                <div className="space-y-2">
                  <div className="flex items-center text-sm">
                    <User className="w-4 h-4 mr-2 text-muted-foreground" />
                    <span className="font-medium">{booking.client_name}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Mail className="w-4 h-4 mr-2 text-muted-foreground" />
                    <span>{booking.client_email}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Phone className="w-4 h-4 mr-2 text-muted-foreground" />
                    <span>{booking.client_phone}</span>
                  </div>
                </div>

                {/* Comments */}
                {booking.comments && (
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="flex items-start gap-2">
                      <MessageSquare className="w-4 h-4 mt-0.5 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Commentaires :</p>
                        <p className="text-sm text-muted-foreground">{booking.comments}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Button
                    onClick={() => handleApprove(booking.id)}
                    disabled={processingId === booking.id}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Confirmer
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => handleReject(booking.id)}
                    disabled={processingId === booking.id}
                    className="flex-1"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Refuser
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default BookingQueue;