import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Calendar, 
  Clock, 
  User, 
  Plus,
  X,
  AlertCircle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
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
import { ClientReservation } from '@/hooks/useClientReservations';
import PriceDisplay from '@/components/ui/price-display';

interface ReservationCardProps {
  reservation: ClientReservation;
  onCancel?: (id: string) => void;
  showCancelButton?: boolean;
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'pending':
      return (
        <Badge variant="secondary" className="bg-orange-100 text-orange-800 border-orange-200">
          <AlertCircle className="h-3 w-3 mr-1" />
          En attente
        </Badge>
      );
    case 'confirmed':
      return (
        <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
          <CheckCircle className="h-3 w-3 mr-1" />
          Confirmé
        </Badge>
      );
    case 'declined':
      return (
        <Badge variant="destructive" className="bg-red-100 text-red-800 border-red-200">
          <XCircle className="h-3 w-3 mr-1" />
          Refusé
        </Badge>
      );
    case 'completed':
      return (
        <Badge variant="default" className="bg-blue-100 text-blue-800 border-blue-200">
          <CheckCircle className="h-3 w-3 mr-1" />
          Terminé
        </Badge>
      );
    case 'no_show':
      return (
        <Badge variant="secondary" className="bg-gray-100 text-gray-800 border-gray-200">
          <XCircle className="h-3 w-3 mr-1" />
          Absent
        </Badge>
      );
    default:
      return (
        <Badge variant="secondary">
          {status}
        </Badge>
      );
  }
};

const ReservationCard = ({ reservation, onCancel, showCancelButton = false }: ReservationCardProps) => (
  <Card className="hover:shadow-md transition-shadow">
    <CardContent className="p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h4 className="font-medium">
              {reservation.service?.name || 'Service personnalisé'}
            </h4>
            {getStatusBadge(reservation.status)}
          </div>
          
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <User className="h-4 w-4" />
              {reservation.stylist_profile?.full_name || 'Professionnel'}
            </p>
            
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {format(new Date(reservation.scheduled_at), 'dd MMMM yyyy', { locale: fr })}
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {format(new Date(reservation.scheduled_at), 'HH:mm')}
              </div>
            </div>

            {reservation.service && (
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <PriceDisplay amount={reservation.service.price} size="sm" />
                <span>{reservation.service.duration} min</span>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {reservation.notes && (
        <div className="mt-3 p-2 bg-muted/50 rounded-md">
          <p className="text-sm text-muted-foreground">
            <strong>Notes:</strong> {reservation.notes}
          </p>
        </div>
      )}

      {showCancelButton && reservation.status === 'pending' && onCancel && (
        <div className="mt-4 flex justify-end">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm">
                <X className="h-4 w-4 mr-2" />
                Annuler
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Annuler la réservation</AlertDialogTitle>
                <AlertDialogDescription>
                  Êtes-vous sûr de vouloir annuler cette réservation ? Cette action est irréversible.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Garder</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={() => onCancel(reservation.id)}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Annuler la réservation
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}
    </CardContent>
  </Card>
);

interface ReservationsDisplayProps {
  upcomingReservations: ClientReservation[];
  pastReservations: ClientReservation[];
  loading: boolean;
  onCancelReservation: (id: string) => void;
}

export const ReservationsDisplay = ({ 
  upcomingReservations, 
  pastReservations, 
  loading, 
  onCancelReservation 
}: ReservationsDisplayProps) => {
  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
    );
  }

  return (
    <Tabs defaultValue="upcoming" className="space-y-4">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="upcoming">
          À venir ({upcomingReservations.length})
        </TabsTrigger>
        <TabsTrigger value="history">
          Historique ({pastReservations.length})
        </TabsTrigger>
      </TabsList>

      <TabsContent value="upcoming" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Prochaines réservations</CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingReservations.length > 0 ? (
              <div className="space-y-4">
                {upcomingReservations.map(reservation => (
                  <ReservationCard 
                    key={reservation.id} 
                    reservation={reservation}
                    onCancel={onCancelReservation}
                    showCancelButton={true}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Calendar className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">Aucune réservation à venir</h3>
                <p className="text-muted-foreground mb-4">
                  Réservez votre prochain rendez-vous dès maintenant
                </p>
                <Button asChild>
                  <Link to="/experts">
                    <Plus className="h-4 w-4 mr-2" />
                    Réserver maintenant
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="history" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Historique des réservations</CardTitle>
          </CardHeader>
          <CardContent>
            {pastReservations.length > 0 ? (
              <div className="space-y-4">
                {pastReservations.map(reservation => (
                  <ReservationCard 
                    key={reservation.id} 
                    reservation={reservation}
                    showCancelButton={false}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Calendar className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">Aucun historique</h3>
                <p className="text-muted-foreground">
                  Vos réservations passées apparaîtront ici
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};