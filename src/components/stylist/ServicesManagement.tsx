import { useStylistServicesManagement } from '@/hooks/useStylistServicesManagement';
import { useRoleAuth } from '@/hooks/useRoleAuth';
import StylistServicesPage from '@/pages/stylist/StylistServicesPage';

const ServicesManagement = () => {
  const { userProfile } = useRoleAuth();
  
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-primary/5 to-secondary/5 p-6 rounded-xl border border-primary/20">
        <h3 className="text-xl font-semibold mb-2">Gestion de vos services</h3>
        <p className="text-muted-foreground">
          Les services que vous créez ici apparaîtront automatiquement sur votre profil public et seront visibles par vos clients lors de la réservation.
        </p>
      </div>
      
      <StylistServicesPage />
    </div>
  );
};

export default ServicesManagement;