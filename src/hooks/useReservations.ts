import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/hooks/use-toast";

export type ReservationStatus = 'en_attente' | 'confirmee' | 'annulee';

export interface Reservation {
  id: string;
  client_id: string;
  coiffeur_id: string;
  date_reservation: string;
  heure_reservation: string;
  service_demande: string;
  status: ReservationStatus;
  notes?: string;
  created_at: string;
  updated_at: string;
  // Relations
  client?: {
    nom: string;
    prenom: string;
    email: string;
    telephone?: string;
  };
  coiffeur?: {
    nom: string;
    prenom: string;
    email: string;
  };
}

export const useReservations = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const getReservations = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('reservations')
        .select(`
          *,
          client:client_id(nom, prenom, email, telephone),
          coiffeur:coiffeur_id(nom, prenom, email)
        `)
        .order('date_reservation', { ascending: true });

      if (error) throw error;
      
      // Transform the data to match our interface
      const transformedData = (data || []).map(item => ({
        ...item,
        client: Array.isArray(item.client) ? item.client[0] : item.client,
        coiffeur: Array.isArray(item.coiffeur) ? item.coiffeur[0] : item.coiffeur
      })) as Reservation[];
      
      setReservations(transformedData);
      return transformedData;
    } catch (error) {
      console.error('Erreur lors du chargement des réservations:', error);
      toast({
        title: "❌ Erreur",
        description: "Impossible de charger les réservations",
        variant: "destructive"
      });
      return [];
    } finally {
      setLoading(false);
    }
  };

  const getMyReservations = async () => {
    try {
      setLoading(true);
      
      // Get current user ID
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Utilisateur non connecté');

      // Get user profile to get the coiffeur_id
      const { data: userProfile, error: profileError } = await supabase
        .from('users')
        .select('id, role')
        .eq('auth_id', user.id)
        .single();

      if (profileError) throw profileError;
      if (!userProfile) throw new Error('Profil utilisateur non trouvé');

      // For coiffeurs, filter by coiffeur_id - for others, get all
      const query = supabase
        .from('reservations')
        .select(`
          *,
          client:client_id(nom, prenom, email, telephone),
          coiffeur:coiffeur_id(nom, prenom, email)
        `);

      // If user is a coiffeur, only show their own reservations
      if (userProfile.role === 'coiffeur') {
        query.eq('coiffeur_id', userProfile.id);
      }
      // If user is a client, only show their own reservations
      else if (userProfile.role === 'client') {
        query.eq('client_id', userProfile.id);
      }
      // Admin can see all reservations (no filter)

      const { data, error } = await query.order('date_reservation', { ascending: true });

      if (error) throw error;
      
      // Transform the data to match our interface
      const transformedData = (data || []).map(item => ({
        ...item,
        client: Array.isArray(item.client) ? item.client[0] : item.client,
        coiffeur: Array.isArray(item.coiffeur) ? item.coiffeur[0] : item.coiffeur
      })) as Reservation[];
      
      setReservations(transformedData);
      return transformedData;
    } catch (error) {
      console.error('Erreur lors du chargement des réservations:', error);
      toast({
        title: "❌ Erreur",
        description: "Impossible de charger vos réservations",
        variant: "destructive"
      });
      return [];
    } finally {
      setLoading(false);
    }
  };

  const createReservation = async (reservationData: {
    coiffeur_id: string;
    date_reservation: string;
    heure_reservation: string;
    service_demande: string;
    notes?: string;
  }) => {
    try {
      // Get current user ID
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Utilisateur non connecté');

      // Get user profile to get the client_id
      const { data: userProfile, error: profileError } = await supabase
        .from('users')
        .select('id')
        .eq('auth_id', user.id)
        .single();

      if (profileError) throw profileError;
      if (!userProfile) throw new Error('Profil utilisateur non trouvé');

      const { data, error } = await supabase
        .from('reservations')
        .insert({
          ...reservationData,
          client_id: userProfile.id
        })
        .select(`
          *,
          client:client_id(nom, prenom, email, telephone),
          coiffeur:coiffeur_id(nom, prenom, email)
        `)
        .single();

      if (error) throw error;

      toast({
        title: "✅ Réservation créée",
        description: "Votre réservation a été enregistrée avec succès"
      });

      return { success: true, data };
    } catch (error: any) {
      console.error('Erreur lors de la création de la réservation:', error);
      toast({
        title: "❌ Erreur",
        description: error.message || "Erreur lors de la création de la réservation",
        variant: "destructive"
      });
      return { success: false, error: error.message };
    }
  };

  const updateReservationStatus = async (reservationId: string, status: ReservationStatus) => {
    try {
      const { data, error } = await supabase
        .from('reservations')
        .update({ status })
        .eq('id', reservationId)
        .select()
        .single();

      if (error) throw error;

      const statusMessages = {
        'confirmee': '✅ Réservation confirmée',
        'annulee': '❌ Réservation annulée',
        'en_attente': '⏳ Réservation en attente'
      };

      toast({
        title: statusMessages[status],
        description: `La réservation a été ${status} avec succès`
      });

      return { success: true, data };
    } catch (error: any) {
      console.error('Erreur lors de la mise à jour:', error);
      toast({
        title: "❌ Erreur",
        description: error.message || "Erreur lors de la mise à jour",
        variant: "destructive"
      });
      return { success: false, error: error.message };
    }
  };

  const deleteReservation = async (reservationId: string) => {
    try {
      const { error } = await supabase
        .from('reservations')
        .delete()
        .eq('id', reservationId);

      if (error) throw error;

      toast({
        title: "✅ Réservation supprimée",
        description: "La réservation a été supprimée avec succès"
      });

      return { success: true };
    } catch (error: any) {
      console.error('Erreur lors de la suppression:', error);
      toast({
        title: "❌ Erreur",
        description: error.message || "Erreur lors de la suppression",
        variant: "destructive"
      });
      return { success: false, error: error.message };
    }
  };

  return {
    reservations,
    loading,
    getReservations,
    getMyReservations,
    createReservation,
    updateReservationStatus,
    deleteReservation
  };
};
