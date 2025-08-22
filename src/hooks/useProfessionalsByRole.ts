import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ProfessionalByRole {
  id: string;
  auth_id: string;
  name: string;
  email?: string;
  phone?: string;
  rating: number;
  location?: string;
  bio?: string;
  website?: string;
  instagram?: string;
  experience?: string;
  image_url?: string;
  gender?: string;
  is_active: boolean;
  working_hours?: any;
  specialties: string[];
  salon_address?: string;
  role: string;
  created_at: string;
  updated_at: string;
}

export const useProfessionalsByRole = (roleFilter?: string) => {
  const [professionals, setProfessionals] = useState<ProfessionalByRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  const loadProfessionals = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log(`🔍 Chargement des professionnels - Rôle: ${roleFilter || 'Tous'}`);
      
      const { data, error } = await supabase.rpc('get_professionals_by_role', {
        role_filter: roleFilter || null
      });

      if (error) {
        throw error;
      }

      if (!data) {
        setProfessionals([]);
        return;
      }

      console.log(`✅ ${data.length} professionnels trouvés pour le rôle: ${roleFilter || 'Tous'}`);
      setProfessionals(data);

    } catch (err) {
      const error = err as Error;
      console.error('Erreur lors du chargement des professionnels:', error);
      setError(error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les professionnels",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfessionals();
  }, [roleFilter]);

  // Configuration de la synchronisation temps réel
  useEffect(() => {
    const channel = supabase
      .channel('professionals-by-role-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'hairdressers',
        },
        (payload) => {
          console.log('📡 Real-time update for hairdressers:', payload);
          loadProfessionals();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles',
        },
        (payload) => {
          console.log('📡 Real-time update for profiles:', payload);
          loadProfessionals();
        }
      )
      .subscribe();

    // Écouter les événements de changement de rôle
    const handleRoleChange = () => {
      console.log('🔄 Changement de rôle détecté, rechargement des professionnels');
      setTimeout(() => loadProfessionals(), 1000);
    };

    window.addEventListener('userRoleChanged', handleRoleChange);
    window.addEventListener('refreshProfessionals', handleRoleChange);

    return () => {
      supabase.removeChannel(channel);
      window.removeEventListener('userRoleChanged', handleRoleChange);
      window.removeEventListener('refreshProfessionals', handleRoleChange);
    };
  }, [roleFilter]);

  return {
    professionals,
    loading,
    error,
    refetch: loadProfessionals
  };
};