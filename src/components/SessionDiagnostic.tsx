import React from 'react';
import { useRoleAuth } from '@/hooks/useRoleAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RefreshCw, LogOut, User, AlertTriangle } from 'lucide-react';

const SessionDiagnostic = () => {
  const { user, userProfile, loading, isAuthenticated, signOut } = useRoleAuth();

  const handleForceLogout = async () => {
    console.log('🔥 Force logout triggered');
    await signOut();
    // Force clear local storage
    localStorage.clear();
    sessionStorage.clear();
    // Force reload page
    window.location.href = '/';
  };

  const handleClearCacheAndReload = () => {
    console.log('🗑️ Clearing cache and reloading');
    localStorage.clear();
    sessionStorage.clear();
    // Force reload with cache clear
    window.location.reload();
  };

  const diagnosticInfo = {
    isAuthenticated,
    hasUser: !!user,
    userEmail: user?.email,
    hasProfile: !!userProfile,
    profileRole: userProfile?.role,
    loading,
    userAgent: navigator.userAgent,
    currentUrl: window.location.href,
    localStorage: Object.keys(localStorage),
    sessionStorage: Object.keys(sessionStorage)
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Diagnostic de Session
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h3 className="font-semibold">État d'authentification</h3>
                <div className="space-y-1 text-sm">
                  <div>Authentifié: {isAuthenticated ? '✅ Oui' : '❌ Non'}</div>
                  <div>Utilisateur: {user ? '✅ Oui' : '❌ Non'}</div>
                  <div>Email: {user?.email || '❌ Non défini'}</div>
                  <div>Profil: {userProfile ? '✅ Oui' : '❌ Non'}</div>
                  <div>Rôle: {userProfile?.role || '❌ Non défini'}</div>
                  <div>Chargement: {loading ? '⏳ En cours' : '✅ Terminé'}</div>
                </div>
              </div>
              
              <div className="space-y-2">
                <h3 className="font-semibold">Stockage local</h3>
                <div className="space-y-1 text-sm">
                  <div>localStorage: {diagnosticInfo.localStorage.length} éléments</div>
                  <div>sessionStorage: {diagnosticInfo.sessionStorage.length} éléments</div>
                  <div className="max-h-20 overflow-y-auto">
                    <details>
                      <summary className="cursor-pointer">Détails du stockage</summary>
                      <pre className="text-xs mt-2 p-2 bg-muted rounded">
                        {JSON.stringify(diagnosticInfo, null, 2)}
                      </pre>
                    </details>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <Button 
                onClick={handleForceLogout} 
                variant="destructive"
                className="flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                Déconnexion forcée
              </Button>
              
              <Button 
                onClick={handleClearCacheAndReload}
                variant="outline"
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Vider le cache et recharger
              </Button>
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
              <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
                Instructions
              </h4>
              <ol className="list-decimal list-inside space-y-1 text-sm text-yellow-700 dark:text-yellow-300">
                <li>Cliquez sur "Déconnexion forcée" pour nettoyer complètement la session</li>
                <li>Vous serez redirigé vers la page d'accueil</li>
                <li>Reconnectez-vous avec vos identifiants</li>
                <li>Si le problème persiste, utilisez "Vider le cache et recharger"</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SessionDiagnostic;