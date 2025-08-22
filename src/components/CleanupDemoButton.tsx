import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Trash2, AlertTriangle, Play } from 'lucide-react';
import { cleanupDemoUsers } from '@/utils/cleanupDemoData';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/hooks/use-toast";

const CleanupDemoButton = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleCleanup = async () => {
    setLoading(true);
    try {
      // Appeler la nouvelle fonction RPC améliorée
      const { data, error } = await supabase.rpc('cleanup_all_demo_data');
      
      if (error) {
        console.error('❌ Erreur lors du nettoyage:', error);
        toast({
          title: "❌ Erreur de nettoyage",
          description: error.message || "Une erreur est survenue lors de la suppression",
          variant: "destructive"
        });
      } else {
        console.log('✅ Nettoyage terminé:', data);
        toast({
          title: "✅ Nettoyage réussi",
          description: `${(data as any)?.deleted_count || 0} utilisateur(s) de démonstration supprimé(s)`
        });
        
        // Recharger la page pour mettre à jour la liste
        window.location.reload();
      }
    } catch (error) {
      console.error('❌ Erreur lors du nettoyage:', error);
      toast({
        title: "❌ Erreur de nettoyage",
        description: "Une erreur est survenue lors de la suppression",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTest = async () => {
    try {
      // Tester si les utilisateurs de démo existent encore
      const { data, error } = await supabase
        .from('users')
        .select('email, nom, prenom')
        .in('email', ['admin@salon.com', 'marie@salon.com', 'pierre@salon.com', 'client@email.com']);
      
      if (error) {
        console.error('Erreur de test:', error);
        return;
      }
      
      console.log('🔍 Utilisateurs de démo trouvés:', data);
      toast({
        title: "🔍 Test effectué",
        description: `${data?.length || 0} utilisateur(s) de démonstration trouvé(s)`,
        variant: data?.length ? "destructive" : "default"
      });
    } catch (error) {
      console.error('Erreur de test:', error);
    }
  };

  return (
    <div className="flex gap-2">
      <Button 
        variant="outline" 
        size="sm" 
        onClick={handleTest}
        className="gap-2"
      >
        <Play className="h-4 w-4" />
        Tester
      </Button>
      
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
    </div>
  );
};

export default CleanupDemoButton;