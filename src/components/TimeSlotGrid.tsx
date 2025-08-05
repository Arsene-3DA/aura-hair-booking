import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAvailability } from '@/hooks/useAvailability';
import { Clock } from 'lucide-react';

interface TimeSlotGridProps {
  stylistId: string;
  selectedDate: Date;
}

interface TimeSlot {
  time: string;
  status: 'available' | 'selected' | 'busy' | 'unavailable';
}

export const TimeSlotGrid: React.FC<TimeSlotGridProps> = ({ stylistId, selectedDate }) => {
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
  const { availabilities, createAvailability, updateAvailability } = useAvailability(stylistId);

  // Generate time slots from 9:00 to 21:30
  const generateTimeSlots = (): TimeSlot[] => {
    const slots: TimeSlot[] = [];
    for (let hour = 9; hour <= 21; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        if (hour === 21 && minute === 30) break; // Stop at 21:30
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        
        // Check if this slot has availability data
        const availability = availabilities.find(av => {
          const avDate = new Date(av.start_at);
          const avTime = `${avDate.getHours().toString().padStart(2, '0')}:${avDate.getMinutes().toString().padStart(2, '0')}`;
          return avTime === time && 
                 avDate.toDateString() === selectedDate.toDateString();
        });

        let status: 'available' | 'selected' | 'busy' | 'unavailable' = 'unavailable';
        if (availability) {
          if (availability.status === 'available') {
            status = selectedSlots.includes(time) ? 'selected' : 'available';
          } else if (availability.status === 'busy') {
            status = 'busy';
          }
        }

        slots.push({ time, status });
      }
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  const handleSlotClick = async (time: string, currentStatus: string) => {
    if (currentStatus === 'busy') return; // Can't click on busy slots

    const isSelected = selectedSlots.includes(time);
    
    if (isSelected) {
      // Deselect
      setSelectedSlots(prev => prev.filter(t => t !== time));
    } else {
      // Select
      setSelectedSlots(prev => [...prev, time]);
    }

    // Update availability in database
    const [hours, minutes] = time.split(':').map(Number);
    const slotDate = new Date(selectedDate);
    slotDate.setHours(hours, minutes, 0, 0);
    
    const endDate = new Date(slotDate);
    endDate.setMinutes(endDate.getMinutes() + 30);

    const existingAvailability = availabilities.find(av => {
      const avDate = new Date(av.start_at);
      return avDate.getTime() === slotDate.getTime();
    });

    if (existingAvailability) {
      // Toggle between available and unavailable
      const newStatus = currentStatus === 'available' || isSelected ? 'busy' : 'available';
      await updateAvailability({ id: existingAvailability.id, status: newStatus });
    } else {
      // Create new availability slot
      await createAvailability({
        start_at: slotDate.toISOString(),
        end_at: endDate.toISOString(),
        status: 'available'
      });
    }
  };

  const getSlotButtonClass = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-[hsl(var(--slot-available)/0.2)] text-[hsl(var(--slot-available))] border-[hsl(var(--slot-available)/0.5)] hover:bg-[hsl(var(--slot-available)/0.3)]';
      case 'selected':
        return 'bg-[hsl(var(--primary)/0.2)] text-[hsl(var(--primary))] border-[hsl(var(--primary))] hover:bg-[hsl(var(--primary)/0.3)]';
      case 'busy':
        return 'bg-[hsl(var(--slot-busy)/0.2)] text-[hsl(var(--slot-busy))] border-[hsl(var(--slot-busy)/0.5)] cursor-not-allowed';
      case 'unavailable':
        return 'bg-[hsl(var(--slot-unavailable)/0.2)] text-[hsl(var(--slot-unavailable))] border-[hsl(var(--slot-unavailable)/0.5)] cursor-not-allowed';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Créneaux disponibles
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Cliquez sur un créneau disponible pour le sélectionner
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Time slots grid */}
        <div className="grid grid-cols-6 gap-2">
          {timeSlots.map((slot) => (
            <Button
              key={slot.time}
              variant="outline"
              size="sm"
              className={`h-12 text-sm font-medium transition-all ${getSlotButtonClass(slot.status)}`}
              onClick={() => handleSlotClick(slot.time, slot.status)}
              disabled={slot.status === 'busy' || slot.status === 'unavailable'}
            >
              {slot.time}
            </Button>
          ))}
        </div>

        {/* Legend avec système de couleurs cohérent */}
        <div className="flex flex-wrap gap-4 pt-4 border-t">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-[hsl(var(--slot-available))]"></div>
            <span className="text-sm">Disponible</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-[hsl(var(--primary))]"></div>
            <span className="text-sm">Sélectionné</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-[hsl(var(--slot-busy))]"></div>
            <span className="text-sm">Bloqué</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-[hsl(var(--slot-unavailable))]"></div>
            <span className="text-sm">Indisponible</span>
          </div>
        </div>

        {selectedSlots.length > 0 && (
          <div className="pt-4 border-t">
            <h4 className="text-sm font-medium mb-2">Créneaux sélectionnés:</h4>
            <div className="flex flex-wrap gap-2">
              {selectedSlots.map(time => (
                <Badge key={time} variant="secondary">
                  {time}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};