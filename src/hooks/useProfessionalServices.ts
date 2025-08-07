import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ProfessionalService {
  id: string;
  name: string;
  description?: string;
  price: number;
  duration: number;
  category?: string;
  created_at?: string;
  updated_at?: string;
}

interface UseProfessionalServicesReturn {
  services: ProfessionalService[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  servicesCount: number;
}

/**
 * Hook pour récupérer les services d'un professionnel spécifique avec mises à jour en temps réel
 * Utilise la relation hairdresser_services pour garantir que seuls les services
 * ajoutés par le professionnel sont affichés
 */
export const useProfessionalServices = (
  professionalAuthId?: string,
  enableRealtime: boolean = true
): UseProfessionalServicesReturn => {
  const [services, setServices] = useState<ProfessionalService[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchServices = useCallback(async () => {
    if (!professionalAuthId) {
      setServices([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log('🔍 Récupération des services pour professionalAuthId:', professionalAuthId);

      // D'abord récupérer l'ID du hairdresser basé sur auth_id
      const { data: hairdresserData, error: hairdresserError } = await supabase
        .from('hairdressers')
        .select('id')
        .eq('auth_id', professionalAuthId)
        .eq('is_active', true)
        .single();

      console.log('🔍 Hairdresser data:', hairdresserData, 'Error:', hairdresserError);

      if (hairdresserError) {
        if (hairdresserError.code === 'PGRST116') {
          // Professionnel non trouvé ou inactif
          console.log('❌ Professionnel non trouvé ou inactif');
          setServices([]);
          return;
        }
        throw hairdresserError;
      }

      if (!hairdresserData) {
        console.log('❌ Aucune donnée hairdresser');
        setServices([]);
        return;
      }

      // Ensuite récupérer les services pour ce professionnel via la table de liaison
      const { data, error: servicesError } = await supabase
        .from('hairdresser_services')
        .select(`
          services!inner (
            id,
            name,
            description,
            price,
            duration,
            category,
            created_at,
            updated_at
          )
        `)
        .eq('hairdresser_id', hairdresserData.id);

      console.log('🔍 Services query result:', data, 'Error:', servicesError);

      if (servicesError) {
        throw servicesError;
      }

      // Extraire et formatter les services
      const formattedServices: ProfessionalService[] = data
        ?.map((item: any) => item.services)
        .filter(Boolean)
        .map((service: any) => ({
          id: service.id,
          name: service.name,
          description: service.description,
          price: Number(service.price),
          duration: Number(service.duration),
          category: service.category,
          created_at: service.created_at,
          updated_at: service.updated_at,
        })) || [];

      console.log('✅ Services formatés:', formattedServices);
      setServices(formattedServices);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement des services';
      console.error('Erreur dans useProfessionalServices:', err);
      setError(errorMessage);
      setServices([]);
    } finally {
      setLoading(false);
    }
  }, [professionalAuthId]);

  // Configuration des mises à jour en temps réel
  useEffect(() => {
    if (!enableRealtime || !professionalAuthId) return;

    const channel = supabase
      .channel(`professional-services-${professionalAuthId}`)
      .on(
        'postgres_changes',
        {
          event: '*', // Écouter tous les changements (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'hairdresser_services'
        },
        (payload) => {
          console.log('Changement dans hairdresser_services:', payload);
          // Recharger les services quand la relation change
          fetchServices();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'services'
        },
        (payload) => {
          console.log('Changement dans services:', payload);
          // Recharger aussi si les données de service sont modifiées
          fetchServices();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'hairdressers'
        },
        (payload) => {
          console.log('Changement dans hairdressers:', payload);
          // Recharger si le statut du professionnel change
          if (payload.new && 'auth_id' in payload.new && payload.new.auth_id === professionalAuthId) {
            fetchServices();
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log(`Souscription temps réel activée pour le professionnel ${professionalAuthId}`);
        } else if (status === 'CHANNEL_ERROR') {
          console.error('Erreur de souscription temps réel');
        }
      });

    return () => {
      console.log(`Nettoyage de la souscription pour le professionnel ${professionalAuthId}`);
      supabase.removeChannel(channel);
    };
  }, [professionalAuthId, enableRealtime, fetchServices]);

  // Chargement initial
  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  return {
    services,
    loading,
    error,
    refetch: fetchServices,
    servicesCount: services.length
  };
};