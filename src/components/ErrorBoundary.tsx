import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleRefresh = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4">
                <AlertTriangle className="h-12 w-12 text-destructive" />
              </div>
              <CardTitle className="text-xl text-destructive">
                Une erreur s'est produite
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-muted-foreground">
                Nous nous excusons pour ce désagrément. Une erreur inattendue s'est produite.
              </p>
              
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="text-left p-3 bg-muted rounded-lg text-sm font-mono">
                  <p className="font-bold mb-2">Détails de l'erreur :</p>
                  <p className="text-destructive">{this.state.error.message}</p>
                </div>
              )}
              
              <div className="space-y-3">
                <Button 
                  onClick={this.handleRefresh}
                  className="w-full"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Actualiser la page
                </Button>
                
                <Button 
                  onClick={this.handleGoHome}
                  variant="outline"
                  className="w-full"
                >
                  <Home className="h-4 w-4 mr-2" />
                  Retour à l'accueil
                </Button>
              </div>
              
              <div className="mt-6 p-3 bg-muted rounded-lg text-sm text-muted-foreground">
                Si le problème persiste, contactez notre support technique.
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;