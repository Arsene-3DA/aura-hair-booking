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

        // Utiliser la fonction RPC publique pour récupérer les données
        const { data: publicData, error: publicError } = await supabase
          .rpc('get_public_hairdresser_data')
          .eq('auth_id', professionalId)
          .eq('is_active', true)
          .single();

        if (publicError) {
          throw new Error('Professionnel non trouvé ou inactif');
        }

        if (!publicData) {
          throw new Error('Aucune donnée trouvée pour ce professionnel');
        }

        // Essayer de récupérer des informations de profil supplémentaires
        const { data: profileData } = await supabase
          .from('profiles')
          .select('role, avatar_url, full_name')
          .eq('user_id', professionalId)
          .single();

        // Combiner les données publiques avec les informations de profil
        const professionalData: PublicProfessionalData = {
          id: publicData.id,
          name: profileData?.full_name || publicData.name || 'Professionnel',
          specialties: publicData.specialties || [],
          rating: publicData.rating || 5.0,
          image_url: profileData?.avatar_url || publicData.image_url || '/placeholder.svg',
          experience: publicData.experience || '',
          location: publicData.location || publicData.salon_address || '',
          salon_address: publicData.salon_address,
          bio: publicData.bio,
          website: publicData.website,
          instagram: publicData.instagram,
          working_hours: publicData.working_hours,
          auth_id: publicData.auth_id,
          gender: publicData.gender || 'non_specifie',
          is_active: publicData.is_active
        };

        setProfessional(professionalData);
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