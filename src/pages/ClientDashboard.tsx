
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, User, Phone, Plus } from 'lucide-react';
import { useRoleAuth } from '@/hooks/useRoleAuth';
import { useReservations } from '@/hooks/useReservations';
import { useUsers } from '@/hooks/useUsers';
import { useNavigate } from 'react-router-dom';
import { ClientReviewPrompt } from '@/components/ClientReviewPrompt';

const ClientDashboard = () => {
  const { signOut, userProfile } = useRoleAuth();
  const { reservations, getMyReservations, loading } = useReservations();
  const { getCoiffeurs } = useUsers();
  const [coiffeurs, setCoiffeurs] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    getMyReservations();
    loadCoiffeurs();
  }, []);

  const loadCoiffeurs = async () => {
    const data = await getCoiffeurs();
    setCoiffeurs(data);
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/');
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-xl font-semibold gradient-text">
                Espace Client
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Mes réservations */}
          <div className="lg:col-span-2 space-y-6">
            {/* Section pour évaluer les prestations terminées */}
            <ClientReviewPrompt />
            
            {/* Mes réservations */}
            <div>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  Mes réservations
                </CardTitle>
                <Button 
                  onClick={() => navigate('/professionals/all')}
                  className="bg-gradient-gold text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Nouvelle réservation
                </Button>
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
                    <Button 
                      onClick={() => navigate('/professionals/all')}
                      className="mt-4 bg-gradient-gold text-white"
                    >
                      Prendre rendez-vous
                    </Button>
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
                                {reservation.coiffeur?.prenom} {reservation.coiffeur?.nom}
                              </span>
                              <Badge className={getStatusColor(reservation.status)}>
                                {getStatusText(reservation.status)}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                {new Date(reservation.date_reservation).toLocaleDateString('fr-FR')}
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                {reservation.heure_reservation}
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

          {/* Sidebar - Coiffeurs disponibles */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Coiffeurs disponibles</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {coiffeurs.map((coiffeur: any) => (
                    <div key={coiffeur.id} className="border rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{coiffeur.prenom} {coiffeur.nom}</p>
                          <p className="text-sm text-gray-600">{coiffeur.email}</p>
                        </div>
                        <Button 
                          size="sm" 
                          onClick={() => navigate(`/reservation/${coiffeur.id}`)}
                          className="bg-gradient-gold text-white"
                        >
                          Réserver
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientDashboard;
