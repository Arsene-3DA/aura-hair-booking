import { useState } from 'react';
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Calendar, Clock, Settings, MessageSquare, Menu, User, Scissors, Camera, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { useRoleAuth } from '@/hooks/useRoleAuth';
import { useRealtimeRoleSync } from '@/hooks/useRealtimeRoleSync';
import LogoutButton from '@/components/LogoutButton';
import { Link } from 'react-router-dom';
const StylistLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const {
    user,
    userProfile
  } = useRoleAuth();
  const location = useLocation();
  const navigate = useNavigate();
  useRealtimeRoleSync(); // Synchronisation en temps réel des rôles

  const navigation = [{
    name: 'Dashboard',
    href: '/stylist',
    icon: LayoutDashboard
  }, {
    name: 'Calendrier',
    href: '/stylist/calendar',
    icon: Calendar
  }, {
    name: 'File d\'attente',
    href: '/stylist/queue',
    icon: Clock
  }, {
    name: 'Clients',
    href: '/stylist/clients',
    icon: User
  }, {
    name: 'Services',
    href: '/stylist/services',
    icon: Scissors
  }, {
    name: 'Portfolio',
    href: '/stylist/portfolio',
    icon: Camera
  }, {
    name: 'Messages',
    href: '/stylist/chat',
    icon: MessageSquare
  }, {
    name: 'Paramètres',
    href: '/stylist/settings',
    icon: Settings
  }];
  const getInitials = () => {
    if (userProfile?.full_name) {
      return userProfile.full_name.split(' ').map(name => name[0]).join('').toUpperCase().slice(0, 2);
    }
    return user?.email?.slice(0, 2).toUpperCase() || 'ST';
  };
  return <div className="flex h-screen bg-background relative">
      {/* Mobile overlay */}
      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}
      {/* Sidebar */}
      <div className={cn("bg-card border-r border-border transition-all duration-300 flex flex-col", "fixed lg:static inset-y-0 left-0 z-50 lg:z-auto", sidebarOpen ? "w-64" : "w-16 lg:w-16", "lg:translate-x-0", sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0")}>
        {/* Header */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between bg-slate-950">
            {sidebarOpen && <h2 className="text-lg font-semibold text-gray-50">Espace Pro</h2>}
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={() => navigate('/')} className="hover:bg-muted text-gray-50">
                <Home className="h-4 w-4" />
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
            const isActive = location.pathname === item.href || item.href === '/stylist' && location.pathname === '/stylist';
            return <li key={item.name}>
                  <NavLink to={item.href} className={cn("flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors", isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted")}>
                    <item.icon className={cn("h-4 w-4", sidebarOpen && "mr-3")} />
                    {sidebarOpen && <span>{item.name}</span>}
                  </NavLink>
                </li>;
          })}
          </ul>
        </nav>

        {/* User Profile & Logout */}
        <div className="p-4 border-t border-border space-y-3">
          {sidebarOpen && <div className="flex items-center gap-3 p-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={userProfile?.avatar_url} alt={userProfile?.full_name || user?.email} />
                <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {userProfile?.full_name || 'Styliste'}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {user?.email}
                </p>
              </div>
            </div>}
          
          <LogoutButton variant="outline" size={sidebarOpen ? "default" : "icon"} showText={sidebarOpen} className="w-full" />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header mobile avec bouton de déconnexion */}
        <div className="lg:hidden bg-card border-b border-border p-4 flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)}>
            <Menu className="h-5 w-5" />
          </Button>
          <h1 className="font-semibold">Espace Pro</h1>
          <LogoutButton variant="outline" size="sm" showText={false} />
        </div>
        
        <main className="flex-1 overflow-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>;
};
export default StylistLayout;