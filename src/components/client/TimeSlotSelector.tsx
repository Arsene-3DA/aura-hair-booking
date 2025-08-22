import { useTimeSlotAvailability } from '@/hooks/useTimeSlotAvailability';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Clock, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TimeSlotSelectorProps {
  stylistId: string;
  selectedDate: Date | null;
  selectedTime: string;
  onTimeSelect: (time: string) => void;
}

export const TimeSlotSelector = ({ 
  stylistId, 
  selectedDate, 
  selectedTime, 
  onTimeSelect 
}: TimeSlotSelectorProps) => {
  const { timeSlots, loading } = useTimeSlotAvailability(stylistId, selectedDate);

  console.log('🕒 TimeSlotSelector - Params:', { stylistId, selectedDate: selectedDate?.toISOString(), selectedTime });

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-2">
        {[...Array(8)].map((_, i) => (
          <Skeleton key={i} className="h-10" />
        ))}
      </div>
    );
  }

  const availableSlots = timeSlots.filter(slot => slot.available);

  console.log('📅 TimeSlotSelector Debug:', {
    stylistId,
    selectedDate,
    totalSlots: timeSlots.length,
    availableSlots: availableSlots.length,
    timeSlots: timeSlots.map(slot => ({ time: slot.time, available: slot.available, booked: slot.booked, unavailable: slot.unavailable }))
  });

  if (availableSlots.length === 0 && !loading) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p>Aucun créneau disponible pour cette date</p>
        <p className="text-sm">Veuillez choisir une autre date</p>
        {timeSlots.length > 0 && (
          <p className="text-xs mt-2">
            {timeSlots.filter(s => s.booked).length} créneaux réservés, {timeSlots.filter(s => s.unavailable).length} indisponibles
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-2">
      {availableSlots.map((slot) => {
        const isSelected = selectedTime === slot.time;
        
        return (
          <Button
            key={slot.time}
            variant={isSelected ? "default" : "outline"}
            onClick={() => onTimeSelect(slot.time)}
            className={cn(
              "w-full relative",
              isSelected && "ring-2 ring-primary"
            )}
            size="sm"
          >
            <Clock className="h-3 w-3 mr-1" />
            {slot.time}
            {slot.booked && (
              <X className="h-3 w-3 ml-1 text-red-500" />
            )}
          </Button>
        );
      })}
    </div>
  );
};