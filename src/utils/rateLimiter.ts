// SECURITY FIX: Enhanced rate limiting utility
import { logSecurityEvent } from '@/utils/security';

interface RateLimitConfig {
  maxAttempts: number;
  windowMs: number;
  blockDurationMs?: number;
  progressive?: boolean;
}

interface RateLimitRecord {
  count: number;
  resetTime: number;
  violations: number;
  blocked: boolean;
}

class RateLimiter {
  private limits = new Map<string, RateLimitRecord>();
  private persistenceKey = 'secure_rate_limits';

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      const stored = localStorage.getItem(this.persistenceKey);
      if (stored) {
        const data = JSON.parse(stored);
        Object.entries(data).forEach(([key, record]: [string, any]) => {
          if (record.resetTime > Date.now()) {
            this.limits.set(key, record);
          }
        });
      }
    } catch (error) {
      console.warn('Failed to load rate limits from storage:', error);
    }
  }

  private saveToStorage() {
    try {
      const data: Record<string, RateLimitRecord> = {};
      this.limits.forEach((record, key) => {
        if (record.resetTime > Date.now()) {
          data[key] = record;
        }
      });
      localStorage.setItem(this.persistenceKey, JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to save rate limits to storage:', error);
    }
  }

  async checkLimit(
    key: string, 
    config: RateLimitConfig,
    context?: Record<string, any>
  ): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
    const now = Date.now();
    const record = this.limits.get(key) || {
      count: 0,
      resetTime: now + config.windowMs,
      violations: 0,
      blocked: false
    };

    // Check if currently blocked
    if (record.blocked && record.resetTime > now) {
      await logSecurityEvent('rate_limit_blocked', `Rate limit block active for: ${key}`, {
        key,
        context,
        resetTime: record.resetTime
      });
      
      return {
        allowed: false,
        remaining: 0,
        resetTime: record.resetTime
      };
    }

    // Reset if window expired
    if (now > record.resetTime) {
      record.count = 0;
      record.resetTime = now + config.windowMs;
      record.blocked = false;
    }

    // Check if limit exceeded
    if (record.count >= config.maxAttempts) {
      record.violations++;
      
      // Calculate block duration (progressive if enabled)
      const blockDuration = config.blockDurationMs || config.windowMs;
      const multiplier = config.progressive ? Math.min(record.violations, 10) : 1;
      
      record.blocked = true;
      record.resetTime = now + (blockDuration * multiplier);
      
      this.limits.set(key, record);
      this.saveToStorage();
      
      await logSecurityEvent('rate_limit_exceeded', `Rate limit exceeded for: ${key}`, {
        key,
        attempts: record.count,
        violations: record.violations,
        blockDuration: blockDuration * multiplier,
        context
      });
      
      return {
        allowed: false,
        remaining: 0,
        resetTime: record.resetTime
      };
    }

    // Increment counter and allow
    record.count++;
    this.limits.set(key, record);
    this.saveToStorage();

    return {
      allowed: true,
      remaining: config.maxAttempts - record.count,
      resetTime: record.resetTime
    };
  }

  // Clear all rate limits (for testing or admin actions)
  clearAll() {
    this.limits.clear();
    localStorage.removeItem(this.persistenceKey);
  }

  // Get current status for a key
  getStatus(key: string): RateLimitRecord | null {
    return this.limits.get(key) || null;
  }

  // Remove expired entries
  cleanup() {
    const now = Date.now();
    let cleaned = 0;
    
    this.limits.forEach((record, key) => {
      if (record.resetTime <= now && !record.blocked) {
        this.limits.delete(key);
        cleaned++;
      }
    });
    
    if (cleaned > 0) {
      this.saveToStorage();
    }
    
    return cleaned;
  }
}

// Export singleton instance
export const rateLimiter = new RateLimiter();

// Common rate limit configurations
export const RateLimitConfigs = {
  LOGIN: {
    maxAttempts: 5,
    windowMs: 15 * 60 * 1000, // 15 minutes
    blockDurationMs: 30 * 60 * 1000, // 30 minutes
    progressive: true
  },
  PASSWORD_RESET: {
    maxAttempts: 3,
    windowMs: 60 * 60 * 1000, // 1 hour
    blockDurationMs: 60 * 60 * 1000, // 1 hour
    progressive: false
  },
  ADMIN_ACTIONS: {
    maxAttempts: 10,
    windowMs: 5 * 60 * 1000, // 5 minutes
    blockDurationMs: 15 * 60 * 1000, // 15 minutes
    progressive: true
  },
  API_CALLS: {
    maxAttempts: 100,
    windowMs: 60 * 1000, // 1 minute
    blockDurationMs: 5 * 60 * 1000, // 5 minutes
    progressive: false
  }
};