import { useAuth } from '@/hooks/useAuth';
import { useClientReservations } from '@/hooks/useClientReservations';
import { ReservationsDisplay } from '@/components/client/ReservationsDisplay';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function MyReservationsPage() {
  const { user } = useAuth();
  const { 
    upcomingReservations, 
    pastReservations, 
    loading, 
    cancelReservation 
  } = useClientReservations(user?.id);

  const handleCancelReservation = async (reservationId: string) => {
    await cancelReservation(reservationId);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Mes réservations</h1>
          <p className="text-muted-foreground">
            Gérez vos rendez-vous passés et à venir
          </p>
        </div>
        <Button asChild>
          <Link to="/experts">
            <Plus className="h-4 w-4 mr-2" />
            Nouvelle réservation
          </Link>
        </Button>
      </div>

      {/* Reservations Display */}
      <ReservationsDisplay
        upcomingReservations={upcomingReservations}
        pastReservations={pastReservations}
        loading={loading}
        onCancelReservation={handleCancelReservation}
      />
    </div>
  );
}