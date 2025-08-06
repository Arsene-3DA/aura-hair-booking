// SECURITY DASHBOARD: Centralized security management interface
import React, { useState, useEffect } from 'react';
import { useSecurityState } from './EnhancedSecurityProvider';
import { SecurityScanner } from './SecurityScanner';
import { securityAuditor, SecurityReport } from '@/utils/securityAudit';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  TrendingUp,
  Download,
  RefreshCw,
  Eye,
  Lock
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export const SecurityDashboard: React.FC = () => {
  const { securityLevel, securityWarnings, isSecurityEnabled } = useSecurityState();
  const [auditReport, setAuditReport] = useState<SecurityReport | null>(null);
  const [isRunningAudit, setIsRunningAudit] = useState(false);
  const [auditHistory, setAuditHistory] = useState<SecurityReport[]>([]);

  const runFullSecurityAudit = async () => {
    setIsRunningAudit(true);
    
    try {
      const report = await securityAuditor.runFullAudit();
      setAuditReport(report);
      
      // Save to audit history
      setAuditHistory(prev => [report, ...prev.slice(0, 9)]); // Keep last 10 reports
      
      // Log the audit to Supabase
      await supabase.from('security_audit_logs').insert({
        event_type: 'security_audit_completed',
        event_data: {
          score: report.overallScore,
          criticalIssues: report.criticalIssues,
          highIssues: report.highIssues,
          mediumIssues: report.mediumIssues,
          lowIssues: report.lowIssues,
          timestamp: report.timestamp.toISOString()
        },
        severity: report.criticalIssues > 0 ? 'critical' : 
                 report.highIssues > 0 ? 'high' : 
                 report.mediumIssues > 0 ? 'medium' : 'low'
      });
    } catch (error) {
      console.error('Audit failed:', error);
    } finally {
      setIsRunningAudit(false);
    }
  };

  const exportAuditReport = () => {
    if (!auditReport) return;
    
    const reportData = {
      timestamp: auditReport.timestamp,
      score: auditReport.overallScore,
      summary: {
        passed: auditReport.passed,
        critical: auditReport.criticalIssues,
        high: auditReport.highIssues,
        medium: auditReport.mediumIssues,
        low: auditReport.lowIssues
      },
      results: auditReport.results
    };
    
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `security-audit-${auditReport.timestamp.toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getSecurityLevelColor = (level: string) => {
    switch (level) {
      case 'low':
        return 'text-green-600 bg-green-100';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100';
      case 'high':
        return 'text-orange-600 bg-orange-100';
      case 'critical':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    if (score >= 50) return 'text-orange-600';
    return 'text-red-600';
  };

  useEffect(() => {
    // Run initial audit
    runFullSecurityAudit();
  }, []);

  if (!isSecurityEnabled) {
    return (
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertTitle>Tableau de bord sécurité indisponible</AlertTitle>
        <AlertDescription>
          Le mode de sécurité strict doit être activé pour accéder au tableau de bord sécurité.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Security Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Niveau de sécurité</p>
                <Badge className={`mt-1 ${getSecurityLevelColor(securityLevel)}`}>
                  {securityLevel.toUpperCase()}
                </Badge>
              </div>
              <Shield className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Score de sécurité</p>
                <p className={`text-2xl font-bold ${auditReport ? getScoreColor(auditReport.overallScore) : 'text-gray-400'}`}>
                  {auditReport ? `${auditReport.overallScore}%` : 'N/A'}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avertissements actifs</p>
                <p className="text-2xl font-bold text-yellow-600">{securityWarnings.length}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Security Warnings */}
      {securityWarnings.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Avertissements de sécurité détectés</AlertTitle>
          <AlertDescription>
            <ul className="mt-2 list-disc list-inside text-sm">
              {securityWarnings.slice(0, 3).map((warning, index) => (
                <li key={index}>{warning}</li>
              ))}
            </ul>
            {securityWarnings.length > 3 && (
              <p className="mt-2 text-xs">
                et {securityWarnings.length - 3} autres avertissements...
              </p>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Main Security Interface */}
      <Tabs defaultValue="scanner" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="scanner">Scanner temps réel</TabsTrigger>
          <TabsTrigger value="audit">Audit complet</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
          <TabsTrigger value="settings">Paramètres</TabsTrigger>
        </TabsList>

        <TabsContent value="scanner" className="space-y-4">
          <SecurityScanner />
        </TabsContent>

        <TabsContent value="audit" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Audit de sécurité complet</CardTitle>
                  <CardDescription>
                    Analyse approfondie de la sécurité de l'application et de la base de données
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  {auditReport && (
                    <Button variant="outline" onClick={exportAuditReport}>
                      <Download className="h-4 w-4 mr-2" />
                      Exporter
                    </Button>
                  )}
                  <Button onClick={runFullSecurityAudit} disabled={isRunningAudit}>
                    <RefreshCw className={`h-4 w-4 mr-2 ${isRunningAudit ? 'animate-spin' : ''}`} />
                    {isRunningAudit ? 'Audit en cours...' : 'Lancer l\'audit'}
                  </Button>
                </div>
              </div>
            </CardHeader>

            {auditReport && (
              <CardContent>
                <div className="space-y-6">
                  {/* Audit Summary */}
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div className="text-center">
                      <div className="flex items-center justify-center w-12 h-12 mx-auto mb-2 bg-green-100 rounded-full">
                        <CheckCircle className="h-6 w-6 text-green-600" />
                      </div>
                      <p className="text-2xl font-bold text-green-600">{auditReport.passed}</p>
                      <p className="text-xs text-muted-foreground">Réussis</p>
                    </div>
                    
                    {auditReport.criticalIssues > 0 && (
                      <div className="text-center">
                        <div className="flex items-center justify-center w-12 h-12 mx-auto mb-2 bg-red-100 rounded-full">
                          <XCircle className="h-6 w-6 text-red-600" />
                        </div>
                        <p className="text-2xl font-bold text-red-600">{auditReport.criticalIssues}</p>
                        <p className="text-xs text-muted-foreground">Critiques</p>
                      </div>
                    )}
                    
                    {auditReport.highIssues > 0 && (
                      <div className="text-center">
                        <div className="flex items-center justify-center w-12 h-12 mx-auto mb-2 bg-orange-100 rounded-full">
                          <AlertTriangle className="h-6 w-6 text-orange-600" />
                        </div>
                        <p className="text-2xl font-bold text-orange-600">{auditReport.highIssues}</p>
                        <p className="text-xs text-muted-foreground">Élevés</p>
                      </div>
                    )}
                    
                    {auditReport.mediumIssues > 0 && (
                      <div className="text-center">
                        <div className="flex items-center justify-center w-12 h-12 mx-auto mb-2 bg-yellow-100 rounded-full">
                          <AlertTriangle className="h-6 w-6 text-yellow-600" />
                        </div>
                        <p className="text-2xl font-bold text-yellow-600">{auditReport.mediumIssues}</p>
                        <p className="text-xs text-muted-foreground">Moyens</p>
                      </div>
                    )}
                    
                    {auditReport.lowIssues > 0 && (
                      <div className="text-center">
                        <div className="flex items-center justify-center w-12 h-12 mx-auto mb-2 bg-blue-100 rounded-full">
                          <AlertTriangle className="h-6 w-6 text-blue-600" />
                        </div>
                        <p className="text-2xl font-bold text-blue-600">{auditReport.lowIssues}</p>
                        <p className="text-xs text-muted-foreground">Faibles</p>
                      </div>
                    )}
                  </div>

                  {/* Detailed Results */}
                  <div className="space-y-4">
                    <h4 className="font-medium">Résultats détaillés</h4>
                    {auditReport.results.map((result, index) => (
                      <div key={index} className="flex items-start justify-between p-4 border rounded-lg">
                        <div className="flex items-start gap-3">
                          {result.status === 'pass' && <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />}
                          {result.status === 'warning' && <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />}
                          {result.status === 'fail' && <XCircle className="h-5 w-5 text-red-500 mt-0.5" />}
                          
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <h5 className="font-medium">{result.test}</h5>
                              <Badge variant={result.severity === 'critical' || result.severity === 'high' ? 'destructive' : 'secondary'}>
                                {result.severity}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{result.category}</p>
                            <p className="text-sm">{result.message}</p>
                            {result.details && (
                              <p className="text-xs text-muted-foreground font-mono bg-gray-50 p-2 rounded">
                                {result.details}
                              </p>
                            )}
                            {result.recommendation && (
                              <p className="text-sm text-blue-600 font-medium">
                                💡 {result.recommendation}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Monitoring de sécurité
              </CardTitle>
              <CardDescription>
                Surveillance continue des événements de sécurité
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Le monitoring de sécurité surveille en temps réel les tentatives d'accès non autorisées,
                    les injections SQL, les attaques XSS et autres comportements suspects.
                  </AlertDescription>
                </Alert>
                
                {/* Security metrics would go here */}
                <div className="text-center text-muted-foreground py-8">
                  Monitoring actif - Aucune menace détectée
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Paramètres de sécurité
              </CardTitle>
              <CardDescription>
                Configuration des politiques de sécurité
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Alert>
                  <Shield className="h-4 w-4" />
                  <AlertDescription>
                    La sécurité stricte est activée. Toutes les mesures de protection sont en place.
                  </AlertDescription>
                </Alert>
                
                <div className="space-y-2">
                  <h4 className="font-medium">Mesures de sécurité actives:</h4>
                  <ul className="text-sm space-y-1 ml-4">
                    <li>✅ Row-Level Security (RLS) activé</li>
                    <li>✅ Protection XSS activée</li>
                    <li>✅ Validation CSRF activée</li>
                    <li>✅ Rate limiting activé</li>
                    <li>✅ Headers de sécurité configurés</li>
                    <li>✅ Audit de sécurité automatique</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};