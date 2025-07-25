import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { HeaderClient } from '@/components/client/HeaderClient';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useRealtimeBookings, RealtimeBooking } from '@/hooks/useRealtimeBookings';
import { useRoleAuth } from '@/hooks/useRoleAuth';
import { useNotifications } from '@/hooks/useNotifications';
import { 
  Home, 
  Calendar, 
  User, 
  Star, 
  Bell, 
  HelpCircle,
  Plus
} from 'lucide-react';

const ClientLayout = () => {
  const { user } = useRoleAuth();
  const location = useLocation();
  const { notifications } = useNotifications(user?.id);
  
  // Count unread notifications
  const unreadCount = notifications.filter(n => !n.is_read).length;

  const navigationItems = [
    { path: '/app', label: 'Accueil', icon: Home },
    { path: '/app/bookings', label: 'Réservations', icon: Calendar },
    { path: '/app/profile', label: 'Profil', icon: User },
    { path: '/app/reviews', label: 'Avis', icon: Star },
    { path: '/app/notifications', label: 'Notifications', icon: Bell, badge: unreadCount },
    { path: '/app/support', label: 'Aide', icon: HelpCircle },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-6">
              <h1 className="text-xl font-semibold">Mon Espace Client</h1>
            </div>
            <div className="flex items-center gap-4">
              <Button asChild size="sm">
                <Link to="/app/booking">
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
        {/* Sidebar Navigation */}
        <nav className="w-64 border-r bg-card/50 p-6">
          <div className="space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Button
                  key={item.path}
                  asChild
                  variant={isActive ? "default" : "ghost"}
                  className="w-full justify-start"
                >
                  <Link to={item.path}>
                    <Icon className="h-4 w-4 mr-3" />
                    {item.label}
                    {item.badge && item.badge > 0 && (
                      <Badge variant="secondary" className="ml-auto">
                        {item.badge}
                      </Badge>
                    )}
                  </Link>
                </Button>
              );
            })}
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default ClientLayout;