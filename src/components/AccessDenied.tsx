import React from 'react';
import { Shield, ArrowLeft, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';

interface AccessDeniedProps {
  reason?: string;
  canRetry?: boolean;
  onRetry?: () => void;
}

export const AccessDenied: React.FC<AccessDeniedProps> = ({
  reason = "Vous n'avez pas les permissions nécessaires pour accéder à cette ressource.",
  canRetry = false,
  onRetry
}) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
            <Shield className="h-6 w-6 text-destructive" />
          </div>
          <CardTitle className="text-xl">Accès refusé</CardTitle>
          <CardDescription>{reason}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {canRetry && onRetry && (
            <Button onClick={onRetry} variant="outline" className="w-full">
              <RefreshCw className="h-4 w-4 mr-2" />
              Réessayer
            </Button>
          )}
          <Button onClick={() => navigate(-1)} variant="secondary" className="w-full">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
          <Button onClick={() => navigate('/')} className="w-full">
            Retour à l'accueil
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};