import { useEffect, useState } from 'react';
import { validateSession, clearAllSessions } from '@/utils/sessionCleanup';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export const SessionValidator = ({ children }: { children: React.ReactNode }) => {
  const [sessionIssue, setSessionIssue] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      setLoading(true);
      try {
        const session = await validateSession();
        
        if (!session) {
          // Pas de session valide, mais c'est normal
          setSessionIssue(false);
        } else {
          // Session valide trouvée
          setSessionIssue(false);
        }
      } catch (error) {
        console.error('Session validation failed:', error);
        setSessionIssue(true);
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, []);

  const handleClearSessions = async () => {
    setLoading(true);
    await clearAllSessions();
    window.location.href = '/'; // Redirection complète pour éviter tout conflit
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Validation de la session...</p>
        </div>
      </div>
    );
  }

  if (sessionIssue) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <CardTitle>Problème de session détecté</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground text-center">
              Il semble y avoir un conflit entre plusieurs comptes. Nous allons nettoyer votre session pour résoudre le problème.
            </p>
            <div className="flex gap-2">
              <Button onClick={handleClearSessions} className="flex-1">
                Nettoyer la session
              </Button>
              <Button variant="outline" onClick={handleRefresh} className="flex-1">
                Actualiser
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
};