import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { validateSecureInput, trackFailedLogin, logSecurityEvent } from "@/utils/security";

export const usePromoteToAdmin = () => {
  const { toast } = useToast();

  const promoteToAdmin = async (email: string) => {
    try {
      // SECURITY FIX: Enhanced input validation
      const validation = validateSecureInput(email, 'email');
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '));
      }

      // SECURITY FIX: Rate limiting check with enhanced security
      const lastPromotion = localStorage.getItem('lastAdminPromotion');
      const now = Date.now();
      if (lastPromotion && (now - parseInt(lastPromotion)) < 60000) {
        await logSecurityEvent('rate_limit_hit', 'Admin promotion rate limit exceeded', {});
        throw new Error("Veuillez patienter avant de promouvoir un autre utilisateur");
      }

      // SECURITY FIX: Log promotion attempt
      await logSecurityEvent('admin_promotion_attempt', `Attempting to promote: ${email}`, {});

      const { error } = await supabase.rpc('promote_to_admin', { p_email: validation.sanitized });
      
      if (error) {
        await logSecurityEvent('admin_promotion_failed', `Failed to promote ${email}: ${error.message}`, {});
        throw error;
      }

      // SECURITY FIX: Store timestamp for rate limiting
      localStorage.setItem('lastAdminPromotion', now.toString());

      // SECURITY FIX: Log successful promotion
      await logSecurityEvent('admin_promotion_success', `Successfully promoted: ${email}`, {});

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