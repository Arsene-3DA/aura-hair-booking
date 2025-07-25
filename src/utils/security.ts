// SECURITY FIX: Comprehensive security utilities

import { supabase } from "@/integrations/supabase/client";

// Content Security Policy helper
export const generateNonce = (): string => {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode(...array));
};

// SECURITY FIX: Enhanced security event logging with overloaded signatures
export const logSecurityEvent = async (
  eventType: string, 
  messageOrDetails: string | Record<string, any>,
  metadata: Record<string, any> = {}
): Promise<void> => {
  try {
    // Handle both old and new function signatures
    let message: string;
    let details: Record<string, any>;
    
    if (typeof messageOrDetails === 'string') {
      message = messageOrDetails;
      details = metadata;
    } else {
      message = `Security event: ${eventType}`;
      details = messageOrDetails;
    }
    
    const { data: { user } } = await supabase.auth.getUser();
    
    await supabase.from('system_logs').insert({
      event_type: `security_${eventType}`,
      message,
      metadata: {
        ...details,
        user_id: user?.id,
        timestamp: new Date().toISOString(),
        user_agent: navigator.userAgent,
        ip_address: 'client-side',
        url: window.location.href
      }
    });
  } catch (error) {
    console.error('Failed to log security event:', error);
  }
};

// Session security checks
export const validateSession = async (): Promise<boolean> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) return false;
    
    // Check if session is expired
    const now = Date.now() / 1000;
    if (session.expires_at && session.expires_at < now) {
      await logSecurityEvent('session_expired', 'Session expired', { session_id: session.access_token.substring(0, 10) });
      return false;
    }
    
    // Check for suspicious session activity
    const lastActivity = localStorage.getItem('lastActivity');
    const currentTime = Date.now();
    
    if (lastActivity) {
      const timeDiff = currentTime - parseInt(lastActivity);
      if (timeDiff > 24 * 60 * 60 * 1000) { // 24 hours
        await logSecurityEvent('session_timeout', 'Session timeout due to inactivity', { inactive_duration: timeDiff });
        return false;
      }
    }
    
    localStorage.setItem('lastActivity', currentTime.toString());
    return true;
  } catch (error) {
    await logSecurityEvent('session_validation_error', 'Error validating session', { error: error instanceof Error ? error.message : 'Unknown error' });
    return false;
  }
};

// Failed login attempt tracking
export const trackFailedLogin = (email: string) => {
  const key = `failed_login_${email}`;
  const attempts = JSON.parse(localStorage.getItem(key) || '[]');
  const now = Date.now();
  
  // Remove attempts older than 1 hour
  const recentAttempts = attempts.filter((timestamp: number) => now - timestamp < 3600000);
  recentAttempts.push(now);
  
  localStorage.setItem(key, JSON.stringify(recentAttempts));
  
  // Log if too many attempts
  if (recentAttempts.length >= 5) {
    logSecurityEvent('brute_force_attempt', 'Brute force login detected', { email, attempts: recentAttempts.length });
  }
  
  return recentAttempts.length;
};

// Clear failed login attempts on successful login
export const clearFailedLoginAttempts = (email: string) => {
  localStorage.removeItem(`failed_login_${email}`);
};

// Secure data validation
export const validateSecureInput = (input: string, type: 'email' | 'password' | 'general'): { isValid: boolean; sanitized: string; errors: string[] } => {
  const errors: string[] = [];
  let sanitized = input.trim();
  
  // Basic XSS prevention
  sanitized = sanitized
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    .slice(0, 1000);
  
  switch (type) {
    case 'email':
      const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
      if (!emailRegex.test(sanitized)) {
        errors.push('Format email invalide');
      }
      break;
      
    case 'password':
      if (sanitized.length < 12) {
        errors.push('Mot de passe trop court');
      }
      break;
      
    case 'general':
      if (sanitized.length === 0) {
        errors.push('Champ requis');
      }
      break;
  }
  
  return {
    isValid: errors.length === 0,
    sanitized,
    errors
  };
};

// Permission checks
export const checkPermission = async (requiredRole: 'admin' | 'coiffeur' | 'client'): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;
    
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .single();
    
    if (!profile) return false;
    
    const roleHierarchy = { admin: 3, coiffeur: 2, client: 1 };
    const userLevel = roleHierarchy[profile.role as keyof typeof roleHierarchy] || 0;
    const requiredLevel = roleHierarchy[requiredRole];
    
    return userLevel >= requiredLevel;
  } catch (error) {
    await logSecurityEvent('permission_check_error', 'Error checking permissions', { requiredRole, error: error instanceof Error ? error.message : 'Unknown error' });
    return false;
  }
};