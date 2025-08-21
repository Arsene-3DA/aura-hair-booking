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

        // Use the secure function to get safe public data
        const { data: safeData, error: safeError } = await supabase.rpc('get_public_hairdresser_data_secure');

        if (safeError) {
          throw safeError;
        }

        // Find the specific hairdresser by ID or auth_id
        let targetHairdresser = null;
        if (safeData && Array.isArray(safeData)) {
          targetHairdresser = safeData.find(h => h.id === hairdresserId || h.auth_id === hairdresserId);
        }

        if (!targetHairdresser) {
          setError('Professionnel non trouvé');
          setHairdresser(null);
          return;
        }

        // Get profile data using auth_id
        const { data: profileData } = await supabase
          .from('profiles')
          .select('role, avatar_url, full_name')
          .eq('user_id', targetHairdresser.auth_id)
          .single();

        // Check if user has access to contact info (admin, own profile, or has confirmed booking)
        let contactInfo = null;
        const currentUser = session?.user;
        const hasContactAccess = currentUser && (
          // User is viewing their own profile
          currentUser.id === targetHairdresser.auth_id ||
          // Admin access (would need to check role)
          false || // Placeholder for admin check
          // Has confirmed booking with this stylist
          false // Placeholder for booking check
        );

        if (hasContactAccess) {
          try {
            const { data: fullData } = await supabase
              .from('hairdressers')
              .select('email, phone')
              .eq('id', targetHairdresser.id)
              .single();
            
            if (fullData) {
              contactInfo = {
                email: fullData.email,
                phone: fullData.phone
              };
            }
          } catch (contactError) {
            console.log('Contact info not accessible:', contactError);
          }
        }

        setHairdresser({
          ...targetHairdresser,
          ...contactInfo,
          role: profileData?.role || 'coiffeur',
          image_url: profileData?.avatar_url || targetHairdresser.image_url || '/placeholder.svg',
          name: profileData?.full_name || targetHairdresser.name || 'Professionnel',
          specialties: targetHairdresser.specialties || [],
          experience: targetHairdresser.experience || '',
          location: targetHairdresser.location || targetHairdresser.salon_address || '',
          canViewContact: Boolean(hasContactAccess)
        });
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