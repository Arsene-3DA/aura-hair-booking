
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";
import { Calendar as CalendarIcon, Clock, Users, Settings, LogOut, Bell, Eye } from 'lucide-react';
import WorkingHoursModal from '../components/WorkingHoursModal';
import BookingDetailsModal from '../components/BookingDetailsModal';

const HairdresserDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [unavailableDates, setUnavailableDates] = useState<Date[]>([]);
  const [isWorkingHoursModalOpen, setIsWorkingHoursModalOpen] = useState(false);
  const [isBookingDetailsModalOpen, setIsBookingDetailsModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [workingHours, setWorkingHours] = useState({ start: '09:00', end: '20:00' });

  // Données simulées des réservations par jour avec plus de détails
  const allBookings = {
    '2024-12-27': [
      {
        id: 1,
        time: '09:00',
        clientName: 'Marie Dubois',
        phone: '06 12 34 56 78',
        email: 'marie.dubois@email.com',
        service: 'Coupe Femme',
        status: 'confirmé',
        date: 'Aujourd\'hui',
        comments: 'Première visite, souhaite un changement de style'
      },
      {
        id: 2,
        time: '10:30',
        clientName: 'Jean Martin',
        phone: '06 98 76 54 32',
        email: 'jean.martin@email.com',
        service: 'Coupe Homme',
        status: 'confirmé',
        date: 'Aujourd\'hui',
        comments: ''
      },
      {
        id: 3,
        time: '14:00',
        clientName: 'Sophie Laurent',
        phone: '06 11 22 33 44',
        email: 'sophie.laurent@email.com',
        service: 'Couleur + Coupe',
        status: 'nouveau',
        date: 'Aujourd\'hui',
        comments: 'Souhaite passer au blond'
      },
      {
        id: 4,
        time: '16:00',
        clientName: 'Alice Moreau',
        phone: '06 55 44 33 22',
        email: 'alice.moreau@email.com',
        service: 'Balayage',
        status: 'nouveau',
        date: 'Aujourd\'hui',
        comments: 'Référée par Marie Dubois'
      }
    ],
    '2024-12-28': [
      {
        id: 5,
        time: '09:30',
        clientName: 'Pierre Durand',
        phone: '06 77 88 99 00',
        email: 'pierre.durand@email.com',
        service: 'Coupe + Barbe',
        status: 'confirmé',
        date: 'Demain',
        comments: 'Client régulier'
      },
      {
        id: 6,
        time: '15:00',
        clientName: 'Emma Bernard',
        phone: '06 33 44 55 66',
        email: 'emma.bernard@email.com',
        service: 'Mèches',
        status: 'nouveau',
        date: 'Demain',
        comments: 'Souhaite des mèches californiennes'
      }
    ]
  };

  // Obtenir les réservations pour la date sélectionnée
  const getBookingsForDate = (date: Date) => {
    const dateKey = date.toISOString().split('T')[0];
    return allBookings[dateKey] || [];
  };

  const selectedDateBookings = getBookingsForDate(selectedDate);
  const todayBookings = getBookingsForDate(new Date());

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
  const totalNewBookings = Object.values(allBookings).flat().filter(apt => apt.status === 'nouveau').length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold gradient-text">Dashboard Coiffeur</h1>
              <p className="text-gray-600">Bienvenue, Anna Martin</p>
            </div>
            <div className="flex gap-2 items-center">
              {totalNewBookings > 0 && (
                <div className="relative">
                  <Bell className="h-6 w-6 text-gold-500" />
                  <Badge className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-1 min-w-[20px] h-5 flex items-center justify-center rounded-full">
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
        {/* Résumé du jour en cours */}
        <div className="mb-8">
          <Card className="border-gold-200 bg-gradient-to-r from-gold-50 to-orange-50">
            <CardHeader>
              <CardTitle className="flex items-center text-gold-800">
                <CalendarIcon className="h-5 w-5 mr-2" />
                Aujourd'hui - {new Date().toLocaleDateString('fr-FR', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gold-600">{todayBookings.length}</div>
                  <div className="text-sm text-gray-600">Rendez-vous</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {todayBookings.filter(b => b.status === 'nouveau').length}
                  </div>
                  <div className="text-sm text-gray-600">Nouveaux</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {todayBookings.filter(b => b.status === 'confirmé').length}
                  </div>
                  <div className="text-sm text-gray-600">Confirmés</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Calendrier et disponibilités */}
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
                    hasBookings: Object.keys(allBookings).map(dateStr => new Date(dateStr))
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

          {/* Réservations du jour sélectionné */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Eye className="h-5 w-5 mr-2 text-gold-500" />
                    Réservations du {selectedDate.toLocaleDateString('fr-FR')}
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="secondary">
                      <Users className="h-4 w-4 mr-1" />
                      {selectedDateBookings.length} client{selectedDateBookings.length > 1 ? 's' : ''}
                    </Badge>
                    {newBookingsCount > 0 && (
                      <Badge className="bg-green-500 text-white">
                        {newBookingsCount} nouveau{newBookingsCount > 1 ? 'x' : ''}
                      </Badge>
                    )}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {selectedDateBookings.map((appointment) => (
                    <div
                      key={appointment.id}
                      className={`p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer ${
                        appointment.status === 'nouveau' ? 'border-green-300 bg-green-50' : ''
                      }`}
                      onClick={() => handleBookingClick(appointment)}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <Badge className="bg-gradient-gold text-white">
                              {appointment.time}
                            </Badge>
                            <h3 className="font-semibold">{appointment.clientName}</h3>
                            <Badge 
                              variant={appointment.status === 'confirmé' ? 'default' : 'secondary'}
                              className={appointment.status === 'nouveau' ? 'bg-green-500 text-white' : ''}
                            >
                              {appointment.status === 'nouveau' ? 'NOUVEAU' : appointment.status}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-600">
                            <div>📱 {appointment.phone}</div>
                            <div>✉️ {appointment.email}</div>
                            <div>✂️ {appointment.service}</div>
                          </div>
                          
                          {appointment.comments && (
                            <div className="mt-2 p-2 bg-yellow-50 rounded text-sm">
                              💬 {appointment.comments}
                            </div>
                          )}
                        </div>
                        
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            Modifier
                          </Button>
                          <Button size="sm" variant="outline">
                            Annuler
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {selectedDateBookings.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Clock className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p>Aucune réservation pour cette date</p>
                    <p className="text-sm">Sélectionnez une autre date dans le calendrier</p>
                  </div>
                )}
              </CardContent>
            </Card>
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
