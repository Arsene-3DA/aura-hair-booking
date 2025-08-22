
import { useEffect } from 'react';
import { Button } from "@/components/ui/button";
import AdminStats from '@/components/AdminStats';
import AdminUserManagement from '@/components/AdminUserManagement';
import AdminHairdresserManagement from '@/components/AdminHairdresserManagement';
import RefreshUsersButton from '@/components/RefreshUsersButton';
import AdminPasswordChangeModal from '@/components/AdminPasswordChangeModal';
import { AdminReviewsManagement } from '@/components/AdminReviewsManagement';
import CleanupDemoButton from '@/components/CleanupDemoButton';
import { usePasswordPolicy } from '@/hooks/usePasswordPolicy';
import { useRoleAuth } from '@/hooks/useRoleAuth';
import PageHeader from '@/components/PageHeader';
import { Users } from 'lucide-react';

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
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="space-y-6 lg:space-y-8">
          <PageHeader
            title="Tableau de bord Admin"
            description="Gérez les utilisateurs et surveillez l'activité du salon"
            icon={<Users className="h-6 w-6 sm:h-8 sm:w-8" />}
            showBackButton={true}
            actions={
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <RefreshUsersButton />
                <Button variant="outline" onClick={handleLogout} className="w-full sm:w-auto">
                  Déconnexion
                </Button>
              </div>
            }
          />
          
          {needsPasswordChange && (
            <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="flex items-start gap-3">
                <span className="text-orange-600 text-lg">⚠️</span>
                <p className="text-orange-800 font-medium text-sm sm:text-base">
                  Changement de mot de passe requis pour votre sécurité
                </p>
              </div>
            </div>
          )}

          <AdminStats />
          
          <AdminHairdresserManagement />
          
          <AdminReviewsManagement />
          
          <AdminUserManagement />
        </div>
      </div>

      {/* Modal de changement de mot de passe obligatoire */}
      <AdminPasswordChangeModal 
        isOpen={needsPasswordChange}
      />
    </div>
  );
};

export default AdminDashboard;
