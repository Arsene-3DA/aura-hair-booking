import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useUpcomingBookings } from '@/hooks/useUpcomingBookings';
import { usePastBookings } from '@/hooks/usePastBookings';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { EditBookingModal } from '@/components/client/EditBookingModal';
import { 
  Calendar, 
  Clock, 
  User, 
  Plus,
  Star,
  X,
  Edit
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ReviewModal } from '@/components/ReviewModal';
import PageHeader from '@/components/PageHeader';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

const BookingCard = ({ 
  booking, 
  isUpcoming = false, 
  onCancel,
  onReview,
  onEdit
}: { 
  booking: any; 
  isUpcoming?: boolean;
  onCancel?: (id: string) => void;
  onReview?: (booking: any) => void;
  onEdit?: (booking: any) => void;
}) => (
  <Card className="hover:shadow-md transition-shadow">
    <CardContent className="p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-medium">{booking.service}</h4>
            <Badge variant={
              booking.status === 'confirmed' ? 'default' :
              booking.status === 'completed' ? 'default' :
              booking.status === 'cancelled' ? 'destructive' :
              'secondary'
            }>
              {booking.status === 'confirmed' ? 'Confirmé' :
               booking.status === 'completed' ? 'Terminé' :
               booking.status === 'cancelled' ? 'Annulé' :
               'En attente'}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mb-2">
            <User className="h-4 w-4 inline mr-1" />
            {booking.stylist_profile?.full_name || booking.stylist_name || 'Styliste'}
          </p>
          
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {format(new Date(booking.scheduled_at), 'dd MMMM yyyy', { locale: fr })}
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {format(new Date(booking.scheduled_at), 'HH:mm')}
            </div>
          </div>
        </div>
      </div>
      
      {booking.notes && (
        <p className="text-sm mt-2 p-2 bg-muted/50 rounded text-muted-foreground">
          <strong>Notes:</strong> {booking.notes}
        </p>
      )}

      {/* Actions */}
      <div className="flex gap-2 mt-4">
        {isUpcoming && booking.status !== 'cancelled' && (
          <>
            <Button variant="outline" size="sm" onClick={() => onEdit?.(booking)}>
              <Edit className="h-4 w-4 mr-2" />
              Modifier
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  <X className="h-4 w-4 mr-2" />
                  Annuler
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Annuler le rendez-vous</AlertDialogTitle>
                  <AlertDialogDescription>
                    Êtes-vous sûr de vouloir annuler ce rendez-vous ? Cette action est irréversible.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Garder</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={() => onCancel?.(booking.id)}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Annuler le RDV
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </>
        )}
        
        {!isUpcoming && booking.status === 'completed' && !booking.has_review && (
          <Button onClick={() => onReview?.(booking)} size="sm">
            <Star className="h-4 w-4 mr-2" />
            Laisser un avis
          </Button>
        )}
        
        {!isUpcoming && booking.has_review && (
          <Badge variant="outline" className="bg-yellow-50">
            <Star className="h-3 w-3 mr-1 fill-yellow-400 text-yellow-400" />
            Avis donné
          </Badge>
        )}
      </div>
    </CardContent>
  </Card>
);

export default function BookingsPage() {
  const { user } = useAuth();
  const { bookings: upcomingBookings, loading: upcomingLoading, cancelBooking } = useUpcomingBookings(user?.id);
  const [currentPage, setCurrentPage] = useState(1);
  const { bookings: pastBookings, loading: pastLoading, hasMore } = usePastBookings(user?.id, { page: currentPage });
  
  const [selectedBookingForReview, setSelectedBookingForReview] = useState<any>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedBookingForEdit, setSelectedBookingForEdit] = useState<any>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const handleCancelBooking = async (bookingId: string) => {
    await cancelBooking(bookingId);
  };

  const handleReviewBooking = (booking: any) => {
    setSelectedBookingForReview(booking);
    setIsReviewModalOpen(true);
  };

  const handleEditBooking = (booking: any) => {
    setSelectedBookingForEdit(booking);
    setIsEditModalOpen(true);
  };

  const handleReviewSubmitted = () => {
    setIsReviewModalOpen(false);
    setSelectedBookingForReview(null);
    // Optionnel: rafraîchir les données
  };

  const handleEditModalClose = () => {
    setIsEditModalOpen(false);
    setSelectedBookingForEdit(null);
  };

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Mes réservations"
        description="Gérez vos rendez-vous passés et à venir"
        icon={<Calendar className="h-8 w-8" />}
        showBackButton={true}
        breadcrumbs={[
          { label: 'Dashboard', path: '/client' },
          { label: 'Mes réservations' }
        ]}
        actions={
          <Button asChild>
            <Link to="/app/bookings/new">
              <Plus className="h-4 w-4 mr-2" />
              Nouvelle réservation
            </Link>
          </Button>
        }
      />

      {/* Tabs */}
      <Tabs defaultValue="upcoming" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upcoming">À venir</TabsTrigger>
          <TabsTrigger value="history">Historique</TabsTrigger>
        </TabsList>

        {/* Upcoming Bookings */}
        <TabsContent value="upcoming" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Prochains rendez-vous</CardTitle>
            </CardHeader>
            <CardContent>
              {upcomingLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-32" />
                  ))}
                </div>
              ) : upcomingBookings.length > 0 ? (
                <div className="space-y-4">
                  {upcomingBookings.map(booking => (
                    <BookingCard 
                      key={booking.id} 
                      booking={booking} 
                      isUpcoming={true}
                      onCancel={handleCancelBooking}
                      onEdit={handleEditBooking}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Calendar className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">Aucun rendez-vous programmé</h3>
                  <p className="text-muted-foreground mb-4">
                    Prenez votre premier rendez-vous dès maintenant
                  </p>
                  <Button asChild>
                    <Link to="/app/bookings/new">
                      <Plus className="h-4 w-4 mr-2" />
                      Prendre rendez-vous
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Past Bookings */}
        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Historique des rendez-vous</CardTitle>
            </CardHeader>
            <CardContent>
              {pastLoading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-32" />
                  ))}
                </div>
              ) : pastBookings.length > 0 ? (
                <div className="space-y-4">
                  {pastBookings.map(booking => (
                    <BookingCard 
                      key={booking.id} 
                      booking={booking} 
                      isUpcoming={false}
                      onReview={handleReviewBooking}
                    />
                  ))}
                  
                  {/* Pagination */}
                  <div className="flex items-center justify-between pt-4">
                    <Button 
                      variant="outline" 
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      Précédent
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      Page {currentPage}
                    </span>
                    <Button 
                      variant="outline" 
                      onClick={() => setCurrentPage(p => p + 1)}
                      disabled={!hasMore}
                    >
                      Suivant
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Calendar className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">Aucun historique</h3>
                  <p className="text-muted-foreground">
                    Vos rendez-vous passés apparaîtront ici
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Review Modal */}
      {selectedBookingForReview && (
        <ReviewModal
          isOpen={isReviewModalOpen}
          onClose={handleReviewSubmitted}
          bookingId={selectedBookingForReview.id}
          stylistId={selectedBookingForReview.stylist_id}
          stylistName={selectedBookingForReview.stylist_profile?.full_name || selectedBookingForReview.stylist_name}
        />
      )}

      {/* Edit Booking Modal */}
      {selectedBookingForEdit && (
        <EditBookingModal
          isOpen={isEditModalOpen}
          onClose={handleEditModalClose}
          booking={selectedBookingForEdit}
        />
      )}
    </div>
  );
}