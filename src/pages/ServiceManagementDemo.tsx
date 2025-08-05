import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Scissors, Users, Eye, Settings, CheckCircle } from 'lucide-react';
import ClientServiceSelector from '@/components/ClientServiceSelector';
import { useAuth } from '@/hooks/useAuth';

const ServiceManagementDemo = () => {
  const { user } = useAuth();
  const [selectedService, setSelectedService] = useState<any>(null);

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-foreground flex items-center justify-center gap-3">
          <Scissors className="h-8 w-8" />
          Système de Gestion des Services
        </h1>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
          Démonstration complète du système de gestion des services : 
          création, modification, suppression par les professionnels, et visibilité pour les clients.
        </p>
      </div>

      {/* Fonctionnalités principales */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="border-primary/20 bg-gradient-to-b from-primary/5 to-transparent">
          <CardContent className="p-6 text-center">
            <Settings className="h-12 w-12 text-primary mx-auto mb-4" />
            <h3 className="font-semibold text-foreground mb-2">Gestion Professionnelle</h3>
            <p className="text-sm text-muted-foreground">
              Créer, modifier et supprimer des services avec validation complète
            </p>
            <Badge variant="default" className="mt-3">✅ Implémenté</Badge>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-gradient-to-b from-green-50 to-transparent">
          <CardContent className="p-6 text-center">
            <Eye className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <h3 className="font-semibold text-foreground mb-2">Visibilité Client</h3>
            <p className="text-sm text-muted-foreground">
              Les clients voient uniquement les services du professionnel sélectionné
            </p>
            <Badge variant="secondary" className="mt-3 bg-green-100 text-green-800">✅ Fonctionnel</Badge>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-gradient-to-b from-blue-50 to-transparent">
          <CardContent className="p-6 text-center">
            <CheckCircle className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            <h3 className="font-semibold text-foreground mb-2">Sécurité RLS</h3>
            <p className="text-sm text-muted-foreground">
              Chaque professionnel ne gère que ses propres services
            </p>
            <Badge variant="secondary" className="mt-3 bg-blue-100 text-blue-800">🔒 Sécurisé</Badge>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-gradient-to-b from-purple-50 to-transparent">
          <CardContent className="p-6 text-center">
            <Users className="h-12 w-12 text-purple-600 mx-auto mb-4" />
            <h3 className="font-semibold text-foreground mb-2">Intégration Réservation</h3>
            <p className="text-sm text-muted-foreground">
              Services liés automatiquement aux réservations
            </p>
            <Badge variant="secondary" className="mt-3 bg-purple-100 text-purple-800">🔗 Connecté</Badge>
          </CardContent>
        </Card>
      </div>

      {/* Démonstration en temps réel */}
      <Tabs defaultValue="professional" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="professional">Vue Professionnel</TabsTrigger>
          <TabsTrigger value="client">Vue Client</TabsTrigger>
        </TabsList>

        <TabsContent value="professional" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Interface Professionnel - Gestion des Services
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-muted/50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Fonctionnalités disponibles :</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>✅ Ajout de nouveaux services avec validation complète</li>
                    <li>✅ Modification des services existants</li>
                    <li>✅ Suppression avec confirmation de sécurité</li>
                    <li>✅ Persistance automatique en base de données</li>
                    <li>✅ Rechargement en temps réel</li>
                    <li>✅ Gestion des erreurs avec messages détaillés</li>
                  </ul>
                </div>
                
                <Button 
                  onClick={() => window.open('/stylist/services', '_blank')}
                  className="w-full"
                >
                  Accéder à l'interface de gestion des services
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="client" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Vue Client - Services Disponibles
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h4 className="font-semibold mb-2 text-blue-800">Ce que voient les clients :</h4>
                  <ul className="text-sm space-y-1 text-blue-700">
                    <li>• Services uniquement du professionnel sélectionné</li>
                    <li>• Informations complètes : nom, description, durée, prix</li>
                    <li>• Interface intuitive pour la sélection</li>
                    <li>• Mise à jour automatique quand le professionnel modifie ses services</li>
                  </ul>
                </div>

                {selectedService && (
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <h4 className="font-semibold mb-2 text-green-800">Service sélectionné :</h4>
                    <p className="text-green-700">
                      <strong>{selectedService.name}</strong> - {selectedService.price}€ ({selectedService.duration} min)
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Sélecteur de services en live */}
          <Card>
            <CardHeader>
              <CardTitle>Démonstration en temps réel</CardTitle>
            </CardHeader>
            <CardContent>
              <ClientServiceSelector 
                onServiceSelect={setSelectedService}
                selectedServiceId={selectedService?.id}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Résumé technique */}
      <Card className="bg-gradient-to-r from-primary/5 to-secondary/5">
        <CardHeader>
          <CardTitle>Spécifications Techniques Implémentées</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3">✅ Côté Professionnel</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Hook `useStylistServicesManagement` pour la gestion CRUD</li>
                <li>• Validation de formulaire avec messages d'erreur spécifiques</li>
                <li>• Confirmation de suppression avec AlertDialog</li>
                <li>• Sauvegarde persistante en base de données</li>
                <li>• Écoute temps réel des changements</li>
                <li>• Gestion d'erreurs Supabase détaillée</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">✅ Côté Client</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Hook `useClientServiceSelection` pour l'affichage</li>
                <li>• Composant `ClientServiceSelector` réutilisable</li>
                <li>• Filtrage par professionnel automatique</li>
                <li>• Interface responsive et intuitive</li>
                <li>• Intégration prête pour les réservations</li>
                <li>• Politiques RLS sécurisées</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ServiceManagementDemo;