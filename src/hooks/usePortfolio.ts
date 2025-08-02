import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface PortfolioItem {
  id: string;
  stylist_id: string;
  service_id: string;
  image_url: string;
  hairstyle_name?: string;
  created_at: string;
  service?: {
    id: string;
    name: string;
  };
}

export const usePortfolio = (stylistId?: string) => {
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPortfolio = async () => {
    if (!stylistId) return;

    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('portfolio')
        .select(`
          *,
          services(id, name)
        `)
        .eq('stylist_id', stylistId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Transform data to match interface
      const transformedData = (data || []).map(item => ({
        ...item,
        service: item.services
      }));
      
      setPortfolio(transformedData);
    } catch (error) {
      console.error('Error fetching portfolio:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPortfolio();

    // Set up real-time subscription
    const channel = supabase
      .channel(`portfolio-${stylistId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'portfolio',
          filter: `stylist_id=eq.${stylistId}`,
        },
        () => {
          fetchPortfolio();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [stylistId]);

  return {
    portfolio,
    loading,
    refetch: fetchPortfolio,
  };
};