import React from 'react';
import { useRouteGuard } from '@/hooks/useRouteGuard';
import { Search, Home, ArrowLeft, MapPin, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const NotFound: React.FC = () => {
  const { suggestions, currentPath, navigateToSuggestion, goHome, goBack } = useRouteGuard({
    enableLogging: true
  });

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Search className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Page non trouvée</CardTitle>
          <CardDescription className="text-base">
            La page que vous recherchez n'existe pas ou a été déplacée.
          </CardDescription>
          
          {currentPath && (
            <div className="mt-4 p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Chemin demandé:</span>
                <code className="bg-background px-2 py-1 rounded text-foreground">
                  {currentPath}
                </code>
              </div>
            </div>
          )}
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Suggestions de routes */}
          {suggestions.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-orange-500" />
                Peut-être cherchiez-vous :
              </h3>
              <div className="grid gap-2">
                {suggestions.slice(0, 4).map((route, index) => (
                  <Button
                    key={route}
                    variant="outline"
                    className="justify-start h-auto p-4"
                    onClick={() => navigateToSuggestion(route)}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-3">
                        <Badge variant="secondary" className="text-xs">
                          {index + 1}
                        </Badge>
                        <code className="text-sm">{route}</code>
                      </div>
                      <ArrowLeft className="h-4 w-4 rotate-180" />
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Pages populaires */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Pages populaires :</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="justify-start h-auto p-4"
                onClick={() => navigateToSuggestion('/')}
              >
                <div className="text-left">
                  <div className="font-medium">Accueil</div>
                  <div className="text-sm text-muted-foreground">Page principale</div>
                </div>
              </Button>
              
              <Button
                variant="outline"
                className="justify-start h-auto p-4"
                onClick={() => navigateToSuggestion('/stylists')}
              >
                <div className="text-left">
                  <div className="font-medium">Stylistes</div>
                  <div className="text-sm text-muted-foreground">Nos professionnels</div>
                </div>
              </Button>
              
              <Button
                variant="outline"
                className="justify-start h-auto p-4"
                onClick={() => navigateToSuggestion('/services')}
              >
                <div className="text-left">
                  <div className="font-medium">Services</div>
                  <div className="text-sm text-muted-foreground">Nos prestations</div>
                </div>
              </Button>
              
              <Button
                variant="outline"
                className="justify-start h-auto p-4"
                onClick={() => navigateToSuggestion('/booking')}
              >
                <div className="text-left">
                  <div className="font-medium">Réserver</div>
                  <div className="text-sm text-muted-foreground">Prendre RDV</div>
                </div>
              </Button>
            </div>
          </div>

          {/* Actions principales */}
          <div className="flex gap-3 pt-4">
            <Button onClick={goBack} variant="outline" className="flex-1">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
            <Button onClick={goHome} className="flex-1">
              <Home className="h-4 w-4 mr-2" />
              Accueil
            </Button>
          </div>

          {/* Message d'aide */}
          <div className="text-center text-sm text-muted-foreground pt-4 border-t">
            <p>
              Si vous pensez qu'il s'agit d'une erreur, veuillez contacter notre support.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};