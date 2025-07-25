import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Promotion {
  id: string;
  title: string;
  description?: string;
  discount_percentage?: number;
  starts_at: string;
  ends_at: string;
  is_active: boolean;
  created_at: string;
}

export const usePromotionsActive = () => {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchActivePromotions = async () => {
    try {
      setLoading(true);
      const now = new Date().toISOString();

      const { data, error } = await supabase
        .from('promotions')
        .select('*')
        .eq('is_active', true)
        .lte('starts_at', now)
        .gte('ends_at', now)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPromotions(data || []);
    } catch (error) {
      console.error('Error fetching promotions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivePromotions();

    // Set up real-time subscription
    const channel = supabase
      .channel('promotions-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'promotions',
        },
        () => {
          fetchActivePromotions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    promotions,
    loading,
    refetch: fetchActivePromotions,
  };
};