// SECURITY ENHANCEMENT: Secure form validation component
import React, { useState, useEffect } from 'react';
import { useSecurityState } from '@/components/EnhancedSecurityProvider';
import { rateLimiter, RateLimitConfigs } from '@/utils/rateLimiter';
import { validateSecureInput } from '@/utils/security';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, AlertTriangle } from 'lucide-react';

interface SecureFormValidationProps {
  children: React.ReactNode;
  formId: string;
  enableRateLimit?: boolean;
  enableXSSProtection?: boolean;
  enableCSRFProtection?: boolean;
  onSecurityViolation?: (violation: string) => void;
}

export const SecureFormValidation: React.FC<SecureFormValidationProps> = ({
  children,
  formId,
  enableRateLimit = true,
  enableXSSProtection = true,
  enableCSRFProtection = true,
  onSecurityViolation
}) => {
  const { validateSecureAction, csrfToken, isSecurityEnabled } = useSecurityState();
  const [securityViolations, setSecurityViolations] = useState<string[]>([]);

  // Validate form submission
  const handleFormSubmit = async (event: Event) => {
    if (!isSecurityEnabled) return;

    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);
    const violations: string[] = [];

    // Rate limiting check
    if (enableRateLimit) {
      const rateLimitResult = await rateLimiter.checkLimit(
        `form_${formId}`,
        RateLimitConfigs.API_CALLS
      );

      if (!rateLimitResult.allowed) {
        violations.push('Trop de soumissions de formulaire. Veuillez patienter.');
        event.preventDefault();
      }
    }

    // CSRF token validation
    if (enableCSRFProtection) {
      const submittedToken = formData.get('csrf_token') as string;
      if (!submittedToken || submittedToken !== csrfToken) {
        violations.push('Token CSRF invalide ou manquant');
        event.preventDefault();
      }
    }

    // XSS protection - validate all text inputs
    if (enableXSSProtection) {
      for (const [key, value] of formData.entries()) {
        if (typeof value === 'string' && value.length > 0) {
          const validation = validateSecureInput(value, 'general');
          if (!validation.isValid) {
            violations.push(`Contenu suspect détecté dans le champ: ${key}`);
            event.preventDefault();
          }
        }
      }
    }

    // Handle security violations
    if (violations.length > 0) {
      setSecurityViolations(violations);
      onSecurityViolation?.(violations.join(', '));
      
      // Validate action for logging
      await validateSecureAction('form_security_violation', {
        formId,
        violations,
        timestamp: new Date().toISOString()
      });
    } else {
      setSecurityViolations([]);
    }
  };

  // Set up form event listeners
  useEffect(() => {
    const forms = document.querySelectorAll(`form[data-form-id="${formId}"]`);
    
    forms.forEach(form => {
      form.addEventListener('submit', handleFormSubmit);
      
      // Add CSRF token to form if enabled
      if (enableCSRFProtection && isSecurityEnabled) {
        let csrfInput = form.querySelector('input[name="csrf_token"]') as HTMLInputElement;
        if (!csrfInput) {
          csrfInput = document.createElement('input');
          csrfInput.type = 'hidden';
          csrfInput.name = 'csrf_token';
          form.appendChild(csrfInput);
        }
        csrfInput.value = csrfToken;
      }

      // Add security attributes to inputs
      const inputs = form.querySelectorAll('input, textarea') as NodeListOf<HTMLInputElement | HTMLTextAreaElement>;
      inputs.forEach(input => {
        // Disable autocomplete for sensitive fields
        if (input.type === 'password' || input.name?.includes('password')) {
          input.setAttribute('autocomplete', 'new-password');
          input.setAttribute('spellcheck', 'false');
        }
        
        // Prevent common injection patterns
        input.addEventListener('paste', (e: ClipboardEvent) => {
          if (enableXSSProtection && isSecurityEnabled) {
            const pastedText = e.clipboardData?.getData('text') || '';
            const validation = validateSecureInput(pastedText, 'general');
            if (!validation.isValid) {
              e.preventDefault();
              setSecurityViolations(['Contenu suspect détecté dans le presse-papiers']);
            }
          }
        });
      });
    });

    return () => {
      forms.forEach(form => {
        form.removeEventListener('submit', handleFormSubmit);
      });
    };
  }, [formId, csrfToken, isSecurityEnabled]);

  return (
    <div className="relative">
      {/* Security Violations Alert */}
      {securityViolations.length > 0 && (
        <Alert variant="destructive" className="mb-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="font-medium">Problèmes de sécurité détectés:</div>
            <ul className="mt-1 list-disc list-inside text-sm">
              {securityViolations.map((violation, index) => (
                <li key={index}>{violation}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Security Indicator */}
      {isSecurityEnabled && (
        <div className="flex items-center gap-2 mb-4 text-sm text-muted-foreground">
          <Shield className="h-4 w-4 text-green-500" />
          <span>Protection de sécurité activée</span>
        </div>
      )}

      {children}
    </div>
  );
};

// HOC for securing forms
export const withSecureForm = <P extends object>(
  Component: React.ComponentType<P>,
  formId: string,
  options?: {
    enableRateLimit?: boolean;
    enableXSSProtection?: boolean;
    enableCSRFProtection?: boolean;
  }
) => {
  return (props: P) => (
    <SecureFormValidation
      formId={formId}
      enableRateLimit={options?.enableRateLimit}
      enableXSSProtection={options?.enableXSSProtection}
      enableCSRFProtection={options?.enableCSRFProtection}
    >
      <Component {...props} />
    </SecureFormValidation>
  );
};

// Secure input validation hook
export const useSecureInput = (fieldName: string, inputType: 'email' | 'password' | 'general' = 'general') => {
  const [value, setValue] = useState('');
  const [isValid, setIsValid] = useState(true);
  const [errors, setErrors] = useState<string[]>([]);
  const { isSecurityEnabled } = useSecurityState();

  const validateInput = (inputValue: string) => {
    if (!isSecurityEnabled) {
      setValue(inputValue);
      return;
    }

    const validation = validateSecureInput(inputValue, inputType);
    setValue(validation.sanitized);
    setIsValid(validation.isValid);
    setErrors(validation.errors);
  };

  return {
    value,
    setValue: validateInput,
    isValid,
    errors,
    fieldProps: {
      value,
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        validateInput(e.target.value);
      },
      'data-field-name': fieldName,
      className: isValid ? '' : 'border-destructive focus:ring-destructive'
    }
  };
};