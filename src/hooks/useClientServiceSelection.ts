import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ClientVisibleService {
  id: string;
  name: string;
  description: string;
  duration: number;
  price: number;
  category: string;
  stylist_name: string;
  stylist_id: string;
}

export const useClientServiceSelection = (stylistId?: string) => {
  const [services, setServices] = useState<ClientVisibleService[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchStylistServices = async (targetStylistId: string) => {
    if (!targetStylistId) return;
    
    try {
      setLoading(true);
      
      // D'abord récupérer l'ID du hairdresser
      const { data: hairdresser, error: hairdresserError } = await supabase
        .from('hairdressers')
        .select('id, name')
        .eq('auth_id', targetStylistId)
        .eq('is_active', true)
        .single();

      if (hairdresserError || !hairdresser) {
        throw new Error('Styliste non trouvé ou inactif');
      }

      // Ensuite récupérer les services liés à ce hairdresser
      const { data: serviceLinks, error: linksError } = await supabase
        .from('hairdresser_services')
        .select(`
          service_id,
          services (
            id,
            name,
            description,
            price,
            duration,
            category
          )
        `)
        .eq('hairdresser_id', hairdresser.id);

      if (linksError) throw linksError;

      // Transformer les données pour l'interface client
      const transformedServices: ClientVisibleService[] = (serviceLinks || [])
        .filter(item => item.services)
        .map(item => ({
          id: item.services.id,
          name: item.services.name,
          description: item.services.description || '',
          duration: item.services.duration,
          price: item.services.price,
          category: item.services.category || 'coiffure',
          stylist_name: hairdresser.name,
          stylist_id: targetStylistId
        }));

      setServices(transformedServices);
      
    } catch (error: any) {
      console.error('Erreur lors du chargement des services:', error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de charger les services du styliste",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Récupérer tous les services pour les clients (vue globale)
  const fetchAllServices = async () => {
    try {
      setLoading(true);
      
      // Récupérer tous les hairdressers actifs avec leurs services
      const { data: hairdressers, error: hairdressersError } = await supabase
        .from('hairdressers')
        .select('id, name, auth_id')
        .eq('is_active', true);

      if (hairdressersError) throw hairdressersError;

      const allServices: ClientVisibleService[] = [];

      // Pour chaque hairdresser, récupérer ses services
      for (const hairdresser of hairdressers || []) {
        const { data: serviceLinks, error: linksError } = await supabase
          .from('hairdresser_services')
          .select(`
            service_id,
            services (
              id,
              name,
              description,
              price,
              duration,
              category
            )
          `)
          .eq('hairdresser_id', hairdresser.id);

        if (!linksError && serviceLinks) {
          const hairdresserServices = serviceLinks
            .filter(item => item.services)
            .map(item => ({
              id: item.services.id,
              name: item.services.name,
              description: item.services.description || '',
              duration: item.services.duration,
              price: item.services.price,
              category: item.services.category || 'coiffure',
              stylist_name: hairdresser.name,
              stylist_id: hairdresser.auth_id
            }));

          allServices.push(...hairdresserServices);
        }
      }

      setServices(allServices);
      
    } catch (error: any) {
      console.error('Erreur lors du chargement des services:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les services",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (stylistId) {
      fetchStylistServices(stylistId);
    } else {
      fetchAllServices();
    }
  }, [stylistId]);

  return {
    services,
    loading,
    refetchServices: stylistId ? () => fetchStylistServices(stylistId) : fetchAllServices,
    fetchStylistServices,
    fetchAllServices
  };
};