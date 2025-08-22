import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Shield, User, Scissors, Crown, Sparkles } from 'lucide-react';
import { useDynamicRoleManagement, UserRole } from '@/hooks/useDynamicRoleManagement';

interface User {
  id: string;
  auth_id: string;
  email: string;
  nom: string;
  prenom: string;
  role: string;
}

interface RoleChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onRoleChanged: () => void;
}

const RoleChangeModal: React.FC<RoleChangeModalProps> = ({
  isOpen,
  onClose,
  user,
  onRoleChanged,
}) => {
  const [selectedRole, setSelectedRole] = useState<UserRole | ''>('');
  const { changeUserRole, loading, getRolePermissions } = useDynamicRoleManagement();

  const roleOptions = [
    {
      value: 'client' as UserRole,
      label: 'Client',
      icon: User,
      color: 'bg-green-100 text-green-800',
      description: 'Peut réserver des services et laisser des avis',
    },
    {
      value: 'coiffeur' as UserRole,
      label: 'Coiffeur',
      icon: Scissors,
      color: 'bg-blue-100 text-blue-800',
      description: 'Peut gérer son agenda et servir les clients',
    },
    {
      value: 'coiffeuse' as UserRole,
      label: 'Coiffeuse',
      icon: Scissors,
      color: 'bg-pink-100 text-pink-800',
      description: 'Peut gérer son agenda et servir les clients',
    },
    {
      value: 'cosmetique' as UserRole,
      label: 'Cosmétique',
      icon: Sparkles,
      color: 'bg-purple-100 text-purple-800',
      description: 'Spécialiste en soins cosmétiques et esthétiques',
    },
    {
      value: 'admin' as UserRole,
      label: 'Administrateur',
      icon: Crown,
      color: 'bg-red-100 text-red-800',
      description: 'Accès complet à la gestion du système',
    },
  ];

  const handleRoleChange = async () => {
    if (!user || !selectedRole) return;

    console.log('🔄 RoleChangeModal: Début changement de rôle', {
      userId: user.auth_id,
      currentRole: user.role,
      newRole: selectedRole
    });

    const result = await changeUserRole(user.auth_id, selectedRole);
    
    console.log('📊 RoleChangeModal: Résultat changement', result);
    
    if (result.success) {
      console.log('✅ RoleChangeModal: Succès - déclenchement des callbacks');
      // Déclencher immédiatement la mise à jour
      onRoleChanged();
      onClose();
      setSelectedRole('');
      
      // Force une mise à jour supplémentaire après un court délai
      setTimeout(() => {
        onRoleChanged();
      }, 500);
    }
  };

  const getCurrentRoleInfo = () => {
    return roleOptions.find(role => role.value === user?.role);
  };

  const getSelectedRoleInfo = () => {
    return roleOptions.find(role => role.value === selectedRole);
  };

  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Modifier le rôle utilisateur
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Informations utilisateur */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">
                    {user.prenom} {user.nom}
                  </h3>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground mb-1">Rôle actuel</p>
                  {(() => {
                    const roleInfo = getCurrentRoleInfo();
                    if (!roleInfo) return null;
                    const IconComponent = roleInfo.icon;
                    return (
                      <Badge className={roleInfo.color}>
                        <IconComponent className="w-3 h-3 mr-1" />
                        {roleInfo.label}
                      </Badge>
                    );
                  })()}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sélection du nouveau rôle */}
          <div className="space-y-3">
            <h4 className="font-medium">Nouveau rôle</h4>
            <Select value={selectedRole} onValueChange={(value) => setSelectedRole(value as UserRole | '')}>
              <SelectTrigger>
                <SelectValue placeholder="Choisir un nouveau rôle" />
              </SelectTrigger>
              <SelectContent>
                {roleOptions.map((role) => (
                  <SelectItem
                    key={role.value}
                    value={role.value}
                    disabled={role.value === user.role}
                  >
                    <div className="flex items-center gap-2">
                      <role.icon className="w-4 h-4" />
                      <span>{role.label}</span>
                      {role.value === user.role && (
                        <Badge variant="secondary" className="ml-2">
                          Actuel
                        </Badge>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Aperçu des permissions */}
          {selectedRole && getSelectedRoleInfo() && (
            <Card>
              <CardContent className="p-4">
                <h4 className="font-medium mb-2">
                  Permissions pour {getSelectedRoleInfo()!.label}
                </h4>
                <p className="text-sm text-muted-foreground mb-3">
                  {getSelectedRoleInfo()!.description}
                </p>
                
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {Object.entries(getRolePermissions(selectedRole)).map(([permission, allowed]) => (
                    <div key={permission} className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${allowed ? 'bg-green-500' : 'bg-gray-300'}`} />
                      <span className={allowed ? 'text-foreground' : 'text-muted-foreground'}>
                        {permission.replace('can', 'Peut ')}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Avertissement */}
          {selectedRole && selectedRole !== user.role && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                ⚠️ L'utilisateur recevra une notification et devra se reconnecter pour que les changements prennent effet.
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Annuler
          </Button>
          <Button
            onClick={handleRoleChange}
            disabled={!selectedRole || selectedRole === user.role || loading}
          >
            {loading ? 'Modification...' : 'Modifier le rôle'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RoleChangeModal;