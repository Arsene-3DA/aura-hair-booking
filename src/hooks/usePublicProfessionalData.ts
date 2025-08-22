import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface PublicProfessionalData {
  id: string;
  name: string;
  specialties: string[];
  rating: number;
  image_url: string;
  experience: string;
  location: string;
  salon_address?: string;
  bio?: string;
  website?: string;
  instagram?: string;
  working_hours?: any;
  auth_id: string;
  gender: string;
  is_active: boolean;
}

export const usePublicProfessionalData = (professionalId?: string) => {
  const [professional, setProfessional] = useState<PublicProfessionalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!professionalId) {
      setLoading(false);
      return;
    }

    const fetchProfessionalData = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log('🔄 Chargement professionnel ID:', professionalId);

        // Rechercher directement dans la table hairdressers
        const { data, error } = await supabase
          .from('hairdressers')
          .select('*')
          .or(`id.eq.${professionalId},auth_id.eq.${professionalId}`)
          .eq('is_active', true)
          .single();

        if (error) {
          console.error('❌ Erreur lors du chargement du professionnel:', error);
          throw new Error('Professionnel non trouvé ou inactif');
        }

        if (!data) {
          throw new Error('Professionnel non trouvé ou inactif');
        }

        console.log('✅ Professionnel trouvé:', data);

        const professionalData: PublicProfessionalData = {
          id: data.id,
          name: data.name || 'Professionnel',
          specialties: data.specialties || [],
          rating: data.rating || 5.0,
          image_url: data.image_url || '/placeholder.svg',
          experience: data.experience || '',
          location: data.salon_address || data.location || '',
          salon_address: data.salon_address,
          bio: data.bio,
          website: data.website,
          instagram: data.instagram,
          working_hours: data.working_hours,
          auth_id: data.auth_id,
          gender: data.gender || 'non_specifie',
          is_active: data.is_active
        };
        
        setProfessional(professionalData);

        console.log('✅ Données du professionnel chargées:', professionalData);

      } catch (err: any) {
        console.error('Error fetching public professional data:', err);
        setError(err.message || 'Erreur lors du chargement des données');
        setProfessional(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProfessionalData();
  }, [professionalId]);

  return {
    professional,
    loading,
    error,
    refetch: () => {
      if (professionalId) {
        setLoading(true);
        // Le useEffect se rechargera automatiquement
      }
    }
  };
};