
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Database, Users, AlertTriangle } from 'lucide-react';
import { initializeTestData, checkExistingTestData } from '@/utils/initializeTestData';

const InitializeDataButton = () => {
  const [loading, setLoading] = useState(false);
  const [existingData, setExistingData] = useState<any>(null);

  const handleCheckData = async () => {
    const result = await checkExistingTestData();
    setExistingData(result);
  };

  const handleInitialize = async () => {
    setLoading(true);
    await initializeTestData();
    setLoading(false);
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="gap-2"
          onClick={handleCheckData}
        >
          <Database className="h-4 w-4" />
          Initialiser les données de test
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5 text-blue-600" />
            <AlertDialogTitle>Initialiser les données de test</AlertDialogTitle>
          </div>
          <AlertDialogDescription asChild>
            <div className="space-y-4">
              <p>
                Cette action va créer automatiquement tous les comptes de test nécessaires :
              </p>
              
              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-4 w-4 text-blue-600" />
                  <span className="font-medium text-blue-800">Comptes qui seront créés :</span>
                </div>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• 👑 Admin: admin@salon.com</li>
                  <li>• ✂️ Coiffeur: marie@salon.com</li>
                  <li>• ✂️ Coiffeur: pierre@salon.com</li>
                  <li>• 👤 Client: client@email.com</li>
                </ul>
              </div>

              {existingData?.hasExistingData && (
                <div className="bg-orange-50 p-3 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-4 w-4 text-orange-600" />
                    <span className="font-medium text-orange-800">Attention :</span>
                  </div>
                  <p className="text-sm text-orange-700">
                    Certains comptes existent déjà. L'initialisation créera uniquement les comptes manquants.
                  </p>
                  <p className="text-xs text-orange-600 mt-1">
                    Comptes existants : {existingData.existingUsers.map((u: any) => u.email).join(', ')}
                  </p>
                </div>
              )}

              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-600">
                  <strong>Mot de passe par défaut :</strong> [nom]123 (ex: admin123, marie123, etc.)
                </p>
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleInitialize}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {loading ? "Initialisation..." : "Créer les comptes"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default InitializeDataButton;
