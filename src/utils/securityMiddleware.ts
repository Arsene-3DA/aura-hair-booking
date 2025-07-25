// SECURITY FIX: Comprehensive security middleware for request validation

import { validateSecureInput, logSecurityEvent, checkPermission } from '@/utils/security';

export interface SecurityConfig {
  rateLimitKey?: string;
  maxAttempts?: number;
  windowMs?: number;
  requireAuth?: boolean;
  requiredRole?: 'admin' | 'coiffeur' | 'client';
  validateInput?: boolean;
  logSecurity?: boolean;
}

// SECURITY FIX: Rate limiting implementation
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

export const checkRateLimit = (
  key: string, 
  maxAttempts: number = 5, 
  windowMs: number = 60000
): boolean => {
  const now = Date.now();
  const record = rateLimitStore.get(key);
  
  if (!record || now > record.resetTime) {
    rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
    return true;
  }
  
  if (record.count >= maxAttempts) {
    return false;
  }
  
  record.count++;
  return true;
};

// SECURITY FIX: CSRF token generation and validation
let csrfToken: string | null = null;

export const generateCSRFToken = (): string => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  csrfToken = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  return csrfToken;
};

export const validateCSRFToken = (token: string): boolean => {
  return csrfToken === token && token.length === 64;
};

// SECURITY FIX: Input sanitization middleware
export const sanitizeFormData = (data: Record<string, any>): Record<string, any> => {
  const sanitized: Record<string, any> = {};
  
  Object.entries(data).forEach(([key, value]) => {
    if (typeof value === 'string') {
      const validation = validateSecureInput(value, 'general');
      sanitized[key] = validation.sanitized;
      
      if (!validation.isValid) {
        throw new Error(`Invalid input for field ${key}: ${validation.errors.join(', ')}`);
      }
    } else {
      sanitized[key] = value;
    }
  });
  
  return sanitized;
};

// SECURITY FIX: Security validation middleware
export const validateSecurityRequirements = async (
  config: SecurityConfig,
  context: {
    userAgent?: string;
    ip?: string;
    userId?: string;
    formData?: Record<string, any>;
  }
): Promise<{ valid: boolean; errors: string[] }> => {
  const errors: string[] = [];
  
  try {
    // Rate limiting check
    if (config.rateLimitKey && config.maxAttempts && config.windowMs) {
      const rateLimitKey = `${config.rateLimitKey}_${context.ip || context.userId || 'anonymous'}`;
      if (!checkRateLimit(rateLimitKey, config.maxAttempts, config.windowMs)) {
        errors.push('Trop de tentatives - veuillez patienter');
        
        if (config.logSecurity) {
          await logSecurityEvent('rate_limit_exceeded', 'Rate limit exceeded', {
            key: config.rateLimitKey,
            ip: context.ip,
            userId: context.userId
          });
        }
      }
    }
    
    // Authentication check
    if (config.requireAuth) {
      if (!context.userId) {
        errors.push('Authentification requise');
      }
    }
    
    // Role-based access control
    if (config.requiredRole && context.userId) {
      const hasPermission = await checkPermission(config.requiredRole);
      if (!hasPermission) {
        errors.push('Permissions insuffisantes');
        
        if (config.logSecurity) {
          await logSecurityEvent('permission_denied', 'Access denied', {
            requiredRole: config.requiredRole,
            userId: context.userId
          });
        }
      }
    }
    
    // Input validation
    if (config.validateInput && context.formData) {
      try {
        sanitizeFormData(context.formData);
      } catch (error) {
        errors.push(error instanceof Error ? error.message : 'Invalid input detected');
        
        if (config.logSecurity) {
          await logSecurityEvent('input_validation_failed', 'Invalid input detected', {
            error: error instanceof Error ? error.message : 'Unknown error',
            formData: Object.keys(context.formData)
          });
        }
      }
    }
    
    // Log successful validation if configured
    if (config.logSecurity && errors.length === 0) {
      await logSecurityEvent('security_validation_passed', 'Security validation successful', {
        config: Object.keys(config),
        userId: context.userId
      });
    }
    
  } catch (error) {
    errors.push('Security validation error');
    console.error('Security validation failed:', error);
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
};

// SECURITY FIX: Security headers validation
export const validateSecurityHeaders = (headers: Record<string, string>): boolean => {
  const requiredHeaders = [
    'content-type',
    'user-agent'
  ];
  
  const suspiciousPatterns = [
    /bot|crawler|spider/i,
    /curl|wget|httpie/i,
    /postman|insomnia/i
  ];
  
  // Check for required headers
  for (const header of requiredHeaders) {
    if (!headers[header]) {
      return false;
    }
  }
  
  // Check for suspicious user agents (in production)
  if (window.location.hostname !== 'localhost') {
    const userAgent = headers['user-agent'] || '';
    if (suspiciousPatterns.some(pattern => pattern.test(userAgent))) {
      return false;
    }
  }
  
  return true;
};

// SECURITY FIX: Session security validation
export const validateSession = async (): Promise<boolean> => {
  try {
    const sessionData = localStorage.getItem('supabase.auth.token');
    if (!sessionData) {
      return false;
    }
    
    const session = JSON.parse(sessionData);
    const now = Date.now() / 1000;
    
    // Check if session is expired
    if (session.expires_at && session.expires_at < now) {
      localStorage.removeItem('supabase.auth.token');
      return false;
    }
    
    // Check for session hijacking (simplified)
    const lastUserAgent = localStorage.getItem('session.user_agent');
    const currentUserAgent = navigator.userAgent;
    
    if (lastUserAgent && lastUserAgent !== currentUserAgent) {
      localStorage.removeItem('supabase.auth.token');
      localStorage.removeItem('session.user_agent');
      await logSecurityEvent('session_hijack_detected', 'Potential session hijacking detected', {});
      return false;
    }
    
    localStorage.setItem('session.user_agent', currentUserAgent);
    return true;
    
  } catch (error) {
    console.error('Session validation error:', error);
    return false;
  }
};