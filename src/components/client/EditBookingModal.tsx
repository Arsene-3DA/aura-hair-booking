import { useState } from 'react';
import { useBookings } from '@/hooks/useBookings';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { CalendarIcon, Clock } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface EditBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: any;
}

const timeSlots = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00'
];

export const EditBookingModal = ({ isOpen, onClose, booking }: EditBookingModalProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    booking ? new Date(booking.scheduled_at) : undefined
  );
  const [selectedTime, setSelectedTime] = useState<string>(
    booking ? format(new Date(booking.scheduled_at), 'HH:mm') : ''
  );
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!selectedDate || !selectedTime || !booking) return;

    setLoading(true);
    try {
      const [hours, minutes] = selectedTime.split(':');
      const scheduledAt = new Date(selectedDate);
      scheduledAt.setHours(parseInt(hours), parseInt(minutes));

      const response = await fetch('/api/bookings/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: booking.id,
          scheduled_at: scheduledAt.toISOString()
        })
      });

      if (!response.ok) throw new Error('Erreur lors de la mise à jour');

      toast({
        title: "Réservation mise à jour",
        description: "Votre rendez-vous a été modifié avec succès.",
      });

      // Invalider le cache react-query
      queryClient.invalidateQueries({ queryKey: ['upcoming'] });
      onClose();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de modifier la réservation.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Modifier le rendez-vous</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Service info (read-only) */}
          {booking && (
            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="font-medium">{booking.service}</p>
              <p className="text-sm text-muted-foreground">
                avec {booking.stylist_profile?.full_name || booking.stylist_name}
              </p>
            </div>
          )}

          {/* Date Picker */}
          <div className="space-y-2">
            <Label>Nouvelle date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !selectedDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? format(selectedDate, "dd MMMM yyyy", { locale: fr }) : "Choisir une date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  disabled={(date) => date < new Date() || date.getDay() === 0}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                  locale={fr}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Time Picker */}
          {selectedDate && (
            <div className="space-y-2">
              <Label>Nouvelle heure</Label>
              <div className="grid grid-cols-3 gap-2">
                {timeSlots.map((time) => (
                  <Button
                    key={time}
                    variant={selectedTime === time ? "default" : "outline"}
                    onClick={() => setSelectedTime(time)}
                    className="w-full"
                    size="sm"
                  >
                    <Clock className="h-3 w-3 mr-1" />
                    {time}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Annuler
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={!selectedDate || !selectedTime || loading}
              className="flex-1"
            >
              {loading ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};