import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface StylistProfile {
  id: string;
  auth_id: string;
  name: string;
  email: string;
  phone?: string;
  location?: string;
  salon_address?: string;
  bio?: string;
  website?: string;
  instagram?: string;
  specialties?: string[];
  working_hours?: any;
  rating: number;
  is_active: boolean;
  image_url?: string;
}

export const useStylistProfile = (authId?: string) => {
  const [profile, setProfile] = useState<StylistProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchProfile = async () => {
    if (!authId) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('hairdressers')
        .select('*')
        .eq('auth_id', authId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // Profil n'existe pas, on peut le créer
          await createProfile();
        } else {
          throw error;
        }
      } else {
        setProfile(data as StylistProfile);
      }
    } catch (error) {
      console.error('Error fetching stylist profile:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de charger votre profil",
      });
    } finally {
      setLoading(false);
    }
  };

  const createProfile = async () => {
    if (!authId) return;

    try {
      // Récupérer les infos de base du profil utilisateur
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', authId)
        .single();

      // Récupérer l'email de l'utilisateur depuis auth.users
      const { data: authUser } = await supabase.auth.getUser();

      const { data, error } = await supabase
        .from('hairdressers')
        .insert({
          auth_id: authId,
          name: userProfile?.full_name || 'Styliste',
          email: authUser?.user?.email || '',
          salon_address: '',
          bio: '',
          rating: 5.0, // Note par défaut de 5 étoiles
          working_hours: {
            monday: { open: "09:00", close: "18:00", isOpen: true },
            tuesday: { open: "09:00", close: "18:00", isOpen: true },
            wednesday: { open: "09:00", close: "18:00", isOpen: true },
            thursday: { open: "09:00", close: "18:00", isOpen: true },
            friday: { open: "09:00", close: "18:00", isOpen: true },
            saturday: { open: "09:00", close: "17:00", isOpen: true },
            sunday: { open: "10:00", close: "16:00", isOpen: false }
          }
        })
        .select()
        .single();

      if (error) throw error;
      setProfile(data as StylistProfile);
      
      toast({
        title: "Profil créé",
        description: "Votre profil professionnel a été créé avec succès (5⭐ par défaut)",
      });
    } catch (error) {
      console.error('Error creating stylist profile:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de créer votre profil",
      });
    }
  };

  const updateProfile = async (updates: Partial<StylistProfile>) => {
    if (!authId || !profile) return;

    try {
      // Validation côté client avant envoi
      if (updates.email && updates.email.trim() !== '') {
        const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
        if (!emailRegex.test(updates.email.trim())) {
          throw new Error('Format d\'email invalide');
        }
      }

      if (updates.phone && updates.phone.trim() !== '') {
        const phoneDigits = updates.phone.replace(/[^0-9]/g, '');
        if (phoneDigits.length < 10) {
          throw new Error('Le numéro de téléphone doit contenir au moins 10 chiffres');
        }
      }

      if (updates.name && updates.name.trim() === '') {
        throw new Error('Le nom ne peut pas être vide');
      }

      const { error } = await supabase
        .from('hairdressers')
        .update(updates)
        .eq('auth_id', authId);

      if (error) throw error;

      setProfile(prev => prev ? { ...prev, ...updates } : null);
      
      toast({
        title: "Profil mis à jour",
        description: "Vos modifications ont été sauvegardées et sont visibles publiquement",
      });
    } catch (error) {
      console.error('Error updating stylist profile:', error);
      const errorMessage = error instanceof Error ? error.message : "Impossible de sauvegarder vos modifications";
      toast({
        variant: "destructive",
        title: "Erreur",
        description: errorMessage,
      });
      throw error;
    }
  };

  const updateWorkingHours = async (workingHours: any) => {
    await updateProfile({ working_hours: workingHours });
  };

  useEffect(() => {
    fetchProfile();
  }, [authId]);

  return {
    profile,
    loading,
    updateProfile,
    updateWorkingHours,
    refetch: fetchProfile,
  };
};