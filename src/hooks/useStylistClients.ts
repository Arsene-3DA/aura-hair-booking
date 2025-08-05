import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { validateUUID } from '@/utils/validateUUID';
import { useToast } from '@/hooks/use-toast';

export interface StylistClient {
  id: string;
  full_name: string;
  email?: string;
  phone?: string;
  avatar_url?: string;
  total_bookings: number;
  last_booking_date?: string;
  first_booking_date?: string;
  status: 'pending' | 'confirmed' | 'active';
  preferred_services?: string[];
  notes?: string;
}

export const useStylistClients = (stylistId?: string) => {
  const [clients, setClients] = useState<StylistClient[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchClients = async () => {
    if (!validateUUID(stylistId)) return;

    try {
      setLoading(true);

      // Récupérer les relations client-professionnel
      const { data: clientRelations, error } = await supabase
        .from('professional_clients')
        .select('*')
        .eq('professional_id', stylistId)
        .order('last_booking_date', { ascending: false });

      if (error) throw error;

      if (!clientRelations || clientRelations.length === 0) {
        setClients([]);
        return;
      }

      // Récupérer les profils des clients
      const clientIds = clientRelations.map(rel => rel.client_id);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, full_name, avatar_url')
        .in('user_id', clientIds);

      // Mapper les données
      const clientsWithServices = await Promise.all(
        clientRelations.map(async (relation) => {
          const profile = profiles?.find(p => p.user_id === relation.client_id);
          
          // Récupérer les services préférés pour ce client
          const { data: bookings } = await supabase
            .from('new_reservations')
            .select('service_id, services(name)')
            .eq('client_user_id', relation.client_id)
            .eq('stylist_user_id', stylistId)
            .not('service_id', 'is', null);

          const serviceNames = bookings?.map(b => b.services?.name).filter(Boolean) || [];
          const uniqueServices = [...new Set(serviceNames)];

          return {
            id: relation.client_id,
            full_name: profile?.full_name || 'Client',
            avatar_url: profile?.avatar_url,
            total_bookings: relation.total_bookings,
            last_booking_date: relation.last_booking_date,
            first_booking_date: relation.first_booking_date,
            status: relation.status as 'pending' | 'confirmed' | 'active',
            preferred_services: uniqueServices,
          };
        })
      );

      setClients(clientsWithServices);
    } catch (error) {
      console.error('Error fetching clients:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les clients",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, [stylistId]);

  return {
    clients,
    loading,
    refetch: fetchClients,
  };
};