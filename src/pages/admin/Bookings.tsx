import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  Search, 
  Download, 
  MoreHorizontal, 
  Filter,
  Calendar,
  Clock,
  User,
  Scissors
} from 'lucide-react';
import { useAdminReservations } from '@/hooks/useAdminReservations';
import { formatPrice } from '@/utils/priceFormatter';
import PriceDisplay from '@/components/ui/price-display';
import Papa from 'papaparse';

const Bookings = () => {
  const { reservations, loading, error, updateReservationStatus } = useAdminReservations();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');

  const exportToCSV = () => {
    const csvData = filteredReservations.map(reservation => ({
      'ID': reservation.id,
      'Client': reservation.client_name || 'N/A',
      'Email Client': reservation.client_email || 'N/A',
      'Téléphone Client': reservation.client_phone || 'N/A',
      'Professionnel': reservation.stylist_name || 'N/A',
      'Email Professionnel': reservation.stylist_email || 'N/A',
      'Rôle': reservation.stylist_role || 'N/A',
      'Spécialités': reservation.stylist_specialties?.join(', ') || 'N/A',
      'Localisation': reservation.stylist_location || 'N/A',
      'Date & Heure': new Date(reservation.scheduled_at).toLocaleString('fr-FR'),
      'Service': reservation.service_name || 'N/A',
      'Prix': reservation.service_price ? formatPrice(reservation.service_price) : 'N/A',
      'Durée': reservation.service_duration ? `${reservation.service_duration}min` : 'N/A',
      'Statut': reservation.status,
      'Notes': reservation.notes || '',
      'Créé le': new Date(reservation.created_at).toLocaleDateString('fr-FR')
    }));

    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `reservations_admin_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredReservations = reservations.filter(reservation => {
    const matchesSearch = 
      (reservation.client_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (reservation.client_email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (reservation.stylist_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (reservation.service_name || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || reservation.status === statusFilter;
    
    let matchesDate = true;
    if (dateFilter !== 'all') {
      const reservationDate = new Date(reservation.scheduled_at);
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const nextWeek = new Date(today);
      nextWeek.setDate(nextWeek.getDate() + 7);

      switch (dateFilter) {
        case 'today':
          matchesDate = reservationDate.toDateString() === today.toDateString();
          break;
        case 'tomorrow':
          matchesDate = reservationDate.toDateString() === tomorrow.toDateString();
          break;
        case 'week':
          matchesDate = reservationDate >= today && reservationDate <= nextWeek;
          break;
      }
    }
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'declined': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'no_show': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'confirmed': return 'Confirmée';
      case 'pending': return 'En attente';
      case 'declined': return 'Refusée';
      case 'completed': return 'Terminée';
      case 'no_show': return 'Absent';
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Gestion des réservations</h1>
          <p className="text-muted-foreground">Toutes les réservations de la plateforme</p>
        </div>
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-muted rounded"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Gestion des réservations</h1>
          <p className="text-muted-foreground">Toutes les réservations de la plateforme</p>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-destructive">{error}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Gestion des réservations</h1>
          <p className="text-muted-foreground">Toutes les réservations de la plateforme</p>
        </div>
        <Button onClick={exportToCSV}>
          <Download className="w-4 h-4 mr-2" />
          Exporter CSV
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div className="ml-2">
                <p className="text-sm font-medium text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{reservations.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Clock className="h-4 w-4 text-yellow-500" />
              <div className="ml-2">
                <p className="text-sm font-medium text-muted-foreground">En attente</p>
                <p className="text-2xl font-bold">
                  {reservations.filter(r => r.status === 'pending').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 text-green-500" />
              <div className="ml-2">
                <p className="text-sm font-medium text-muted-foreground">Confirmées</p>
                <p className="text-2xl font-bold">
                  {reservations.filter(r => r.status === 'confirmed').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 text-blue-500" />
              <div className="ml-2">
                <p className="text-sm font-medium text-muted-foreground">Terminées</p>
                <p className="text-2xl font-bold">
                  {reservations.filter(r => r.status === 'completed').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filtres
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher par client, service..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="pending">En attente</SelectItem>
                <SelectItem value="confirmed">Confirmée</SelectItem>
                <SelectItem value="declined">Refusée</SelectItem>
                <SelectItem value="completed">Terminée</SelectItem>
                <SelectItem value="no_show">Absent</SelectItem>
              </SelectContent>
            </Select>
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Période" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les dates</SelectItem>
                <SelectItem value="today">Aujourd'hui</SelectItem>
                <SelectItem value="tomorrow">Demain</SelectItem>
                <SelectItem value="week">Cette semaine</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Bookings Table */}
      <Card>
        <CardHeader>
          <CardTitle>Réservations ({filteredReservations.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client</TableHead>
                <TableHead>Professionnel</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Date & Heure</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Créé le</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReservations.map((reservation) => (
                <TableRow key={reservation.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="font-medium">{reservation.client_name || 'Client inconnu'}</div>
                        <div className="text-sm text-muted-foreground">
                          {reservation.client_email || 'Email non renseigné'}
                        </div>
                        {reservation.client_phone && (
                          <div className="text-sm text-muted-foreground">
                            {reservation.client_phone}
                          </div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Scissors className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="font-medium">{reservation.stylist_name || 'Professionnel inconnu'}</div>
                        <div className="text-sm text-muted-foreground">
                          {reservation.stylist_role && getStatusLabel(reservation.stylist_role)}
                        </div>
                        {reservation.stylist_location && (
                          <div className="text-sm text-muted-foreground">
                            📍 {reservation.stylist_location}
                          </div>
                        )}
                        {reservation.stylist_specialties && reservation.stylist_specialties.length > 0 && (
                          <div className="text-xs text-muted-foreground">
                            {reservation.stylist_specialties.join(', ')}
                          </div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{reservation.stylist_email || 'Email non renseigné'}</div>
                      {reservation.stylist_phone && (
                        <div className="text-muted-foreground">{reservation.stylist_phone}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">
                        {new Date(reservation.scheduled_at).toLocaleDateString('fr-FR')}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(reservation.scheduled_at).toLocaleTimeString('fr-FR', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{reservation.service_name || 'Service non spécifié'}</div>
                      {reservation.service_price && (
                        <div className="text-sm text-muted-foreground">
                          <PriceDisplay amount={reservation.service_price} size="sm" />
                        </div>
                      )}
                      {reservation.service_duration && (
                        <div className="text-sm text-muted-foreground">
                          {reservation.service_duration}min
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(reservation.status)}>
                      {getStatusLabel(reservation.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(reservation.created_at).toLocaleDateString('fr-FR')}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem 
                          onClick={() => updateReservationStatus(reservation.id, 'confirmed')}
                          disabled={reservation.status === 'confirmed'}
                        >
                          Confirmer
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => updateReservationStatus(reservation.id, 'completed')}
                          disabled={reservation.status === 'completed'}
                        >
                          Marquer terminée
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => updateReservationStatus(reservation.id, 'declined')}
                          disabled={reservation.status === 'declined'}
                        >
                          Refuser
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => updateReservationStatus(reservation.id, 'no_show')}
                          disabled={reservation.status === 'no_show'}
                        >
                          Marquer absent
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Bookings;