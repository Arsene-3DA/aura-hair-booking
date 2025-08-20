import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useRoleAuth } from '@/hooks/useRoleAuth';
import { useProfileRole } from '@/hooks/useProfileRole';
import { LayoutDashboard } from 'lucide-react';

interface DashboardRedirectButtonProps {
  className?: string;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
}

export const DashboardRedirectButton = ({ 
  className = "", 
  variant = "default" 
}: DashboardRedirectButtonProps) => {
  const { user, isAuthenticated } = useRoleAuth();
  const { data: role } = useProfileRole(user?.id);

  if (!isAuthenticated || !role) {
    return null;
  }

  const getDashboardPath = () => {
    switch (role) {
      case 'admin':
        return '/admin';
      case 'coiffeur':
      case 'coiffeuse':
      case 'cosmetique':
        return '/stylist';
      case 'client':
      default:
        return '/app';
    }
  };

  const getDashboardLabel = () => {
    switch (role) {
      case 'admin':
        return 'Admin Dashboard';
      case 'coiffeur':
      case 'coiffeuse':
      case 'cosmetique':
        return 'Espace Pro';
      case 'client':
      default:
        return 'Mon Espace';
    }
  };

  return (
    <Button asChild variant={variant} className={className}>
      <Link to={getDashboardPath()}>
        <LayoutDashboard className="mr-2 h-4 w-4" />
        {getDashboardLabel()}
      </Link>
    </Button>
  );
};