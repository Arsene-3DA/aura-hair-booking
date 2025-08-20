import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface CompleteProfessional {
  id: string;
  auth_id: string;
  name: string;
  email?: string; // Only available for authenticated users
  phone?: string;
  salon_address?: string;
  bio?: string;
  website?: string;
  instagram?: string;
  specialties: string[];
  rating: number;
  image_url: string;
  experience?: string;
  location?: string;
  gender?: string;
  is_active: boolean;
  working_hours?: any;
  // Données enrichies depuis profiles
  full_name?: string;
  avatar_url?: string;
  role?: string;
}

export const useCompleteProfessionals = () => {
  const [professionals, setProfessionals] = useState<CompleteProfessional[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  const loadProfessionals = async () => {
    try {
      setLoading(true);
      setError(null);

      // Check if user is authenticated
      const { data: { user } } = await supabase.auth.getUser();
      
      let hairdressersData;
      let hairdressersError;

      if (user) {
        // Authenticated user - can access full data including contact info
        // Join with profiles to filter only users with professional roles
        const { data, error } = await supabase
          .from('hairdressers')
          .select(`
            id,
            auth_id,
            name,
            email,
            phone,
            salon_address,
            bio,
            website,
            instagram,
            specialties,
            rating,
            image_url,
            experience,
            location,
            gender,
            is_active,
            working_hours,
            profiles!inner(role)
          `)
          .eq('is_active', true)
          .not('auth_id', 'is', null)
          .in('profiles.role', ['coiffeur', 'coiffeuse', 'cosmetique'])
          .order('rating', { ascending: false });
        
        hairdressersData = data;
        hairdressersError = error;
      } else {
        // Unauthenticated user - use secure function that only returns business info (no email/phone)
        const { data, error } = await supabase
          .rpc('get_public_hairdresser_data')
          .order('rating', { ascending: false });
        
        hairdressersData = data;
        hairdressersError = error;
      }

      if (hairdressersError) {
        throw hairdressersError;
      }

      if (!hairdressersData || hairdressersData.length === 0) {
        setProfessionals([]);
        return;
      }

      // Récupérer les profils correspondants en une seule requête
      // Filtrer uniquement les rôles professionnels
      const authIds = hairdressersData.map(h => h.auth_id).filter(Boolean);
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, full_name, avatar_url, role')
        .in('user_id', authIds)
        .in('role', ['coiffeur', 'coiffeuse', 'cosmetique']);

      if (profilesError) {
        console.warn('Erreur lors du chargement des profils:', profilesError);
        // Continue sans les données de profils
      }

      // Mapper et enrichir les données - ne garder que ceux avec un profil professionnel
      const enrichedProfessionals: CompleteProfessional[] = hairdressersData
        .map(hairdresser => {
          const profile = profilesData?.find(p => p.user_id === hairdresser.auth_id);
          
          // Ne garder que les professionnels avec un rôle professionnel valide
          if (!profile || !['coiffeur', 'coiffeuse', 'cosmetique'].includes(profile.role)) {
            return null;
          }
          
          return {
            ...hairdresser,
            // Utiliser les données du profil en priorité
            name: profile?.full_name || hairdresser.name,
            image_url: profile?.avatar_url || hairdresser.image_url || '/placeholder.svg',
            role: profile?.role || 'coiffeur',
            // Garder les données originales aussi
            full_name: profile?.full_name,
            avatar_url: profile?.avatar_url,
            specialties: hairdresser.specialties || [],
            rating: hairdresser.rating || 5.0
          };
        })
        .filter(Boolean) as CompleteProfessional[];

      setProfessionals(enrichedProfessionals);

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
  }, []);

  // Configuration de la synchronisation temps réel
  useEffect(() => {
    const channel = supabase
      .channel('professionals-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'hairdressers',
        },
        (payload) => {
          console.log('📡 Real-time update for hairdressers:', payload);
          // Recharger les données quand il y a des changements
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
          // Recharger les données quand les profils changent
          loadProfessionals();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    professionals,
    loading,
    error,
    refetch: loadProfessionals
  };
};