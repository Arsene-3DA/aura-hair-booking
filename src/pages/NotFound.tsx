import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Home, Search } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  const handleGoBack = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="flex items-center justify-center py-24">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4">
              <div className="text-6xl font-bold text-primary mb-2">404</div>
              <Search className="h-12 w-12 mx-auto text-muted-foreground" />
            </div>
            <CardTitle className="text-2xl">Page introuvable</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              Désolé, la page que vous recherchez n'existe pas ou a été déplacée.
            </p>
            
            <div className="space-y-3">
              <Button 
                onClick={handleGoBack}
                variant="outline"
                className="w-full"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour
              </Button>
              
              <Button 
                onClick={() => navigate('/')}
                className="w-full"
              >
                <Home className="h-4 w-4 mr-2" />
                Retour à l'accueil
              </Button>
              
              <Button 
                onClick={() => navigate('/stylists')}
                variant="secondary"
                className="w-full"
              >
                <Search className="h-4 w-4 mr-2" />
                Voir nos coiffeurs
              </Button>
            </div>
            
            <div className="mt-6 p-3 bg-muted rounded-lg text-sm text-muted-foreground">
              Si vous pensez qu'il s'agit d'une erreur, contactez notre support.
            </div>
          </CardContent>
        </Card>
      </main>
      
      <Footer />
    </div>
  );
};

export default NotFound;
