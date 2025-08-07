import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { useRoleAuth } from '@/hooks/useRoleAuth';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Calendar, Clock, User, FileText } from 'lucide-react';
import PriceDisplay from '@/components/ui/price-display';

interface Reservation {
  id: string;
  scheduled_at: string;
  status: 'pending' | 'confirmed' | 'declined' | 'completed';
  notes?: string;
  services?: {
    name: string;
    price: number;
    duration: number;
  };
}

const ClientBookingsPage = () => {
  const { user } = useRoleAuth();

  const { data: reservations = [], isLoading } = useQuery({
    queryKey: ['client-reservations', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('new_reservations')
        .select(`
          id,
          scheduled_at,
          status,
          notes,
          services(name, price, duration)
        `)
        .eq('client_user_id', user!.id)
        .order('scheduled_at', { ascending: true });
      
      if (error) throw error;
      return data as any[];
    },
    enabled: !!user?.id,
  });

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: { variant: 'outline' as const, label: 'En attente', color: 'text-yellow-600' },
      confirmed: { variant: 'default' as const, label: 'Confirmé', color: 'text-green-600' },
      declined: { variant: 'destructive' as const, label: 'Refusé', color: 'text-red-600' },
      completed: { variant: 'secondary' as const, label: 'Terminé', color: 'text-gray-600' },
    };
    
    const config = variants[status as keyof typeof variants] || variants.pending;
    return (
      <Badge variant={config.variant} className={config.color}>
        {config.label}
      </Badge>
    );
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Mes Réservations</h1>
          <p className="text-muted-foreground">Gérez vos rendez-vous</p>
        </div>
        <Button onClick={() => window.location.href = '/services'}>
          Nouvelle réservation
        </Button>
      </div>

      {reservations.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Aucune réservation</h3>
            <p className="text-muted-foreground mb-4">
              Vous n'avez pas encore de rendez-vous programmé
            </p>
            <Button onClick={() => window.location.href = '/services'}>
              Prendre rendez-vous
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Vos rendez-vous
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Service</TableHead>
                  <TableHead>Styliste</TableHead>
                  <TableHead>Date & Heure</TableHead>
                  <TableHead>Prix</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reservations.map((reservation) => (
                  <TableRow key={reservation.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {reservation.services?.name || 'Service supprimé'}
                        </div>
                        {reservation.services && (
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {reservation.services.duration} min
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        Styliste
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {format(new Date(reservation.scheduled_at), 'PPP', { locale: fr })}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {format(new Date(reservation.scheduled_at), 'HH:mm')}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {reservation.services ? <PriceDisplay amount={reservation.services.price} size="sm" /> : '-'}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(reservation.status)}
                    </TableCell>
                    <TableCell>
                      {reservation.notes ? (
                        <div className="flex items-center gap-1">
                          <FileText className="h-3 w-3" />
                          <span className="text-sm">{reservation.notes}</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
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

export default ClientBookingsPage;