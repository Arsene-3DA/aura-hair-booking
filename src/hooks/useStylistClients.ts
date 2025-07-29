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

      // Get unique clients from bookings
      const { data: bookings, error } = await supabase
        .from('bookings')
        .select(`
          client_id,
          client_name,
          client_email,
          client_phone,
          scheduled_at,
          service,
          status
        `)
        .eq('stylist_id', stylistId)
        .order('scheduled_at', { ascending: false });

      if (error) throw error;

      // Group by client
      const clientsMap = new Map<string, StylistClient>();
      const clientIds = new Set<string>();

      bookings?.forEach((booking) => {
        const clientId = booking.client_id;
        if (!clientId) return;

        clientIds.add(clientId);
        
        if (!clientsMap.has(clientId)) {
          clientsMap.set(clientId, {
            id: clientId,
            full_name: booking.client_name || 'Client',
            email: booking.client_email,
            phone: booking.client_phone,
            total_bookings: 0,
            preferred_services: [],
          });
        }

        const client = clientsMap.get(clientId)!;
        client.total_bookings++;
        
        if (!client.last_booking_date || booking.scheduled_at > client.last_booking_date) {
          client.last_booking_date = booking.scheduled_at;
        }

        if (booking.service && !client.preferred_services?.includes(booking.service)) {
          client.preferred_services?.push(booking.service);
        }
      });

      // Fetch additional profile data
      if (clientIds.size > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, full_name, avatar_url')
          .in('user_id', Array.from(clientIds));

        profiles?.forEach((profile) => {
          const client = clientsMap.get(profile.user_id);
          if (client && profile.full_name) {
            client.full_name = profile.full_name;
            client.avatar_url = profile.avatar_url;
          }
        });
      }

      setClients(Array.from(clientsMap.values()));
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