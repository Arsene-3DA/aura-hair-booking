import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface StylistService {
  id: string;
  name: string;
  description: string;
  duration: number;
  price: number;
  isActive: boolean;
  stylist_id: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateServiceData {
  name: string;
  description: string;
  duration: number;
  price: number;
}

export const useStylistServicesManagement = (stylistId: string) => {
  const [services, setServices] = useState<StylistService[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Charger les services depuis la base de données
  const fetchServices = async () => {
    if (!stylistId) return;
    
    try {
      setLoading(true);
      
      // D'abord vérifier/créer l'entrée hairdresser pour cet utilisateur
      let { data: hairdresser, error: hairdresserError } = await supabase
        .from('hairdressers')
        .select('id, auth_id')
        .eq('auth_id', stylistId)
        .single();

      if (hairdresserError && hairdresserError.code === 'PGRST116') {
        // Hairdresser n'existe pas, le créer
        const { data: userProfile } = await supabase
          .from('profiles')
          .select('full_name, user_id')
          .eq('user_id', stylistId)
          .single();

        const { data: newHairdresser, error: createError } = await supabase
          .from('hairdressers')
          .insert([{
            auth_id: stylistId,
            name: userProfile?.full_name || 'Styliste',
            email: 'styliste@example.com', // TODO: récupérer l'email du profil
            is_active: true
          }])
          .select('id, auth_id')
          .single();

        if (createError) throw createError;
        hairdresser = newHairdresser;
      } else if (hairdresserError) {
        throw hairdresserError;
      }

      // Maintenant récupérer les services liés à ce hairdresser
      const { data, error } = await supabase
        .from('hairdresser_services')
        .select(`
          id,
          hairdresser_id,
          created_at,
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

      if (error) throw error;

      // Transformer les données pour correspondre à notre interface
      const transformedServices: StylistService[] = (data || []).map(item => ({
        id: item.services.id,
        name: item.services.name,
        description: item.services.description || '',
        duration: item.services.duration,
        price: item.services.price,
        isActive: true, // Par défaut actif
        stylist_id: stylistId,
        created_at: item.created_at
      }));

      setServices(transformedServices);
    } catch (error) {
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

  // Ajouter un nouveau service
  const addService = async (serviceData: CreateServiceData) => {
    if (!stylistId) throw new Error('ID styliste requis');

    try {
      // D'abord récupérer l'ID du hairdresser
      const { data: hairdresser } = await supabase
        .from('hairdressers')
        .select('id')
        .eq('auth_id', stylistId)
        .single();

      if (!hairdresser) throw new Error('Profil coiffeur non trouvé');

      // Créer le service dans la table services
      const { data: newService, error: serviceError } = await supabase
        .from('services')
        .insert([{
          name: serviceData.name,
          description: serviceData.description,
          duration: serviceData.duration,
          price: serviceData.price,
          category: 'coiffure' // Catégorie par défaut
        }])
        .select()
        .single();

      if (serviceError) throw serviceError;

      // Ensuite lier le service au coiffeur
      const { error: linkError } = await supabase
        .from('hairdresser_services')
        .insert([{
          hairdresser_id: hairdresser.id,
          service_id: newService.id
        }]);

      if (linkError) throw linkError;

      // Recharger complètement la liste des services pour garantir la synchronisation
      await fetchServices();

      toast({
        title: "Succès",
        description: "Service ajouté avec succès"
      });

      console.log('✅ Service ajouté et liste rechargée');
      return newService;
    } catch (error: any) {
      console.error('Erreur lors de l\'ajout du service:', error);
      
      const errorMessage = error?.message || 'Impossible d\'ajouter le service';
      toast({
        title: "Erreur lors de l'ajout",
        description: errorMessage,
        variant: "destructive"
      });
      throw error;
    }
  };

  // Modifier un service existant
  const updateService = async (serviceId: string, serviceData: CreateServiceData) => {
    try {
      const { error } = await supabase
        .from('services')
        .update({
          name: serviceData.name,
          description: serviceData.description,
          duration: serviceData.duration,
          price: serviceData.price,
          updated_at: new Date().toISOString()
        })
        .eq('id', serviceId);

      if (error) throw error;

      // Recharger complètement la liste des services pour garantir la synchronisation
      await fetchServices();

      toast({
        title: "Succès",
        description: "Service modifié avec succès"
      });

      console.log('✅ Service modifié et liste rechargée');
    } catch (error: any) {
      console.error('Erreur lors de la modification du service:', error);
      
      const errorMessage = error?.message || 'Impossible de modifier le service';
      toast({
        title: "Erreur lors de la modification",
        description: errorMessage,
        variant: "destructive"
      });
      throw error;
    }
  };

  // Supprimer un service
  const deleteService = async (serviceId: string) => {
    if (!stylistId) throw new Error('ID styliste requis');

    try {
      // D'abord récupérer l'ID du hairdresser
      const { data: hairdresser } = await supabase
        .from('hairdressers')
        .select('id')
        .eq('auth_id', stylistId)
        .single();

      if (!hairdresser) throw new Error('Profil coiffeur non trouvé');

      // Supprimer la liaison hairdresser_services
      const { error: linkError } = await supabase
        .from('hairdresser_services')
        .delete()
        .eq('hairdresser_id', hairdresser.id)
        .eq('service_id', serviceId);

      if (linkError) throw linkError;

      // Recharger complètement la liste des services pour garantir la synchronisation
      await fetchServices();

      toast({
        title: "Succès",
        description: "Service supprimé avec succès"
      });

      console.log('✅ Service supprimé et liste rechargée');
    } catch (error: any) {
      console.error('Erreur lors de la suppression du service:', error);
      
      const errorMessage = error?.message || 'Impossible de supprimer le service';
      toast({
        title: "Erreur lors de la suppression",
        description: errorMessage,
        variant: "destructive"
      });
      throw error;
    }
  };

  // Activer/désactiver un service (logique locale pour l'instant)
  const toggleServiceStatus = (serviceId: string) => {
    setServices(prev => prev.map(service => 
      service.id === serviceId 
        ? { ...service, isActive: !service.isActive }
        : service
    ));
  };

  // Charger les services au montage du composant et à chaque focus
  useEffect(() => {
    if (stylistId) {
      console.log('📍 Chargement initial des services pour:', stylistId);
      fetchServices();
    }
  }, [stylistId]);

  // Recharger les services quand la page reprend le focus (actualisation visible)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && stylistId) {
        console.log('🔄 Page visible, rechargement des services...');
        fetchServices();
      }
    };

    const handleFocus = () => {
      if (stylistId) {
        console.log('🔄 Page en focus, rechargement des services...');
        fetchServices();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [stylistId]);

  // Configurer l'écoute en temps réel des changements
  useEffect(() => {
    if (!stylistId) return;

    const setupRealtimeSubscription = async () => {
      try {
        // Récupérer l'ID du hairdresser pour l'écoute en temps réel
        const { data: hairdresser } = await supabase
          .from('hairdressers')
          .select('id')
          .eq('auth_id', stylistId)
          .single();

        if (!hairdresser) return;

        const channel = supabase
          .channel('hairdresser-services-changes')
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'hairdresser_services',
              filter: `hairdresser_id=eq.${hairdresser.id}`
            },
            () => {
              console.log('🔄 Détection de changement dans hairdresser_services, rechargement...');
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
            () => {
              console.log('🔄 Détection de changement dans services, rechargement...');
              fetchServices();
            }
          )
          .subscribe();

        return () => {
          supabase.removeChannel(channel);
        };
      } catch (error) {
        console.error('Erreur lors de la configuration du temps réel:', error);
      }
    };

    const cleanup = setupRealtimeSubscription();
    
    return () => {
      cleanup.then(cleanupFn => cleanupFn && cleanupFn());
    };
  }, [stylistId]);

  return {
    services,
    loading,
    addService,
    updateService,
    deleteService,
    toggleServiceStatus,
    refetch: fetchServices
  };
};