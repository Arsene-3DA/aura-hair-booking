import React, { useState, useEffect } from 'react';
import { AlertTriangle, X, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface BrokenLinkDetectorProps {
  children: React.ReactNode;
}

export const BrokenLinkDetector: React.FC<BrokenLinkDetectorProps> = ({ children }) => {
  const [brokenLinks, setBrokenLinks] = useState<string[]>([]);
  const [showAlert, setShowAlert] = useState(false);

  useEffect(() => {
    const checkLinks = async () => {
      const links = document.querySelectorAll('a[href]');
      const broken: string[] = [];

      for (const link of Array.from(links)) {
        const href = (link as HTMLAnchorElement).href;
        
        // Ignorer les liens externes et les liens spéciaux
        if (
          href.startsWith('mailto:') ||
          href.startsWith('tel:') ||
          href.startsWith('javascript:') ||
          href.includes('://') && !href.includes(window.location.origin)
        ) {
          continue;
        }

        try {
          const response = await fetch(href, { method: 'HEAD' });
          if (!response.ok && response.status === 404) {
            broken.push(href);
          }
        } catch (error) {
          // Lien potentiellement cassé
          broken.push(href);
        }
      }

      if (broken.length > 0) {
        setBrokenLinks(broken);
        setShowAlert(true);
      }
    };

    // Vérifier les liens après le chargement de la page
    const timeoutId = setTimeout(checkLinks, 2000);

    return () => clearTimeout(timeoutId);
  }, []);

  if (!showAlert || brokenLinks.length === 0) {
    return <>{children}</>;
  }

  return (
    <>
      {children}
      
      {/* Alerte pour les liens cassés */}
      <div className="fixed bottom-4 right-4 max-w-md z-50">
        <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950 dark:border-orange-800">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-orange-600 dark:text-orange-400 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-medium text-orange-800 dark:text-orange-200">
                  Liens cassés détectés
                </h4>
                <p className="text-sm text-orange-700 dark:text-orange-300 mt-1">
                  {brokenLinks.length} lien(s) sur cette page semblent ne pas fonctionner.
                </p>
                
                <div className="mt-3 space-y-2">
                  {brokenLinks.slice(0, 3).map((link, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        404
                      </Badge>
                      <code className="text-xs bg-background px-1 py-0.5 rounded">
                        {link.replace(window.location.origin, '')}
                      </code>
                    </div>
                  ))}
                  
                  {brokenLinks.length > 3 && (
                    <p className="text-xs text-orange-600 dark:text-orange-400">
                      Et {brokenLinks.length - 3} autre(s)...
                    </p>
                  )}
                </div>

                <div className="flex gap-2 mt-3">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.location.reload()}
                    className="text-xs"
                  >
                    <ExternalLink className="h-3 w-3 mr-1" />
                    Recharger
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowAlert(false)}
                    className="text-xs"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};