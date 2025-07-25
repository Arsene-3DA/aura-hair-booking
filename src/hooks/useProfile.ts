import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ClientProfile {
  id: string;
  user_id: string;
  full_name?: string;
  avatar_url?: string;
  phone?: string;
  preferences?: {
    notifications: boolean;
    email_marketing: boolean;
    preferred_time?: string;
  };
}

export const useProfile = (clientId?: string) => {
  const [profile, setProfile] = useState<ClientProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchProfile = async () => {
    if (!clientId) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', clientId)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<ClientProfile>) => {
    if (!clientId) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('user_id', clientId);

      if (error) throw error;

      setProfile(prev => prev ? { ...prev, ...updates } : null);
      
      toast({
        title: "Succès",
        description: "Profil mis à jour avec succès",
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le profil",
        variant: "destructive",
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [clientId]);

  return {
    profile,
    loading,
    updateProfile,
    refetch: fetchProfile,
  };
};