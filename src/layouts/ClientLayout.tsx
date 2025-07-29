import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { HeaderClient } from '@/components/client/HeaderClient';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useRealtimeBookings, RealtimeBooking } from '@/hooks/useRealtimeBookings';
import { useAuthenticationManager } from '@/hooks/useAuthenticationManager';
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
  const { user } = useAuthenticationManager();
  const location = useLocation();
  const { notifications } = useNotifications(user?.id);
  useRealtimeRoleSync(); // Synchronisation en temps réel des rôles
  
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
        {/* Sidebar Navigation */}
        <nav className="w-[220px] border-r bg-primary/90 p-6 flex flex-col">
          <div className="space-y-2 flex-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Button
                  key={item.path}
                  asChild
                  variant={isActive ? "secondary" : "ghost"}
                  className="w-full justify-start text-primary-foreground hover:text-primary hover:bg-primary-foreground/90"
                >
                  <Link to={item.path}>
                    <Icon className="h-4 w-4 mr-3" />
                    {item.label}
                    {item.path === '/app/notifications' && unreadCount > 0 && (
                      <Badge variant="destructive" className="ml-auto h-5 px-2 text-xs">
                        {unreadCount}
                      </Badge>
                    )}
                  </Link>
                </Button>
              );
            })}
          </div>
          
          {/* Logout Button */}
          <div className="mt-6 pt-6 border-t border-primary-foreground/20">
            <Button 
              variant="ghost" 
              onClick={handleLogout}
              className="w-full justify-start text-primary-foreground hover:text-primary hover:bg-primary-foreground/90"
            >
              <LogOut className="h-4 w-4 mr-3" />
              Déconnexion
            </Button>
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