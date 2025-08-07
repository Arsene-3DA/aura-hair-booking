import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useRoleAuth } from '@/hooks/useRoleAuth';
import { useNavigate } from 'react-router-dom';
import { Clock, Euro, Scissors, ArrowLeft } from 'lucide-react';
interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number;
}
interface Stylist {
  id: string;
  name: string;
}
const ServicesListPage = () => {
  const navigate = useNavigate();
  const {
    isAuthenticated
  } = useRoleAuth();

  // Récupérer les services
  const {
    data: services = [],
    isLoading: servicesLoading
  } = useQuery({
    queryKey: ['services'],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from('services').select('*').order('name');
      if (error) throw error;
      return data as Service[];
    }
  });

  // Récupérer la liste des stylistes
  const {
    data: stylists = [],
    isLoading: stylistsLoading
  } = useQuery({
    queryKey: ['stylists'],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from('profiles').select('user_id, full_name').eq('role', 'coiffeur');
      if (error) throw error;
      return data.map(p => ({
        id: p.user_id,
        name: p.full_name || 'Styliste'
      })) as Stylist[];
    }
  });
  const handleServiceSelect = (serviceId: string, stylistId?: string) => {
    if (!isAuthenticated) {
      const nextUrl = `/reserve/${serviceId}${stylistId ? `?stylist=${stylistId}` : ''}`;
      navigate(`/auth?next=${encodeURIComponent(nextUrl)}`);
      return;
    }
    if (stylistId) {
      navigate(`/reserve/${serviceId}?stylist=${stylistId}`);
    } else if (stylists.length === 1) {
      navigate(`/reserve/${serviceId}?stylist=${stylists[0].id}`);
    } else {
      // Pour l'instant, on prend le premier styliste disponible
      // Dans une version future, on pourrait permettre de choisir
      navigate(`/reserve/${serviceId}?stylist=${stylists[0]?.id}`);
    }
  };
  if (servicesLoading || stylistsLoading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement des services...</p>
        </div>
      </div>;
  }
  return <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <Button variant="ghost" onClick={() => navigate('/')} className="mb-4 text-slate-400">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour à l'accueil
        </Button>

        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Nos Services</h1>
          <p className="text-muted-foreground">
            Choisissez le service qui vous convient et réservez votre rendez-vous
          </p>
        </div>

        {services.length === 0 ? <Card>
            <CardContent className="text-center py-12">
              <Scissors className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Aucun service disponible</h3>
              <p className="text-muted-foreground">
                Les services seront bientôt disponibles
              </p>
            </CardContent>
          </Card> : <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {services.map(service => <Card key={service.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-xl">{service.name}</CardTitle>
                    <Badge variant="secondary" className="ml-2">
                      {service.price}€
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {service.description && <p className="text-muted-foreground">{service.description}</p>}
                  
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{service.duration} min</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Euro className="h-4 w-4 text-muted-foreground" />
                      <span>{service.price}€</span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <Button onClick={() => handleServiceSelect(service.id)} className="w-full">
                      Réserver ce service
                    </Button>
                  </div>
                </CardContent>
              </Card>)}
          </div>}

        {stylists.length > 0 && <Card className="mt-8">
            <CardHeader>
              <CardTitle>Nos Stylistes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2 md:grid-cols-3">
                {stylists.map(stylist => <div key={stylist.id} className="p-2 bg-muted rounded-lg">
                    <span className="font-medium">{stylist.name}</span>
                  </div>)}
              </div>
            </CardContent>
          </Card>}
      </div>
    </div>;
};
export default ServicesListPage;