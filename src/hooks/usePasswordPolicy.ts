
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/hooks/use-toast";

export const usePasswordPolicy = () => {
  const [needsPasswordChange, setNeedsPasswordChange] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const checkPasswordChangeRequired = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('created_at, updated_at, role')
        .eq('auth_id', userId)
        .single();

      if (error) throw error;

      // Si c'est un admin et que created_at === updated_at, alors première connexion
      if (data?.role === 'admin' && data.created_at === data.updated_at) {
        setNeedsPasswordChange(true);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Erreur lors de la vérification du mot de passe:', error);
      return false;
    }
  };

  const updatePassword = async (newPassword: string) => {
    setLoading(true);
    try {
      // SECURITY FIX: Validate password strength client-side
      const { validatePassword } = await import('@/utils/validation');
      const validation = await validatePassword(newPassword);
      
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '));
      }

      // SECURITY FIX: Check rate limiting
      const { checkRateLimit } = await import('@/utils/validation');
      if (!checkRateLimit('passwordUpdate', 3, 3600000)) { // Max 3 updates per hour
        throw new Error('Trop de changements de mot de passe récents. Veuillez patienter.');
      }

      // Mettre à jour le mot de passe avec Supabase Auth
      const { error: authError } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (authError) throw authError;

      // Marquer que le profil a été mis à jour
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { error: profileError } = await supabase
          .from('users')
          .update({ updated_at: new Date().toISOString() })
          .eq('auth_id', user.id);

        if (profileError) throw profileError;
      }

      setNeedsPasswordChange(false);
      
      toast({
        title: "✅ Mot de passe mis à jour",
        description: "Votre mot de passe a été changé avec succès"
      });

      return { success: true };
    } catch (error: any) {
      const errorMessage = error.message || 'Erreur lors de la mise à jour du mot de passe';
      toast({
        title: "❌ Erreur",
        description: errorMessage,
        variant: "destructive"
      });
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  return {
    needsPasswordChange,
    loading,
    checkPasswordChangeRequired,
    updatePassword,
    setNeedsPasswordChange
  };
};
