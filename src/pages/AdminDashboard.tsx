
import { useEffect } from 'react';
import { Button } from "@/components/ui/button";
import AdminStats from '@/components/AdminStats';
import AdminUserManagement from '@/components/AdminUserManagement';
import AdminHairdresserManagement from '@/components/AdminHairdresserManagement';
import AdminPasswordChangeModal from '@/components/AdminPasswordChangeModal';
import { usePasswordPolicy } from '@/hooks/usePasswordPolicy';
import { useRoleAuth } from '@/hooks/useRoleAuth';

const AdminDashboard = () => {
  const { user, signOut } = useRoleAuth();
  const { needsPasswordChange, checkPasswordChangeRequired } = usePasswordPolicy();

  useEffect(() => {
    if (user) {
      checkPasswordChangeRequired(user.id);
    }
  }, [user, checkPasswordChangeRequired]);

  const handleLogout = async () => {
    await signOut();
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-xl font-semibold gradient-text">
                Tableau de bord Admin
              </h1>
              <p className="text-sm text-gray-600">
                Gérez les utilisateurs et surveillez l'activité du salon
              </p>
            </div>
            <Button variant="outline" onClick={handleLogout}>
              Déconnexion
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto py-8 px-4">
        <div className="mb-8">
          
          {needsPasswordChange && (
            <div className="mt-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="flex items-center gap-2">
                <span className="text-orange-600">⚠️</span>
                <p className="text-orange-800 font-medium">
                  Changement de mot de passe requis pour votre sécurité
                </p>
              </div>
            </div>
          )}
        </div>

        <AdminStats />
        
        <div className="mb-8">
          <AdminHairdresserManagement />
        </div>
        
        <AdminUserManagement />
      </div>

      {/* Modal de changement de mot de passe obligatoire */}
      <AdminPasswordChangeModal 
        isOpen={needsPasswordChange}
      />
    </div>
  );
};

export default AdminDashboard;
