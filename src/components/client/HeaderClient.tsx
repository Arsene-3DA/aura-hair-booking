import { Bell, Calendar, User, LogOut, Settings, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { EnhancedAvatar } from '@/components/EnhancedAvatar';
import { useRoleAuth } from '@/hooks/useRoleAuth';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

interface HeaderClientProps {
  onNewBookingClick?: () => void;
  pendingNotifications?: number;
}

export const HeaderClient = ({ onNewBookingClick, pendingNotifications = 0 }: HeaderClientProps) => {
  const { signOut, user, userProfile } = useRoleAuth();
  const navigate = useNavigate();
  
  const handleSignOut = async () => {
    await signOut();
  };

  const handleNewBookingClick = () => {
    if (onNewBookingClick) {
      onNewBookingClick();
    } else {
      navigate('/app/bookings/new');
    }
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
    return user?.email?.slice(0, 2).toUpperCase() || 'CL';
  };

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="flex h-16 items-center justify-between px-6">
        <div className="flex items-center space-x-4">
          {/* Home Button */}
          <Button 
            asChild
            variant="ghost" 
            size="icon"
            className="hover:bg-muted"
          >
            <Link to="/">
              <Home className="h-5 w-5" />
            </Link>
          </Button>
          
          <h1 className="text-xl font-semibold text-foreground">
            Mon Espace Client
          </h1>
        </div>

        <div className="flex items-center space-x-4">
          {/* New Booking Button */}
          <Button 
            onClick={handleNewBookingClick}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Calendar className="mr-2 h-4 w-4" />
            Nouveau RDV
          </Button>

          {/* Notifications */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="relative"
          >
            <Bell className="h-5 w-5" />
            {pendingNotifications > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
              >
                {pendingNotifications > 9 ? '9+' : pendingNotifications}
              </Badge>
            )}
          </Button>

          {/* User Avatar Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                <EnhancedAvatar 
                  src={userProfile?.avatar_url}
                  name={userProfile?.full_name || user?.email}
                  size="md"
                />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {userProfile?.full_name || 'Client'}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>Mon Profil</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>Paramètres</span>
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
    </header>
  );
};