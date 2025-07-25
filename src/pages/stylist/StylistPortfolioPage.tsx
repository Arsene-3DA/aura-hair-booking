import { useState } from 'react';
import { useRoleAuth } from '@/hooks/useRoleAuth';
import { usePortfolio } from '@/hooks/usePortfolio';
import { useStylistServices } from '@/hooks/useStylistServices';
import { useRemoveServiceFromPortfolio } from '@/hooks/useRemoveServiceFromPortfolio';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Camera, Plus, Trash2, Images } from 'lucide-react';
import AddServiceModal from '@/components/portfolio/AddServiceModal';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

const StylistPortfolioPage = () => {
  const { userProfile } = useRoleAuth();
  const { portfolio, loading: portfolioLoading, refetch } = usePortfolio(userProfile?.user_id);
  const { services, loading: servicesLoading } = useStylistServices(userProfile?.user_id);
  const { removeServiceFromPortfolio, removing } = useRemoveServiceFromPortfolio();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const handleRemoveService = async (portfolioId: string, imageUrl: string) => {
    try {
      await removeServiceFromPortfolio(portfolioId, imageUrl);
      refetch();
    } catch (error) {
      // Error is handled in the hook
    }
  };

  const handleServiceAdded = () => {
    setIsAddModalOpen(false);
    refetch();
  };

  if (portfolioLoading || servicesLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Get services not yet in portfolio
  const portfolioServiceIds = portfolio.map(item => item.service_id);
  const availableServices = services.filter(service => 
    !portfolioServiceIds.includes(service.id)
  );

  return (
    <div className="space-y-6" data-cy="stylist-portfolio">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Camera className="h-8 w-8" />
            Mon Portfolio
          </h1>
          <p className="text-muted-foreground">
            Présentez vos réalisations et services
          </p>
        </div>
        <Button 
          onClick={() => setIsAddModalOpen(true)}
          disabled={availableServices.length === 0}
          data-cy="add-service-button"
        >
          <Plus className="h-4 w-4 mr-2" />
          Ajouter un service
        </Button>
      </div>

      {/* Portfolio Grid */}
      {portfolio.length === 0 ? (
        <div className="text-center py-12">
          <Images className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Votre portfolio est vide
          </h3>
          <p className="text-muted-foreground mb-4">
            Commencez par ajouter vos premières réalisations
          </p>
          {availableServices.length > 0 && (
            <Button onClick={() => setIsAddModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Ajouter votre première réalisation
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3" data-cy="portfolio-grid">
          {portfolio.map((item) => (
            <Card key={item.id} className="overflow-hidden" data-cy="portfolio-item">
              <div className="relative aspect-square">
                <img
                  src={item.image_url}
                  alt={item.hairstyle_name || item.service?.name}
                  className="w-full h-full object-cover"
                  data-cy="portfolio-image"
                />
                <div className="absolute top-2 right-2">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="destructive"
                        size="icon"
                        className="h-8 w-8"
                        data-cy="delete-portfolio-item"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Supprimer cette réalisation ?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Cette action est irréversible. L'image et les informations seront définitivement supprimées.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleRemoveService(item.id, item.image_url)}
                          disabled={removing}
                          data-cy="confirm-delete-portfolio"
                        >
                          Supprimer
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg" data-cy="service-name">
                    {item.service?.name}
                  </CardTitle>
                  <Badge variant="outline">Portfolio</Badge>
                </div>
                {item.hairstyle_name && (
                  <p className="text-sm text-muted-foreground" data-cy="hairstyle-name">
                    {item.hairstyle_name}
                  </p>
                )}
              </CardHeader>
            </Card>
          ))}
        </div>
      )}

      {/* Available Services Info */}
      {availableServices.length === 0 && portfolio.length > 0 && (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">
              Vous avez ajouté tous vos services disponibles au portfolio !
            </p>
          </CardContent>
        </Card>
      )}

      {/* Add Service Modal */}
      <AddServiceModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onServiceAdded={handleServiceAdded}
        availableServices={availableServices}
        stylistId={userProfile?.user_id}
      />
    </div>
  );
};

export default StylistPortfolioPage;