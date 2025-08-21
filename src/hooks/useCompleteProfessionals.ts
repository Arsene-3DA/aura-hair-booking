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

      console.log('🌐 Chargement SÉCURISÉ des professionnels - données publiques protégées');
      
      // Utiliser la fonction sécurisée qui masque les informations de contact
      const { data, error } = await supabase.rpc('get_public_hairdresser_data_secure');
      
      hairdressersData = data;
      hairdressersError = error;

      if (hairdressersError) {
        throw hairdressersError;
      }

      if (!hairdressersData || hairdressersData.length === 0) {
        setProfessionals([]);
        return;
      }

      // Enrichir les données depuis professionals_public (déjà filtrées)
      const enrichedProfessionals: CompleteProfessional[] = hairdressersData
        .map(professional => ({
          id: professional.id,
          auth_id: professional.auth_id || professional.id, // Fallback pour compatibilité
          name: professional.name,
          email: user ? professional.email : undefined, // Email seulement si connecté
          phone: user ? professional.phone : undefined, // Téléphone seulement si connecté
          salon_address: professional.location,
          bio: professional.bio,
          website: professional.website,
          instagram: professional.instagram,
          specialties: professional.specialties || [],
          rating: professional.rating || 5.0,
          image_url: professional.image_url || '/placeholder.svg',
          experience: professional.experience,
          location: professional.location,
          gender: professional.gender,
          is_active: professional.is_active,
          working_hours: professional.working_hours,
          role: professional.professional_type || 'coiffeur'
        }));

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