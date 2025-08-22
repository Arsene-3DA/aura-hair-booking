import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useWelcomeData } from '@/hooks/useWelcomeData';
import { useClientReservations } from '@/hooks/useClientReservations';
import { useIsMobile } from '@/hooks/use-mobile';
import { ReservationsDisplay } from '@/components/client/ReservationsDisplay';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Calendar, 
  Clock, 
  Star, 
  Bell, 
  User, 
  Plus,
  ArrowRight 
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const KPICard = ({ title, value, subtitle, icon: Icon, color = "primary" }: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: any;
  color?: string;
}) => (
  <Card>
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
          {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
        </div>
        <Icon className={`h-8 w-8 text-${color}`} />
      </div>
    </CardContent>
  </Card>
);

const UpcomingBookingCard = ({ booking }: { booking: any }) => {
  console.log('🏷️ Rendering booking card:', booking);
  
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h4 className="font-medium">
              {booking.service?.name || booking.service_name || booking.service || 'Service personnalisé'}
            </h4>
            <p className="text-sm text-muted-foreground">
              {booking.stylist_profile?.full_name || booking.stylist_name || 'Professionnel'}
            </p>
          </div>
          <Badge variant={booking.status === 'confirmed' ? 'default' : 'secondary'}>
            {booking.status === 'confirmed' ? 'Confirmé' : 
             booking.status === 'declined' ? 'Refusé' :
             booking.status === 'pending' ? 'En attente' : booking.status}
          </Badge>
        </div>
        
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            {format(new Date(booking.scheduled_at), 'dd MMM', { locale: fr })}
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {format(new Date(booking.scheduled_at), 'HH:mm')}
          </div>
        </div>
        
        {booking.notes && (
          <p className="text-sm mt-2 p-2 bg-muted/50 rounded text-muted-foreground">
            {booking.notes}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

const RecentActionItem = ({ action }: { action: any }) => (
  <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
    <div className={`p-2 rounded-full ${
      action.type === 'booking' ? 'bg-blue-100 text-blue-600' :
      action.type === 'review' ? 'bg-yellow-100 text-yellow-600' :
      'bg-green-100 text-green-600'
    }`}>
      {action.type === 'booking' && <Calendar className="h-4 w-4" />}
      {action.type === 'review' && <Star className="h-4 w-4" />}
      {action.type === 'notification' && <Bell className="h-4 w-4" />}
    </div>
    <div className="flex-1">
      <p className="text-sm font-medium">{action.message}</p>
      <p className="text-xs text-muted-foreground">
        {format(new Date(action.created_at), 'dd MMM à HH:mm', { locale: fr })}
      </p>
    </div>
  </div>
);

export default function ClientDashboard() {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const { data: welcomeData, loading: welcomeLoading } = useWelcomeData(user?.id);
  const { 
    upcomingReservations, 
    pastReservations, 
    loading: reservationsLoading, 
    cancelReservation 
  } = useClientReservations(user?.id);

  // TEST: Vérifier le rôle de l'utilisateur
  useEffect(() => {
    console.log('🚨 DEBUG CLIENT DASHBOARD - User role check:', {
      userId: user?.id,
      userEmail: user?.email,
      welcomeData
    });
  }, [user, welcomeData]);

  console.log('🎯 Dashboard Debug:', {
    userId: user?.id,
    upcomingReservations,
    pastReservations,
    reservationsLoading
  });

  if (welcomeLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-48" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`${isMobile ? 'p-4' : 'p-6'} space-y-4`}>
      {/* Header */}
      <div className="space-y-2">
        <h1 className={`${isMobile ? 'text-2xl' : 'text-3xl'} font-bold`}>
          Bonjour {welcomeData?.user_name} ! 👋
        </h1>
        <p className="text-muted-foreground text-sm">
          Voici un aperçu de votre activité récente
        </p>
      </div>

      {/* KPI Cards */}
      <div className={`grid ${isMobile ? 'grid-cols-1 gap-3' : 'grid-cols-1 md:grid-cols-3 gap-6'}`}>
        <KPICard
          title="Total réservations"
          value={welcomeData?.stats.total_bookings || 0}
          icon={Calendar}
          color="blue-600"
        />
        <KPICard
          title="Avis en attente"
          value={welcomeData?.stats.pending_reviews || 0}
          subtitle="À évaluer"
          icon={Star}
          color="yellow-600"
        />
        <KPICard
          title="Notifications"
          value={welcomeData?.stats.unread_notifications || 0}
          subtitle="Non lues"
          icon={Bell}
          color="green-600"
        />
      </div>

      {/* Section complète des réservations */}
      <ReservationsDisplay
        upcomingReservations={upcomingReservations}
        pastReservations={pastReservations}
        loading={reservationsLoading}
        onCancelReservation={cancelReservation}
      />

      <div className="grid grid-cols-1 gap-4">
        {/* Actions rapides */}
        <Card>
          <CardHeader className={isMobile ? 'pb-3' : ''}>
            <CardTitle className={isMobile ? 'text-lg' : ''}>Actions rapides</CardTitle>
          </CardHeader>
          <CardContent className={`grid ${isMobile ? 'grid-cols-1 gap-2' : 'grid-cols-3 gap-3'}`}>
            <Button asChild variant="outline" className={`h-auto ${isMobile ? 'p-3 flex-row justify-start' : 'p-4 flex-col'}`}>
              <Link to="/app/profile">
                <User className={`${isMobile ? 'h-5 w-5 mr-3' : 'h-6 w-6 mb-2'}`} />
                Mon profil
              </Link>
            </Button>
            <Button asChild variant="outline" className={`h-auto ${isMobile ? 'p-3 flex-row justify-start' : 'p-4 flex-col'}`}>
              <Link to="/app/reviews">
                <Star className={`${isMobile ? 'h-5 w-5 mr-3' : 'h-6 w-6 mb-2'}`} />
                Mes avis
              </Link>
            </Button>
            <Button asChild variant="outline" className={`h-auto ${isMobile ? 'p-3 flex-row justify-between' : 'p-4 flex-col'}`}>
              <Link to="/app/notifications">
                <div className={`flex ${isMobile ? 'items-center' : 'flex-col items-center'}`}>
                  <Bell className={`${isMobile ? 'h-5 w-5 mr-3' : 'h-6 w-6 mb-2'}`} />
                  <span>Notifications</span>
                </div>
                {(welcomeData?.stats.unread_notifications || 0) > 0 && (
                  <Badge className="h-5 px-2 text-xs">
                    {welcomeData?.stats.unread_notifications}
                  </Badge>
                )}
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Activité récente */}
        <Card>
          <CardHeader className={isMobile ? 'pb-3' : ''}>
            <CardTitle className={isMobile ? 'text-lg' : ''}>Activité récente</CardTitle>
          </CardHeader>
          <CardContent>
            {welcomeData?.recent_actions && welcomeData.recent_actions.length > 0 ? (
              <div className="space-y-2">
                {welcomeData.recent_actions.map(action => (
                  <RecentActionItem key={action.id} action={action} />
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-muted-foreground text-sm">
                  Aucune activité récente
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}