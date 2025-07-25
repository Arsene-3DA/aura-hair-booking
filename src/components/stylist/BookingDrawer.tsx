import { useState } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Check, X, User, Clock, Scissors } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface BookingDrawerProps {
  booking: {
    id: string;
    client_name: string;
    service: string;
    scheduled_at: string;
    status: string;
    comments?: string;
    client_email?: string;
    client_phone?: string;
  };
  children: React.ReactNode;
  onStatusUpdate?: () => void;
}

export const BookingDrawer = ({ booking, children, onStatusUpdate }: BookingDrawerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [updating, setUpdating] = useState(false);
  const { toast } = useToast();

  const updateBookingStatus = async (status: 'confirmed' | 'declined') => {
    try {
      setUpdating(true);
      const { error } = await supabase
        .from('bookings')
        .update({ status })
        .eq('id', booking.id);

      if (error) throw error;

      toast({
        title: "Succès",
        description: `Réservation ${status === 'confirmed' ? 'confirmée' : 'refusée'}`,
      });

      setIsOpen(false);
      onStatusUpdate?.();
    } catch (error) {
      console.error('Error updating booking:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour la réservation",
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: 'En attente', variant: 'secondary' as const },
      confirmed: { label: 'Confirmé', variant: 'default' as const },
      declined: { label: 'Refusé', variant: 'destructive' as const },
      completed: { label: 'Terminé', variant: 'outline' as const },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerTrigger asChild>
        {children}
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            {booking.client_name}
          </DrawerTitle>
          <DrawerDescription>
            Détails de la réservation
          </DrawerDescription>
        </DrawerHeader>
        <div className="px-4 pb-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Scissors className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{booking.service}</span>
            </div>
            {getStatusBadge(booking.status)}
          </div>

          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>
              {format(new Date(booking.scheduled_at), "EEEE d MMMM yyyy 'à' HH:mm", { locale: fr })}
            </span>
          </div>

          {booking.client_email && (
            <div>
              <span className="text-sm text-muted-foreground">Email: </span>
              <span>{booking.client_email}</span>
            </div>
          )}

          {booking.client_phone && (
            <div>
              <span className="text-sm text-muted-foreground">Téléphone: </span>
              <span>{booking.client_phone}</span>
            </div>
          )}

          {booking.comments && (
            <div>
              <span className="text-sm text-muted-foreground">Commentaires: </span>
              <p className="mt-1 text-sm bg-muted p-2 rounded">{booking.comments}</p>
            </div>
          )}

          {booking.status === 'pending' && (
            <>
              <Separator />
              <div className="flex gap-2">
                <Button
                  onClick={() => updateBookingStatus('confirmed')}
                  disabled={updating}
                  className="flex-1"
                >
                  <Check className="h-4 w-4 mr-2" />
                  Confirmer
                </Button>
                <Button
                  onClick={() => updateBookingStatus('declined')}
                  disabled={updating}
                  variant="destructive"
                  className="flex-1"
                >
                  <X className="h-4 w-4 mr-2" />
                  Refuser
                </Button>
              </div>
            </>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
};