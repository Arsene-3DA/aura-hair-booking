import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useRoleAuth } from '@/hooks/useRoleAuth';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import PriceDisplay from '@/components/ui/price-display';
import { Calendar, Clock, User, FileText, Check, X } from 'lucide-react';

interface PendingReservation {
  id: string;
  scheduled_at: string;
  status: 'pending';
  notes?: string;
  services?: {
    name: string;
    price: number;
    duration: number;
  };
}

const StylistQueuePage = () => {
  const { user } = useRoleAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: pendingReservations = [], isLoading } = useQuery({
    queryKey: ['stylist-pending-reservations', user?.id],
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
        .eq('stylist_user_id', user!.id)
        .eq('status', 'pending')
        .order('scheduled_at', { ascending: true });
      
      if (error) throw error;
      return data as any[];
    },
    enabled: !!user?.id,
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: 'confirmed' | 'declined' }) => {
      const { error } = await supabase
        .from('new_reservations')
        .update({ status })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: (_, { status }) => {
      toast({
        title: status === 'confirmed' ? '✅ Réservation confirmée' : '❌ Réservation refusée',
        description: `La réservation a été ${status === 'confirmed' ? 'confirmée' : 'refusée'} avec succès`,
      });
      queryClient.invalidateQueries({ queryKey: ['stylist-pending-reservations'] });
    },
    onError: () => {
      toast({
        title: '❌ Erreur',
        description: 'Impossible de mettre à jour la réservation',
        variant: 'destructive',
      });
    },
  });

  const handleConfirm = (id: string) => {
    updateStatus.mutate({ id, status: 'confirmed' });
  };

  const handleDecline = (id: string) => {
    updateStatus.mutate({ id, status: 'declined' });
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement des réservations en attente...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">File d'attente</h1>
        <p className="text-muted-foreground">Réservations en attente de confirmation</p>
      </div>

      {pendingReservations.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Aucune réservation en attente</h3>
            <p className="text-muted-foreground">
              Toutes vos réservations ont été traitées
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {pendingReservations.map((reservation) => (
            <Card key={reservation.id} className="border-l-4 border-l-yellow-500">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">
                      {reservation.services?.name || 'Service supprimé'}
                    </CardTitle>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                      {reservation.services && (
                        <>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {reservation.services.duration} min
                          </div>
                          <div><PriceDisplay amount={reservation.services.price} size="sm" /></div>
                        </>
                      )}
                    </div>
                  </div>
                  <Badge variant="outline" className="text-yellow-600 border-yellow-200">
                    En attente
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Client</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="font-medium">
                        {format(new Date(reservation.scheduled_at), 'PPP', { locale: fr })}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {format(new Date(reservation.scheduled_at), 'HH:mm')}
                      </div>
                    </div>
                  </div>
                </div>

                {reservation.notes && (
                  <div className="flex items-start gap-2 p-3 bg-muted rounded-lg">
                    <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <div className="font-medium text-sm mb-1">Notes du client :</div>
                      <p className="text-sm text-muted-foreground">{reservation.notes}</p>
                    </div>
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <Button
                    onClick={() => handleConfirm(reservation.id)}
                    disabled={updateStatus.isPending}
                    className="flex-1"
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Confirmer
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleDecline(reservation.id)}
                    disabled={updateStatus.isPending}
                    className="flex-1 border-red-200 text-red-600 hover:bg-red-50"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Refuser
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default StylistQueuePage;