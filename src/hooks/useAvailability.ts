import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Availability {
  id: string;
  stylist_id: string;
  start_at: string;
  end_at: string;
  status: 'available' | 'busy';
  created_at: string;
}

export interface CreateAvailabilityData {
  start_at: string;
  end_at: string;
  status?: 'available' | 'busy';
}

export interface UpdateAvailabilityData {
  id: string;
  status: 'available' | 'busy';
}

export const useAvailability = (stylistId?: string) => {
  const [availabilities, setAvailabilities] = useState<Availability[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchAvailabilities = async () => {
    if (!stylistId) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('availabilities')
        .select('*')
        .eq('stylist_id', stylistId)
        .order('start_at', { ascending: true });

      if (error) throw error;
      setAvailabilities(data || []);
    } catch (error) {
      console.error('Error fetching availabilities:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les disponibilités",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createAvailability = async (data: CreateAvailabilityData) => {
    try {
      const { error } = await supabase
        .from('availabilities')
        .insert({
          stylist_id: stylistId,
          start_at: data.start_at,
          end_at: data.end_at,
          status: data.status || 'available',
        });

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Disponibilité créée avec succès",
      });

      await fetchAvailabilities();
    } catch (error) {
      console.error('Error creating availability:', error);
      toast({
        title: "Erreur",
        description: "Impossible de créer la disponibilité",
        variant: "destructive",
      });
    }
  };

  const updateAvailability = async (data: UpdateAvailabilityData) => {
    try {
      const { error } = await supabase
        .from('availabilities')
        .update({ status: data.status })
        .eq('id', data.id);

      if (error) throw error;

      toast({
        title: "Succès",
        description: `Statut mis à jour: ${data.status === 'available' ? 'Disponible' : 'Occupé'}`,
      });

      await fetchAvailabilities();
    } catch (error) {
      console.error('Error updating availability:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour la disponibilité",
        variant: "destructive",
      });
    }
  };

  const deleteAvailability = async (id: string) => {
    try {
      const { error } = await supabase
        .from('availabilities')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Disponibilité supprimée",
      });

      await fetchAvailabilities();
    } catch (error) {
      console.error('Error deleting availability:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la disponibilité",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchAvailabilities();
  }, [stylistId]);

  return {
    availabilities,
    loading,
    createAvailability,
    updateAvailability,
    deleteAvailability,
    refetch: fetchAvailabilities,
  };
};