
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertTriangle, Lock } from 'lucide-react';
import { usePasswordPolicy } from '@/hooks/usePasswordPolicy';

interface AdminPasswordChangeModalProps {
  isOpen: boolean;
  onClose?: () => void;
}

const AdminPasswordChangeModal = ({ isOpen, onClose }: AdminPasswordChangeModalProps) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const { updatePassword, loading } = usePasswordPolicy();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      return;
    }

    if (newPassword.length < 8) {
      return;
    }

    const result = await updatePassword(newPassword);
    
    if (result.success) {
      setNewPassword('');
      setConfirmPassword('');
      if (onClose) onClose();
    }
  };

  const passwordsMatch = newPassword === confirmPassword && newPassword.length > 0;
  const isValidPassword = newPassword.length >= 8;

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-full">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <DialogTitle className="text-lg font-semibold">
                Changement de mot de passe requis
              </DialogTitle>
              <p className="text-sm text-gray-600 mt-1">
                Première connexion détectée. Vous devez changer votre mot de passe par défaut.
              </p>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div>
            <Label htmlFor="new-password">Nouveau mot de passe</Label>
            <Input
              id="new-password"
              type={showPasswords ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Minimum 8 caractères"
              required
              minLength={8}
              className="mt-1"
            />
            {newPassword.length > 0 && !isValidPassword && (
              <p className="text-sm text-red-600 mt-1">
                Le mot de passe doit contenir au moins 8 caractères
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="confirm-password">Confirmer le mot de passe</Label>
            <Input
              id="confirm-password"
              type={showPasswords ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Répétez le mot de passe"
              required
              className="mt-1"
            />
            {confirmPassword.length > 0 && !passwordsMatch && (
              <p className="text-sm text-red-600 mt-1">
                Les mots de passe ne correspondent pas
              </p>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="show-passwords"
              checked={showPasswords}
              onChange={(e) => setShowPasswords(e.target.checked)}
              className="rounded"
            />
            <Label htmlFor="show-passwords" className="text-sm cursor-pointer">
              Afficher les mots de passe
            </Label>
          </div>

          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="flex items-start gap-2">
              <Lock className="h-4 w-4 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Conseils de sécurité :</p>
                <ul className="text-xs space-y-1">
                  <li>• Utilisez au moins 8 caractères</li>
                  <li>• Mélangez lettres, chiffres et symboles</li>
                  <li>• Évitez les mots de passe évidents</li>
                </ul>
              </div>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-orange-600 hover:bg-orange-700"
            disabled={loading || !passwordsMatch || !isValidPassword}
          >
            {loading ? "Mise à jour..." : "Changer le mot de passe"}
          </Button>

          <p className="text-xs text-gray-500 text-center">
            Vous ne pourrez pas accéder au système avant d'avoir changé votre mot de passe.
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AdminPasswordChangeModal;
