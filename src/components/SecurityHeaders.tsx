import { useEffect } from 'react';

// Security headers component for enhanced client-side security
const SecurityHeaders = () => {
  useEffect(() => {
    // Set security-related meta tags and headers
    const addMetaTag = (name: string, content: string) => {
      const existingTag = document.querySelector(`meta[name="${name}"]`);
      if (existingTag) {
        existingTag.setAttribute('content', content);
      } else {
        const meta = document.createElement('meta');
        meta.name = name;
        meta.content = content;
        document.head.appendChild(meta);
      }
    };

    // Content Security Policy (basic)
    addMetaTag('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://yazsvadgmkpatqyjrzcw.supabase.co");
    
    // Prevent MIME type sniffing
    addMetaTag('X-Content-Type-Options', 'nosniff');
    
    // XSS Protection
    addMetaTag('X-XSS-Protection', '1; mode=block');
    
    // Frame options
    addMetaTag('X-Frame-Options', 'DENY');
    
    // Referrer policy
    addMetaTag('Referrer-Policy', 'strict-origin-when-cross-origin');
    
    // Permissions policy
    addMetaTag('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

    // Prevent autocomplete on sensitive forms
    const sensitiveInputs = document.querySelectorAll('input[type="password"], input[name*="card"], input[name*="ssn"]');
    sensitiveInputs.forEach(input => {
      input.setAttribute('autocomplete', 'off');
    });

  }, []);

  return null; // This component doesn't render anything
};

export default SecurityHeaders;