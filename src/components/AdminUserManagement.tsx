
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserPlus, Edit, Trash2, Ban, CheckCircle, Phone, Mail } from 'lucide-react';
import { useUsers, User, UserRole, UserStatus } from '@/hooks/useUsers';
import { useRoleAuth } from '@/hooks/useRoleAuth';

const AdminUserManagement = () => {
  const { users, loading, getAllUsers, createUser, updateUser, deleteUser, blockUser, unblockUser } = useUsers();
  const { signUp } = useRoleAuth();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [newUserData, setNewUserData] = useState({
    email: '',
    password: '',
    nom: '',
    prenom: '',
    telephone: '',
    role: 'client' as UserRole
  });

  useEffect(() => {
    getAllUsers();
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newUserData.password.length < 6) {
      return;
    }

    // Créer le compte d'authentification
    const authResult = await signUp(newUserData.email, newUserData.password, {
      nom: newUserData.nom,
      prenom: newUserData.prenom,
      role: newUserData.role,
      telephone: newUserData.telephone
    });

    if (authResult.success) {
      setNewUserData({
        email: '',
        password: '',
        nom: '',
        prenom: '',
        telephone: '',
        role: 'client'
      });
      setIsCreateModalOpen(false);
      getAllUsers();
    }
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    const result = await updateUser(editingUser.id, {
      nom: editingUser.nom,
      prenom: editingUser.prenom,
      telephone: editingUser.telephone,
      role: editingUser.role
    });

    if (result.success) {
      setEditingUser(null);
      getAllUsers();
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      const result = await deleteUser(userId);
      if (result.success) {
        getAllUsers();
      }
    }
  };

  const handleToggleUserStatus = async (user: User) => {
    const result = user.status === 'bloque' 
      ? await unblockUser(user.id)
      : await blockUser(user.id);
    
    if (result.success) {
      getAllUsers();
    }
  };

  const getStatusBadge = (status: UserStatus) => {
    const variants = {
      'actif': 'default',
      'bloque': 'destructive',
      'inactif': 'secondary'
    } as const;
    
    return <Badge variant={variants[status]}>{status}</Badge>;
  };

  const getRoleBadge = (role: UserRole) => {
    const colors = {
      'admin': 'bg-red-500',
      'coiffeur': 'bg-blue-500',
      'client': 'bg-green-500',
      'cosmetique': 'bg-purple-500'
    };
    
    return <Badge className={`${colors[role]} text-white`}>{role}</Badge>;
  };

  const coiffeurs = users.filter(user => user.role === 'coiffeur');
  const clients = users.filter(user => user.role === 'client');
  const admins = users.filter(user => user.role === 'admin');

  if (loading) {
    return <div className="text-center p-8">Chargement des utilisateurs...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gestion des utilisateurs</h2>
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gold-500 hover:bg-gold-600">
              <UserPlus className="h-4 w-4 mr-2" />
              Nouvel utilisateur
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Créer un nouvel utilisateur</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={newUserData.email}
                  onChange={(e) => setNewUserData({...newUserData, email: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="password">Mot de passe</Label>
                <Input
                  id="password"
                  type="password"
                  value={newUserData.password}
                  onChange={(e) => setNewUserData({...newUserData, password: e.target.value})}
                  required
                  minLength={6}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nom">Nom</Label>
                  <Input
                    id="nom"
                    value={newUserData.nom}
                    onChange={(e) => setNewUserData({...newUserData, nom: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="prenom">Prénom</Label>
                  <Input
                    id="prenom"
                    value={newUserData.prenom}
                    onChange={(e) => setNewUserData({...newUserData, prenom: e.target.value})}
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="telephone">Téléphone</Label>
                <Input
                  id="telephone"
                  value={newUserData.telephone}
                  onChange={(e) => setNewUserData({...newUserData, telephone: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="role">Rôle</Label>
                <Select value={newUserData.role} onValueChange={(value: UserRole) => setNewUserData({...newUserData, role: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="client">Client</SelectItem>
                    <SelectItem value="coiffeur">Coiffeur</SelectItem>
                    <SelectItem value="cosmetique">Cosmétique</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <Button type="submit" className="flex-1">Créer</Button>
                <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                  Annuler
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="coiffeurs" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="coiffeurs">Expert Coiffeur ({coiffeurs.length})</TabsTrigger>
          <TabsTrigger value="cosmetique">Cosmétique ({users.filter(user => user.role === 'cosmetique').length})</TabsTrigger>
          <TabsTrigger value="clients">Clients ({clients.length})</TabsTrigger>
          <TabsTrigger value="admins">Admins ({admins.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="coiffeurs" className="space-y-4">
          <div className="grid gap-4">
            {coiffeurs.map((user) => (
              <Card key={user.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Avatar>
                        <AvatarFallback className="bg-blue-100 text-blue-700">
                          {user.prenom.charAt(0)}{user.nom.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold">{user.prenom} {user.nom}</h3>
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Mail className="h-4 w-4" />
                          <span>{user.email}</span>
                        </div>
                        {user.telephone && (
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <Phone className="h-4 w-4" />
                            <span>{user.telephone}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getRoleBadge(user.role)}
                      {getStatusBadge(user.status)}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingUser(user)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant={user.status === 'bloque' ? 'default' : 'destructive'}
                        size="sm"
                        onClick={() => handleToggleUserStatus(user)}
                      >
                        {user.status === 'bloque' ? <CheckCircle className="h-4 w-4" /> : <Ban className="h-4 w-4" />}
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteUser(user.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="clients" className="space-y-4">
          <div className="grid gap-4">
            {clients.map((user) => (
              <Card key={user.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Avatar>
                        <AvatarFallback className="bg-green-100 text-green-700">
                          {user.prenom.charAt(0)}{user.nom.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold">{user.prenom} {user.nom}</h3>
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Mail className="h-4 w-4" />
                          <span>{user.email}</span>
                        </div>
                        {user.telephone && (
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <Phone className="h-4 w-4" />
                            <span>{user.telephone}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getRoleBadge(user.role)}
                      {getStatusBadge(user.status)}
                      <Button
                        variant={user.status === 'bloque' ? 'default' : 'destructive'}
                        size="sm"
                        onClick={() => handleToggleUserStatus(user)}
                      >
                        {user.status === 'bloque' ? <CheckCircle className="h-4 w-4" /> : <Ban className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="cosmetique" className="space-y-4">
          <div className="grid gap-4">
            {users.filter(user => user.role === 'cosmetique').map((user) => (
              <Card key={user.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Avatar>
                        <AvatarFallback className="bg-purple-100 text-purple-700">
                          {user.prenom.charAt(0)}{user.nom.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold">{user.prenom} {user.nom}</h3>
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Mail className="h-4 w-4" />
                          <span>{user.email}</span>
                        </div>
                        {user.telephone && (
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <Phone className="h-4 w-4" />
                            <span>{user.telephone}</span>
                          </div>
                        )}
                        {user.gender && user.gender !== 'non_specifie' && (
                          <div className="text-sm text-gray-500 capitalize">
                            Genre: {user.gender}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getRoleBadge(user.role)}
                      {getStatusBadge(user.status)}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingUser(user)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant={user.status === 'bloque' ? 'default' : 'destructive'}
                        size="sm"
                        onClick={() => handleToggleUserStatus(user)}
                      >
                        {user.status === 'bloque' ? <CheckCircle className="h-4 w-4" /> : <Ban className="h-4 w-4" />}
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteUser(user.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="admins" className="space-y-4">
          <div className="grid gap-4">
            {admins.map((user) => (
              <Card key={user.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Avatar>
                        <AvatarFallback className="bg-red-100 text-red-700">
                          {user.prenom.charAt(0)}{user.nom.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold">{user.prenom} {user.nom}</h3>
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Mail className="h-4 w-4" />
                          <span>{user.email}</span>
                        </div>
                        {user.telephone && (
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <Phone className="h-4 w-4" />
                            <span>{user.telephone}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getRoleBadge(user.role)}
                      {getStatusBadge(user.status)}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingUser(user)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Modal d'édition */}
      <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier l'utilisateur</DialogTitle>
          </DialogHeader>
          {editingUser && (
            <form onSubmit={handleUpdateUser} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-nom">Nom</Label>
                  <Input
                    id="edit-nom"
                    value={editingUser.nom}
                    onChange={(e) => setEditingUser({...editingUser, nom: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="edit-prenom">Prénom</Label>
                  <Input
                    id="edit-prenom"
                    value={editingUser.prenom}
                    onChange={(e) => setEditingUser({...editingUser, prenom: e.target.value})}
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="edit-telephone">Téléphone</Label>
                <Input
                  id="edit-telephone"
                  value={editingUser.telephone || ''}
                  onChange={(e) => setEditingUser({...editingUser, telephone: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="edit-role">Rôle</Label>
                <Select value={editingUser.role} onValueChange={(value: UserRole) => setEditingUser({...editingUser, role: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="client">Client</SelectItem>
                    <SelectItem value="coiffeur">Coiffeur</SelectItem>
                    <SelectItem value="cosmetique">Cosmétique</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <Button type="submit" className="flex-1">Sauvegarder</Button>
                <Button type="button" variant="outline" onClick={() => setEditingUser(null)}>
                  Annuler
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminUserManagement;
