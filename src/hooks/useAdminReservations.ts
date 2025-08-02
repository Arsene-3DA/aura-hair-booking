import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface AdminReservation {
  id: string;
  scheduled_at: string;
  status: 'pending' | 'confirmed' | 'declined' | 'completed' | 'no_show';
  notes?: string;
  created_at: string;
  updated_at: string;
  // Client info
  client_name?: string;
  client_avatar?: string;
  client_email?: string;
  client_phone?: string;
  // Stylist info
  stylist_name?: string;
  stylist_avatar?: string;
  stylist_email?: string;
  stylist_phone?: string;
  stylist_specialties?: string[];
  stylist_location?: string;
  stylist_role?: 'coiffeur' | 'coiffeuse' | 'cosmetique' | 'client' | 'admin';
  // Service info
  service_name?: string;
  service_description?: string;
  service_price?: number;
  service_duration?: number;
  service_category?: string;
}

export const useAdminReservations = () => {
  const [reservations, setReservations] = useState<AdminReservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchReservations = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase.rpc('get_admin_reservations');

      if (error) {
        console.error('Error fetching admin reservations:', error);
        throw error;
      }

      setReservations((data || []).map(item => ({
        ...item,
        status: item.status as 'pending' | 'confirmed' | 'declined' | 'completed' | 'no_show',
        stylist_role: item.stylist_role as 'coiffeur' | 'coiffeuse' | 'cosmetique' | 'client' | 'admin'
      })));
    } catch (err: any) {
      const errorMessage = err.message || 'Erreur lors du chargement des réservations';
      setError(errorMessage);
      toast({
        title: "❌ Erreur",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateReservationStatus = async (
    reservationId: string, 
    status: 'pending' | 'confirmed' | 'declined' | 'completed' | 'no_show'
  ) => {
    try {
      // Use direct update instead of RPC for now
      const { error } = await supabase
        .from('new_reservations')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', reservationId);

      if (error) throw error;

      await fetchReservations(); // Refresh data
      toast({
        title: "✅ Succès",
        description: "Statut de la réservation mis à jour",
      });
    } catch (err: any) {
      toast({
        title: "❌ Erreur",
        description: err.message || "Impossible de mettre à jour le statut",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  return {
    reservations,
    loading,
    error,
    fetchReservations,
    updateReservationStatus
  };
};