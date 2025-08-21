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

        // First try to get data by ID (hairdresser ID, not auth_id)
        const { data: fullDataById, error: fullErrorById } = await supabase
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
          .eq('id', hairdresserId) // Try by ID first
          .eq('is_active', true)
          .single();

        if (!fullErrorById && fullDataById) {
          // Found by ID - get profile data using auth_id
          const { data: profileData } = await supabase
            .from('profiles')
            .select('role, avatar_url, full_name')
            .eq('user_id', fullDataById.auth_id)
            .single();

          setHairdresser({
            ...fullDataById,
            role: profileData?.role || 'coiffeur',
            image_url: profileData?.avatar_url || fullDataById.image_url || '/placeholder.svg',
            name: profileData?.full_name || fullDataById.name || 'Professionnel',
            specialties: fullDataById.specialties || [],
            experience: fullDataById.experience || '',
            location: fullDataById.location || fullDataById.salon_address || '',
            canViewContact: false // Default to false for public view
          });
          return;
        }

        // Fallback: try by auth_id (for backward compatibility)
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

        if (!fullError && fullData) {
          // User has access to contact info
          const { data: profileData } = await supabase
            .from('profiles')
            .select('role, avatar_url, full_name')
            .eq('user_id', hairdresserId)
            .single();

          setHairdresser({
            ...fullData,
            role: profileData?.role || 'coiffeur',
            image_url: profileData?.avatar_url || fullData.image_url || '/placeholder.svg',
            name: profileData?.full_name || fullData.name || 'Professionnel',
            specialties: fullData.specialties || [],
            experience: fullData.experience || '',
            location: fullData.location || fullData.salon_address || '',
            canViewContact: false // Default to false for public view
          });
          return;
        }

        // If both methods fail, set error
        setError('Professionnel non trouvé');
        setHairdresser(null);
      } catch (err: any) {
        console.error('Error fetching hairdresser data:', err);
        setError(err.message || 'Erreur lors du chargement des données');
      } finally {
        setLoading(false);
      }
    };

    fetchHairdresserData();

    // Set up real-time updates based on the ID we found
    const channel = supabase
      .channel(`secure-hairdresser-${hairdresserId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'hairdressers',
          filter: `id=eq.${hairdresserId}`, // Listen for ID changes
        },
        () => {
          // Refetch data on changes
          fetchHairdresserData();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'hairdressers',
          filter: `auth_id=eq.${hairdresserId}`, // Also listen for auth_id changes
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