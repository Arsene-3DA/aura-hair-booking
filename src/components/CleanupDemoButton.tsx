import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Trash2, AlertTriangle } from 'lucide-react';
import { cleanupDemoUsers } from '@/utils/cleanupDemoData';

const CleanupDemoButton = () => {
  const [loading, setLoading] = useState(false);

  const handleCleanup = async () => {
    setLoading(true);
    await cleanupDemoUsers();
    setLoading(false);
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button 
          variant="destructive" 
          size="sm" 
          className="gap-2"
        >
          <Trash2 className="h-4 w-4" />
          Supprimer les données de test
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <AlertDialogTitle>Supprimer les données de démonstration</AlertDialogTitle>
          </div>
          <AlertDialogDescription asChild>
            <div className="space-y-4">
              <div className="bg-red-50 p-3 rounded-lg border border-red-200">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <span className="font-medium text-red-800">Attention : Action irréversible !</span>
                </div>
                <p className="text-sm text-red-700">
                  Cette action va supprimer définitivement tous les comptes de démonstration et leurs données associées.
                </p>
              </div>

              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-700 font-medium mb-2">
                  Comptes qui seront supprimés :
                </p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• admin@salon.com</li>
                  <li>• marie@salon.com</li>
                  <li>• pierre@salon.com</li>
                  <li>• client@email.com</li>
                </ul>
              </div>

              <div className="bg-amber-50 p-3 rounded-lg border border-amber-200">
                <p className="text-sm text-amber-700">
                  <strong>Données supprimées :</strong> Profils, réservations, avis, messages, portfolios et toutes les données liées.
                </p>
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleCleanup}
            disabled={loading}
            className="bg-red-600 hover:bg-red-700"
          >
            {loading ? "Suppression..." : "Confirmer la suppression"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default CleanupDemoButton;