
import { useState, useEffect } from 'react';
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Clock, Calendar as CalendarIcon, CheckCircle, Info } from 'lucide-react';
import { format, addDays, isSameDay, isAfter, isBefore } from 'date-fns';
import { fr } from 'date-fns/locale';

interface TimeSlot {
  time: string;
  available: boolean;
  booked?: boolean;
}

interface BookingCalendarProps {
  hairdresserId: string;
  onTimeSlotSelect: (date: string, time: string) => void;
  selectedDate?: string;
  selectedTime?: string;
}

const BookingCalendar = ({ hairdresserId, onTimeSlotSelect, selectedDate, selectedTime }: BookingCalendarProps) => {
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<Date>();
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Horaires de travail par défaut (9h-18h)
  const workingHours = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
    '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'
  ];

  // Générer les créneaux disponibles pour une date donnée
  const generateTimeSlots = (date: Date): TimeSlot[] => {
    const today = new Date();
    const isToday = isSameDay(date, today);
    const currentHour = today.getHours();
    const currentMinutes = today.getMinutes();

    return workingHours.map(time => {
      const [hours, minutes] = time.split(':').map(Number);
      let available = true;

      // Si c'est aujourd'hui, désactiver les créneaux passés
      if (isToday) {
        if (hours < currentHour || (hours === currentHour && minutes <= currentMinutes)) {
          available = false;
        }
      }

      // Simuler quelques créneaux déjà réservés (en réalité, on interrogerait la base de données)
      const isBooked = Math.random() > 0.8; // 20% de chance d'être réservé
      if (isBooked) {
        available = false;
      }

      return {
        time,
        available,
        booked: isBooked
      };
    });
  };

  // Charger les créneaux quand une date est sélectionnée
  useEffect(() => {
    if (selectedCalendarDate) {
      setLoadingSlots(true);
      // Simuler un délai de chargement
      setTimeout(() => {
        const slots = generateTimeSlots(selectedCalendarDate);
        setAvailableSlots(slots);
        setLoadingSlots(false);
      }, 500);
    }
  }, [selectedCalendarDate]);

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedCalendarDate(date);
    }
  };

  const handleTimeSlotClick = (time: string) => {
    if (selectedCalendarDate) {
      const dateString = format(selectedCalendarDate, 'yyyy-MM-dd');
      onTimeSlotSelect(dateString, time);
    }
  };

  const isDateDisabled = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to start of day
    const maxDate = addDays(today, 60); // Réservation jusqu'à 2 mois à l'avance
    
    const dateToCheck = new Date(date);
    dateToCheck.setHours(0, 0, 0, 0);
    
    return (
      isBefore(dateToCheck, today) || 
      isAfter(dateToCheck, maxDate) ||
      date.getDay() === 0 // Dimanche fermé
    );
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return isSameDay(date, today);
  };

  return (
    <TooltipProvider>
      <div className="space-y-6">
      {/* Calendrier */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <CalendarIcon className="h-5 w-5 mr-2 text-gold-500" />
            Choisissez une date
          </CardTitle>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-4 w-4 cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <div className="space-y-1">
                  <p>• La date d'aujourd'hui est mise en évidence en orange</p>
                  <p>• Les dimanches sont fermés</p>
                  <p>• Réservations possibles jusqu'à 2 mois à l'avance</p>
                </div>
              </TooltipContent>
            </Tooltip>
            <span>Cliquez sur l'icône pour plus d'informations</span>
          </div>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={selectedCalendarDate}
            onSelect={handleDateSelect}
            disabled={isDateDisabled}
            locale={fr}
            className="rounded-md border"
            modifiers={{
              today: (date) => isToday(date)
            }}
            modifiersStyles={{
              today: { 
                backgroundColor: '#fbbf24', 
                color: 'white',
                fontWeight: 'bold',
                borderRadius: '50%'
              }
            }}
          />
          
          {selectedCalendarDate && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm font-medium text-blue-800">
                Date sélectionnée : {format(selectedCalendarDate, 'EEEE d MMMM yyyy', { locale: fr })}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Créneaux horaires */}
      {selectedCalendarDate && (
        <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <Clock className="h-5 w-5 mr-2 text-gold-500" />
            Créneaux disponibles
          </CardTitle>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-4 w-4 cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <div className="space-y-1">
                  <p>• Vert : Créneaux disponibles</p>
                  <p>• Orange : Créneau sélectionné</p>
                  <p>• Gris : Créneaux occupés ou passés</p>
                </div>
              </TooltipContent>
            </Tooltip>
            <span>Cliquez sur un créneau disponible pour le sélectionner</span>
          </div>
        </CardHeader>
          <CardContent>
            {loadingSlots ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold-500"></div>
                <span className="ml-3 text-gray-600">Chargement des créneaux...</span>
              </div>
            ) : (
              <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {availableSlots.map((slot) => {
                  const isSelected = selectedTime === slot.time;
                  
                  return (
                    <Button
                      key={slot.time}
                      variant={isSelected ? "default" : "outline"}
                      className={`
                        h-12 text-sm relative
                        ${isSelected 
                          ? 'bg-gold-500 hover:bg-gold-600 text-white' 
                          : slot.available 
                            ? 'hover:bg-gold-50 hover:border-gold-300 text-gray-700' 
                            : 'opacity-50 cursor-not-allowed bg-gray-100 text-gray-400'
                        }
                      `}
                      disabled={!slot.available}
                      onClick={() => slot.available && handleTimeSlotClick(slot.time)}
                    >
                      {slot.time}
                      {isSelected && (
                        <CheckCircle className="h-4 w-4 absolute -top-1 -right-1 text-green-500 bg-white rounded-full" />
                      )}
                      {slot.booked && !isSelected && (
                        <div className="absolute inset-0 bg-red-500/20 rounded-md flex items-center justify-center">
                          <span className="text-xs text-red-600 font-semibold">Occupé</span>
                        </div>
                      )}
                    </Button>
                  );
                })}
              </div>
            )}
            
            {!loadingSlots && availableSlots.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-4 text-sm">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-100 border border-green-300 rounded mr-2"></div>
                  <span className="text-gray-600">Disponible</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-gold-500 rounded mr-2"></div>
                  <span className="text-gray-600">Sélectionné</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-red-100 border border-red-300 rounded mr-2"></div>
                  <span className="text-gray-600">Occupé</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {selectedDate && selectedTime && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center text-green-800">
              <CheckCircle className="h-5 w-5 mr-2" />
              <div>
                <p className="font-medium">Créneau sélectionné</p>
                <p className="text-sm">
                  {format(new Date(selectedDate + 'T00:00:00'), 'EEEE d MMMM yyyy', { locale: fr })} à {selectedTime}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      </div>
    </TooltipProvider>
  );
};

export default BookingCalendar;
