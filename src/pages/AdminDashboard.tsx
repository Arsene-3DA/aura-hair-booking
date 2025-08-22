
import { useEffect } from 'react';
import { Button } from "@/components/ui/button";
import AdminStats from '@/components/AdminStats';
import AdminUserManagement from '@/components/AdminUserManagement';
import AdminHairdresserManagement from '@/components/AdminHairdresserManagement';
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
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8 px-4">
        <PageHeader
          title="Tableau de bord Admin"
          description="Gérez les utilisateurs et surveillez l'activité du salon"
          icon={<Users className="h-8 w-8" />}
          showBackButton={true}
          actions={
            <div className="flex gap-2">
              <CleanupDemoButton />
              <Button variant="outline" onClick={handleLogout}>
                Déconnexion
              </Button>
            </div>
          }
        />
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
        
        <div className="mb-8">
          <AdminReviewsManagement />
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
