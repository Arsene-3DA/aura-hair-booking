
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";
import { Calendar as CalendarIcon, Clock, Users, Settings, LogOut, Bell, Eye, Filter } from 'lucide-react';
import WorkingHoursModal from '../components/WorkingHoursModal';
import BookingDetailsModal from '../components/BookingDetailsModal';
import { useBookings } from '@/contexts/BookingsContext';

const HairdresserDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { getBookingsForHairdresser, getBookingsForDate } = useBookings();
  
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [unavailableDates, setUnavailableDates] = useState<Date[]>([]);
  const [isWorkingHoursModalOpen, setIsWorkingHoursModalOpen] = useState(false);
  const [isBookingDetailsModalOpen, setIsBookingDetailsModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [workingHours, setWorkingHours] = useState({ start: '09:00', end: '20:00' });
  const [viewMode, setViewMode] = useState<'today' | 'selected' | 'week'>('today');

  // ID du coiffeur connecté (Thomas Moreau = 1)
  const currentHairdresserId = 1;

  // Obtenir les réservations pour la date sélectionnée
  const getBookingsForDateFormatted = (date: Date) => {
    const dateKey = date.toISOString().split('T')[0];
    return getBookingsForDate(currentHairdresserId, dateKey);
  };

  // Obtenir les réservations de la semaine
  const getWeekBookings = () => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    
    const weekBookings = [];
    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(startOfWeek);
      currentDate.setDate(startOfWeek.getDate() + i);
      const dayBookings = getBookingsForDateFormatted(currentDate);
      if (dayBookings.length > 0) {
        weekBookings.push({
          date: currentDate,
          bookings: dayBookings,
          dayName: currentDate.toLocaleDateString('fr-FR', { weekday: 'long' })
        });
      }
    }
    return weekBookings;
  };

  const selectedDateBookings = getBookingsForDateFormatted(selectedDate);
  const todayBookings = getBookingsForDateFormatted(new Date());
  const weekBookings = getWeekBookings();
  const allHairdresserBookings = getBookingsForHairdresser(currentHairdresserId);

  const handleLogout = () => {
    toast({
      title: "Déconnexion",
      description: "À bientôt !"
    });
    navigate('/');
  };

  const toggleDateAvailability = (date: Date) => {
    const isUnavailable = unavailableDates.some(d => 
      d.toDateString() === date.toDateString()
    );
    
    if (isUnavailable) {
      setUnavailableDates(unavailableDates.filter(d => 
        d.toDateString() !== date.toDateString()
      ));
      toast({
        title: "Disponibilité activée",
        description: `Vous êtes maintenant disponible le ${date.toLocaleDateString()}`
      });
    } else {
      setUnavailableDates([...unavailableDates, date]);
      toast({
        title: "Jour bloqué",
        description: `Vous êtes indisponible le ${date.toLocaleDateString()}`
      });
    }
  };

  const handleBookingClick = (booking: any) => {
    setSelectedBooking(booking);
    setIsBookingDetailsModalOpen(true);
  };

  const handleWorkingHoursSave = (hours: { start: string; end: string }) => {
    setWorkingHours(hours);
  };

  // Compter les nouvelles réservations
  const newBookingsCount = selectedDateBookings.filter(apt => apt.status === 'nouveau').length;
  const totalNewBookings = allHairdresserBookings.filter(apt => apt.status === 'nouveau').length;
  const totalBookings = allHairdresserBookings.length;

  // Obtenir les dates avec des réservations
  const datesWithBookings = allHairdresserBookings.map(booking => 
    new Date(booking.bookingDate)
  );

  const renderBookingCard = (appointment: any) => (
    <div
      key={appointment.id}
      className={`p-4 border rounded-lg hover:shadow-md transition-all duration-200 cursor-pointer transform hover:scale-[1.02] ${
        appointment.status === 'nouveau' ? 'border-green-300 bg-gradient-to-r from-green-50 to-emerald-50 shadow-sm' : 'border-gray-200 bg-white'
      }`}
      onClick={() => handleBookingClick(appointment)}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <Badge className="bg-gradient-gold text-white font-semibold px-3 py-1">
              {appointment.time}
            </Badge>
            <h3 className="font-bold text-gray-800 text-lg">{appointment.clientName}</h3>
            <Badge 
              variant={appointment.status === 'confirmé' ? 'default' : 'secondary'}
              className={`${appointment.status === 'nouveau' ? 'bg-green-500 text-white animate-pulse' : ''} font-medium`}
            >
              {appointment.status === 'nouveau' ? '🆕 NOUVEAU' : '✅ CONFIRMÉ'}
            </Badge>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div className="flex items-center text-gray-600">
              <span className="font-medium mr-2">📱</span> {appointment.phone}
            </div>
            <div className="flex items-center text-gray-600">
              <span className="font-medium mr-2">✉️</span> {appointment.email}
            </div>
            <div className="flex items-center text-blue-600 font-medium col-span-full">
              <span className="mr-2">✂️</span> {appointment.service}
            </div>
          </div>
          
          {appointment.comments && (
            <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm">
              <span className="font-medium text-amber-700">💬 Note:</span> {appointment.comments}
            </div>
          )}
        </div>
        
        <div className="flex flex-col gap-2 ml-4">
          <Button size="sm" variant="outline" className="text-blue-600 border-blue-200 hover:bg-blue-50">
            Modifier
          </Button>
          <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50">
            Annuler
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold gradient-text">Dashboard Coiffeur</h1>
              <p className="text-gray-600">Bienvenue, Thomas Moreau</p>
            </div>
            <div className="flex gap-2 items-center">
              {totalNewBookings > 0 && (
                <div className="relative">
                  <Bell className="h-6 w-6 text-gold-500" />
                  <Badge className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-1 min-w-[20px] h-5 flex items-center justify-center rounded-full animate-bounce">
                    {totalNewBookings}
                  </Badge>
                </div>
              )}
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setIsWorkingHoursModalOpen(true)}
              >
                <Clock className="h-4 w-4 mr-2" />
                Horaires ({workingHours.start}-{workingHours.end})
              </Button>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Profil
              </Button>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Déconnexion
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Statistiques globales */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-gold-200 bg-gradient-to-br from-gold-50 to-orange-50">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-gold-600 mb-2">{totalBookings}</div>
              <div className="text-sm text-gray-600 font-medium">Total Réservations</div>
            </CardContent>
          </Card>
          <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-sky-50">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">{todayBookings.length}</div>
              <div className="text-sm text-gray-600 font-medium">Aujourd'hui</div>
            </CardContent>
          </Card>
          <Card className="border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">{totalNewBookings}</div>
              <div className="text-sm text-gray-600 font-medium">Nouvelles</div>
            </CardContent>
          </Card>
          <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-violet-50">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">{weekBookings.length}</div>
              <div className="text-sm text-gray-600 font-medium">Jours actifs</div>
            </CardContent>
          </Card>
        </div>

        {/* Modes de vue */}
        <div className="mb-6">
          <div className="flex gap-2">
            <Button
              variant={viewMode === 'today' ? 'default' : 'outline'}
              onClick={() => setViewMode('today')}
              className={viewMode === 'today' ? 'bg-gradient-gold text-white' : ''}
            >
              <CalendarIcon className="h-4 w-4 mr-2" />
              Aujourd'hui
            </Button>
            <Button
              variant={viewMode === 'selected' ? 'default' : 'outline'}
              onClick={() => setViewMode('selected')}
              className={viewMode === 'selected' ? 'bg-gradient-gold text-white' : ''}
            >
              <Eye className="h-4 w-4 mr-2" />
              Date sélectionnée
            </Button>
            <Button
              variant={viewMode === 'week' ? 'default' : 'outline'}
              onClick={() => setViewMode('week')}
              className={viewMode === 'week' ? 'bg-gradient-gold text-white' : ''}
            >
              <Filter className="h-4 w-4 mr-2" />
              Vue semaine
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Calendrier */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CalendarIcon className="h-5 w-5 mr-2 text-gold-500" />
                  Calendrier des réservations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  className="rounded-md border"
                  modifiers={{
                    unavailable: unavailableDates,
                    hasBookings: datesWithBookings
                  }}
                  modifiersStyles={{
                    unavailable: { 
                      backgroundColor: '#fee2e2', 
                      color: '#dc2626',
                      textDecoration: 'line-through'
                    },
                    hasBookings: {
                      backgroundColor: '#dbeafe',
                      color: '#1d4ed8',
                      fontWeight: 'bold'
                    }
                  }}
                />
                
                <div className="mt-4 space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleDateAvailability(selectedDate)}
                    className="w-full"
                  >
                    {unavailableDates.some(d => 
                      d.toDateString() === selectedDate.toDateString()
                    ) ? 'Débloquer ce jour' : 'Bloquer ce jour'}
                  </Button>
                  
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>• <span className="inline-block w-3 h-3 bg-blue-200 rounded"></span> Jours avec RDV</p>
                    <p>• <span className="inline-block w-3 h-3 bg-red-200 rounded"></span> Jours bloqués</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contenu principal selon le mode */}
          <div className="lg:col-span-2">
            {viewMode === 'today' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center">
                      <CalendarIcon className="h-5 w-5 mr-2 text-gold-500" />
                      Mes rendez-vous d'aujourd'hui
                    </div>
                    <Badge variant="secondary" className="bg-gold-100 text-gold-800">
                      <Users className="h-4 w-4 mr-1" />
                      {todayBookings.length} client{todayBookings.length > 1 ? 's' : ''}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {todayBookings.map(renderBookingCard)}
                    {todayBookings.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <Clock className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                        <p className="font-medium">Aucune réservation aujourd'hui</p>
                        <p className="text-sm">Profitez de cette journée libre !</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {viewMode === 'selected' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Eye className="h-5 w-5 mr-2 text-gold-500" />
                      Réservations du {selectedDate.toLocaleDateString('fr-FR')}
                    </div>
                    <Badge variant="secondary">
                      <Users className="h-4 w-4 mr-1" />
                      {selectedDateBookings.length} client{selectedDateBookings.length > 1 ? 's' : ''}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {selectedDateBookings.map(renderBookingCard)}
                    {selectedDateBookings.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <Clock className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                        <p className="font-medium">Aucune réservation pour cette date</p>
                        <p className="text-sm">Sélectionnez une autre date dans le calendrier</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {viewMode === 'week' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Filter className="h-5 w-5 mr-2 text-gold-500" />
                    Vue d'ensemble de la semaine
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {weekBookings.map((day, index) => (
                      <div key={index} className="border-l-4 border-gold-400 pl-4">
                        <h3 className="font-bold text-lg text-gray-800 mb-3 capitalize">
                          {day.dayName} - {day.date.toLocaleDateString('fr-FR')}
                          <Badge className="ml-2 bg-gold-100 text-gold-800">
                            {day.bookings.length} RDV
                          </Badge>
                        </h3>
                        <div className="space-y-3">
                          {day.bookings.map(renderBookingCard)}
                        </div>
                      </div>
                    ))}
                    {weekBookings.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <Calendar className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                        <p className="font-medium">Aucune réservation cette semaine</p>
                        <p className="text-sm">Une semaine tranquille vous attend !</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <WorkingHoursModal
        isOpen={isWorkingHoursModalOpen}
        onClose={() => setIsWorkingHoursModalOpen(false)}
        currentHours={workingHours}
        onSave={handleWorkingHoursSave}
      />

      <BookingDetailsModal
        isOpen={isBookingDetailsModalOpen}
        onClose={() => setIsBookingDetailsModalOpen(false)}
        booking={selectedBooking}
      />
    </div>
  );
};

export default HairdresserDashboard;
