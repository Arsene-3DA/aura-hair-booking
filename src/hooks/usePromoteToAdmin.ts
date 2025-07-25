import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const usePromoteToAdmin = () => {
  const { toast } = useToast();

  const promoteToAdmin = async (email: string) => {
    try {
      const { error } = await supabase.rpc('promote_to_admin', { p_email: email });
      
      if (error) {
        throw error;
      }

      toast({
        title: "Promotion réussie",
        description: `L'utilisateur ${email} a été promu administrateur`,
      });

      return { success: true };
    } catch (error) {
      console.error('Erreur promotion admin:', error);
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Impossible de promouvoir l'utilisateur",
        variant: "destructive",
      });
      return { success: false, error };
    }
  };

  return { promoteToAdmin };
};