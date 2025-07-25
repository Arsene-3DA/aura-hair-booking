import { useState } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Calendar, 
  Clock, 
  Settings, 
  MessageSquare,
  LogOut,
  Menu,
  User,
  Scissors,
  Camera
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { useRoleAuth } from '@/hooks/useRoleAuth';

const StylistLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { signOut, user, userProfile } = useRoleAuth();
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/stylist', icon: LayoutDashboard },
    { name: 'Calendrier', href: '/stylist/calendar', icon: Calendar },
    { name: 'File d\'attente', href: '/stylist/queue', icon: Clock },
    { name: 'Clients', href: '/stylist/clients', icon: User },
    { name: 'Services', href: '/stylist/services', icon: Scissors },
    { name: 'Portfolio', href: '/stylist/portfolio', icon: Camera },
    { name: 'Messages', href: '/stylist/chat', icon: MessageSquare },
    { name: 'Paramètres', href: '/stylist/settings', icon: Settings },
  ];

  const handleSignOut = async () => {
    await signOut();
  };

  const getInitials = () => {
    if (userProfile?.full_name) {
      return userProfile.full_name
        .split(' ')
        .map(name => name[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return user?.email?.slice(0, 2).toUpperCase() || 'ST';
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className={cn(
        "bg-card border-r border-border transition-all duration-300 flex flex-col",
        sidebarOpen ? "w-64" : "w-16"
      )}>
        {/* Header */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between">
            {sidebarOpen && (
              <h2 className="text-lg font-semibold">Espace Pro</h2>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <Menu className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href || 
                (item.href === '/stylist' && location.pathname === '/stylist');
              
              return (
                <li key={item.name}>
                  <NavLink
                    to={item.href}
                    className={cn(
                      "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    )}
                  >
                    <item.icon className={cn("h-4 w-4", sidebarOpen && "mr-3")} />
                    {sidebarOpen && <span>{item.name}</span>}
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-border">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                className={cn(
                  "w-full justify-start h-auto p-2",
                  !sidebarOpen && "justify-center"
                )}
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage 
                    src={userProfile?.avatar_url} 
                    alt={userProfile?.full_name || user?.email} 
                  />
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                    {getInitials()}
                  </AvatarFallback>
                </Avatar>
                {sidebarOpen && (
                  <div className="ml-3 text-left">
                    <p className="text-sm font-medium">
                      {userProfile?.full_name || 'Styliste'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {user?.email}
                    </p>
                  </div>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">
                    {userProfile?.full_name || 'Styliste'}
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
    </div>
  );
};

export default StylistLayout;