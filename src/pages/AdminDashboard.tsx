
import { useEffect } from 'react';
import AdminStats from '@/components/AdminStats';
import AdminUserManagement from '@/components/AdminUserManagement';
import AdminHairdresserManagement from '@/components/AdminHairdresserManagement';
import AdminPasswordChangeModal from '@/components/AdminPasswordChangeModal';
import { usePasswordPolicy } from '@/hooks/usePasswordPolicy';
import { useRoleAuth } from '@/hooks/useRoleAuth';

const AdminDashboard = () => {
  const { user } = useRoleAuth();
  const { needsPasswordChange, checkPasswordChangeRequired } = usePasswordPolicy();

  useEffect(() => {
    if (user) {
      checkPasswordChangeRequired(user.id);
    }
  }, [user, checkPasswordChangeRequired]);

  return (
    <>
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Tableau de bord Admin</h1>
          <p className="text-gray-600">Gérez les utilisateurs et surveillez l'activité du salon</p>
          
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
    </>
  );
};

export default AdminDashboard;
