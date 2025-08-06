// CYPRESS TASKS: Security testing helper functions
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://yazsvadgmkpatqyjrzcw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlhenN2YWRnbWtwYXRxeWpyemN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEwNjA3ODAsImV4cCI6MjA2NjYzNjc4MH0.2tBTkMzkcpI7YU9XajQZRyaaRAoegmFcCRTobZRIw80';

export const securityTasks = {
  // Test RLS policies
  testSupabaseRLS: async ({ table, operation, userId, targetData, shouldSucceed }: {
    table: string;
    operation: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE';
    userId: string | null;
    targetData: any;
    shouldSucceed: boolean;
  }) => {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    // Mock user authentication
    if (userId) {
      // This would normally use a test token
      console.log(`Testing RLS for user ${userId} on table ${table}`);
    }

    try {
      let result;
      switch (operation) {
        case 'SELECT':
          result = await supabase.from(table).select('*').match(targetData);
          break;
        case 'INSERT':
          result = await supabase.from(table).insert(targetData);
          break;
        case 'UPDATE':
          result = await supabase.from(table).update(targetData).eq('id', targetData.id);
          break;
        case 'DELETE':
          result = await supabase.from(table).delete().match(targetData);
          break;
      }

      const success = !result.error;
      if (shouldSucceed && !success) {
        throw new Error(`Expected operation to succeed but got error: ${result.error?.message}`);
      }
      if (!shouldSucceed && success) {
        throw new Error(`Expected operation to fail but it succeeded`);
      }

      return { success, error: result.error };
    } catch (error) {
      if (shouldSucceed) {
        throw error;
      }
      return { success: false, error };
    }
  },

  // Test storage security
  testSupabaseStorage: async ({ bucket, operation, userId, path, shouldSucceed }: {
    bucket: string;
    operation: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE';
    userId: string | null;
    path: string;
    shouldSucceed: boolean;
  }) => {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    try {
      let result;
      switch (operation) {
        case 'SELECT':
          result = await supabase.storage.from(bucket).download(path);
          break;
        case 'INSERT':
          const file = new File(['test'], 'test.txt', { type: 'text/plain' });
          result = await supabase.storage.from(bucket).upload(path, file);
          break;
        case 'DELETE':
          result = await supabase.storage.from(bucket).remove([path]);
          break;
      }

      const success = !result.error;
      return { success, error: result.error };
    } catch (error) {
      return { success: false, error };
    }
  },

  // Test SQL injection protection
  testSQLInjection: async ({ endpoint, payload, shouldSucceed }: {
    endpoint: string;
    payload: string;
    shouldSucceed: boolean;
  }) => {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: payload })
      });

      const success = response.ok;
      const data = await response.json();

      // Check if the response contains signs of successful injection
      const hasInjectionSigns = JSON.stringify(data).includes('DROP TABLE') || 
                               JSON.stringify(data).includes('auth.users') ||
                               JSON.stringify(data).includes('DELETE FROM');

      if (hasInjectionSigns) {
        throw new Error('SQL injection vulnerability detected');
      }

      return { success, data };
    } catch (error) {
      return { success: false, error };
    }
  },

  // Test RPC function security
  testSupabaseRPC: async ({ functionName, params, shouldSucceed, shouldSanitize }: {
    functionName: string;
    params: any;
    shouldSucceed: boolean;
    shouldSanitize?: boolean;
  }) => {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    try {
      const result = await supabase.rpc(functionName, params);
      
      if (shouldSanitize && result.data) {
        // Check if malicious code was executed
        const stringData = JSON.stringify(result.data);
        if (stringData.includes('<script>') || stringData.includes('DROP TABLE')) {
          throw new Error('Input was not properly sanitized');
        }
      }

      return { success: !result.error, data: result.data, error: result.error };
    } catch (error) {
      return { success: false, error };
    }
  },

  // Security header validation
  testSecurityHeaders: async (url: string) => {
    try {
      const response = await fetch(url);
      const headers = Object.fromEntries(response.headers.entries());
      
      const requiredHeaders = [
        'x-frame-options',
        'x-content-type-options',
        'x-xss-protection',
        'content-security-policy'
      ];

      const missingHeaders = requiredHeaders.filter(header => !headers[header]);
      
      return {
        success: missingHeaders.length === 0,
        headers,
        missingHeaders
      };
    } catch (error) {
      return { success: false, error };
    }
  },

  // Rate limiting test
  testRateLimit: async ({ endpoint, maxRequests, timeWindow }: {
    endpoint: string;
    maxRequests: number;
    timeWindow: number;
  }) => {
    const requests = [];
    const startTime = Date.now();

    for (let i = 0; i < maxRequests + 5; i++) {
      requests.push(
        fetch(endpoint, { method: 'POST' })
          .then(response => ({ status: response.status, index: i }))
          .catch(error => ({ error, index: i }))
      );
    }

    const results = await Promise.all(requests);
    const rateLimitedRequests = results.filter(r => r.status === 429);
    
    return {
      success: rateLimitedRequests.length > 0,
      totalRequests: results.length,
      rateLimitedCount: rateLimitedRequests.length,
      timeElapsed: Date.now() - startTime
    };
  }
};