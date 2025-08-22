import { usePublicAvailability } from '@/hooks/usePublicAvailability';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Clock } from 'lucide-react';
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
  const { timeSlots, loading, error } = usePublicAvailability(stylistId, selectedDate);

  console.log('🕒 TimeSlotSelector - Params:', { 
    stylistId, 
    selectedDate: selectedDate?.toISOString(), 
    selectedTime,
    timeSlots: timeSlots?.length || 0,
    loading,
    error,
    availableSlots: timeSlots?.filter(slot => slot.is_available)?.length || 0
  });

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-2">
        {[...Array(8)].map((_, i) => (
          <Skeleton key={i} className="h-10" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-destructive">
        <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p>{error}</p>
      </div>
    );
  }

  if (!timeSlots || timeSlots.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p>Aucun créneau disponible pour cette date</p>
        <p className="text-sm">Veuillez choisir une autre date</p>
      </div>
    );
  }

  const availableSlots = timeSlots.filter(slot => slot.is_available);

  if (availableSlots.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p>Aucun créneau disponible pour cette date</p>
        <p className="text-sm">Veuillez choisir une autre date</p>
        <p className="text-xs mt-2">
          {timeSlots.length} créneaux trouvés mais tous indisponibles
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-2">
      {availableSlots.map((slot) => {
        const isSelected = selectedTime === slot.time_slot;
        
        return (
          <Button
            key={slot.time_slot}
            variant={isSelected ? "default" : "outline"}
            onClick={() => onTimeSelect(slot.time_slot)}
            className={cn(
              "w-full relative",
              isSelected && "ring-2 ring-primary"
            )}
            size="sm"
          >
            <Clock className="h-3 w-3 mr-1" />
            {slot.time_slot}
          </Button>
        );
      })}
    </div>
  );
};