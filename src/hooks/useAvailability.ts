import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Availability {
  id: string;
  stylist_id: string;
  start_at: string;
  end_at: string;
  status: 'available' | 'busy' | 'unavailable';
  created_at: string;
}

export interface CreateAvailabilityData {
  start_at: string;
  end_at: string;
  status?: 'available' | 'busy' | 'unavailable';
}

export interface UpdateAvailabilityData {
  id: string;
  status: 'available' | 'busy' | 'unavailable';
}

export const useAvailability = (stylistId?: string) => {
  const [availabilities, setAvailabilities] = useState<Availability[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchAvailabilities = async () => {
    if (!stylistId) {
      console.log('❌ No stylistId provided to fetchAvailabilities');
      return;
    }

    console.log('🔍 Fetching availabilities for stylist:', stylistId);
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('availabilities')
        .select('*')
        .eq('stylist_id', stylistId)
        .order('start_at', { ascending: true });

      if (error) {
        console.error('❌ Supabase error:', error);
        throw error;
      }

      console.log('✅ Availabilities fetched:', data?.length || 0, 'items');
      console.log('📊 Raw availability data:', data);
      setAvailabilities(data || []);
    } catch (error) {
      console.error('💥 Error fetching availabilities:', error);
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
      console.log('➕ Creating new availability slot:', data);
      
      const newSlot = {
        stylist_id: stylistId,
        start_at: data.start_at,
        end_at: data.end_at,
        status: data.status || 'available',
      };

      const { data: inserted, error } = await supabase
        .from('availabilities')
        .insert(newSlot)
        .select()
        .single();

      if (error) throw error;

      // Mise à jour optimiste immédiate
      if (inserted) {
        setAvailabilities(prev => [...prev, inserted].sort((a, b) => 
          new Date(a.start_at).getTime() - new Date(b.start_at).getTime()
        ));
      }

      toast({
        title: "Succès",
        description: `Créneau créé: ${data.status === 'available' ? 'Disponible' : data.status === 'busy' ? 'Occupé' : 'Indisponible'}`,
      });

      console.log('✅ New availability slot created successfully');
    } catch (error) {
      console.error('❌ Error creating availability:', error);
      toast({
        title: "Erreur",
        description: "Impossible de créer le créneau",
        variant: "destructive",
      });
      // Refetch en cas d'erreur pour assurer la cohérence
      await fetchAvailabilities();
    }
  };

  const updateAvailability = async (data: UpdateAvailabilityData) => {
    try {
      console.log('🔄 Updating availability slot:', data.id, 'to status:', data.status);
      
      // Mise à jour optimiste pour une réactivité immédiate
      setAvailabilities(prev => 
        prev.map(avail => 
          avail.id === data.id 
            ? { ...avail, status: data.status }
            : avail
        )
      );

      const { error } = await supabase
        .from('availabilities')
        .update({ 
          status: data.status
          // SUPPRIMÉ: updated_at car cette colonne n'existe pas dans la table
        })
        .eq('id', data.id);

      if (error) {
        // Rollback en cas d'erreur
        await fetchAvailabilities();
        throw error;
      }

      toast({
        title: "Succès",
        description: `Créneau mis à jour: ${data.status === 'available' ? 'Disponible' : data.status === 'busy' ? 'Occupé' : 'Indisponible'}`,
      });

      console.log('✅ Availability slot updated successfully');
    } catch (error) {
      console.error('❌ Error updating availability:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le créneau",
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

  // Écoute en temps réel des changements de disponibilités
  useEffect(() => {
    fetchAvailabilities();
    
    if (!stylistId) return;

    console.log('📡 Setting up real-time subscription for availabilities:', stylistId);
    
    const channel = supabase
      .channel('availabilities-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'availabilities',
          filter: `stylist_id=eq.${stylistId}`
        },
        (payload) => {
          console.log('🔔 Real-time availability change:', payload);
          
          if (payload.eventType === 'INSERT' && payload.new) {
            setAvailabilities(prev => {
              const exists = prev.find(a => a.id === payload.new.id);
              if (exists) return prev;
              return [...prev, payload.new as Availability].sort((a, b) => 
                new Date(a.start_at).getTime() - new Date(b.start_at).getTime()
              );
            });
          } else if (payload.eventType === 'UPDATE' && payload.new) {
            setAvailabilities(prev => 
              prev.map(avail => 
                avail.id === payload.new.id 
                  ? { ...avail, ...payload.new }
                  : avail
              )
            );
          } else if (payload.eventType === 'DELETE' && payload.old) {
            setAvailabilities(prev => 
              prev.filter(avail => avail.id !== payload.old.id)
            );
          }
        }
      )
      .subscribe();

    return () => {
      console.log('🔇 Unsubscribing from availabilities real-time updates');
      supabase.removeChannel(channel);
    };
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