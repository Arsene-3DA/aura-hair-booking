
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, User, Phone, Mail, Check, X } from 'lucide-react';
import { useRoleAuth } from '@/hooks/useRoleAuth';
import { useReservations } from '@/hooks/useReservations';

const CoiffeurDashboard = () => {
  const { signOut, userProfile } = useRoleAuth();
  const { reservations, getMyReservations, updateReservationStatus, loading } = useReservations();

  useEffect(() => {
    getMyReservations();
  }, []);

  const handleLogout = async () => {
    await signOut();
    window.location.href = '/';
  };

  const handleStatusUpdate = async (reservationId: string, status: 'confirmee' | 'annulee') => {
    await updateReservationStatus(reservationId, status);
    getMyReservations(); // Refresh
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmee': return 'bg-green-100 text-green-800';
      case 'en_attente': return 'bg-yellow-100 text-yellow-800';
      case 'annulee': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmee': return 'Confirmée';
      case 'en_attente': return 'En attente';
      case 'annulee': return 'Annulée';
      default: return status;
    }
  };

  const pendingReservations = reservations.filter(r => r.status === 'en_attente');
  const confirmedReservations = reservations.filter(r => r.status === 'confirmee');
  const cancelledReservations = reservations.filter(r => r.status === 'annulee');

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
                  <p className="text-2xl font-bold">{pendingReservations.length}</p>
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
                  <p className="text-2xl font-bold">{confirmedReservations.length}</p>
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
                  <p className="text-sm text-gray-600">Annulées</p>
                  <p className="text-2xl font-bold">{cancelledReservations.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Réservations en attente */}
        {pendingReservations.length > 0 && (
          <Card className="mb-8 border-yellow-200">
            <CardHeader className="bg-yellow-50">
              <CardTitle className="text-yellow-800">
                Réservations en attente de validation
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {pendingReservations.map((reservation) => (
                  <div key={reservation.id} className="border rounded-lg p-4 bg-white">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <User className="h-4 w-4 text-gray-500" />
                          <span className="font-medium">
                            {reservation.client?.prenom} {reservation.client?.nom}
                          </span>
                          <Badge className={getStatusColor(reservation.status)}>
                            {getStatusText(reservation.status)}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-2">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {new Date(reservation.date_reservation).toLocaleDateString('fr-FR')}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {reservation.heure_reservation}
                          </div>
                          <div className="flex items-center gap-1">
                            <Phone className="h-4 w-4" />
                            {reservation.client?.telephone}
                          </div>
                          <div className="flex items-center gap-1">
                            <Mail className="h-4 w-4" />
                            {reservation.client?.email}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-sm mb-4">
                      <p><strong>Service:</strong> {reservation.service_demande}</p>
                      {reservation.notes && (
                        <p className="mt-1 text-gray-600">
                          <strong>Notes:</strong> {reservation.notes}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleStatusUpdate(reservation.id, 'confirmee')}
                        className="bg-green-500 hover:bg-green-600 text-white"
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Confirmer
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleStatusUpdate(reservation.id, 'annulee')}
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
            <CardTitle>Toutes mes réservations</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold-500 mx-auto mb-4"></div>
                <p className="text-gray-600">Chargement...</p>
              </div>
            ) : reservations.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Aucune réservation trouvée</p>
              </div>
            ) : (
              <div className="space-y-4">
                {reservations.map((reservation) => (
                  <div key={reservation.id} className="border rounded-lg p-4 hover:shadow-sm transition-shadow">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <User className="h-4 w-4 text-gray-500" />
                          <span className="font-medium">
                            {reservation.client?.prenom} {reservation.client?.nom}
                          </span>
                          <Badge className={getStatusColor(reservation.status)}>
                            {getStatusText(reservation.status)}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {new Date(reservation.date_reservation).toLocaleDateString('fr-FR')}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {reservation.heure_reservation}
                          </div>
                          <div className="flex items-center gap-1">
                            <Phone className="h-4 w-4" />
                            {reservation.client?.telephone}
                          </div>
                          <div className="flex items-center gap-1">
                            <Mail className="h-4 w-4" />
                            {reservation.client?.email}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-sm">
                      <p><strong>Service:</strong> {reservation.service_demande}</p>
                      {reservation.notes && (
                        <p className="mt-1 text-gray-600">
                          <strong>Notes:</strong> {reservation.notes}
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
