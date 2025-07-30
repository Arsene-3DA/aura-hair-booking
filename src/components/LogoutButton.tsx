import { useState } from 'react';
import { LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface LogoutButtonProps {
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  showText?: boolean;
  className?: string;
}

const LogoutButton = ({ 
  variant = 'outline', 
  size = 'default', 
  showText = true,
  className 
}: LogoutButtonProps) => {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      
      // SECURITY FIX: Enhanced logout with security cleanup
      const { logSecurityEvent } = await import('@/utils/security');
      
      // Log logout attempt
      await logSecurityEvent('user_logout_attempt', 'User initiated logout', {});
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw error;
      }

      // SECURITY FIX: Clear sensitive data from localStorage
      const sensitiveKeys = [
        'lastActivity',
        'rate_limits',
        'lastAdminPromotion',
        'session.user_agent'
      ];
      
      sensitiveKeys.forEach(key => {
        localStorage.removeItem(key);
      });
      
      // Clear any remaining Supabase session data
      localStorage.removeItem('supabase.auth.token');
      
      // Log successful logout
      await logSecurityEvent('user_logout_success', 'User logged out successfully', {});

      toast({
        title: "Déconnexion réussie",
        description: "Vous avez été déconnecté avec succès",
      });

      navigate('/', { replace: true });
    } catch (error) {
      console.error('Logout error:', error);
      
      // Log logout error
      const { logSecurityEvent } = await import('@/utils/security');
      await logSecurityEvent('user_logout_error', 'Logout failed', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      toast({
        title: "Erreur de déconnexion",
        description: "Une erreur s'est produite lors de la déconnexion",
        variant: "destructive",
      });
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleLogout}
      disabled={isLoggingOut}
      className={className}
    >
      <LogOut className={`h-4 w-4 ${showText ? 'mr-2' : ''}`} />
      {showText && (isLoggingOut ? 'Déconnexion...' : 'Se déconnecter')}
    </Button>
  );
};

export default LogoutButton;