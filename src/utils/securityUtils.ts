import { supabase } from '@/integrations/supabase/client';

// Rate limiter en mémoire (côté client)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

export const rateLimit = (key: string, maxRequests: number = 10, windowMs: number = 60000) => {
  const now = Date.now();
  const bucket = rateLimitStore.get(key);

  if (!bucket || now > bucket.resetTime) {
    rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (bucket.count >= maxRequests) {
    return false;
  }

  bucket.count++;
  return true;
};

// Validation et nettoyage des données
export const sanitizeInput = (input: string): string => {
  if (typeof input !== 'string') return '';
  
  return input
    .trim()
    .replace(/[<>\"']/g, '') // Supprime les caractères XSS de base
    .replace(/javascript:/gi, '') // Supprime les URLs javascript
    .replace(/on\w+=/gi, '') // Supprime les event handlers
    .substring(0, 1000); // Limite la taille
};

// Validation des UUIDs
export const isValidUUID = (uuid: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

// Middleware pour sécuriser les requêtes Supabase
export const secureRequest = async <T>(
  operation: () => Promise<{ data: T | null; error: any }>,
  context: { operation: string; userId?: string; metadata?: any }
): Promise<{ data: T | null; error: any; blocked?: boolean }> => {
  const { operation: operationType, userId, metadata = {} } = context;

  try {
    // Vérifier la session
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      await logSecurityEvent('unauthorized_request', 'Request without valid session', {
        operation: operationType,
        ...metadata
      });
      return { data: null, error: new Error('Unauthorized'), blocked: true };
    }

    // Rate limiting
    const rateLimitKey = `${session.user.id}_${operationType}`;
    if (!rateLimit(rateLimitKey, 30, 60000)) {
      await logSecurityEvent('rate_limit_exceeded', 'Rate limit exceeded', {
        operation: operationType,
        userId: session.user.id,
        ...metadata
      });
      return { data: null, error: new Error('Rate limit exceeded'), blocked: true };
    }

    // Exécuter l'opération
    const result = await operation();

    // Logger les erreurs de permission
    if (result.error && result.error.message?.includes('permission denied')) {
      await logSecurityEvent('permission_denied', 'Permission denied on operation', {
        operation: operationType,
        userId: session.user.id,
        error: result.error.message,
        ...metadata
      });
    }

    return result;
  } catch (error) {
    await logSecurityEvent('request_error', 'Error during secure request', {
      operation: operationType,
      userId,
      error: error instanceof Error ? error.message : 'Unknown error',
      ...metadata
    });
    return { data: null, error };
  }
};

// Logger pour événements de sécurité
export const logSecurityEvent = async (
  eventType: string,
  message: string,
  metadata: any = {}
) => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    await supabase.from('security_audit_logs').insert({
      event_type: eventType,
      event_data: {
        message,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent,
        ...metadata
      },
      user_id: session?.user?.id || null,
      severity: getSeverityLevel(eventType),
      ip_address: await getClientIP()
    });
  } catch (error) {
    console.error('Failed to log security event:', error);
  }
};

// Déterminer le niveau de gravité
const getSeverityLevel = (eventType: string): string => {
  const criticalEvents = ['unauthorized_request', 'permission_denied', 'token_manipulation', 'route_not_found'];
  const highEvents = ['rate_limit_exceeded', 'suspicious_activity', 'failed_validation'];
  const mediumEvents = ['unusual_access_pattern', 'multiple_login_attempts', 'page_navigation'];
  
  if (criticalEvents.includes(eventType)) return 'critical';
  if (highEvents.includes(eventType)) return 'high';
  if (mediumEvents.includes(eventType)) return 'medium';
  return 'low';
};

// Obtenir l'IP du client (approximative)
const getClientIP = async (): Promise<string | null> => {
  try {
    // Utiliser ipinfo.io au lieu de ip-api.com pour éviter les erreurs 403
    const response = await fetch('https://ipinfo.io/json');
    if (response.ok) {
      const data = await response.json();
      return data.ip;
    }
  } catch (error) {
    console.warn('Cannot get client IP:', error);
  }
  return null;
};

// Vérification CSRF (pour les formulaires critiques)
export const generateCSRFToken = (): string => {
  return crypto.randomUUID();
};

export const validateCSRFToken = (token: string, storedToken: string): boolean => {
  return token === storedToken && token.length > 0;
};

// Headers de sécurité pour les requêtes
export const getSecurityHeaders = (): HeadersInit => {
  return {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin'
  };
};