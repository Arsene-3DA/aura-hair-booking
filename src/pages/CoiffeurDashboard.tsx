
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, User, Phone, Mail, Check, X } from 'lucide-react';
import { useRoleAuth } from '@/hooks/useRoleAuth';
import { useNewSupabaseBookings } from '@/hooks/useNewSupabaseBookings';

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
  created_at: string;
}

const CoiffeurDashboard = () => {
  const { signOut, userProfile, user } = useRoleAuth();
  const { getHairdresserByAuthId, getBookingsForHairdresser, updateBookingStatus, loading } = useNewSupabaseBookings();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [hairdresserId, setHairdresserId] = useState<string>('');

  useEffect(() => {
    const loadHairdresserAndBookings = async () => {
      if (!user?.id) return;

      // Récupérer le profil coiffeur
      const hairdresserProfile = await getHairdresserByAuthId(user.id);
      if (hairdresserProfile) {
        setHairdresserId(hairdresserProfile.id);
        
        // Charger les réservations
        const bookingsData = await getBookingsForHairdresser(hairdresserProfile.id);
        setBookings(bookingsData);
      }
    };

    loadHairdresserAndBookings();
  }, [user?.id, getHairdresserByAuthId, getBookingsForHairdresser]);

  const handleLogout = async () => {
    await signOut();
    window.location.href = '/';
  };

  const handleStatusUpdate = async (bookingId: string, status: 'confirmed' | 'declined') => {
    await updateBookingStatus(bookingId, status);
    
    // Recharger les réservations
    if (hairdresserId) {
      const bookingsData = await getBookingsForHairdresser(hairdresserId);
      setBookings(bookingsData);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmé': return 'bg-green-100 text-green-800';
      case 'en_attente': return 'bg-yellow-100 text-yellow-800';
      case 'refusé': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmé': return 'Confirmée';
      case 'en_attente': return 'En attente';
      case 'refusé': return 'Refusée';
      default: return status;
    }
  };

  const pendingBookings = bookings.filter(b => b.status === 'en_attente');
  const confirmedBookings = bookings.filter(b => b.status === 'confirmé');
  const rejectedBookings = bookings.filter(b => b.status === 'refusé');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-xl font-semibold gradient-text">
                Espace Coiffeur
              </h1>
              <p className="text-sm text-gray-600">
                Bienvenue {userProfile?.prenom} {userProfile?.nom}
              </p>
            </div>
            <Button variant="outline" onClick={handleLogout}>
              Déconnexion
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">En attente</p>
                  <p className="text-2xl font-bold">{pendingBookings.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Check className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Confirmées</p>
                  <p className="text-2xl font-bold">{confirmedBookings.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 rounded-lg">
                  <X className="h-6 w-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Refusées</p>
                  <p className="text-2xl font-bold">{rejectedBookings.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Réservations en attente */}
        {pendingBookings.length > 0 && (
          <Card className="mb-8 border-yellow-200">
            <CardHeader className="bg-yellow-50">
              <CardTitle className="text-yellow-800">
                Réservations en attente de validation ({pendingBookings.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {pendingBookings.map((booking) => (
                  <div key={booking.id} className="border rounded-lg p-4 bg-white">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <User className="h-4 w-4 text-gray-500" />
                          <span className="font-medium">{booking.client_name}</span>
                          <Badge className={getStatusColor(booking.status)}>
                            {getStatusText(booking.status)}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-2">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {new Date(booking.booking_date).toLocaleDateString('fr-FR')}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {booking.booking_time}
                          </div>
                          <div className="flex items-center gap-1">
                            <Phone className="h-4 w-4" />
                            {booking.client_phone}
                          </div>
                          <div className="flex items-center gap-1">
                            <Mail className="h-4 w-4" />
                            {booking.client_email}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-sm mb-4">
                      <p><strong>Service:</strong> {booking.service}</p>
                      {booking.comments && (
                        <p className="mt-1 text-gray-600">
                          <strong>Notes:</strong> {booking.comments}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleStatusUpdate(booking.id, 'confirmed')}
                        className="bg-green-500 hover:bg-green-600 text-white"
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Confirmer
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleStatusUpdate(booking.id, 'declined')}
                      >
                        <X className="h-4 w-4 mr-1" />
                        Refuser
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Toutes les réservations */}
        <Card>
          <CardHeader>
            <CardTitle>Toutes mes réservations ({bookings.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold-500 mx-auto mb-4"></div>
                <p className="text-gray-600">Chargement...</p>
              </div>
            ) : bookings.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Aucune réservation trouvée</p>
                <p className="text-sm text-gray-500 mt-2">
                  Les clients peuvent vous trouver et réserver via la page d'accueil
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {bookings.map((booking) => (
                  <div key={booking.id} className="border rounded-lg p-4 hover:shadow-sm transition-shadow">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <User className="h-4 w-4 text-gray-500" />
                          <span className="font-medium">{booking.client_name}</span>
                          <Badge className={getStatusColor(booking.status)}>
                            {getStatusText(booking.status)}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {new Date(booking.booking_date).toLocaleDateString('fr-FR')}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {booking.booking_time}
                          </div>
                          <div className="flex items-center gap-1">
                            <Phone className="h-4 w-4" />
                            {booking.client_phone}
                          </div>
                          <div className="flex items-center gap-1">
                            <Mail className="h-4 w-4" />
                            {booking.client_email}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-sm">
                      <p><strong>Service:</strong> {booking.service}</p>
                      {booking.comments && (
                        <p className="mt-1 text-gray-600">
                          <strong>Notes:</strong> {booking.comments}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CoiffeurDashboard;
