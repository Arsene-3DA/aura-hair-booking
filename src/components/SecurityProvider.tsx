// SECURITY FIX: Security provider component
import React, { createContext, useContext, ReactNode } from 'react';
import { useSecurityContext } from '@/hooks/useSecurityContext';
import SecurityHeaders from '@/components/SecurityHeaders';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Shield, AlertTriangle } from 'lucide-react';

interface SecurityContextType {
  sessionValid: boolean;
  csrfToken: string;
  securityLevel: 'low' | 'medium' | 'high';
  securityWarnings: string[];
  validateSecureAction: (action: string, data?: any) => Promise<boolean>;
  refreshCSRFToken: () => string;
  refreshSecurityContext: () => Promise<void>;
}

const SecurityContext = createContext<SecurityContextType | null>(null);

interface SecurityProviderProps {
  children: ReactNode;
  enableWarnings?: boolean;
}

export const SecurityProvider: React.FC<SecurityProviderProps> = ({ 
  children, 
  enableWarnings = true 
}) => {
  const {
    securityContext,
    loading,
    validateSecureAction,
    refreshCSRFToken,
    refreshSecurityContext
  } = useSecurityContext();

  // Show security warnings for critical issues
  const showCriticalWarning = enableWarnings && 
    securityContext.securityLevel === 'low' && 
    securityContext.securityWarnings.length > 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Shield className="mx-auto h-8 w-8 animate-spin text-primary" />
          <p className="mt-2 text-sm text-muted-foreground">
            Initialisation sécurisée...
          </p>
        </div>
      </div>
    );
  }

  return (
    <SecurityContext.Provider
      value={{
        sessionValid: securityContext.sessionValid,
        csrfToken: securityContext.csrfToken,
        securityLevel: securityContext.securityLevel,
        securityWarnings: securityContext.securityWarnings,
        validateSecureAction,
        refreshCSRFToken,
        refreshSecurityContext
      }}
    >
      <SecurityHeaders />
      
      {showCriticalWarning && (
        <Alert variant="destructive" className="m-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Problème de sécurité détecté</AlertTitle>
          <AlertDescription>
            <ul className="mt-2 list-disc list-inside text-sm">
              {securityContext.securityWarnings.slice(0, 3).map((warning, index) => (
                <li key={index}>{warning}</li>
              ))}
            </ul>
            {securityContext.securityWarnings.length > 3 && (
              <p className="mt-2 text-xs">
                et {securityContext.securityWarnings.length - 3} autres avertissements...
              </p>
            )}
          </AlertDescription>
        </Alert>
      )}
      
      {children}
    </SecurityContext.Provider>
  );
};

export const useSecurityState = () => {
  const context = useContext(SecurityContext);
  if (!context) {
    throw new Error('useSecurityState must be used within a SecurityProvider');
  }
  return context;
};