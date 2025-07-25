import { useState } from 'react';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, User, MessageSquare, Phone, Mail, X } from 'lucide-react';
import { RealtimeBooking } from '@/hooks/useRealtimeBookings';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ReservationDrawerProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  booking: RealtimeBooking | null;
  onBookingUpdated?: () => void;
}

export const ReservationDrawer = ({ 
  isOpen, 
  onOpenChange, 
  booking,
  onBookingUpdated 
}: ReservationDrawerProps) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  if (!booking) return null;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmé':
        return <Badge className="bg-green-500 text-white">Confirmé</Badge>;
      case 'en_attente':
        return <Badge variant="secondary">En attente</Badge>;
      case 'refusé':
        return <Badge variant="destructive">Refusé</Badge>;
      case 'terminé':
        return <Badge variant="outline">Terminé</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const formatDateTime = (date: string, time: string) => {
    try {
      const dateTime = new Date(`${date}T${time}`);
      return format(dateTime, "EEEE d MMMM yyyy 'à' HH:mm", { locale: fr });
    } catch (error) {
      return `${date} à ${time}`;
    }
  };

  const handleCancelBooking = async () => {
    if (!booking) return;
    
    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: 'refusé' })
        .eq('id', booking.id);

      if (error) {
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Impossible d'annuler le rendez-vous. Veuillez réessayer.",
        });
        return;
      }

      toast({
        title: "Rendez-vous annulé",
        description: "Votre rendez-vous a été annulé avec succès.",
      });

      onBookingUpdated?.();
      onOpenChange(false);
    } catch (error) {
      console.error('Error canceling booking:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur inattendue est survenue.",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const canCancelBooking = booking.status === 'en_attente' || booking.status === 'confirmé';
  const isPastBooking = new Date(`${booking.booking_date}T${booking.booking_time}`) < new Date();

  return (
    <Drawer open={isOpen} onOpenChange={onOpenChange}>
      <DrawerContent>
        <div className="mx-auto w-full max-w-sm">
          <DrawerHeader>
            <div className="flex items-center justify-between">
              <DrawerTitle className="text-left">Détails du rendez-vous</DrawerTitle>
              <DrawerClose asChild>
                <Button variant="ghost" size="icon">
                  <X className="h-4 w-4" />
                </Button>
              </DrawerClose>
            </div>
            <DrawerDescription className="text-left">
              Informations et actions disponibles
            </DrawerDescription>
          </DrawerHeader>

          <div className="p-4 space-y-6">
            {/* Status */}
            <div className="flex justify-center">
              {getStatusBadge(booking.status)}
            </div>

            {/* Service and DateTime */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">{booking.service}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDateTime(booking.booking_date, booking.booking_time)}
                  </p>
                </div>
              </div>

              {/* Contact Info */}
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{booking.client_name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{booking.client_email}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{booking.client_phone}</span>
                </div>
              </div>

              {/* Comments */}
              {booking.comments && (
                <div className="flex items-start gap-3">
                  <MessageSquare className="h-4 w-4 text-muted-foreground mt-1" />
                  <div>
                    <p className="text-sm font-medium">Commentaires</p>
                    <p className="text-sm text-muted-foreground">{booking.comments}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <DrawerFooter>
            <div className="space-y-2">
              {/* Cancel Button */}
              {canCancelBooking && !isPastBooking && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      variant="destructive" 
                      className="w-full"
                      disabled={isUpdating}
                    >
                      Annuler le rendez-vous
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Confirmer l'annulation</AlertDialogTitle>
                      <AlertDialogDescription>
                        Êtes-vous sûr de vouloir annuler ce rendez-vous ? Cette action ne peut pas être annulée.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Garder le RDV</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleCancelBooking}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Oui, annuler
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}

              {/* Reschedule Button */}
              {canCancelBooking && !isPastBooking && (
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => {
                    toast({
                      title: "Fonction en développement",
                      description: "La reprogrammation sera bientôt disponible.",
                    });
                  }}
                >
                  Reprogrammer
                </Button>
              )}

              <DrawerClose asChild>
                <Button variant="secondary" className="w-full">
                  Fermer
                </Button>
              </DrawerClose>
            </div>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
};