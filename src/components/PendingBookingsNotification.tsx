
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Bell, Check, X, Clock, Phone, Mail } from 'lucide-react';
import { useSupabaseBookings } from '@/hooks/useSupabaseBookings';
import { supabase } from '@/integrations/supabase/client';

interface PendingBookingsNotificationProps {
  hairdresserId: string;
}

interface Booking {
  id: string;
  client_name: string;
  client_email: string;
  client_phone: string;
  service: string;
  booking_date: string;
  booking_time: string;
  status: string;
  comments?: string;
  expires_at?: string;
  created_at: string;
}

const PendingBookingsNotification = ({ hairdresserId }: PendingBookingsNotificationProps) => {
  const { toast } = useToast();
  const { updateBookingStatus } = useSupabaseBookings();
  const [pendingBookings, setPendingBookings] = useState<Booking[]>([]);
  const [lastNotificationCount, setLastNotificationCount] = useState(0);

  useEffect(() => {
    const fetchPendingBookings = async () => {
      try {
        const { data, error } = await supabase
          .from('bookings')
          .select('*')
          .eq('hairdresser_id', hairdresserId)
          .eq('status', 'pending')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Erreur lors du chargement des réservations:', error);
          return;
        }

        setPendingBookings(data || []);
        
        // Notification sonore et toast pour nouvelles demandes
        if (data && data.length > lastNotificationCount && lastNotificationCount > 0) {
          // Son de notification (optionnel)
          try {
            const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodbjec');
            audio.play().catch(() => {});
          } catch (e) {}
          
          toast({
            title: "🔔 Nouvelle demande de réservation !",
            description: `Vous avez ${data.length} demande${data.length > 1 ? 's' : ''} en attente`,
            duration: 5000,
          });
        }
        
        setLastNotificationCount(data?.length || 0);
      } catch (error) {
        console.error('Erreur:', error);
      }
    };

    fetchPendingBookings();
    
    // Actualiser toutes les 30 secondes
    const interval = setInterval(fetchPendingBookings, 30000);

    // Écouter les changements en temps réel
    const channel = supabase
      .channel('bookings-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookings',
          filter: `hairdresser_id=eq.${hairdresserId}`
        },
        () => {
          fetchPendingBookings();
        }
      )
      .subscribe();

    return () => {
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, [hairdresserId, lastNotificationCount, toast]);

  const handleAcceptBooking = async (bookingId: string, clientName: string) => {
    try {
      await updateBookingStatus(bookingId, 'confirmed');
      // Actualiser la liste après la mise à jour
      setPendingBookings(prev => prev.filter(booking => booking.id !== bookingId));
    } catch (error) {
      console.error('Erreur lors de l\'acceptation:', error);
    }
  };

  const handleRejectBooking = async (bookingId: string, clientName: string) => {
    try {
      await updateBookingStatus(bookingId, 'declined');
      // Actualiser la liste après la mise à jour
      setPendingBookings(prev => prev.filter(booking => booking.id !== bookingId));
    } catch (error) {
      console.error('Erreur lors du refus:', error);
    }
  };

  const getTimeRemaining = (expiresAt?: string) => {
    if (!expiresAt) return null;
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
                    {booking.booking_time}
                  </Badge>
                  <h3 className="font-bold text-gray-800">{booking.client_name}</h3>
                  {booking.expires_at && (
                    <Badge variant="outline" className="text-orange-600 border-orange-300">
                      <Clock className="h-3 w-3 mr-1" />
                      {getTimeRemaining(booking.expires_at)} min restantes
                    </Badge>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600 mb-2">
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 mr-1" />
                    {booking.client_phone}
                  </div>
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 mr-1" />
                    {booking.client_email}
                  </div>
                </div>
                
                <div className="text-sm">
                  <strong>Service:</strong> {booking.service}
                </div>
                <div className="text-sm">
                  <strong>Date:</strong> {new Date(booking.booking_date).toLocaleDateString('fr-FR')}
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
                onClick={() => handleAcceptBooking(booking.id, booking.client_name)}
              >
                <Check className="h-4 w-4 mr-1" />
                Accepter
              </Button>
              <Button
                size="sm"
                variant="destructive"
                className="flex-1"
                onClick={() => handleRejectBooking(booking.id, booking.client_name)}
              >
                <X className="h-4 w-4 mr-1" />
                Refuser
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default PendingBookingsNotification;
