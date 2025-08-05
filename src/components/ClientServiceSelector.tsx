import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, Euro, User } from 'lucide-react';
import { useClientServiceSelection, type ClientVisibleService } from '@/hooks/useClientServiceSelection';
import { Skeleton } from '@/components/ui/skeleton';

interface ClientServiceSelectorProps {
  stylistId?: string;
  onServiceSelect?: (service: ClientVisibleService) => void;
  selectedServiceId?: string;
}

export const ClientServiceSelector = ({ 
  stylistId, 
  onServiceSelect, 
  selectedServiceId 
}: ClientServiceSelectorProps) => {
  const { services, loading } = useClientServiceSelection(stylistId);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="text-center">
          <div className="animate-pulse flex space-x-4">
            <div className="rounded-full bg-muted h-10 w-10"></div>
            <div className="flex-1 space-y-2 py-1">
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-4 bg-muted rounded w-1/2"></div>
            </div>
          </div>
        </div>
        {[1, 2, 3].map(i => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
    );
  }

  if (services.length === 0) {
    return (
      <Card className="border-dashed border-2">
        <CardContent className="text-center py-12">
          <User className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">
            {stylistId ? 'Aucun service disponible' : 'Aucun service trouvé'}
          </h3>
          <p className="text-muted-foreground">
            {stylistId 
              ? 'Ce styliste n\'a pas encore configuré de services.' 
              : 'Aucun styliste n\'a configuré de services pour le moment.'
            }
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {!stylistId && (
        <div className="text-center mb-6">
          <h2 className="text-xl font-semibold text-foreground mb-2">
            Services disponibles
          </h2>
          <p className="text-muted-foreground">
            Choisissez un service parmi ceux proposés par nos professionnels
          </p>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {services.map(service => (
          <Card 
            key={service.id} 
            className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
              selectedServiceId === service.id 
                ? 'ring-2 ring-primary bg-primary/5' 
                : 'hover:border-primary/50'
            }`}
            onClick={() => onServiceSelect?.(service)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg">{service.name}</CardTitle>
                <Badge variant="outline" className="ml-2">
                  {service.category}
                </Badge>
              </div>
              {!stylistId && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="h-4 w-4" />
                  <span>{service.stylist_name}</span>
                </div>
              )}
            </CardHeader>
            
            <CardContent className="pt-0 space-y-3">
              <p className="text-sm text-muted-foreground line-clamp-2">
                {service.description}
              </p>
              
              <div className="flex items-center justify-between bg-muted/50 p-3 rounded-lg">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{service.duration} min</span>
                </div>
                <div className="flex items-center gap-1">
                  <Euro className="h-4 w-4 text-muted-foreground" />
                  <span className="text-lg font-bold text-primary">{service.price}€</span>
                </div>
              </div>

              {onServiceSelect && (
                <Button 
                  variant={selectedServiceId === service.id ? "default" : "outline"}
                  className="w-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    onServiceSelect(service);
                  }}
                >
                  {selectedServiceId === service.id ? 'Service sélectionné' : 'Choisir ce service'}
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {services.length > 0 && !stylistId && (
        <div className="text-center mt-6 p-4 bg-muted/30 rounded-lg">
          <p className="text-sm text-muted-foreground">
            💡 <strong>Total de {services.length} service{services.length > 1 ? 's' : ''} disponible{services.length > 1 ? 's' : ''}</strong>
            <br />
            Tous les services sont proposés par nos professionnels vérifiés
          </p>
        </div>
      )}
    </div>
  );
};

export default ClientServiceSelector;