import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { useRoleAuth } from '@/hooks/useRoleAuth';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Calendar, Clock, User, FileText, Check, X } from 'lucide-react';

interface BookingWithDetails {
  id: string;
  scheduled_at: string;
  status: 'pending' | 'confirmed' | 'declined';
  services?: {
    name: string;
    price: number;
    duration: number;
  };
  profiles?: {
    full_name: string;
  };
}

const StylistBookingsPage = () => {
  const { user } = useRoleAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ['stylist-bookings', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          id,
          scheduled_at,
          status,
          services(name, price, duration),
          profiles!client_id(full_name)
        `)
        .eq('stylist_id', user!.id)
        .order('scheduled_at', { ascending: true });
      
      if (error) throw error;
      return data as BookingWithDetails[];
    },
    enabled: !!user?.id,
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ bookingId, status }: { bookingId: string, status: 'confirmed' | 'declined' }) => {
      const { error } = await supabase
        .from('bookings')
        .update({ status })
        .eq('id', bookingId);
      
      if (error) throw error;
    },
    onSuccess: (_, { status }) => {
      toast({
        title: "Statut mis à jour",
        description: `Réservation ${status === 'confirmed' ? 'confirmée' : 'refusée'}.`,
      });
      queryClient.invalidateQueries({ queryKey: ['stylist-bookings'] });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le statut.",
        variant: "destructive",
      });
    }
  });

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: { variant: 'outline' as const, label: 'En attente', color: 'text-yellow-600' },
      confirmed: { variant: 'default' as const, label: 'Confirmé', color: 'text-green-600' },
      declined: { variant: 'destructive' as const, label: 'Refusé', color: 'text-red-600' },
    };
    
    const config = variants[status as keyof typeof variants] || variants.pending;
    return (
      <Badge variant={config.variant} className={config.color}>
        {config.label}
      </Badge>
    );
  };

  const handleStatusUpdate = (bookingId: string, status: 'confirmed' | 'declined') => {
    updateStatusMutation.mutate({ bookingId, status });
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement de vos réservations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Mes Réservations</h1>
        <p className="text-muted-foreground">Gérez les demandes de rendez-vous</p>
      </div>

      {bookings.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Aucune réservation</h3>
            <p className="text-muted-foreground mb-4">
              Vous n'avez pas encore de demandes de rendez-vous
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Demandes de rendez-vous
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Date & Heure</TableHead>
                  <TableHead>Prix</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookings.map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        {booking.profiles?.full_name || 'Client'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {booking.services?.name || 'Service'}
                        </div>
                        {booking.services && (
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {booking.services.duration} min
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {format(new Date(booking.scheduled_at), 'PPP', { locale: fr })}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {format(new Date(booking.scheduled_at), 'HH:mm')}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {booking.services ? `${booking.services.price}€` : '-'}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(booking.status)}
                    </TableCell>
                    <TableCell>
                      {booking.status === 'pending' ? (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleStatusUpdate(booking.id, 'confirmed')}
                            disabled={updateStatusMutation.isPending}
                            className="flex items-center gap-1"
                          >
                            <Check className="h-3 w-3" />
                            Confirmer
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleStatusUpdate(booking.id, 'declined')}
                            disabled={updateStatusMutation.isPending}
                            className="flex items-center gap-1 text-red-600 hover:text-red-700"
                          >
                            <X className="h-3 w-3" />
                            Refuser
                          </Button>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">-</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default StylistBookingsPage;