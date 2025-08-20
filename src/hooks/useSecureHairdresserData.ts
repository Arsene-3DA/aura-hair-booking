import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface SecureHairdresserData {
  id: string;
  name: string;
  specialties: string[];
  rating: number;
  image_url: string;
  experience: string;
  location: string;
  auth_id: string;
  role: string;
  salon_address?: string;
  bio?: string;
  website?: string;
  instagram?: string;
  working_hours?: any;
  // Contact info - only available if authorized
  email?: string;
  phone?: string;
  canViewContact: boolean;
}

export const useSecureHairdresserData = (hairdresserId?: string) => {
  const [hairdresser, setHairdresser] = useState<SecureHairdresserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Get current session
  const [session, setSession] = useState<any>(null);
  
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!hairdresserId) {
      setLoading(false);
      return;
    }

    const fetchHairdresserData = async () => {
      try {
        setLoading(true);
        setError(null);

        // First try to get full data (for authenticated users with permission)
        const { data: fullData, error: fullError } = await supabase
          .from('hairdressers')
          .select(`
            id,
            name,
            email,
            phone,
            specialties,
            rating,
            image_url,
            experience,
            location,
            salon_address,
            bio,
            website,
            instagram,
            working_hours,
            auth_id,
            is_active
          `)
          .eq('auth_id', hairdresserId)
          .eq('is_active', true)
          .single();

        if (fullData) {
          // User has access to contact info
          const { data: profileData } = await supabase
            .from('profiles')
            .select('role, avatar_url, full_name')
            .eq('user_id', hairdresserId)
            .single();

          setHairdresser({
            ...fullData,
            role: profileData?.role || 'coiffeur',
            image_url: profileData?.avatar_url || fullData.image_url,
            name: profileData?.full_name || fullData.name,
            canViewContact: true
          });
        } else {
          // Try public view (business info only) using secure function
          const { data: publicDataArray, error: publicError } = await supabase
            .rpc('get_public_hairdresser_data')
            .eq('auth_id', hairdresserId)
            .eq('is_active', true);

          const publicData = publicDataArray?.[0] || null;

          if (publicError) {
            throw publicError;
          }

          const { data: profileData } = await supabase
            .from('profiles')
            .select('role, avatar_url, full_name')
            .eq('user_id', hairdresserId)
            .single();

          // Si le professionnel a un compte mais pas de rôle professionnel, rejeter
          if (hairdresserId && profileData && !['coiffeur', 'coiffeuse', 'cosmetique'].includes(profileData.role)) {
            throw new Error('Professionnel non trouvé ou compte non professionnel');
          }

          setHairdresser({
            ...publicData,
            role: profileData?.role || 'coiffeur',
            image_url: profileData?.avatar_url || publicData.image_url,
            name: profileData?.full_name || publicData.name,
            canViewContact: false
          });
        }
      } catch (err: any) {
        console.error('Error fetching hairdresser data:', err);
        setError(err.message || 'Erreur lors du chargement des données');
      } finally {
        setLoading(false);
      }
    };

    fetchHairdresserData();

    // Set up real-time updates
    const channel = supabase
      .channel(`secure-hairdresser-${hairdresserId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'hairdressers',
          filter: `auth_id=eq.${hairdresserId}`,
        },
        () => {
          // Refetch data on changes
          fetchHairdresserData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [hairdresserId, session?.access_token]); // Re-fetch when auth state changes

  return {
    hairdresser,
    loading,
    error,
    refetch: () => {
      if (hairdresserId) {
        setLoading(true);
        // Re-fetch will be handled by useEffect
      }
    }
  };
};