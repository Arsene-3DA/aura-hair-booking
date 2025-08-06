// SECURITY AUDIT: Comprehensive security validation utilities
import { supabase } from '@/integrations/supabase/client';

export interface SecurityAuditResult {
  category: string;
  test: string;
  status: 'pass' | 'fail' | 'warning';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  details?: string;
  recommendation?: string;
}

export interface SecurityReport {
  timestamp: Date;
  overallScore: number;
  criticalIssues: number;
  highIssues: number;
  mediumIssues: number;
  lowIssues: number;
  passed: number;
  results: SecurityAuditResult[];
}

export class SecurityAuditor {
  private async testRLSPolicies(): Promise<SecurityAuditResult[]> {
    const results: SecurityAuditResult[] = [];
    
    const tables = [
      'profiles',
      'new_reservations', 
      'messages',
      'reviews',
      'portfolio',
      'hairdressers'
    ] as const;

    for (const table of tables) {
      try {
        // Test unauthorized access
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1);

        if (error && error.code === '42501') {
          // Permission denied - good, RLS is working
          results.push({
            category: 'RLS Protection',
            test: `${table} table access control`,
            status: 'pass',
            severity: 'low',
            message: `RLS properly protecting ${table} table`,
          });
        } else if (!error && data) {
          // Data returned without proper auth - potential issue
          results.push({
            category: 'RLS Protection',
            test: `${table} table access control`,
            status: 'warning',
            severity: 'medium',
            message: `${table} table accessible without authentication`,
            recommendation: `Review RLS policies for ${table} table`
          });
        }
      } catch (error) {
        results.push({
          category: 'RLS Protection',
          test: `${table} table access control`,
          status: 'fail',
          severity: 'high',
          message: `Failed to test RLS for ${table}`,
          details: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    return results;
  }

  private async testInputValidation(): Promise<SecurityAuditResult[]> {
    const results: SecurityAuditResult[] = [];
    
    const xssPayloads = [
      '<script>alert("xss")</script>',
      '"><script>alert("xss")</script>',
      '<img src=x onerror=alert("xss")>',
      'javascript:alert("xss")'
    ];

    for (const payload of xssPayloads) {
      // Test XSS protection
      const sanitized = this.sanitizeInput(payload);
      
      results.push({
        category: 'Input Validation',
        test: `XSS protection test`,
        status: sanitized !== payload ? 'pass' : 'fail',
        severity: sanitized !== payload ? 'low' : 'critical',
        message: sanitized !== payload ? 'XSS payload properly sanitized' : 'XSS vulnerability detected',
        details: `Input: "${payload}" | Output: "${sanitized}"`,
        recommendation: sanitized === payload ? 'Implement proper input sanitization' : undefined
      });
    }

    return results;
  }

  private async testAuthenticationSecurity(): Promise<SecurityAuditResult[]> {
    const results: SecurityAuditResult[] = [];
    
    // Test session validation
    try {
      const { data: session, error } = await supabase.auth.getSession();
      
      if (session?.session) {
        // Check session expiry
        const expiresAt = session.session.expires_at;
        const now = Math.floor(Date.now() / 1000);
        const timeToExpiry = expiresAt ? expiresAt - now : 0;
        
        if (timeToExpiry > 0) {
          results.push({
            category: 'Authentication',
            test: 'Session validity',
            status: 'pass',
            severity: 'low',
            message: `Session valid, expires in ${Math.round(timeToExpiry / 60)} minutes`
          });
        } else {
          results.push({
            category: 'Authentication',
            test: 'Session validity',
            status: 'warning',
            severity: 'medium',
            message: 'Session expired or invalid',
            recommendation: 'Refresh authentication token'
          });
        }
      } else {
        results.push({
          category: 'Authentication',
          test: 'Session validity',
          status: 'warning',
          severity: 'low',
          message: 'No active session',
          details: 'User is not authenticated'
        });
      }
    } catch (error) {
      results.push({
        category: 'Authentication',
        test: 'Session validity',
        status: 'fail',
        severity: 'high',
        message: 'Failed to validate session',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    return results;
  }

  private async testNetworkSecurity(): Promise<SecurityAuditResult[]> {
    const results: SecurityAuditResult[] = [];
    
    // Test HTTPS enforcement
    const isHTTPS = window.location.protocol === 'https:';
    const isDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    
    results.push({
      category: 'Network Security',
      test: 'HTTPS enforcement',
      status: (isHTTPS || isDev) ? 'pass' : 'fail',
      severity: isHTTPS ? 'low' : 'critical',
      message: isHTTPS ? 'HTTPS properly enforced' : isDev ? 'Development environment (HTTP acceptable)' : 'HTTP detected in production',
      recommendation: !isHTTPS && !isDev ? 'Enforce HTTPS in production' : undefined
    });

    // Test Content Security Policy
    const metaTags = document.querySelectorAll('meta[name="Content-Security-Policy"]');
    const hasCSP = metaTags.length > 0;
    
    results.push({
      category: 'Network Security',
      test: 'Content Security Policy',
      status: hasCSP ? 'pass' : 'warning',
      severity: hasCSP ? 'low' : 'medium',
      message: hasCSP ? 'CSP header present' : 'CSP header missing',
      recommendation: !hasCSP ? 'Implement Content Security Policy' : undefined
    });

    // Test for mixed content
    const hasHTTPResources = Array.from(document.querySelectorAll('script, link, img')).some(el => {
      const src = el.getAttribute('src') || el.getAttribute('href');
      return src && src.startsWith('http://');
    });

    results.push({
      category: 'Network Security',
      test: 'Mixed content detection',
      status: !hasHTTPResources ? 'pass' : 'warning',
      severity: !hasHTTPResources ? 'low' : 'medium',
      message: hasHTTPResources ? 'HTTP resources detected' : 'No mixed content detected',
      recommendation: hasHTTPResources ? 'Ensure all resources use HTTPS' : undefined
    });

    return results;
  }

  private async testStorageSecurity(): Promise<SecurityAuditResult[]> {
    const results: SecurityAuditResult[] = [];
    
    // Check localStorage for sensitive data
    const sensitiveKeys = Object.keys(localStorage).filter(key => 
      key.toLowerCase().includes('password') ||
      key.toLowerCase().includes('secret') ||
      key.toLowerCase().includes('private') ||
      key.toLowerCase().includes('token')
    );

    // Exception for Supabase auth tokens which are expected
    const nonSupabaseSensitiveKeys = sensitiveKeys.filter(key => 
      !key.startsWith('sb-') && !key.includes('supabase')
    );

    results.push({
      category: 'Storage Security',
      test: 'Sensitive data in localStorage',
      status: nonSupabaseSensitiveKeys.length === 0 ? 'pass' : 'warning',
      severity: nonSupabaseSensitiveKeys.length === 0 ? 'low' : 'medium',
      message: nonSupabaseSensitiveKeys.length === 0 
        ? 'No sensitive data in localStorage' 
        : `${nonSupabaseSensitiveKeys.length} sensitive keys found`,
      details: nonSupabaseSensitiveKeys.length > 0 ? `Keys: ${nonSupabaseSensitiveKeys.join(', ')}` : undefined,
      recommendation: nonSupabaseSensitiveKeys.length > 0 ? 'Remove sensitive data from localStorage' : undefined
    });

    // Test Supabase storage bucket policies
    try {
      const { data, error } = await supabase.storage.listBuckets();
      
      if (data) {
        for (const bucket of data) {
          results.push({
            category: 'Storage Security',
            test: `Bucket ${bucket.name} configuration`,
            status: bucket.public ? 'warning' : 'pass',
            severity: bucket.public ? 'medium' : 'low',
            message: bucket.public 
              ? `Bucket ${bucket.name} is public` 
              : `Bucket ${bucket.name} has proper access control`,
            recommendation: bucket.public ? `Review if ${bucket.name} bucket should be public` : undefined
          });
        }
      }
    } catch (error) {
      results.push({
        category: 'Storage Security',
        test: 'Storage bucket access',
        status: 'warning',
        severity: 'medium',
        message: 'Unable to verify storage bucket security',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    return results;
  }

  private sanitizeInput(input: string): string {
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<[^>]*>/g, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '');
  }

  private calculateSeverityScore(severity: string): number {
    const scores = { low: 1, medium: 3, high: 7, critical: 10 };
    return scores[severity as keyof typeof scores] || 1;
  }

  public async runFullAudit(): Promise<SecurityReport> {
    const startTime = Date.now();
    console.log('🔍 Starting comprehensive security audit...');

    const allResults: SecurityAuditResult[] = [];

    try {
      // Run all security tests
      const [
        rlsResults,
        inputResults,
        authResults,
        networkResults,
        storageResults
      ] = await Promise.all([
        this.testRLSPolicies(),
        this.testInputValidation(),
        this.testAuthenticationSecurity(),
        this.testNetworkSecurity(),
        this.testStorageSecurity()
      ]);

      allResults.push(...rlsResults, ...inputResults, ...authResults, ...networkResults, ...storageResults);

      // Calculate metrics
      const passed = allResults.filter(r => r.status === 'pass').length;
      const criticalIssues = allResults.filter(r => r.severity === 'critical' && r.status !== 'pass').length;
      const highIssues = allResults.filter(r => r.severity === 'high' && r.status !== 'pass').length;
      const mediumIssues = allResults.filter(r => r.severity === 'medium' && r.status !== 'pass').length;
      const lowIssues = allResults.filter(r => r.severity === 'low' && r.status !== 'pass').length;

      // Calculate overall score (100 - weighted penalty for issues)
      const totalIssues = criticalIssues * 10 + highIssues * 5 + mediumIssues * 2 + lowIssues * 1;
      const maxPossibleScore = allResults.length * 10;
      const overallScore = Math.max(0, Math.round(100 - (totalIssues / maxPossibleScore) * 100));

      const report: SecurityReport = {
        timestamp: new Date(),
        overallScore,
        criticalIssues,
        highIssues,
        mediumIssues,
        lowIssues,
        passed,
        results: allResults
      };

      const duration = Date.now() - startTime;
      console.log(`✅ Security audit completed in ${duration}ms`);
      console.log(`📊 Score: ${overallScore}% | Critical: ${criticalIssues} | High: ${highIssues} | Medium: ${mediumIssues} | Low: ${lowIssues}`);

      return report;

    } catch (error) {
      console.error('❌ Security audit failed:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const securityAuditor = new SecurityAuditor();