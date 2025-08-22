import { useState } from 'react';
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, Calendar, Settings, Activity, LogOut, Menu, User, Shield, FileText, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useRoleAuth } from '@/hooks/useRoleAuth';
import { useRealtimeRoleSync } from '@/hooks/useRealtimeRoleSync';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { clearAllSessions } from '@/utils/sessionCleanup';
const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();
  const {
    user,
    userProfile
  } = useRoleAuth();
  const location = useLocation();
  useRealtimeRoleSync(); // Synchronisation en temps réel des rôles

  const navigation = [{
    name: 'Overview',
    href: '/admin',
    icon: LayoutDashboard
  }, {
    name: 'Utilisateurs',
    href: '/admin/users',
    icon: Users
  }, {
    name: 'Réservations',
    href: '/admin/bookings',
    icon: Calendar
  }, {
    name: 'Rapports',
    href: '/admin/reports',
    icon: FileText
  }, {
    name: 'Audit Trail',
    href: '/admin/audit',
    icon: Activity
  }, {
    name: 'Paramètres',
    href: '/admin/settings',
    icon: Settings
  }];
  const handleSignOut = async () => {
    try {
      // Force logout directement avec Supabase
      await supabase.auth.signOut();
      
      // Nettoyage du localStorage
      const sensitiveKeys = [
        'lastActivity',
        'rate_limits',
        'lastAdminPromotion',
        'session.user_agent',
        'supabase.auth.token'
      ];
      
      sensitiveKeys.forEach(key => {
        localStorage.removeItem(key);
      });
      
      toast({
        title: "Déconnexion réussie",
        description: "Vous avez été déconnecté avec succès",
      });
      
      // Redirection vers la page d'accueil
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      toast({
        title: "Erreur de déconnexion",
        description: "Une erreur s'est produite lors de la déconnexion",
        variant: "destructive",
      });
    }
  };
  const handleClearConflictingSessions = async () => {
    try {
      await clearAllSessions();
      toast({
        title: "Sessions nettoyées",
        description: "Toutes les sessions conflictuelles ont été supprimées",
      });
      window.location.href = '/';
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de nettoyer les sessions",
        variant: "destructive",
      });
    }
  };

  const getInitials = () => {
    if (userProfile?.full_name) {
      return userProfile.full_name.split(' ').map(name => name[0]).join('').toUpperCase().slice(0, 2);
    }
    return user?.email?.slice(0, 2).toUpperCase() || 'AD';
  };
  return <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className={cn("bg-card border-r border-border transition-all duration-300 flex flex-col", sidebarOpen ? "w-64" : "w-16")}>
        {/* Header */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between">
            {sidebarOpen && <div className="flex items-center gap-2">
                <Shield className="h-6 w-6 text-primary" />
                <h2 className="text-lg font-semibold">Admin Panel</h2>
              </div>}
            <div className="flex items-center gap-2">
              <Button asChild variant="ghost" size="icon" className="hover:bg-muted">
                <Link to="/">
                  <Home className="h-4 w-4" />
                </Link>
              </Button>
              <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)} className="text-gray-50">
                <Menu className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {navigation.map(item => {
            const isActive = location.pathname === item.href || item.href === '/admin' && location.pathname === '/admin';
            return <li key={item.name}>
                  <NavLink to={item.href} className={cn("flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors", isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted")}>
                    <item.icon className={cn("h-4 w-4", sidebarOpen && "mr-3")} />
                    {sidebarOpen && <span>{item.name}</span>}
                  </NavLink>
                </li>;
          })}
          </ul>
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-border">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className={cn("w-full justify-start h-auto p-2", !sidebarOpen && "justify-center")}>
                <Avatar className="h-8 w-8">
                  <AvatarImage src={userProfile?.avatar_url} alt={userProfile?.full_name || user?.email} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                    {getInitials()}
                  </AvatarFallback>
                </Avatar>
                {sidebarOpen && <div className="ml-3 text-left">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">
                        {userProfile?.full_name || 'Admin'}
                      </p>
                      <Badge variant="secondary" className="text-xs">
                        Admin
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {user?.email}
                    </p>
                  </div>}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">
                    {userProfile?.full_name || 'Administrateur'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {user?.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>Mon Profil</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleClearConflictingSessions}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Nettoyer les sessions</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Se déconnecter</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>;
};
export default AdminLayout;