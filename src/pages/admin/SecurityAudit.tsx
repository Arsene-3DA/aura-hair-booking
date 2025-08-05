// SECURITY ENHANCEMENT: Security audit page for administrators
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSecurityState } from '@/components/EnhancedSecurityProvider';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Eye, 
  RefreshCw,
  Clock,
  Users,
  Database,
  Lock
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface SecurityLog {
  id: string;
  event_type: string;
  user_id?: string;
  event_data: any;
  ip_address?: string;
  user_agent?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  created_at: string;
}

interface SecurityMetrics {
  totalEvents: number;
  criticalEvents: number;
  highSeverityEvents: number;
  failedLogins: number;
  suspiciousActivity: number;
  lastUpdate: string;
}

export default function SecurityAudit() {
  const [securityLogs, setSecurityLogs] = useState<SecurityLog[]>([]);
  const [metrics, setMetrics] = useState<SecurityMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const { securityLevel, securityWarnings, refreshSecurityContext } = useSecurityState();

  // Load security logs
  const loadSecurityLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('security_audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;

      setSecurityLogs(data as SecurityLog[]);

      // Calculate metrics
      const now = new Date().toISOString();
      const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      
      const recentLogs = data.filter(log => log.created_at > last24h);
      
      setMetrics({
        totalEvents: data.length,
        criticalEvents: recentLogs.filter(log => log.severity === 'critical').length,
        highSeverityEvents: recentLogs.filter(log => log.severity === 'high').length,
        failedLogins: recentLogs.filter(log => log.event_type === 'login_failed').length,
        suspiciousActivity: recentLogs.filter(log => 
          log.event_type.includes('suspicious') || 
          log.event_type.includes('violation')
        ).length,
        lastUpdate: now
      });

    } catch (error) {
      console.error('Error loading security logs:', error);
    } finally {
      setLoading(false);
    }
  };

  // Refresh security data
  const handleRefresh = async () => {
    setLoading(true);
    await Promise.all([
      loadSecurityLogs(),
      refreshSecurityContext()
    ]);
  };

  useEffect(() => {
    loadSecurityLogs();
  }, []);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const getSecurityLevelIcon = (level: string) => {
    switch (level) {
      case 'critical': return <XCircle className="h-5 w-5 text-destructive" />;
      case 'high': return <AlertTriangle className="h-5 w-5 text-orange-500" />;
      case 'medium': return <Eye className="h-5 w-5 text-yellow-500" />;
      case 'low': return <CheckCircle className="h-5 w-5 text-green-500" />;
      default: return <Shield className="h-5 w-5 text-muted-foreground" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Chargement de l'audit de sécurité...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Shield className="h-8 w-8" />
            Audit de Sécurité
          </h1>
          <p className="text-muted-foreground">
            Surveillance et analyse de la sécurité de la plateforme
          </p>
        </div>
        <Button onClick={handleRefresh} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Actualiser
        </Button>
      </div>

      {/* Security Level Alert */}
      {(securityLevel === 'high' || securityLevel === 'critical') && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Niveau de sécurité: {securityLevel.toUpperCase()}</AlertTitle>
          <AlertDescription>
            {securityWarnings.length > 0 && (
              <ul className="mt-2 list-disc list-inside">
                {securityWarnings.slice(0, 3).map((warning, index) => (
                  <li key={index}>{warning}</li>
                ))}
              </ul>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Metrics Overview */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Database className="h-4 w-4 text-blue-500" />
                <div>
                  <p className="text-sm font-medium">Événements Total</p>
                  <p className="text-2xl font-bold">{metrics.totalEvents}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <XCircle className="h-4 w-4 text-red-500" />
                <div>
                  <p className="text-sm font-medium">Critiques (24h)</p>
                  <p className="text-2xl font-bold text-red-500">{metrics.criticalEvents}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-4 w-4 text-orange-500" />
                <div>
                  <p className="text-sm font-medium">Haute Gravité (24h)</p>
                  <p className="text-2xl font-bold text-orange-500">{metrics.highSeverityEvents}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Lock className="h-4 w-4 text-purple-500" />
                <div>
                  <p className="text-sm font-medium">Connexions Échouées</p>
                  <p className="text-2xl font-bold text-purple-500">{metrics.failedLogins}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Eye className="h-4 w-4 text-yellow-500" />
                <div>
                  <p className="text-sm font-medium">Activité Suspecte</p>
                  <p className="text-2xl font-bold text-yellow-500">{metrics.suspiciousActivity}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Security Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="events">Événements</TabsTrigger>
          <TabsTrigger value="users">Utilisateurs</TabsTrigger>
          <TabsTrigger value="system">Système</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {getSecurityLevelIcon(securityLevel)}
                État de Sécurité Global
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Niveau de sécurité actuel:</span>
                  <Badge variant={getSeverityColor(securityLevel)}>
                    {securityLevel.toUpperCase()}
                  </Badge>
                </div>
                
                {securityWarnings.length > 0 && (
                  <div>
                    <p className="font-medium mb-2">Avertissements actifs:</p>
                    <ul className="list-disc list-inside space-y-1">
                      {securityWarnings.map((warning, index) => (
                        <li key={index} className="text-sm text-muted-foreground">
                          {warning}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="events" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Événements de Sécurité Récents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {securityLogs.slice(0, 20).map((log) => (
                  <div key={log.id} className="flex items-start justify-between p-3 border rounded">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant={getSeverityColor(log.severity)}>
                          {log.severity}
                        </Badge>
                        <span className="font-medium">{log.event_type}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {typeof log.event_data === 'object' 
                          ? JSON.stringify(log.event_data, null, 2)
                          : log.event_data
                        }
                      </p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {format(new Date(log.created_at), 'PPpp', { locale: fr })}
                        </span>
                        {log.ip_address && (
                          <span>IP: {log.ip_address}</span>
                        )}
                        {log.user_id && (
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {log.user_id.substring(0, 8)}...
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Activité Utilisateurs Suspecte</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {securityLogs
                  .filter(log => log.event_type.includes('login') || log.event_type.includes('user'))
                  .slice(0, 10)
                  .map((log) => (
                    <div key={log.id} className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <p className="font-medium">{log.event_type}</p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(log.created_at), 'PPpp', { locale: fr })}
                        </p>
                      </div>
                      <Badge variant={getSeverityColor(log.severity)}>
                        {log.severity}
                      </Badge>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Événements Système</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {securityLogs
                  .filter(log => log.event_type.includes('system') || log.event_type.includes('security'))
                  .slice(0, 10)
                  .map((log) => (
                    <div key={log.id} className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <p className="font-medium">{log.event_type}</p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(log.created_at), 'PPpp', { locale: fr })}
                        </p>
                      </div>
                      <Badge variant={getSeverityColor(log.severity)}>
                        {log.severity}
                      </Badge>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}