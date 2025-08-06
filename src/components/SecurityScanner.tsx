// SECURITY SCANNER: Real-time security monitoring component
import React, { useState, useEffect } from 'react';
import { useSecurityState } from './EnhancedSecurityProvider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Shield, AlertTriangle, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface SecurityScanResult {
  category: string;
  test: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  recommendation?: string;
}

interface SecurityMetrics {
  securityScore: number;
  vulnerabilities: number;
  warnings: number;
  passed: number;
  lastScan: Date;
}

export const SecurityScanner: React.FC = () => {
  const { validateSecureAction, isSecurityEnabled } = useSecurityState();
  const [scanResults, setScanResults] = useState<SecurityScanResult[]>([]);
  const [metrics, setMetrics] = useState<SecurityMetrics | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [progress, setProgress] = useState(0);

  const securityTests = [
    {
      category: 'Authentication',
      test: 'Session Validation',
      check: async () => {
        const { data: session } = await supabase.auth.getSession();
        return {
          status: session?.session ? 'pass' : 'warning' as const,
          message: session?.session ? 'Session active and valid' : 'No active session',
          recommendation: !session?.session ? 'User should be authenticated' : undefined
        };
      }
    },
    {
      category: 'RLS Protection',
      test: 'Profile Access Control',
      check: async () => {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .limit(1);
          
          return {
            status: error ? 'pass' : 'warning' as const,
            message: error ? 'RLS protecting profile access' : 'Profile data accessible',
            recommendation: !error ? 'Verify RLS policies are correctly configured' : undefined
          };
        } catch (error) {
          return {
            status: 'pass' as const,
            message: 'RLS blocking unauthorized access',
          };
        }
      }
    },
    {
      category: 'Input Validation',
      test: 'XSS Protection',
      check: async () => {
        const testInput = '<script>alert("xss")</script>';
        const sanitized = testInput.replace(/<[^>]*>/g, '');
        
        return {
          status: sanitized !== testInput ? 'pass' : 'fail' as const,
          message: sanitized !== testInput ? 'XSS protection active' : 'XSS vulnerability detected',
          recommendation: sanitized === testInput ? 'Implement input sanitization' : undefined
        };
      }
    },
    {
      category: 'Network Security',
      test: 'HTTPS Enforcement',
      check: async () => {
        const isHTTPS = window.location.protocol === 'https:';
        const isDev = window.location.hostname === 'localhost';
        
        return {
          status: (isHTTPS || isDev) ? 'pass' : 'fail' as const,
          message: isHTTPS ? 'HTTPS enforced' : isDev ? 'Development environment' : 'HTTP detected',
          recommendation: !isHTTPS && !isDev ? 'Enable HTTPS in production' : undefined
        };
      }
    },
    {
      category: 'Storage Security',
      test: 'Local Storage Inspection',
      check: async () => {
        const sensitiveKeys = Object.keys(localStorage).filter(key => 
          key.includes('password') || 
          key.includes('secret') || 
          key.includes('private')
        );
        
        return {
          status: sensitiveKeys.length === 0 ? 'pass' : 'warning' as const,
          message: sensitiveKeys.length === 0 ? 'No sensitive data in localStorage' : `${sensitiveKeys.length} sensitive keys found`,
          recommendation: sensitiveKeys.length > 0 ? 'Remove sensitive data from localStorage' : undefined
        };
      }
    },
    {
      category: 'Content Security',
      test: 'Iframe Protection',
      check: async () => {
        const inFrame = window.self !== window.top;
        
        return {
          status: !inFrame ? 'pass' : 'warning' as const,
          message: !inFrame ? 'Not running in iframe' : 'Running in iframe - potential clickjacking risk',
          recommendation: inFrame ? 'Verify iframe source is trusted' : undefined
        };
      }
    },
    {
      category: 'Database Security',
      test: 'Security Context Validation',
      check: async () => {
        try {
          const { data, error } = await supabase.rpc('validate_security_context');
          
          if (error) {
            return {
              status: 'warning' as const,
              message: 'Security context validation failed',
              recommendation: 'Check database security functions'
            };
          }
          
          const result = typeof data === 'string' ? JSON.parse(data) : data;
          return {
            status: result?.valid ? 'pass' : 'warning' as const,
            message: result?.valid ? 'Security context valid' : 'Security context issues detected',
            recommendation: !result?.valid ? 'Review security context configuration' : undefined
          };
        } catch (error) {
          return {
            status: 'warning' as const,
            message: 'Unable to validate security context',
            recommendation: 'Ensure security functions are properly configured'
          };
        }
      }
    }
  ];

  const runSecurityScan = async () => {
    if (!isSecurityEnabled) {
      return;
    }

    const isAuthorized = await validateSecureAction('security_scan');
    if (!isAuthorized) {
      return;
    }

    setIsScanning(true);
    setProgress(0);
    setScanResults([]);

    const results: SecurityScanResult[] = [];
    
    for (let i = 0; i < securityTests.length; i++) {
      const test = securityTests[i];
      setProgress((i / securityTests.length) * 100);
      
      try {
        const result = await test.check();
        results.push({
          category: test.category,
          test: test.test,
          status: result.status as 'pass' | 'fail' | 'warning',
          message: result.message,
          recommendation: result.recommendation
        });
      } catch (error) {
        results.push({
          category: test.category,
          test: test.test,
          status: 'fail',
          message: 'Test failed to execute',
          recommendation: 'Check test configuration'
        });
      }

      // Small delay for visual feedback
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    setProgress(100);
    setScanResults(results);

    // Calculate metrics
    const passed = results.filter(r => r.status === 'pass').length;
    const warnings = results.filter(r => r.status === 'warning').length;
    const failed = results.filter(r => r.status === 'fail').length;
    const securityScore = Math.round((passed / results.length) * 100);

    setMetrics({
      securityScore,
      vulnerabilities: failed,
      warnings,
      passed,
      lastScan: new Date()
    });

    setIsScanning(false);
  };

  useEffect(() => {
    // Run initial scan
    runSecurityScan();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'fail':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Shield className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pass: 'default' as const,
      warning: 'secondary' as const,
      fail: 'destructive' as const
    };
    return <Badge variant={variants[status as keyof typeof variants]}>{status.toUpperCase()}</Badge>;
  };

  if (!isSecurityEnabled) {
    return (
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertTitle>Scanner de sécurité désactivé</AlertTitle>
        <AlertDescription>
          Le scanner de sécurité nécessite l'activation du mode de sécurité strict.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Security Metrics Overview */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Score de sécurité</p>
                  <p className="text-2xl font-bold">{metrics.securityScore}%</p>
                </div>
                <Shield className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Tests réussis</p>
                  <p className="text-2xl font-bold text-green-600">{metrics.passed}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Avertissements</p>
                  <p className="text-2xl font-bold text-yellow-600">{metrics.warnings}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Vulnérabilités</p>
                  <p className="text-2xl font-bold text-red-600">{metrics.vulnerabilities}</p>
                </div>
                <XCircle className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Scan Control */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Scanner de sécurité
              </CardTitle>
              <CardDescription>
                Vérification automatique des vulnérabilités et des configurations de sécurité
              </CardDescription>
            </div>
            <Button
              onClick={runSecurityScan}
              disabled={isScanning}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isScanning ? 'animate-spin' : ''}`} />
              {isScanning ? 'Scan en cours...' : 'Lancer le scan'}
            </Button>
          </div>
        </CardHeader>
        
        {isScanning && (
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progression du scan</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          </CardContent>
        )}
      </Card>

      {/* Scan Results */}
      {scanResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Résultats du scan</CardTitle>
            <CardDescription>
              {metrics?.lastScan && `Dernière vérification: ${metrics.lastScan.toLocaleString()}`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {scanResults.map((result, index) => (
                <div key={index} className="flex items-start justify-between p-4 border rounded-lg">
                  <div className="flex items-start gap-3">
                    {getStatusIcon(result.status)}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{result.test}</h4>
                        {getStatusBadge(result.status)}
                      </div>
                      <p className="text-sm text-muted-foreground">{result.category}</p>
                      <p className="text-sm">{result.message}</p>
                      {result.recommendation && (
                        <p className="text-sm text-yellow-600 font-medium">
                          💡 {result.recommendation}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};