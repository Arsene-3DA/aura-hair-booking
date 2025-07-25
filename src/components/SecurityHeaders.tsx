import { useEffect } from 'react';
import { generateNonce } from '@/utils/security';

// SECURITY FIX: Enhanced security headers component
const SecurityHeaders = () => {
  useEffect(() => {
    // Generate nonce for CSP
    const nonce = generateNonce();
    
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

    // SECURITY FIX: Enhanced Content Security Policy
    const cspDirectives = [
      "default-src 'self'",
      `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'`,
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "connect-src 'self' https://yazsvadgmkpatqyjrzcw.supabase.co",
      "font-src 'self' data:",
      "object-src 'none'",
      "media-src 'self'",
      "frame-src 'none'",
      "worker-src 'self'",
      "manifest-src 'self'",
      "base-uri 'self'",
      "form-action 'self'"
    ].join('; ');
    
    addMetaTag('Content-Security-Policy', cspDirectives);
    
    // Prevent MIME type sniffing
    addMetaTag('X-Content-Type-Options', 'nosniff');
    
    // XSS Protection
    addMetaTag('X-XSS-Protection', '1; mode=block');
    
    // Frame options
    addMetaTag('X-Frame-Options', 'DENY');
    
    // Referrer policy
    addMetaTag('Referrer-Policy', 'strict-origin-when-cross-origin');
    
    // SECURITY FIX: Enhanced permissions policy
    addMetaTag('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), bluetooth=(), accelerometer=(), gyroscope=()');

    // SECURITY FIX: Add Cross-Origin policies
    addMetaTag('Cross-Origin-Embedder-Policy', 'require-corp');
    addMetaTag('Cross-Origin-Opener-Policy', 'same-origin');
    addMetaTag('Cross-Origin-Resource-Policy', 'same-origin');

    // SECURITY FIX: Enhanced form security
    const sensitiveInputs = document.querySelectorAll('input[type="password"], input[name*="card"], input[name*="ssn"], input[name*="credit"]');
    sensitiveInputs.forEach(input => {
      input.setAttribute('autocomplete', 'off');
      input.setAttribute('data-lpignore', 'true'); // Prevent LastPass
      input.setAttribute('data-form-type', 'other'); // Prevent autofill
    });

    // SECURITY FIX: Disable drag and drop on sensitive elements
    const preventDragDrop = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
    };
    
    document.addEventListener('dragover', preventDragDrop);
    document.addEventListener('drop', preventDragDrop);

    // SECURITY FIX: Prevent context menu on sensitive areas
    const preventRightClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.matches('input[type="password"], [data-sensitive="true"]')) {
        e.preventDefault();
      }
    };
    
    document.addEventListener('contextmenu', preventRightClick);

    // SECURITY FIX: Add keyboard shortcut protection
    const preventKeyboardShortcuts = (e: KeyboardEvent) => {
      // Prevent F12 (DevTools), Ctrl+Shift+I, Ctrl+U (View Source)
      if (e.key === 'F12' || 
          (e.ctrlKey && e.shiftKey && e.key === 'I') ||
          (e.ctrlKey && e.key === 'u')) {
        // Only in production - allow in development
        if (window.location.hostname !== 'localhost') {
          e.preventDefault();
        }
      }
    };
    
    document.addEventListener('keydown', preventKeyboardShortcuts);

    // Cleanup function
    return () => {
      document.removeEventListener('dragover', preventDragDrop);
      document.removeEventListener('drop', preventDragDrop);
      document.removeEventListener('contextmenu', preventRightClick);
      document.removeEventListener('keydown', preventKeyboardShortcuts);
    };
  }, []);

  return null; // This component doesn't render anything
};

export default SecurityHeaders;