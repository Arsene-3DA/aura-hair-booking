
import AdminStats from '@/components/AdminStats';
import AdminUserManagement from '@/components/AdminUserManagement';

const AdminDashboard = () => {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Tableau de bord Admin</h1>
        <p className="text-gray-600">Gérez les utilisateurs et surveillez l'activité du salon</p>
      </div>

      <AdminStats />
      <AdminUserManagement />
    </div>
  );
};

export default AdminDashboard;
