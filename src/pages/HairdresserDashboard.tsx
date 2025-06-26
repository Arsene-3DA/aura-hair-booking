
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";
import { Calendar as CalendarIcon, Clock, Users, Settings, LogOut } from 'lucide-react';
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

  // Données simulées des réservations avec plus de détails
  const todayAppointments = [
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
  ];

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
  const newBookingsCount = todayAppointments.filter(apt => apt.status === 'nouveau').length;

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
            <div className="flex gap-2">
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Calendrier et disponibilités */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CalendarIcon className="h-5 w-5 mr-2 text-gold-500" />
                  Gestion des disponibilités
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  className="rounded-md border"
                  modifiers={{
                    unavailable: unavailableDates
                  }}
                  modifiersStyles={{
                    unavailable: { 
                      backgroundColor: '#fee2e2', 
                      color: '#dc2626',
                      textDecoration: 'line-through'
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
                  
                  <div className="text-sm text-gray-600">
                    <p>• Cliquez sur une date pour la sélectionner</p>
                    <p>• Bloquez vos jours d'absence</p>
                    <p className="text-red-600">• Jours barrés = indisponible</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Réservations du jour */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Clock className="h-5 w-5 mr-2 text-gold-500" />
                    Réservations du jour
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="secondary">
                      <Users className="h-4 w-4 mr-1" />
                      {todayAppointments.length} clients
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
                  {todayAppointments.map((appointment) => (
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
                        </div>
                        
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            Modifier
                          </Button>
                          <Button size="sm" variant="outline">
                            Contacter
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {todayAppointments.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Clock className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p>Aucune réservation pour aujourd'hui</p>
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
