// SECURITY FIX: Enhanced secure form wrapper
import React, { ReactNode, useEffect, useState } from 'react';
import { useSecurityState } from '@/components/SecurityProvider';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, AlertTriangle } from 'lucide-react';

interface SecureFormProps {
  children: ReactNode;
  onSubmit: (data: FormData, csrfToken: string) => Promise<void>;
  requireHighSecurity?: boolean;
  className?: string;
}

export const SecureForm: React.FC<SecureFormProps> = ({
  children,
  onSubmit,
  requireHighSecurity = false,
  className = ''
}) => {
  const { sessionValid, csrfToken, securityLevel, validateSecureAction } = useSecurityState();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [securityError, setSecurityError] = useState<string | null>(null);

  // Validate security requirements
  useEffect(() => {
    if (requireHighSecurity && securityLevel !== 'high') {
      setSecurityError('Niveau de sécurité insuffisant pour cette action');
    } else if (!sessionValid) {
      setSecurityError('Session invalide ou expirée');
    } else {
      setSecurityError(null);
    }
  }, [requireHighSecurity, securityLevel, sessionValid]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    if (securityError) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Validate the action before proceeding
      const isValidAction = await validateSecureAction('form_submission', {
        requireHighSecurity,
        timestamp: Date.now()
      });
      
      if (!isValidAction) {
        throw new Error('Action non autorisée par les politiques de sécurité');
      }

      const formData = new FormData(event.currentTarget);
      
      // Add CSRF token to form data
      formData.append('csrf_token', csrfToken);
      
      await onSubmit(formData, csrfToken);
      
    } catch (error) {
      console.error('Secure form submission error:', error);
      setSecurityError(error instanceof Error ? error.message : 'Erreur de sécurité inconnue');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={className}>
      {securityError && (
        <Alert variant="destructive" className="mb-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{securityError}</AlertDescription>
        </Alert>
      )}
      
      <form onSubmit={handleSubmit}>
        {/* CSRF Token as hidden input */}
        <input type="hidden" name="csrf_token" value={csrfToken} />
        
        {/* Security level indicator */}
        <div className="flex items-center gap-2 mb-4 text-xs text-muted-foreground">
          <Shield className={`h-3 w-3 ${
            securityLevel === 'high' ? 'text-green-500' : 
            securityLevel === 'medium' ? 'text-yellow-500' : 
            'text-red-500'
          }`} />
          <span>Sécurité: {securityLevel === 'high' ? 'Élevée' : securityLevel === 'medium' ? 'Moyenne' : 'Faible'}</span>
        </div>
        
        {children}
      </form>
    </div>
  );
};