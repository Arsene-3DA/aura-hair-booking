import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { RefreshCw, CheckCircle } from 'lucide-react';
import { useUsers } from '@/hooks/useUsers';

const RefreshUsersButton = () => {
  const [loading, setLoading] = useState(false);
  const { getAllUsers } = useUsers();

  const handleRefresh = async () => {
    setLoading(true);
    await getAllUsers();
    setLoading(false);
    // Recharger la page pour s'assurer que tout est à jour
    window.location.reload();
  };

  return (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={handleRefresh}
      disabled={loading}
      className="gap-2"
    >
      {loading ? (
        <RefreshCw className="h-4 w-4 animate-spin" />
      ) : (
        <CheckCircle className="h-4 w-4" />
      )}
      {loading ? "Actualisation..." : "Actualiser la liste"}
    </Button>
  );
};

export default RefreshUsersButton;