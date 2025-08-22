import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { HeaderClient } from '@/components/client/HeaderClient';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useRealtimeBookings, RealtimeBooking } from '@/hooks/useRealtimeBookings';
import { useRoleAuth } from '@/hooks/useRoleAuth';
import { useNotifications } from '@/hooks/useNotifications';
import { useRealtimeRoleSync } from '@/hooks/useRealtimeRoleSync';
import { supabase } from '@/integrations/supabase/client';
import { 
  Home, 
  Calendar, 
  User, 
  Star, 
  Bell, 
  HelpCircle,
  Plus,
  LogOut
} from 'lucide-react';

const ClientLayout = () => {
  const { user } = useRoleAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { notifications } = useNotifications(user?.id);
  useRealtimeRoleSync(); // Synchronisation en temps réel des rôles
  
  // Count unread notifications
  const unreadCount = notifications.filter(n => !n.is_read).length;

  const navigationItems = [
    { path: '/app', label: 'Accueil', icon: Home },
    { path: '/app/bookings/new', label: 'Réservation', icon: Plus },
    { path: '/app/bookings', label: 'Mes RDV', icon: Calendar },
    { path: '/app/profile', label: 'Profil', icon: User },
    { path: '/app/reviews', label: 'Avis', icon: Star },
    { path: '/app/notifications', label: 'Notifications', icon: Bell, badge: unreadCount },
    { path: '/app/support', label: 'Aide', icon: HelpCircle },
  ];

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-6">
              <Button 
                variant="ghost" 
                size="icon"
                className="hover:bg-muted"
                onClick={() => navigate('/')}
              >
                <Home className="h-5 w-5" />
              </Button>
              <h1 className="text-xl font-semibold">Mon Espace Client</h1>
            </div>
            <div className="flex items-center gap-4">
              <Button asChild size="sm">
                <Link to="/app/bookings/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Nouveau RDV
                </Link>
              </Button>
              <div className="text-sm text-muted-foreground">
                {user?.email}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex min-h-[calc(100vh-4rem)]">
        {/* Main Content - Full width without sidebar */}
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default ClientLayout;