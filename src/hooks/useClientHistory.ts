import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ClientBooking {
  id: string;
  service: string;
  scheduled_at: string;
  status: string;
  comments?: string;
}

export interface ClientNote {
  id: string;
  note: string;
  created_at: string;
}

export const useClientHistory = (stylistId?: string, clientId?: string) => {
  const [bookings, setBookings] = useState<ClientBooking[]>([]);
  const [notes, setNotes] = useState<ClientNote[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchClientHistory = async () => {
    if (!stylistId || !clientId) return;

    try {
      setLoading(true);

      // Fetch client bookings
      const { data: clientBookings, error: bookingsError } = await supabase
        .from('bookings')
        .select('id, service, scheduled_at, status, comments')
        .eq('stylist_id', stylistId)
        .eq('client_id', clientId)
        .order('scheduled_at', { ascending: false });

      if (bookingsError) throw bookingsError;

      // Fetch client notes
      const { data: clientNotes, error: notesError } = await supabase
        .from('client_notes')
        .select('*')
        .eq('stylist_id', stylistId)
        .eq('client_id', clientId)
        .order('created_at', { ascending: false });

      if (notesError) throw notesError;

      setBookings(clientBookings || []);
      setNotes(clientNotes || []);
    } catch (error) {
      console.error('Error fetching client history:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger l'historique client",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addNote = async (noteText: string) => {
    if (!stylistId || !clientId || !noteText.trim()) return;

    try {
      const { error } = await supabase
        .from('client_notes')
        .insert({
          stylist_id: stylistId,
          client_id: clientId,
          note: noteText.trim(),
        });

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Note ajoutée avec succès",
      });

      await fetchClientHistory();
    } catch (error) {
      console.error('Error adding note:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter la note",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchClientHistory();
  }, [stylistId, clientId]);

  return {
    bookings,
    notes,
    loading,
    addNote,
    refetch: fetchClientHistory,
  };
};