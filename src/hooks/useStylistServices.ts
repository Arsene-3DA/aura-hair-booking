import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface StylistService {
  id: string;
  name: string;
  description?: string;
  price?: number;
  duration?: number;
}

export const useStylistServices = (stylistId?: string) => {
  const [services, setServices] = useState<StylistService[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchServices = async () => {
    if (!stylistId) return;

    try {
      setLoading(true);
      
      // Get all available services
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      setServices(data || []);
    } catch (error) {
      console.error('Error fetching services:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, [stylistId]);

  return {
    services,
    loading,
    refetch: fetchServices,
  };
};