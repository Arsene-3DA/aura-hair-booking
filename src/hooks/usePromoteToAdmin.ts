import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const usePromoteToAdmin = () => {
  const { toast } = useToast();

  const promoteToAdmin = async (email: string) => {
    try {
      // SECURITY FIX: Validate email format client-side
      const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
      if (!emailRegex.test(email)) {
        throw new Error("Format d'email invalide");
      }

      // SECURITY FIX: Additional client-side rate limiting check
      const lastPromotion = localStorage.getItem('lastAdminPromotion');
      const now = Date.now();
      if (lastPromotion && (now - parseInt(lastPromotion)) < 60000) { // 1 minute cooldown
        throw new Error("Veuillez patienter avant de promouvoir un autre utilisateur");
      }

      const { error } = await supabase.rpc('promote_to_admin', { p_email: email.trim().toLowerCase() });
      
      if (error) {
        throw error;
      }

      // SECURITY FIX: Store timestamp for rate limiting
      localStorage.setItem('lastAdminPromotion', now.toString());

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