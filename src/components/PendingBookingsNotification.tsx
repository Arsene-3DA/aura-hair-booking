
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Bell, Check, X, Clock, User, Phone, Mail } from 'lucide-react';
import { useBookings } from '@/contexts/BookingsContext';

interface PendingBookingsNotificationProps {
  hairdresserId: number;
}

const PendingBookingsNotification = ({ hairdresserId }: PendingBookingsNotificationProps) => {
  const { toast } = useToast();
  const { getPendingBookings, updateBookingStatus } = useBookings();
  const [pendingBookings, setPendingBookings] = useState<any[]>([]);
  const [lastNotificationCount, setLastNotificationCount] = useState(0);

  useEffect(() => {
    const updatePendingBookings = () => {
      const pending = getPendingBookings(hairdresserId);
      setPendingBookings(pending);
      
      // Notification sonore et toast pour nouvelles demandes
      if (pending.length > lastNotificationCount && lastNotificationCount > 0) {
        // Son de notification (optionnel)
        try {
          const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodbjec');
          audio.play().catch(() => {});
        } catch (e) {}
        
        toast({
          title: "🔔 Nouvelle demande de réservation !",
          description: `Vous avez ${pending.length} demande${pending.length > 1 ? 's' : ''} en attente`,
          duration: 5000,
        });
      }
      
      setLastNotificationCount(pending.length);
    };

    updatePendingBookings();
    const interval = setInterval(updatePendingBookings, 5000); // Vérifier toutes les 5 secondes

    return () => clearInterval(interval);
  }, [hairdresserId, getPendingBookings, lastNotificationCount, toast]);

  const handleAcceptBooking = (bookingId: number, clientName: string) => {
    updateBookingStatus(bookingId, 'confirmé');
    toast({
      title: "✅ Réservation acceptée",
      description: `La réservation de ${clientName} a été confirmée`,
      duration: 4000,
    });
  };

  const handleRejectBooking = (bookingId: number, clientName: string) => {
    updateBookingStatus(bookingId, 'refusé');
    toast({
      title: "❌ Réservation refusée",
      description: `La réservation de ${clientName} a été refusée. Le créneau est maintenant disponible`,
      duration: 4000,
    });
  };

  const getTimeRemaining = (expiresAt: string) => {
    const now = new Date();
    const expires = new Date(expiresAt);
    const diff = expires.getTime() - now.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    return Math.max(0, minutes);
  };

  if (pendingBookings.length === 0) {
    return null;
  }

  return (
    <Card className="border-orange-200 bg-gradient-to-r from-orange-50 to-yellow-50 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-orange-100 to-yellow-100">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <Bell className="h-5 w-5 mr-2 text-orange-600 animate-pulse" />
            Demandes de réservation en attente
          </div>
          <Badge className="bg-red-500 text-white animate-bounce">
            {pendingBookings.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 p-6">
        {pendingBookings.map((booking) => (
          <div key={booking.id} className="bg-white p-4 rounded-lg border border-orange-200 shadow-sm">
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold">
                    {booking.time}
                  </Badge>
                  <h3 className="font-bold text-gray-800">{booking.clientName}</h3>
                  {booking.expiresAt && (
                    <Badge variant="outline" className="text-orange-600 border-orange-300">
                      <Clock className="h-3 w-3 mr-1" />
                      {getTimeRemaining(booking.expiresAt)} min restantes
                    </Badge>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600 mb-2">
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 mr-1" />
                    {booking.phone}
                  </div>
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 mr-1" />
                    {booking.email}
                  </div>
                </div>
                
                <div className="text-sm">
                  <strong>Service:</strong> {booking.service}
                </div>
                <div className="text-sm">
                  <strong>Date:</strong> {new Date(booking.bookingDate).toLocaleDateString('fr-FR')}
                </div>
                
                {booking.comments && (
                  <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
                    <strong>Commentaires:</strong> {booking.comments}
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button
                size="sm"
                className="bg-green-500 hover:bg-green-600 text-white flex-1"
                onClick={() => handleAcceptBooking(booking.id, booking.clientName)}
              >
                <Check className="h-4 w-4 mr-1" />
                Accepter
              </Button>
              <Button
                size="sm"
                variant="destructive"
                className="flex-1"
                onClick={() => handleRejectBooking(booking.id, booking.clientName)}
              >
                <X className="h-4 w-4 mr-1" />
                Refuser
              </Button>
            </div>
          </div>
        ))}
      </Content>
    </Card>
  );
};

export default PendingBookingsNotification;
