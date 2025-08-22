import { useState, useEffect } from 'react';
import { Calendar, Clock, CheckCircle, XCircle, Minus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAvailability } from '@/hooks/useAvailability';
import { format, addDays, startOfDay } from 'date-fns';
import { fr } from 'date-fns/locale';

interface RealTimeAvailabilityProps {
  stylistId: string;
  showControls?: boolean; // Pour différencier vue publique vs vue styliste
}

export const RealTimeAvailability = ({ 
  stylistId, 
  showControls = false 
}: RealTimeAvailabilityProps) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const { availabilities, loading } = useAvailability(stylistId);

  // Générer les créneaux pour la date sélectionnée
  const generateTimeSlots = () => {
    const slots = [];
    const startHour = 9;
    const endHour = 21;
    const intervalMinutes = 30;

    for (let hour = startHour; hour <= endHour; hour++) {
      for (let minute = 0; minute < 60; minute += intervalMinutes) {
        if (hour === endHour && minute > 30) break;
        
        const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const slotDateTime = new Date(selectedDate);
        slotDateTime.setHours(hour, minute, 0, 0);
        
        // Trouver la disponibilité correspondante
        const availability = availabilities.find(avail => {
          const availStart = new Date(avail.start_at);
          return Math.abs(availStart.getTime() - slotDateTime.getTime()) < 30 * 60 * 1000; // 30 min tolerance
        });

        // Déterminer le statut
        let status: 'available' | 'busy' | 'unavailable' | 'past' = 'available';
        
        if (slotDateTime <= new Date()) {
          status = 'past';
        } else if (availability) {
          status = availability.status;
        }

        slots.push({
          time: timeStr,
          datetime: slotDateTime,
          status,
          availabilityId: availability?.id
        });
      }
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'available':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'busy':
        return <Minus className="h-4 w-4 text-gray-500" />;
      case 'unavailable':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'past':
        return <Clock className="h-4 w-4 text-gray-400" />;
      default:
        return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'busy':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'unavailable':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'past':
        return 'bg-gray-50 text-gray-400 border-gray-100';
      default:
        return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'available':
        return 'Disponible';
      case 'busy':
        return 'Occupé';
      case 'unavailable':
        return 'Indisponible';
      case 'past':
        return 'Passé';
      default:
        return 'Disponible';
    }
  };

  // Navigation entre les dates
  const goToPreviousDay = () => {
    setSelectedDate(prev => addDays(prev, -1));
  };

  const goToNextDay = () => {
    setSelectedDate(prev => addDays(prev, 1));
  };

  const goToToday = () => {
    setSelectedDate(new Date());
  };

  if (loading) {
    return (
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Disponibilités en temps réel
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Disponibilités en temps réel
        </CardTitle>
        
        {/* Navigation de date */}
        <div className="flex items-center gap-4 pt-4">
          <button
            onClick={goToPreviousDay}
            className="px-3 py-1 text-sm border rounded-lg hover:bg-muted transition-colors"
          >
            ← Précédent
          </button>
          
          <div className="flex-1 text-center">
            <h3 className="font-semibold text-lg">
              {format(selectedDate, 'EEEE d MMMM yyyy', { locale: fr })}
            </h3>
          </div>
          
          <button
            onClick={goToNextDay}
            className="px-3 py-1 text-sm border rounded-lg hover:bg-muted transition-colors"
          >
            Suivant →
          </button>
        </div>
        
        {format(selectedDate, 'yyyy-MM-dd') !== format(new Date(), 'yyyy-MM-dd') && (
          <div className="flex justify-center pt-2">
            <button
              onClick={goToToday}
              className="text-sm text-primary hover:underline"
            >
              Retour à aujourd'hui
            </button>
          </div>
        )}
      </CardHeader>
      
      <CardContent>
        {/* Légende */}
        <div className="flex flex-wrap gap-4 mb-6 p-4 bg-muted/30 rounded-lg">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span className="text-sm">Disponible</span>
          </div>
          <div className="flex items-center gap-2">
            <Minus className="h-4 w-4 text-gray-500" />
            <span className="text-sm">Occupé</span>
          </div>
          <div className="flex items-center gap-2">
            <XCircle className="h-4 w-4 text-red-500" />
            <span className="text-sm">Indisponible</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-gray-400" />
            <span className="text-sm">Passé</span>
          </div>
        </div>

        {/* Grille des créneaux */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
          {timeSlots.map((slot) => (
            <div
              key={slot.time}
              className={`
                p-3 rounded-lg border-2 text-center transition-all duration-200
                ${getStatusColor(slot.status)}
                ${slot.status === 'available' ? 'hover:shadow-md' : ''}
              `}
            >
              <div className="flex items-center justify-center gap-1 mb-1">
                {getStatusIcon(slot.status)}
                <span className="text-sm font-medium">
                  {slot.time}
                </span>
              </div>
              
              <Badge 
                variant="outline" 
                className={`text-xs ${getStatusColor(slot.status)} border-current`}
              >
                {getStatusLabel(slot.status)}
              </Badge>
            </div>
          ))}
        </div>

        {/* Message informatif pour la vue publique */}
        {!showControls && (
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <Clock className="h-4 w-4 inline mr-2" />
              Les créneaux se mettent à jour automatiquement. 
              Les créneaux verts sont disponibles pour réservation.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};