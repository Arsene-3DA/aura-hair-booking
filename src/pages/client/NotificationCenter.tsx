import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNotifications } from '@/hooks/useNotifications';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Bell, 
  BellOff,
  Check,
  Trash2,
  Search,
  Filter,
  CheckCheck
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const NotificationItem = ({ 
  notification, 
  onMarkAsRead, 
  onDelete 
}: { 
  notification: any;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
}) => (
  <Card className={`transition-all ${notification.is_read ? 'opacity-75' : 'border-primary/20'}`}>
    <CardContent className="p-4">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-medium">{notification.title}</h4>
            {!notification.is_read && (
              <Badge variant="secondary" className="h-5 px-2">
                Nouveau
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground mb-2">
            {notification.body}
          </p>
          <p className="text-xs text-muted-foreground">
            {format(new Date(notification.created_at), 'dd MMMM yyyy à HH:mm', { locale: fr })}
          </p>
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              •••
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {!notification.is_read && (
              <DropdownMenuItem onClick={() => onMarkAsRead(notification.id)}>
                <Check className="h-4 w-4 mr-2" />
                Marquer comme lu
              </DropdownMenuItem>
            )}
            <DropdownMenuItem 
              onClick={() => onDelete(notification.id)}
              className="text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Supprimer
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </CardContent>
  </Card>
);

export default function NotificationCenter() {
  const { user } = useAuth();
  const { 
    notifications, 
    loading, 
    unreadCount,
    markAsRead,
    markAllAsRead
  } = useNotifications(user?.id);

  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');

  const filteredNotifications = notifications
    .filter(notif => {
      if (filter === 'unread') return !notif.is_read;
      if (filter === 'read') return notif.is_read;
      return true;
    })
    .filter(notif => 
      searchQuery === '' || 
      notif.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notif.body?.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const handleMarkAsRead = async (notificationId: string) => {
    await markAsRead(notificationId);
  };

  const handleDelete = async (notificationId: string) => {
    // Simple suppression côté client pour l'instant
    console.log('Delete notification:', notificationId);
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Bell className="h-8 w-8" />
            Notifications
          </h1>
          <p className="text-muted-foreground">
            {unreadCount > 0 
              ? `${unreadCount} notification${unreadCount > 1 ? 's' : ''} non lue${unreadCount > 1 ? 's' : ''}`
              : 'Toutes les notifications sont lues'
            }
          </p>
        </div>
        
        {unreadCount > 0 && (
          <Button onClick={handleMarkAllAsRead} variant="outline">
            <CheckCheck className="h-4 w-4 mr-2" />
            Tout marquer comme lu
          </Button>
        )}
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher dans les notifications..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full sm:w-auto">
                  <Filter className="h-4 w-4 mr-2" />
                  {filter === 'all' ? 'Toutes' : 
                   filter === 'unread' ? 'Non lues' : 'Lues'}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setFilter('all')}>
                  Toutes les notifications
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter('unread')}>
                  Non lues uniquement
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter('read')}>
                  Lues uniquement
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>

      {/* Notifications List */}
      <div className="space-y-4">
        {loading ? (
          [...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))
        ) : filteredNotifications.length > 0 ? (
          filteredNotifications.map(notification => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onMarkAsRead={handleMarkAsRead}
              onDelete={handleDelete}
            />
          ))
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              {searchQuery || filter !== 'all' ? (
                <>
                  <Search className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">Aucun résultat</h3>
                  <p className="text-muted-foreground">
                    Aucune notification ne correspond à vos critères de recherche
                  </p>
                </>
              ) : (
                <>
                  <BellOff className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">Aucune notification pour l'instant</h3>
                  <p className="text-muted-foreground">
                    Vos notifications apparaîtront ici lorsque vous en recevrez
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}