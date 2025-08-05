// SECURITY ENHANCEMENT: Comprehensive security provider
import React, { createContext, useContext, ReactNode, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Shield, AlertTriangle, Lock } from 'lucide-react';
import { rateLimiter, RateLimitConfigs } from '@/utils/rateLimiter';

interface SecurityContextType {
  sessionValid: boolean;
  csrfToken: string;
  securityLevel: 'low' | 'medium' | 'high' | 'critical';
  securityWarnings: string[];
  validateSecureAction: (action: string, data?: any) => Promise<boolean>;
  refreshCSRFToken: () => string;
  refreshSecurityContext: () => Promise<void>;
  isSecurityEnabled: boolean;
}

const SecurityContext = createContext<SecurityContextType | null>(null);

interface EnhancedSecurityProviderProps {
  children: ReactNode;
  enableStrictMode?: boolean;
  showWarnings?: boolean;
}

export const EnhancedSecurityProvider: React.FC<EnhancedSecurityProviderProps> = ({ 
  children, 
  enableStrictMode = true,
  showWarnings = true 
}) => {
  const [securityContext, setSecurityContext] = useState({
    sessionValid: false,
    csrfToken: '',
    securityLevel: 'medium' as 'low' | 'medium' | 'high' | 'critical',
    securityWarnings: [] as string[],
    isSecurityEnabled: enableStrictMode
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Generate CSRF token
  const generateCSRFToken = (): string => {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  };

  // Validate security context
  const validateSecurityContext = async (): Promise<void> => {
    try {
      // Check session validity with Supabase
      const { data: session } = await supabase.auth.getSession();
      const sessionValid = !!session?.session;

      // Perform security checks
      const warnings: string[] = [];
      let securityLevel: 'low' | 'medium' | 'high' | 'critical' = 'medium';

      // Check for suspicious localStorage keys
      const suspiciousKeys = Object.keys(localStorage).filter(key => 
        key.includes('debug') || key.includes('admin') || key.includes('test')
      );
      if (suspiciousKeys.length > 0) {
        warnings.push('Suspicious localStorage keys detected');
        securityLevel = 'high';
      }

      // Check for developer tools (production only)
      if (process.env.NODE_ENV === 'production') {
        const devtools = (window as any).devtools || 
          (window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__ ||
          (window as any).__REDUX_DEVTOOLS_EXTENSION__;
        if (devtools) {
          warnings.push('Developer tools detected in production');
          securityLevel = 'high';
        }
      }

      // Check for iframe embedding (clickjacking protection)
      if (window.self !== window.top) {
        warnings.push('Application is running in iframe - potential clickjacking risk');
        securityLevel = 'high';
      }

      // Validate with backend if session exists
      if (sessionValid) {
        const { data, error } = await supabase.rpc('validate_security_context');
        if (error) {
          warnings.push('Backend security validation failed');
          securityLevel = 'critical';
        } else if (data) {
          const result = typeof data === 'string' ? JSON.parse(data) : data;
          if (!result.valid) {
            warnings.push(result.reason || 'Security context invalid');
            securityLevel = 'critical';
          }
          if (result.warnings) {
            warnings.push(...result.warnings);
          }
        }
      }

      setSecurityContext(prev => ({
        ...prev,
        sessionValid,
        securityLevel,
        securityWarnings: warnings
      }));

    } catch (error) {
      console.error('Security validation error:', error);
      setSecurityContext(prev => ({
        ...prev,
        sessionValid: false,
        securityLevel: 'critical',
        securityWarnings: ['Security validation failed']
      }));
    }
  };

  // Validate secure action
  const validateSecureAction = async (action: string, data?: any): Promise<boolean> => {
    if (!enableStrictMode) return true;

    try {
      // Rate limiting check
      const rateLimitResult = await rateLimiter.checkLimit(
        `action_${action}`,
        RateLimitConfigs.API_CALLS
      );

      if (!rateLimitResult.allowed) {
        toast({
          title: "Action bloquée",
          description: "Trop de tentatives. Veuillez patienter.",
          variant: "destructive"
        });
        return false;
      }

      // Session validity check
      if (!securityContext.sessionValid && action !== 'login') {
        toast({
          title: "Session invalide",
          description: "Veuillez vous reconnecter",
          variant: "destructive"
        });
        return false;
      }

      // Security level check
      if (securityContext.securityLevel === 'critical') {
        toast({
          title: "Sécurité compromise",
          description: "Action refusée pour des raisons de sécurité",
          variant: "destructive"
        });
        return false;
      }

      // Log security event
      await supabase.from('security_audit_logs').insert({
        event_type: `action_${action}`,
        event_data: { action, timestamp: new Date().toISOString() },
        severity: 'low'
      });

      return true;
    } catch (error) {
      console.error('Action validation error:', error);
      return false;
    }
  };

  // Refresh CSRF token
  const refreshCSRFToken = (): string => {
    const newToken = generateCSRFToken();
    setSecurityContext(prev => ({ ...prev, csrfToken: newToken }));
    return newToken;
  };

  // Refresh security context
  const refreshSecurityContext = async (): Promise<void> => {
    setLoading(true);
    await validateSecurityContext();
    setLoading(false);
  };

  // Initialize security context
  useEffect(() => {
    const initSecurity = async () => {
      // Initialize rate limiter
      rateLimiter.cleanup();
      
      // Generate initial CSRF token
      const initialToken = generateCSRFToken();
      setSecurityContext(prev => ({ ...prev, csrfToken: initialToken }));

      // Validate initial context
      await validateSecurityContext();
      setLoading(false);
    };

    initSecurity();

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
          setTimeout(async () => {
            await validateSecurityContext();
          }, 100);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Security warning display
  const showCriticalWarning = showWarnings && 
    securityContext.securityLevel === 'critical' && 
    securityContext.securityWarnings.length > 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <Shield className="mx-auto h-8 w-8 animate-spin text-primary" />
          <p className="mt-2 text-sm text-muted-foreground">
            Initialisation sécurisée...
          </p>
        </div>
      </div>
    );
  }

  return (
    <SecurityContext.Provider
      value={{
        sessionValid: securityContext.sessionValid,
        csrfToken: securityContext.csrfToken,
        securityLevel: securityContext.securityLevel,
        securityWarnings: securityContext.securityWarnings,
        validateSecureAction,
        refreshCSRFToken,
        refreshSecurityContext,
        isSecurityEnabled: enableStrictMode
      }}
    >
      {/* Security Headers */}
      <SecurityHeaders />
      
      {/* Critical Security Warnings */}
      {showCriticalWarning && (
        <Alert variant="destructive" className="m-4 border-destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle className="flex items-center gap-2">
            <Lock className="h-4 w-4" />
            Problème de sécurité critique détecté
          </AlertTitle>
          <AlertDescription>
            <ul className="mt-2 list-disc list-inside text-sm">
              {securityContext.securityWarnings.slice(0, 3).map((warning, index) => (
                <li key={index}>{warning}</li>
              ))}
            </ul>
            {securityContext.securityWarnings.length > 3 && (
              <p className="mt-2 text-xs">
                et {securityContext.securityWarnings.length - 3} autres avertissements...
              </p>
            )}
          </AlertDescription>
        </Alert>
      )}
      
      {children}
    </SecurityContext.Provider>
  );
};

// Security Headers Component
const SecurityHeaders: React.FC = () => {
  useEffect(() => {
    // Generate nonce for CSP
    const nonce = generateCSRFToken();
    
    // Set security meta tags
    const setMetaTag = (name: string, content: string) => {
      let meta = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement;
      if (!meta) {
        meta = document.createElement('meta');
        meta.name = name;
        document.head.appendChild(meta);
      }
      meta.content = content;
    };

    // Content Security Policy
    setMetaTag('Content-Security-Policy', 
      `default-src 'self'; ` +
      `script-src 'self' 'nonce-${nonce}' https://yazsvadgmkpatqyjrzcw.supabase.co; ` +
      `style-src 'self' 'unsafe-inline'; ` +
      `img-src 'self' data: https:; ` +
      `connect-src 'self' https://yazsvadgmkpatqyjrzcw.supabase.co wss://yazsvadgmkpatqyjrzcw.supabase.co; ` +
      `frame-ancestors 'none'; ` +
      `base-uri 'self'; ` +
      `form-action 'self'`
    );

    // Other security headers
    setMetaTag('X-Content-Type-Options', 'nosniff');
    setMetaTag('X-Frame-Options', 'DENY');
    setMetaTag('X-XSS-Protection', '1; mode=block');
    setMetaTag('Referrer-Policy', 'strict-origin-when-cross-origin');
    setMetaTag('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

    // Force HTTPS
    if (process.env.NODE_ENV === 'production' && location.protocol !== 'https:') {
      location.replace(`https:${location.href.substring(location.protocol.length)}`);
    }

  }, []);

  return null;
};

export const useSecurityState = () => {
  const context = useContext(SecurityContext);
  if (!context) {
    throw new Error('useSecurityState must be used within an EnhancedSecurityProvider');
  }
  return context;
};

// Utility function for CSRF token generation
const generateCSRFToken = (): string => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};
