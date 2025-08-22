import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/hooks/use-toast";

export const cleanupDemoUsers = async () => {
  const toast = useToast().toast;
  
  try {
    console.log('🧹 Début du nettoyage des utilisateurs de démonstration...');
    
    // Appeler la fonction RPC pour nettoyer les utilisateurs de démo
    const { data, error } = await supabase.rpc('cleanup_demo_users');
    
    if (error) {
      console.error('❌ Erreur lors du nettoyage:', error);
      toast({
        title: "❌ Erreur de nettoyage",
        description: error.message || "Une erreur est survenue lors de la suppression",
        variant: "destructive"
      });
      return { success: false, error };
    }

    console.log('✅ Nettoyage terminé:', data);
    toast({
      title: "✅ Nettoyage réussi",
      description: `${(data as any)?.deleted_count || 0} utilisateur(s) de démonstration supprimé(s)`
    });

    return { success: true, data };

  } catch (error) {
    console.error('❌ Erreur lors du nettoyage:', error);
    toast({
      title: "❌ Erreur de nettoyage",
      description: "Une erreur est survenue lors de la suppression",
      variant: "destructive"
    });
    return { success: false, error };
  }
};