// SECURITY FIX: Enhanced security context hook
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { validateSession, logSecurityEvent, generateNonce } from '@/utils/security';
import { initializeRateLimits } from '@/utils/securityMiddleware';

interface SecurityContext {
  sessionValid: boolean;
  csrfToken: string;
  securityLevel: 'low' | 'medium' | 'high';
  lastSecurityCheck: Date | null;
  securityWarnings: string[];
}

export const useSecurityContext = () => {
  const [securityContext, setSecurityContext] = useState<SecurityContext>({
    sessionValid: false,
    csrfToken: '',
    securityLevel: 'low',
    lastSecurityCheck: null,
    securityWarnings: []
  });

  const [loading, setLoading] = useState(true);

  // Initialize security context
  useEffect(() => {
    const initializeSecurity = async () => {
      try {
        // Initialize rate limiting
        initializeRateLimits();
        
        // Generate CSRF token
        const csrfToken = generateNonce();
        
        // Validate current session
        const sessionValid = await validateSession();
        
        // Perform security checks
        const warnings = await performSecurityChecks();
        
        setSecurityContext({
          sessionValid,
          csrfToken,
          securityLevel: warnings.length === 0 ? 'high' : warnings.length < 3 ? 'medium' : 'low',
          lastSecurityCheck: new Date(),
          securityWarnings: warnings
        });
        
        // Log security initialization
        await logSecurityEvent('security_context_initialized', 'Security context established', {
          sessionValid,
          warningCount: warnings.length,
          timestamp: Date.now()
        });
        
      } catch (error) {
        console.error('Security initialization failed:', error);
        await logSecurityEvent('security_init_failed', 'Failed to initialize security context', {
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      } finally {
        setLoading(false);
      }
    };

    initializeSecurity();
  }, []);

  // Perform comprehensive security checks
  const performSecurityChecks = async (): Promise<string[]> => {
    const warnings: string[] = [];
    
    try {
      // Check session security
      const { data: sessionData } = await supabase.rpc('validate_session_security');
      if (sessionData && !(sessionData as any).valid) {
        warnings.push(`Session invalide: ${(sessionData as any).reason}`);
      }
      
      // Check for suspicious localStorage data
      const suspiciousKeys = ['debug', 'admin', 'bypass', 'hack'];
      suspiciousKeys.forEach(key => {
        if (localStorage.getItem(key)) {
          warnings.push(`Données suspectes détectées: ${key}`);
        }
      });
      
      // Check for developer tools (in production)
      if (window.location.hostname !== 'localhost' && 
          (window.outerWidth - window.innerWidth > 200 || 
           window.outerHeight - window.innerHeight > 200)) {
        warnings.push('Outils de développement potentiellement ouverts');
      }
      
      // Check for iframe embedding (clickjacking protection)
      if (window !== window.top) {
        warnings.push('Application intégrée dans une iframe');
      }
      
    } catch (error) {
      warnings.push('Erreur lors des vérifications de sécurité');
    }
    
    return warnings;
  };

  // Refresh security context
  const refreshSecurityContext = useCallback(async () => {
    setLoading(true);
    
    try {
      const sessionValid = await validateSession();
      const warnings = await performSecurityChecks();
      
      setSecurityContext(prev => ({
        ...prev,
        sessionValid,
        securityLevel: warnings.length === 0 ? 'high' : warnings.length < 3 ? 'medium' : 'low',
        lastSecurityCheck: new Date(),
        securityWarnings: warnings
      }));
      
    } catch (error) {
      console.error('Security refresh failed:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Validate action with security context
  const validateSecureAction = useCallback(async (action: string, data?: any): Promise<boolean> => {
    try {
      // Check if session is still valid
      if (!securityContext.sessionValid) {
        await logSecurityEvent('invalid_session_action', `Action attempted with invalid session: ${action}`, data);
        return false;
      }
      
      // Check security level
      if (securityContext.securityLevel === 'low') {
        await logSecurityEvent('low_security_action', `Action attempted with low security level: ${action}`, data);
        return false;
      }
      
      // Log valid action
      await logSecurityEvent('valid_secure_action', `Secure action validated: ${action}`, data);
      return true;
      
    } catch (error) {
      console.error('Security validation failed:', error);
      return false;
    }
  }, [securityContext]);

  // Generate new CSRF token
  const refreshCSRFToken = useCallback(() => {
    const newToken = generateNonce();
    setSecurityContext(prev => ({
      ...prev,
      csrfToken: newToken
    }));
    return newToken;
  }, []);

  return {
    securityContext,
    loading,
    refreshSecurityContext,
    validateSecureAction,
    refreshCSRFToken,
    performSecurityChecks
  };
};