import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface WorkingDay {
  open: string;
  close: string;
  isOpen: boolean;
}

interface WorkingHours {
  monday: WorkingDay;
  tuesday: WorkingDay;
  wednesday: WorkingDay;
  thursday: WorkingDay;
  friday: WorkingDay;
  saturday: WorkingDay;
  sunday: WorkingDay;
}

export const useWorkingHours = () => {
  const [workingHours, setWorkingHours] = useState<WorkingHours | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchWorkingHours = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('hairdressers')
        .select('working_hours')
        .eq('auth_id', (await supabase.auth.getUser()).data.user?.id)
        .single();

      if (error) {
        console.error('Erreur lors de la récupération des horaires:', error);
        return;
      }

      if (data?.working_hours) {
        setWorkingHours(data.working_hours as any);
      }
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateWorkingHours = async (newHours: WorkingHours) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('hairdressers')
        .update({ 
          working_hours: newHours as any,
          updated_at: new Date().toISOString()
        })
        .eq('auth_id', (await supabase.auth.getUser()).data.user?.id);

      if (error) {
        toast({
          title: "Erreur",
          description: "Impossible de mettre à jour les horaires",
          variant: "destructive"
        });
        return false;
      }

      setWorkingHours(newHours);
      toast({
        title: "Succès",
        description: "Horaires mis à jour avec succès"
      });
      return true;
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      toast({
        title: "Erreur",
        description: "Une erreur inattendue s'est produite",
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkingHours();
  }, []);

  return {
    workingHours,
    loading,
    updateWorkingHours,
    refetch: fetchWorkingHours
  };
};