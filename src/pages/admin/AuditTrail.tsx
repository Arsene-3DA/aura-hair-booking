import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Search, 
  Filter,
  Activity,
  User,
  Calendar,
  Settings,
  Shield,
  AlertTriangle
} from 'lucide-react';

interface AuditEvent {
  id: string;
  timestamp: string;
  userId: string;
  userEmail: string;
  action: string;
  resource: string;
  details: string;
  ipAddress: string;
  userAgent: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

const AuditTrail = () => {
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [actionFilter, setActionFilter] = useState<string>('all');

  // Mock data for demonstration
  useEffect(() => {
    const mockEvents: AuditEvent[] = [
      {
        id: '1',
        timestamp: new Date().toISOString(),
        userId: 'admin-1',
        userEmail: 'admin@salon.com',
        action: 'USER_ROLE_CHANGED',
        resource: 'users',
        details: 'Rôle modifié de client vers coiffeur pour utilisateur john@example.com',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0...',
        severity: 'medium'
      },
      {
        id: '2',
        timestamp: new Date(Date.now() - 300000).toISOString(),
        userId: 'admin-1',
        userEmail: 'admin@salon.com',
        action: 'USER_SUSPENDED',
        resource: 'users',
        details: 'Utilisateur suspendu: spammer@example.com',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0...',
        severity: 'high'
      },
      {
        id: '3',
        timestamp: new Date(Date.now() - 600000).toISOString(),
        userId: 'coiffeur-1',
        userEmail: 'marie@salon.com',
        action: 'BOOKING_CONFIRMED',
        resource: 'bookings',
        details: 'Réservation confirmée pour client@example.com le 2024-01-15',
        ipAddress: '192.168.1.101',
        userAgent: 'Mozilla/5.0...',
        severity: 'low'
      },
      {
        id: '4',
        timestamp: new Date(Date.now() - 900000).toISOString(),
        userId: 'system',
        userEmail: 'system@salon.com',
        action: 'SYSTEM_BACKUP',
        resource: 'system',
        details: 'Sauvegarde automatique effectuée avec succès',
        ipAddress: '127.0.0.1',
        userAgent: 'System/1.0',
        severity: 'low'
      },
      {
        id: '5',
        timestamp: new Date(Date.now() - 1200000).toISOString(),
        userId: 'unknown',
        userEmail: 'unknown',
        action: 'LOGIN_FAILED',
        resource: 'auth',
        details: 'Tentative de connexion échouée pour admin@salon.com',
        ipAddress: '89.123.45.67',
        userAgent: 'curl/7.68.0',
        severity: 'critical'
      }
    ];

    setTimeout(() => {
      setEvents(mockEvents);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredEvents = events.filter(event => {
    const matchesSearch = 
      event.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.details.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSeverity = severityFilter === 'all' || event.severity === severityFilter;
    const matchesAction = actionFilter === 'all' || event.action.includes(actionFilter);
    
    return matchesSearch && matchesSeverity && matchesAction;
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getActionIcon = (action: string) => {
    if (action.includes('USER')) return User;
    if (action.includes('BOOKING')) return Calendar;
    if (action.includes('SYSTEM')) return Settings;
    if (action.includes('LOGIN') || action.includes('AUTH')) return Shield;
    return Activity;
  };

  const getActionColor = (action: string) => {
    if (action.includes('FAILED') || action.includes('SUSPENDED')) return 'text-red-500';
    if (action.includes('CONFIRMED') || action.includes('BACKUP')) return 'text-green-500';
    if (action.includes('CHANGED') || action.includes('UPDATED')) return 'text-blue-500';
    return 'text-gray-500';
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Journal d'audit</h1>
          <p className="text-muted-foreground">Historique des actions sur la plateforme</p>
        </div>
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-muted rounded"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Journal d'audit</h1>
          <p className="text-muted-foreground">Historique des actions sur la plateforme</p>
        </div>
        <Badge variant="outline" className="px-3 py-1">
          <Activity className="w-3 h-3 mr-1" />
          Temps réel
        </Badge>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Activity className="h-4 w-4 text-muted-foreground" />
              <div className="ml-2">
                <p className="text-sm font-medium text-muted-foreground">Total événements</p>
                <p className="text-2xl font-bold">{events.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <div className="ml-2">
                <p className="text-sm font-medium text-muted-foreground">Critiques</p>
                <p className="text-2xl font-bold">
                  {events.filter(e => e.severity === 'critical').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <AlertTriangle className="h-4 w-4 text-orange-500" />
              <div className="ml-2">
                <p className="text-sm font-medium text-muted-foreground">Élevés</p>
                <p className="text-2xl font-bold">
                  {events.filter(e => e.severity === 'high').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Activity className="h-4 w-4 text-green-500" />
              <div className="ml-2">
                <p className="text-sm font-medium text-muted-foreground">Dernière heure</p>
                <p className="text-2xl font-bold">
                  {events.filter(e => 
                    new Date(e.timestamp) > new Date(Date.now() - 3600000)
                  ).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filtres
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher par utilisateur, action..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Sévérité" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes</SelectItem>
                <SelectItem value="low">Faible</SelectItem>
                <SelectItem value="medium">Moyenne</SelectItem>
                <SelectItem value="high">Élevée</SelectItem>
                <SelectItem value="critical">Critique</SelectItem>
              </SelectContent>
            </Select>
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes</SelectItem>
                <SelectItem value="USER">Utilisateurs</SelectItem>
                <SelectItem value="BOOKING">Réservations</SelectItem>
                <SelectItem value="SYSTEM">Système</SelectItem>
                <SelectItem value="LOGIN">Authentification</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Events Table */}
      <Card>
        <CardHeader>
          <CardTitle>Événements ({filteredEvents.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Horodatage</TableHead>
                <TableHead>Utilisateur</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Détails</TableHead>
                <TableHead>Sévérité</TableHead>
                <TableHead>IP</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEvents.map((event) => {
                const ActionIcon = getActionIcon(event.action);
                return (
                  <TableRow key={event.id}>
                    <TableCell>
                      <div className="text-sm">
                        {new Date(event.timestamp).toLocaleString('fr-FR')}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{event.userEmail}</div>
                        <div className="text-sm text-muted-foreground">
                          {event.userId}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <ActionIcon className={`w-4 h-4 ${getActionColor(event.action)}`} />
                        <span className="font-mono text-sm">{event.action}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-md truncate" title={event.details}>
                        {event.details}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getSeverityColor(event.severity)}>
                        {event.severity}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="font-mono text-sm">{event.ipAddress}</div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuditTrail;