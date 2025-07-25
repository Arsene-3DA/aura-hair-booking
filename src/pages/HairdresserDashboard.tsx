
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";
import { Calendar as CalendarIcon, Clock, Users, Settings, LogOut, Bell, Eye, Filter, Check, X } from 'lucide-react';
import WorkingHoursModal from '../components/WorkingHoursModal';
import BookingDetailsModal from '../components/BookingDetailsModal';
import AuthenticatedRoute from '../components/AuthenticatedRoute';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from '@/hooks/useAuth';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';

interface Booking {
  id: string;
  client_name: string;
  client_email: string;
  client_phone: string;
  service: string;
  booking_date: string;
  booking_time: string;
  status: string;
  comments?: string;
  expires_at?: string;
  created_at: string;
}

const HairdresserDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, logout } = useAuth();
  const { getCoiffeurByUserId, getBookingsForCoiffeur, updateBookingStatus } = useSupabaseAuth();
  
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [unavailableDates, setUnavailableDates] = useState<Date[]>([]);
  const [isWorkingHoursModalOpen, setIsWorkingHoursModalOpen] = useState(false);
  const [isBookingDetailsModalOpen, setIsBookingDetailsModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [workingHours, setWorkingHours] = useState({ start: '09:00', end: '20:00' });
  const [viewMode, setViewMode] = useState<'today' | 'selected' | 'week' | 'all'>('today');
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [coiffeurProfile, setCoiffeurProfile] = useState<any>(null);

  useEffect(() => {
    if (user) {
      loadCoiffeurData();
    }
  }, [user]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (coiffeurProfile) {
        loadBookings();
      }
    }, 30000); // Actualiser toutes les 30 secondes
    
    return () => clearInterval(interval);
  }, [coiffeurProfile]);

  const loadCoiffeurData = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const profile = await getCoiffeurByUserId(user.id);
      
      if (!profile) {
        toast({
          title: "❌ Erreur",
          description: "Profil coiffeur non trouvé",
          variant: "destructive"
        });
        navigate('/login');
        return;
      }

      setCoiffeurProfile(profile);
      await loadBookings(profile.hairdresser_id);
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadBookings = async (hairdresserId?: string) => {
    if (!hairdresserId && !coiffeurProfile) return;
    
    try {
      const bookingsData = await getBookingsForCoiffeur(hairdresserId || coiffeurProfile.hairdresser_id);
      setBookings(bookingsData);
    } catch (error) {
      console.error('Erreur lors du chargement des réservations:', error);
    }
  };

  // Filtrer les réservations selon la vue
  const getFilteredBookings = () => {
    const today = new Date().toISOString().split('T')[0];
    const selectedDateStr = selectedDate.toISOString().split('T')[0];

    switch (viewMode) {
      case 'today':
        return bookings.filter(booking => booking.booking_date === today);
      case 'selected':
        return bookings.filter(booking => booking.booking_date === selectedDateStr);
      case 'week':
        const startOfWeek = new Date();
        startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        
        return bookings.filter(booking => {
          const bookingDate = new Date(booking.booking_date);
          return bookingDate >= startOfWeek && bookingDate <= endOfWeek;
        });
      case 'all':
      default:
        return bookings;
    }
  };

  const filteredBookings = getFilteredBookings();
  const pendingCount = bookings.filter(b => b.status === 'en_attente').length;
  const confirmedCount = bookings.filter(b => b.status === 'confirmé').length;

  const handleLogout = async () => {
    await logout();
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

  const handleBookingClick = (booking: Booking) => {
    setSelectedBooking(booking);
    setIsBookingDetailsModalOpen(true);
  };

  const handleConfirmBooking = async (bookingId: string) => {
    try {
      await updateBookingStatus(bookingId, 'confirmed');
      await loadBookings();
    } catch (error) {
      console.error('Erreur lors de la confirmation:', error);
    }
  };

  const handleRejectBooking = async (bookingId: string) => {
    try {
      await updateBookingStatus(bookingId, 'declined');
      await loadBookings();
    } catch (error) {
      console.error('Erreur lors du refus:', error);
    }
  };

  const handleWorkingHoursSave = (hours: { start: string; end: string }) => {
    setWorkingHours(hours);
  };

  const renderBookingCard = (booking: Booking) => {
    const getStatusBadge = (status: string) => {
      switch (status) {
        case 'en_attente':
          return <Badge className="bg-orange-500 text-white animate-pulse font-medium">🕐 EN ATTENTE</Badge>;
        case 'confirmé':
          return <Badge className="bg-green-500 text-white font-medium">✅ CONFIRMÉ</Badge>;
        case 'refusé':
          return <Badge className="bg-red-500 text-white font-medium">❌ REFUSÉ</Badge>;
        default:
          return <Badge variant="secondary">{status}</Badge>;
      }
    };

    const isActionable = booking.status === 'en_attente';

    return (
      <div
        key={booking.id}
        className={`p-4 border rounded-lg hover:shadow-md transition-all duration-200 cursor-pointer transform hover:scale-[1.02] ${
          isActionable
            ? 'border-orange-300 bg-gradient-to-r from-orange-50 to-yellow-50 shadow-sm' 
            : booking.status === 'confirmé'
            ? 'border-green-300 bg-gradient-to-r from-green-50 to-emerald-50'
            : 'border-gray-200 bg-white'
        }`}
        onClick={() => handleBookingClick(booking)}
      >
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <Badge className="bg-gradient-gold text-white font-semibold px-3 py-1">
                {booking.booking_time}
              </Badge>
              <h3 className="font-bold text-gray-800 text-lg">{booking.client_name}</h3>
              {getStatusBadge(booking.status)}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div className="flex items-center text-gray-600">
                <span className="font-medium mr-2">📱</span> {booking.client_phone}
              </div>
              <div className="flex items-center text-gray-600">
                <span className="font-medium mr-2">✉️</span> {booking.client_email}
              </div>
              <div className="flex items-center text-blue-600 font-medium col-span-full">
                <span className="mr-2">✂️</span> {booking.service}
              </div>
            </div>
            
            {booking.comments && (
              <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm">
                <span className="font-medium text-amber-700">💬 Note:</span> {booking.comments}
              </div>
            )}
          </div>
          
          <div className="flex flex-col gap-2 ml-4">
            {isActionable && (
              <>
                <Button 
                  size="sm" 
                  className="bg-green-500 hover:bg-green-600 text-white"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleConfirmBooking(booking.id);
                  }}
                >
                  <Check className="h-4 w-4 mr-1" />
                  Accepter
                </Button>
                <Button 
                  size="sm" 
                  variant="destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRejectBooking(booking.id);
                  }}
                >
                  <X className="h-4 w-4 mr-1" />
                  Refuser
                </Button>
              </>
            )}
            <Button 
              size="sm" 
              variant="outline" 
              className="text-blue-600 border-blue-200 hover:bg-blue-50"
              onClick={(e) => {
                e.stopPropagation();
                handleBookingClick(booking);
              }}
            >
              <Eye className="h-4 w-4 mr-1" />
              Détails
            </Button>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de vos réservations...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthenticatedRoute requiredUserType="hairdresser">
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <Avatar className="h-16 w-16 border-2 border-gold-300">
                  <AvatarImage 
                    src={coiffeurProfile?.image_url}
                    alt={user?.first_name}
                    className="object-cover"
                  />
                  <AvatarFallback className="bg-gold-100 text-gold-700 text-lg font-semibold">
                    {user?.first_name?.charAt(0)}{user?.last_name?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="text-2xl font-bold gradient-text">Dashboard Coiffeur</h1>
                  <p className="text-gray-600">Bienvenue, {user?.first_name} {user?.last_name}</p>
                </div>
              </div>
              
              <div className="flex gap-2 items-center">
                {pendingCount > 0 && (
                  <div className="relative">
                    <Bell className="h-6 w-6 text-orange-500 animate-pulse" />
                    <Badge className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-1 min-w-[20px] h-5 flex items-center justify-center rounded-full animate-bounce">
                      {pendingCount}
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
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Déconnexion
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          {/* Statistiques */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="border-gold-200 bg-gradient-to-br from-gold-50 to-orange-50">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-gold-600 mb-2">{bookings.length}</div>
                <div className="text-sm text-gray-600 font-medium">Total Réservations</div>
              </CardContent>
            </Card>
            <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-sky-50">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">{filteredBookings.filter(b => b.booking_date === new Date().toISOString().split('T')[0]).length}</div>
                <div className="text-sm text-gray-600 font-medium">Aujourd'hui</div>
              </CardContent>
            </Card>
            <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-yellow-50">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-orange-600 mb-2">{pendingCount}</div>
                <div className="text-sm text-gray-600 font-medium">En attente</div>
              </CardContent>
            </Card>
            <Card className="border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">{confirmedCount}</div>
                <div className="text-sm text-gray-600 font-medium">Confirmées</div>
              </CardContent>
            </Card>
          </div>

          {/* Modes de vue */}
          <div className="mb-6">
            <div className="flex gap-2 flex-wrap">
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
              <Button
                variant={viewMode === 'all' ? 'default' : 'outline'}
                onClick={() => setViewMode('all')}
                className={viewMode === 'all' ? 'bg-gradient-gold text-white' : ''}
              >
                <Users className="h-4 w-4 mr-2" />
                Toutes les réservations
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
                    Calendrier
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
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Réservations */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center">
                      <CalendarIcon className="h-5 w-5 mr-2 text-gold-500" />
                      Mes réservations
                    </div>
                    <Badge variant="secondary" className="bg-gold-100 text-gold-800">
                      <Users className="h-4 w-4 mr-1" />
                      {filteredBookings.length}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {filteredBookings.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <Clock className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                        <p className="font-medium">Aucune réservation</p>
                        <p className="text-sm">Aucune réservation trouvée pour cette période</p>
                      </div>
                    ) : (
                      filteredBookings.map(renderBookingCard)
                    )}
                  </div>
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
    </AuthenticatedRoute>
  );
};

export default HairdresserDashboard;
