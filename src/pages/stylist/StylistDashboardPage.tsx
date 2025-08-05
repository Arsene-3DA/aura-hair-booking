import { useRoleAuth } from '@/hooks/useRoleAuth';
import { useStylistStats } from '@/hooks/useStylistStats';
import { useStylistClients } from '@/hooks/useStylistClients';
import { useStylistReservations } from '@/hooks/useStylistReservations';
import { KPICard } from '@/components/stylist/KPICard';
import { DashboardSkeleton } from '@/components/stylist/SkeletonLoader';
import { Calendar, CheckCircle, Clock, AlertTriangle, TrendingUp, Users, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

const StylistDashboardPage = () => {
  const { userProfile } = useRoleAuth();
  const navigate = useNavigate();
  const stats = useStylistStats(userProfile?.user_id);
  const { clients, loading: clientsLoading } = useStylistClients(userProfile?.user_id);
  const { reservations, loading: reservationsLoading } = useStylistReservations();

  // Memoized revenue data for better performance
  const revenueData = useMemo(() => [
    { date: '1 Jan', revenue: 250 },
    { date: '5 Jan', revenue: 180 },
    { date: '10 Jan', revenue: 320 },
    { date: '15 Jan', revenue: 290 },
    { date: '20 Jan', revenue: 410 },
    { date: '25 Jan', revenue: 350 },
    { date: '30 Jan', revenue: 480 },
  ], []);

  if (stats.loading || clientsLoading || reservationsLoading) {
    return <DashboardSkeleton />;
  }

  // Prochains rendez-vous dans les 7 jours
  const upcomingBookings = reservations.filter(reservation => {
    const bookingDate = new Date(reservation.scheduled_at);
    const now = new Date();
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    return bookingDate >= now && bookingDate <= sevenDaysFromNow;
  }).slice(0, 5);

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'confirmed': return 'default';
      case 'pending': return 'secondary';
      case 'completed': return 'outline';
      case 'cancelled': return 'destructive';
      default: return 'secondary';
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto p-4 sm:p-6">
      {/* Header amélioré */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-gradient-to-r from-primary/5 to-secondary/5 p-6 rounded-xl border border-primary/20">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Bonjour {userProfile?.full_name || 'Styliste'}, voici un aperçu de votre activité
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => navigate('/stylist/calendar')}
            className="flex items-center gap-2"
          >
            <Calendar className="h-4 w-4" />
            Planning
          </Button>
          <Button 
            onClick={() => navigate('/stylist/clients')}
            className="flex items-center gap-2"
          >
            <Users className="h-4 w-4" />
            Mes clients
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Rendez-vous aujourd'hui"
          value={stats.totalToday}
          icon={Calendar}
          change="+2 par rapport à hier"
          changeType="positive"
        />
        <KPICard
          title="Confirmés"
          value={stats.confirmed}
          icon={CheckCircle}
          change={`${Math.round((stats.confirmed / stats.totalToday) * 100) || 0}% du total`}
          changeType="positive"
        />
        <KPICard
          title="En attente"
          value={stats.pending}
          icon={Clock}
          change="À valider"
          changeType="neutral"
        />
        <KPICard
          title="Total clients"
          value={clients.length}
          icon={Users}
          change="clients fidèles"
          changeType="positive"
        />
      </div>

      {/* Section Clients et Prochains RDV */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Prochains rendez-vous */}
        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Prochains rendez-vous
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('/stylist/calendar')}
              >
                <Eye className="h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {upcomingBookings.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Aucun rendez-vous à venir</p>
              </div>
            ) : (
              upcomingBookings.map((booking) => (
                <div key={booking.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={booking.client_avatar || ''} />
                      <AvatarFallback>
                        {booking.client_name?.split(' ').map(n => n[0]).join('') || 'C'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-sm">{booking.client_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(booking.scheduled_at), 'dd MMM - HH:mm', { locale: fr })}
                      </p>
                    </div>
                  </div>
                  <Badge variant={getStatusBadgeVariant(booking.status)}>
                    {booking.status}
                  </Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Clients récents */}
        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Clients récents
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('/stylist/clients')}
              >
                <Eye className="h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {clients.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Aucun client pour le moment</p>
              </div>
            ) : (
              clients.slice(0, 5).map((client) => (
                <div key={client.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={client.avatar_url || ''} />
                      <AvatarFallback>
                        {client.full_name?.split(' ').map(n => n[0]).join('') || 'C'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-sm">{client.full_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {client.total_bookings} rendez-vous
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {client.last_booking_date ? 
                      format(new Date(client.last_booking_date), 'dd MMM', { locale: fr }) 
                      : 'Jamais'
                    }
                  </p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Revenue Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Revenus des 30 derniers jours
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[250px] sm:h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis 
                  dataKey="date" 
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${value}€`}
                />
                <Tooltip 
                  formatter={(value) => [`${value}€`, 'Revenus']}
                  labelFormatter={(label) => `Date: ${label}`}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '6px'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--primary))' }}
                  activeDot={{ r: 4, fill: 'hsl(var(--primary))' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StylistDashboardPage;