import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAvailability } from '@/hooks/useAvailability';
import { Clock, CheckCircle, XCircle, MinusCircle, Trash2 } from 'lucide-react';
import { format, startOfDay } from 'date-fns';
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
  conflictingSlots?: string[]; // Pour détecter les conflits
}

export const StrictAvailabilityManager: React.FC<AvailabilitySlotManagerProps> = ({ 
  stylistId, 
  selectedDate 
}) => {
  const { availabilities, createAvailability, updateAvailability, deleteAvailability, loading } = useAvailability(stylistId);
  const [processingSlots, setProcessingSlots] = useState<Set<string>>(new Set());

  // Filtrer UNIQUEMENT les créneaux de 30 minutes pour le jour sélectionné
  const dayAvailabilities = useMemo(() => {
    const dayStr = format(selectedDate, 'yyyy-MM-dd');
    
    return availabilities.filter(avail => {
      const availStart = new Date(avail.start_at);
      const availEnd = new Date(avail.end_at);
      const duration = availEnd.getTime() - availStart.getTime();
      const is30Minutes = duration === (30 * 60 * 1000); // Exactement 30 minutes
      const isToday = format(availStart, 'yyyy-MM-dd') === dayStr;
      
      return isToday && is30Minutes;
    });
  }, [availabilities, selectedDate]);

  // Détecter les créneaux problématiques (durée != 30min)
  const problematicSlots = useMemo(() => {
    const dayStr = format(selectedDate, 'yyyy-MM-dd');
    
    return availabilities.filter(avail => {
      const availStart = new Date(avail.start_at);
      const availEnd = new Date(avail.end_at);
      const duration = availEnd.getTime() - availStart.getTime();
      const isNot30Minutes = duration !== (30 * 60 * 1000);
      const isToday = format(availStart, 'yyyy-MM-dd') === dayStr;
      
      return isToday && isNot30Minutes;
    });
  }, [availabilities, selectedDate]);

  // Générer les créneaux de 30 minutes de 9h à 21h30
  const timeSlots: TimeSlot[] = useMemo(() => {
    const slots: TimeSlot[] = [];
    const dayStart = startOfDay(selectedDate);
    
    for (let hour = 9; hour <= 21; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        if (hour === 21 && minute === 30) break;
        
        const slotTime = new Date(dayStart);
        slotTime.setHours(hour, minute, 0, 0);
        
        const timeString = format(slotTime, 'HH:mm');
        
        // Trouver le créneau de 30min EXACT pour cette heure
        const exactAvailability = dayAvailabilities.find(avail => {
          const availStart = new Date(avail.start_at);
          return availStart.getTime() === slotTime.getTime();
        });
        
        // Détecter les conflits potentiels (créneaux qui chevauchent)
        const conflictingSlots = availabilities
          .filter(avail => {
            const availStart = new Date(avail.start_at);
            const availEnd = new Date(avail.end_at);
            const slotEnd = new Date(slotTime);
            slotEnd.setMinutes(slotEnd.getMinutes() + 30);
            
            return (
              format(availStart, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd') &&
              avail.id !== exactAvailability?.id &&
              (
                (availStart >= slotTime && availStart < slotEnd) ||
                (availEnd > slotTime && availEnd <= slotEnd) ||
                (availStart <= slotTime && availEnd >= slotEnd)
              )
            );
          })
          .map(a => a.id);
        
        slots.push({
          time: timeString,
          datetime: slotTime,
          status: exactAvailability ? exactAvailability.status : 'none',
          availabilityId: exactAvailability?.id,
          conflictingSlots: conflictingSlots.length > 0 ? conflictingSlots : undefined
        });
      }
    }
    
    return slots;
  }, [dayAvailabilities, availabilities, selectedDate]);

  const handleSlotClick = async (slot: TimeSlot) => {
    const slotKey = `${format(selectedDate, 'yyyy-MM-dd')}-${slot.time}`;
    
    if (processingSlots.has(slotKey) || loading) return;
    
    console.log('🎯 STRICT SLOT CLICK:', {
      time: slot.time,
      status: slot.status,
      availabilityId: slot.availabilityId,
      conflicting: slot.conflictingSlots
    });
    
    setProcessingSlots(prev => new Set([...prev, slotKey]));
    
    try {
      if (slot.status === 'none') {
        // Créer un nouveau créneau de 30 minutes EXACT
        const endTime = new Date(slot.datetime);
        endTime.setMinutes(endTime.getMinutes() + 30);
        
        await createAvailability({
          start_at: slot.datetime.toISOString(),
          end_at: endTime.toISOString(),
          status: 'available'
        });
      } else if (slot.availabilityId) {
        // Modifier UNIQUEMENT ce créneau spécifique
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
      console.error('❌ Error managing slot:', error);
    } finally {
      setProcessingSlots(prev => {
        const newSet = new Set(prev);
        newSet.delete(slotKey);
        return newSet;
      });
    }
  };

  const cleanupProblematicSlots = async () => {
    if (problematicSlots.length === 0) return;
    
    console.log('🧹 Cleaning up', problematicSlots.length, 'problematic slots');
    
    for (const slot of problematicSlots) {
      try {
        await deleteAvailability(slot.id);
        console.log('🗑️ Deleted problematic slot:', slot.id, 'Duration:', new Date(slot.end_at).getTime() - new Date(slot.start_at).getTime(), 'ms');
      } catch (error) {
        console.error('❌ Error deleting slot:', slot.id, error);
      }
    }
  };

  const getSlotStyle = (slot: TimeSlot) => {
    const slotKey = `${format(selectedDate, 'yyyy-MM-dd')}-${slot.time}`;
    const isProcessing = processingSlots.has(slotKey);
    const hasConflicts = slot.conflictingSlots && slot.conflictingSlots.length > 0;
    
    const baseStyle = "w-full p-3 rounded-lg border-2 transition-all duration-200 hover:scale-105 disabled:scale-100 disabled:opacity-50";
    
    if (isProcessing) {
      return `${baseStyle} bg-muted border-muted-foreground animate-pulse cursor-not-allowed`;
    }
    
    if (hasConflicts) {
      return `${baseStyle} bg-yellow-50 border-yellow-400 text-yellow-800 border-dashed`;
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
    if (slot.conflictingSlots && slot.conflictingSlots.length > 0) {
      return <span className="text-yellow-600">⚠️</span>;
    }
    
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
    if (slot.conflictingSlots && slot.conflictingSlots.length > 0) {
      return 'Conflit';
    }
    
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
    const conflicts = timeSlots.filter(s => s.conflictingSlots && s.conflictingSlots.length > 0).length;
    
    return { available, busy, unavailable, undefined, conflicts };
  }, [timeSlots]);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Gestion Stricte des Créneaux - {format(selectedDate, 'EEEE d MMMM yyyy', { locale: fr })}
        </CardTitle>
        
        {/* Alertes et nettoyage */}
        {problematicSlots.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-yellow-600">⚠️</span>
                <span className="text-sm font-medium">
                  {problematicSlots.length} créneaux problématiques détectés (durée ≠ 30min)
                </span>
              </div>
              <Button
                onClick={cleanupProblematicSlots}
                size="sm"
                variant="outline"
                className="text-yellow-700 border-yellow-300 hover:bg-yellow-100"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Nettoyer
              </Button>
            </div>
          </div>
        )}
        
        {/* Statistiques */}
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
          {stats.conflicts > 0 && (
            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
              ⚠️ Conflits: {stats.conflicts}
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
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
                title={slot.conflictingSlots ? `Conflit avec ${slot.conflictingSlots.length} autre(s) créneau(x)` : undefined}
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
        
        {/* Informations de debug */}
        <div className="text-xs text-muted-foreground bg-muted/20 p-4 rounded-lg">
          <p className="font-medium mb-2">🔍 Statistiques techniques :</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>Total disponibilités: {availabilities.length}</div>
            <div>Créneaux 30min aujourd'hui: {dayAvailabilities.length}</div>
            <div>Créneaux problématiques: {problematicSlots.length}</div>
            <div>Créneaux en conflit: {stats.conflicts}</div>
          </div>
        </div>
        
        {/* Instructions */}
        <div className="text-sm text-muted-foreground bg-muted/20 p-4 rounded-lg">
          <p className="font-medium mb-2">💡 Instructions :</p>
          <ul className="space-y-1 text-xs">
            <li>• <strong>Un clic = un seul créneau de 30min modifié</strong></li>
            <li>• Gris → Vert (disponible) → Rouge (occupé) → Gris (indisponible) → cycle</li>
            <li>• Les créneaux jaunes indiquent des conflits avec d'anciens créneaux</li>
            <li>• Utilisez "Nettoyer" pour supprimer les créneaux problématiques</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};