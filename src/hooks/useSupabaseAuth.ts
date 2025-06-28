
import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/hooks/use-toast";

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAuthenticated: boolean;
}

export const useSupabaseAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
    isAuthenticated: false
  });
  const { toast } = useToast();

  useEffect(() => {
    // Vérifier la session existante
    supabase.auth.getSession().then(({ data: { session } }) => {
      setAuthState({
        user: session?.user ?? null,
        session,
        loading: false,
        isAuthenticated: !!session
      });
    });

    // Écouter les changements d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        setAuthState({
          user: session?.user ?? null,
          session,
          loading: false,
          isAuthenticated: !!session
        });
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, userData?: { role?: string; name?: string }) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: userData || { role: 'client' }
        }
      });

      if (error) throw error;

      toast({
        title: "✅ Inscription réussie",
        description: "Veuillez vérifier votre email pour confirmer votre compte"
      });

      return { success: true, user: data.user };
    } catch (error: any) {
      const errorMessage = error.message || 'Erreur lors de l\'inscription';
      toast({
        title: "❌ Erreur d'inscription",
        description: errorMessage,
        variant: "destructive"
      });
      return { success: false, error: errorMessage };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      toast({
        title: "✅ Connexion réussie",
        description: `Bienvenue ${data.user.email}!`
      });

      return { success: true, user: data.user };
    } catch (error: any) {
      const errorMessage = error.message || 'Erreur de connexion';
      toast({
        title: "❌ Erreur de connexion",
        description: errorMessage,
        variant: "destructive"
      });
      return { success: false, error: errorMessage };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      toast({
        title: "Déconnexion",
        description: "À bientôt !"
      });
      
      return { success: true };
    } catch (error: any) {
      console.error('Erreur lors de la déconnexion:', error);
      return { success: false, error: error.message };
    }
  };

  const getUserRole = () => {
    return authState.user?.user_metadata?.role || 'client';
  };

  const createHairdresserProfile = async (name: string, email: string) => {
    try {
      const { data, error } = await supabase
        .from('hairdressers')
        .insert({
          auth_id: authState.user?.id,
          name,
          email,
          is_active: true
        })
        .select()
        .single();

      if (error) throw error;

      return { success: true, data };
    } catch (error: any) {
      console.error('Erreur création profil coiffeur:', error);
      return { success: false, error: error.message };
    }
  };

  const getCoiffeurByUserId = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('hairdressers')
        .select('*')
        .eq('auth_id', userId)
        .single();

      if (error) {
        console.error('Erreur lors de la récupération du profil coiffeur:', error);
        return null;
      }

      return { hairdresser_id: data.id, ...data };
    } catch (error) {
      console.error('Erreur:', error);
      return null;
    }
  };

  const getBookingsForCoiffeur = async (hairdresserId: string) => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('hairdresser_id', hairdresserId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erreur lors du chargement des réservations:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      toast({
        title: "❌ Erreur",
        description: "Impossible de charger les réservations",
        variant: "destructive",
      });
      return [];
    }
  };

  const updateBookingStatus = async (bookingId: string, status: 'confirmé' | 'refusé' | 'terminé') => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status })
        .eq('id', bookingId);

      if (error) {
        console.error('Erreur lors de la mise à jour du statut:', error);
        throw error;
      }

      const statusMessages = {
        'confirmé': '✅ Réservation confirmée',
        'refusé': '❌ Réservation refusée',
        'terminé': '✅ Réservation terminée'
      };

      toast({
        title: statusMessages[status],
        description: `La réservation a été ${status}e avec succès`,
      });
    } catch (error) {
      toast({
        title: "❌ Erreur",
        description: "Impossible de mettre à jour le statut",
        variant: "destructive",
      });
      throw error;
    }
  };

  return {
    ...authState,
    signUp,
    signIn,
    signOut,
    getUserRole,
    createHairdresserProfile,
    getCoiffeurByUserId,
    getBookingsForCoiffeur,
    updateBookingStatus
  };
};
