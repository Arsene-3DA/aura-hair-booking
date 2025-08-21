import { useEffect } from 'react';
import { useRoleAuth } from '@/hooks/useRoleAuth';

const AutoLogout = () => {
  const { signOut, isAuthenticated } = useRoleAuth();

  useEffect(() => {
    const logout = async () => {
      if (isAuthenticated) {
        console.log('🚪 Auto logout triggered...');
        const result = await signOut();
        if (result.success) {
          console.log('✅ User successfully logged out');
        } else {
          console.error('❌ Logout failed:', result.error);
        }
      }
    };

    logout();
  }, [signOut, isAuthenticated]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Déconnexion en cours...</p>
      </div>
    </div>
  );
};

export default AutoLogout;