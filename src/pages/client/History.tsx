import { useState, useMemo } from 'react';
import { useRealtimeBookings } from '@/hooks/useRealtimeBookings';
import { useRoleAuth } from '@/hooks/useRoleAuth';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Star, Search, Filter } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

type SortField = 'date' | 'service' | 'status';
type SortDirection = 'asc' | 'desc';

const History = () => {
  const { user } = useRoleAuth();
  const { bookings, loading } = useRealtimeBookings(user?.id);
  const { toast } = useToast();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  // Filter completed bookings only
  const completedBookings = useMemo(() => {
    return bookings.filter(booking => {
      const bookingDate = new Date(`${booking.booking_date}T${booking.booking_time}`);
      const now = new Date();
      return bookingDate <= now || booking.status === 'terminé';
    });
  }, [bookings]);

  // Apply filters and search
  const filteredBookings = useMemo(() => {
    return completedBookings.filter(booking => {
      const matchesSearch = booking.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           booking.client_name.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [completedBookings, searchTerm, statusFilter]);

  // Apply sorting
  const sortedBookings = useMemo(() => {
    return [...filteredBookings].sort((a, b) => {
      let aValue: string | Date;
      let bValue: string | Date;
      
      switch (sortField) {
        case 'date':
          aValue = new Date(`${a.booking_date}T${a.booking_time}`);
          bValue = new Date(`${b.booking_date}T${b.booking_time}`);
          break;
        case 'service':
          aValue = a.service;
          bValue = b.service;
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        default:
          return 0;
      }
      
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredBookings, sortField, sortDirection]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'terminé':
        return <Badge className="bg-green-500 text-white">Terminé</Badge>;
      case 'refusé':
        return <Badge variant="destructive">Annulé</Badge>;
      case 'confirmé':
        return <Badge className="bg-blue-500 text-white">Confirmé</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleLeaveReview = (bookingId: string) => {
    toast({
      title: "Fonction en développement",
      description: "Le système d'avis sera bientôt disponible.",
    });
  };

  const formatDateTime = (date: string, time: string) => {
    try {
      const dateTime = new Date(`${date}T${time}`);
      return format(dateTime, "d MMM yyyy 'à' HH:mm", { locale: fr });
    } catch (error) {
      return `${date} ${time}`;
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle>Historique des rendez-vous</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-12 bg-muted rounded"></div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Historique des rendez-vous</h1>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>Mes rendez-vous passés</CardTitle>
            
            {/* Filters */}
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 w-64"
                />
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  <SelectItem value="terminé">Terminé</SelectItem>
                  <SelectItem value="refusé">Annulé</SelectItem>
                  <SelectItem value="confirmé">Confirmé</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {sortedBookings.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Aucun rendez-vous trouvé</p>
              {searchTerm || statusFilter !== 'all' ? (
                <Button 
                  variant="link" 
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('all');
                  }}
                  className="mt-2"
                >
                  Effacer les filtres
                </Button>
              ) : null}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead 
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleSort('date')}
                    >
                      Date et heure
                      {sortField === 'date' && (
                        <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleSort('service')}
                    >
                      Service
                      {sortField === 'service' && (
                        <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleSort('status')}
                    >
                      Statut
                      {sortField === 'status' && (
                        <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedBookings.map((booking) => (
                    <TableRow key={booking.id}>
                      <TableCell>
                        {formatDateTime(booking.booking_date, booking.booking_time)}
                      </TableCell>
                      <TableCell className="font-medium">
                        {booking.service}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(booking.status)}
                      </TableCell>
                      <TableCell>
                        {booking.status === 'terminé' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleLeaveReview(booking.id)}
                            className="flex items-center gap-1"
                          >
                            <Star className="h-3 w-3" />
                            Laisser un avis
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default History;