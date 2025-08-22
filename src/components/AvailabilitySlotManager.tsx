import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAvailability } from '@/hooks/useAvailability';
import { Clock, CheckCircle, XCircle, MinusCircle } from 'lucide-react';
import { format, startOfDay, endOfDay } from 'date-fns';
import { fr } from 'date-fns/locale';

interface AvailabilitySlotManagerProps {
  stylistId: string;
  selectedDate: Date;
}

interface TimeSlot {
  time: string;
  datetime: Date;
  status: 'available' | 'busy' | 'unavailable' | 'none';
  availabilityId?: string;
}

export const AvailabilitySlotManager: React.FC<AvailabilitySlotManagerProps> = ({ 
  stylistId, 
  selectedDate 
}) => {
  const { availabilities, createAvailability, updateAvailability, loading } = useAvailability(stylistId);
  const [processingSlots, setProcessingSlots] = useState<Set<string>>(new Set());

  // Générer les créneaux de 30 minutes de 9h à 21h30
  const timeSlots: TimeSlot[] = useMemo(() => {
    const slots: TimeSlot[] = [];
    const dayStart = startOfDay(selectedDate);
    
    // Créer les créneaux de 9h00 à 21h30
    for (let hour = 9; hour <= 21; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        if (hour === 21 && minute === 30) break; // Stop à 21h30
        
        const slotTime = new Date(dayStart);
        slotTime.setHours(hour, minute, 0, 0);
        
        const timeString = format(slotTime, 'HH:mm');
        
        // Trouver la disponibilité correspondante
        const availability = availabilities.find(avail => {
          const availStart = new Date(avail.start_at);
          return (
            format(availStart, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd') &&
            format(availStart, 'HH:mm') === timeString
          );
        });
        
        slots.push({
          time: timeString,
          datetime: slotTime,
          status: availability ? availability.status : 'none',
          availabilityId: availability?.id
        });
      }
    }
    
    return slots;
  }, [availabilities, selectedDate]);

  const handleSlotClick = async (slot: TimeSlot) => {
    const slotKey = `${format(selectedDate, 'yyyy-MM-dd')}-${slot.time}`;
    
    if (processingSlots.has(slotKey) || loading) return;
    
    setProcessingSlots(prev => new Set([...prev, slotKey]));
    
    try {
      if (slot.status === 'none') {
        // Créer un nouveau créneau disponible
        const endTime = new Date(slot.datetime);
        endTime.setMinutes(endTime.getMinutes() + 30);
        
        await createAvailability({
          start_at: slot.datetime.toISOString(),
          end_at: endTime.toISOString(),
          status: 'available'
        });
      } else if (slot.availabilityId) {
        // Changer le statut du créneau existant
        let newStatus: 'available' | 'busy' | 'unavailable';
        
        switch (slot.status) {
          case 'available':
            newStatus = 'busy';
            break;
          case 'busy':
            newStatus = 'unavailable';
            break;
          case 'unavailable':
            newStatus = 'available';
            break;
          default:
            newStatus = 'available';
        }
        
        await updateAvailability({
          id: slot.availabilityId,
          status: newStatus
        });
      }
    } catch (error) {
      console.error('Error managing slot:', error);
    } finally {
      setProcessingSlots(prev => {
        const newSet = new Set(prev);
        newSet.delete(slotKey);
        return newSet;
      });
    }
  };

  const getSlotStyle = (slot: TimeSlot) => {
    const slotKey = `${format(selectedDate, 'yyyy-MM-dd')}-${slot.time}`;
    const isProcessing = processingSlots.has(slotKey);
    
    const baseStyle = "w-full p-3 rounded-lg border-2 transition-all duration-200 hover:scale-105 disabled:scale-100 disabled:opacity-50";
    
    if (isProcessing) {
      return `${baseStyle} bg-muted border-muted-foreground animate-pulse cursor-not-allowed`;
    }
    
    switch (slot.status) {
      case 'available':
        return `${baseStyle} bg-green-50 border-green-200 hover:bg-green-100 text-green-800`;
      case 'busy':
        return `${baseStyle} bg-red-50 border-red-200 hover:bg-red-100 text-red-800`;
      case 'unavailable':
        return `${baseStyle} bg-gray-50 border-gray-200 hover:bg-gray-100 text-gray-800`;
      case 'none':
        return `${baseStyle} bg-background border-border hover:bg-muted text-muted-foreground hover:border-primary`;
      default:
        return baseStyle;
    }
  };

  const getSlotIcon = (slot: TimeSlot) => {
    switch (slot.status) {
      case 'available':
        return <CheckCircle className="h-4 w-4" />;
      case 'busy':
        return <XCircle className="h-4 w-4" />;
      case 'unavailable':
        return <MinusCircle className="h-4 w-4" />;
      case 'none':
        return <Clock className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getSlotLabel = (slot: TimeSlot) => {
    switch (slot.status) {
      case 'available':
        return 'Disponible';
      case 'busy':
        return 'Occupé';
      case 'unavailable':
        return 'Indisponible';
      case 'none':
        return 'Non défini';
      default:
        return 'Non défini';
    }
  };

  const stats = useMemo(() => {
    const available = timeSlots.filter(s => s.status === 'available').length;
    const busy = timeSlots.filter(s => s.status === 'busy').length;
    const unavailable = timeSlots.filter(s => s.status === 'unavailable').length;
    const undefined = timeSlots.filter(s => s.status === 'none').length;
    
    return { available, busy, unavailable, undefined };
  }, [timeSlots]);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Gestion des créneaux - {format(selectedDate, 'EEEE d MMMM yyyy', { locale: fr })}
        </CardTitle>
        
        {/* Statistiques rapides */}
        <div className="flex flex-wrap gap-2 mt-4">
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            ✅ Disponibles: {stats.available}
          </Badge>
          <Badge variant="secondary" className="bg-red-100 text-red-800">
            ❌ Occupés: {stats.busy}
          </Badge>
          <Badge variant="secondary" className="bg-gray-100 text-gray-800">
            🚫 Indisponibles: {stats.unavailable}
          </Badge>
          <Badge variant="outline">
            ⚪ Non définis: {stats.undefined}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Légende */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted/30 rounded-lg">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span className="text-sm">Disponible</span>
          </div>
          <div className="flex items-center gap-2">
            <XCircle className="h-4 w-4 text-red-600" />
            <span className="text-sm">Occupé</span>
          </div>
          <div className="flex items-center gap-2">
            <MinusCircle className="h-4 w-4 text-gray-600" />
            <span className="text-sm">Indisponible</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">Non défini</span>
          </div>
        </div>

        {/* Grille des créneaux */}
        <div className="grid grid-cols-3 md:grid-cols-6 lg:grid-cols-8 gap-2">
          {timeSlots.map((slot) => {
            const slotKey = `${format(selectedDate, 'yyyy-MM-dd')}-${slot.time}`;
            const isProcessing = processingSlots.has(slotKey);
            
            return (
              <Button
                key={slotKey}
                onClick={() => handleSlotClick(slot)}
                disabled={isProcessing || loading}
                className={getSlotStyle(slot)}
                variant="outline"
              >
                <div className="flex flex-col items-center gap-1">
                  {getSlotIcon(slot)}
                  <span className="text-xs font-mono">{slot.time}</span>
                  <span className="text-xs">{getSlotLabel(slot)}</span>
                </div>
              </Button>
            );
          })}
        </div>
        
        {/* Instructions */}
        <div className="text-sm text-muted-foreground bg-muted/20 p-4 rounded-lg">
          <p className="font-medium mb-2">💡 Instructions :</p>
          <ul className="space-y-1 text-xs">
            <li>• <strong>Cliquez</strong> sur un créneau gris pour le rendre disponible</li>
            <li>• <strong>Cliquez</strong> sur un créneau vert pour le bloquer (occupé)</li>
            <li>• <strong>Cliquez</strong> sur un créneau rouge pour le rendre indisponible</li>
            <li>• <strong>Cliquez</strong> sur un créneau gris pour le rendre disponible</li>
            <li>• Chaque créneau est <strong>indépendant</strong> et se met à jour <strong>immédiatement</strong></li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};