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

        // Essayer d'abord par ID de hairdresser
        const { data: byIdData, error: byIdError } = await supabase
          .rpc('get_professional_by_id', { professional_id: professionalId });

        if (!byIdError && byIdData && byIdData.length > 0) {
          const professionalData: PublicProfessionalData = {
            id: byIdData[0].id,
            name: byIdData[0].name || 'Professionnel',
            specialties: byIdData[0].specialties || [],
            rating: byIdData[0].rating || 5.0,
            image_url: byIdData[0].image_url || '/placeholder.svg',
            experience: byIdData[0].experience || '',
            location: byIdData[0].salon_address || '',
            salon_address: byIdData[0].salon_address,
            bio: byIdData[0].bio,
            website: byIdData[0].website,
            instagram: byIdData[0].instagram,
            working_hours: byIdData[0].working_hours,
            auth_id: byIdData[0].auth_id,
            gender: byIdData[0].gender || 'non_specifie',
            is_active: byIdData[0].is_active
          };
          setProfessional(professionalData);
          return;
        }

        // Essayer par auth_id en fallback
        const { data: byAuthData, error: byAuthError } = await supabase
          .rpc('get_professional_by_auth_id', { auth_user_id: professionalId });

        if (!byAuthError && byAuthData && byAuthData.length > 0) {
          const professionalData: PublicProfessionalData = {
            id: byAuthData[0].id,
            name: byAuthData[0].name || 'Professionnel',
            specialties: byAuthData[0].specialties || [],
            rating: byAuthData[0].rating || 5.0,
            image_url: byAuthData[0].image_url || '/placeholder.svg',
            experience: byAuthData[0].experience || '',
            location: byAuthData[0].salon_address || '',
            salon_address: byAuthData[0].salon_address,
            bio: byAuthData[0].bio,
            website: byAuthData[0].website,
            instagram: byAuthData[0].instagram,
            working_hours: byAuthData[0].working_hours,
            auth_id: byAuthData[0].auth_id,
            gender: byAuthData[0].gender || 'non_specifie',
            is_active: byAuthData[0].is_active
          };
          setProfessional(professionalData);
          return;
        }

        throw new Error('Professionnel non trouvé ou inactif');

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