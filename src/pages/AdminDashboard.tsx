
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";
import { Users, UserPlus, Settings, LogOut, Calendar, Phone, Mail } from 'lucide-react';
import AuthenticatedRoute from '../components/AuthenticatedRoute';
import CreateCoiffeurModal from '../components/CreateCoiffeurModal';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface Hairdresser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  specialties: string[];
  location?: string;
  rating: number;
  is_active: boolean;
  user_id?: string;
}

interface User {
  id: string;
  email: string;
  user_type: string;
  first_name?: string;
  last_name?: string;
  is_active: boolean;
  created_at: string;
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, logout } = useAuth();
  const [isCreateCoiffeurModalOpen, setIsCreateCoiffeurModalOpen] = useState(false);
  const [hairdressers, setHairdressers] = useState<Hairdresser[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Charger les coiffeurs avec leurs profils utilisateur
      const { data: hairdressersData, error: hairdressersError } = await supabase
        .from('hairdressers')
        .select(`
          *,
          coiffeur_profiles(user_id)
        `);

      if (hairdressersError) {
        console.error('Erreur lors du chargement des coiffeurs:', hairdressersError);
      } else {
        setHairdressers(hairdressersData || []);
      }

      // Charger tous les utilisateurs
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (usersError) {
        console.error('Erreur lors du chargement des utilisateurs:', usersError);
      } else {
        setUsers(usersData || []);
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast({
        title: "❌ Erreur",
        description: "Impossible de charger les données",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const toggleHairdresserStatus = async (hairdresserId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('hairdressers')
        .update({ is_active: !isActive })
        .eq('id', hairdresserId);

      if (error) {
        throw error;
      }

      toast({
        title: "✅ Statut mis à jour",
        description: `Le coiffeur a été ${!isActive ? 'activé' : 'désactivé'}`
      });

      await loadData();
    } catch (error) {
      console.error('Erreur:', error);
      toast({
        title: "❌ Erreur",
        description: "Impossible de mettre à jour le statut",
        variant: "destructive"
      });
    }
  };

  const toggleUserStatus = async (userId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ is_active: !isActive })
        .eq('id', userId);

      if (error) {
        throw error;
      }

      toast({
        title: "✅ Statut mis à jour",
        description: `L'utilisateur a été ${!isActive ? 'activé' : 'désactivé'}`
      });

      await loadData();
    } catch (error) {
      console.error('Erreur:', error);
      toast({
        title: "❌ Erreur",
        description: "Impossible de mettre à jour le statut",
        variant: "destructive"
      });
    }
  };

  const userStats = {
    total: users.length,
    clients: users.filter(u => u.user_type === 'client').length,
    coiffeurs: users.filter(u => u.user_type === 'coiffeur').length,
    admins: users.filter(u => u.user_type === 'admin').length,
    active: users.filter(u => u.is_active).length
  };

  const hairdresserStats = {
    total: hairdressers.length,
    active: hairdressers.filter(h => h.is_active).length,
    withAccount: hairdressers.filter(h => h.coiffeur_profiles && h.coiffeur_profiles.length > 0).length,
    withoutAccount: hairdressers.filter(h => !h.coiffeur_profiles || h.coiffeur_profiles.length === 0).length
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement du tableau de bord...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthenticatedRoute requiredUserType="admin">
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold gradient-text">Dashboard Administrateur</h1>
                <p className="text-gray-600">Bienvenue, {user?.first_name} {user?.last_name}</p>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setIsCreateCoiffeurModalOpen(true)}
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Créer un compte coiffeur
                </Button>
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4 mr-2" />
                  Paramètres
                </Button>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Déconnexion
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          {/* Statistiques */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-sky-50">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">{userStats.total}</div>
                <div className="text-sm text-gray-600 font-medium">Total Utilisateurs</div>
                <div className="text-xs text-gray-500 mt-1">
                  {userStats.active} actifs
                </div>
              </CardContent>
            </Card>
            <Card className="border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">{userStats.coiffeurs}</div>
                <div className="text-sm text-gray-600 font-medium">Comptes Coiffeurs</div>
              </CardContent>
            </Card>
            <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-violet-50">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">{userStats.clients}</div>
                <div className="text-sm text-gray-600 font-medium">Clients</div>
              </CardContent>
            </Card>
            <Card className="border-gold-200 bg-gradient-to-br from-gold-50 to-orange-50">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-gold-600 mb-2">{hairdresserStats.withoutAccount}</div>
                <div className="text-sm text-gray-600 font-medium">Coiffeurs sans compte</div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Liste des coiffeurs */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Users className="h-5 w-5 mr-2 text-gold-500" />
                    Gestion des Coiffeurs
                  </div>
                  <Badge variant="secondary">{hairdressers.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {hairdressers.map((hairdresser) => (
                    <div key={hairdresser.id} className="p-3 border rounded-lg">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold">{hairdresser.name}</h3>
                            <Badge 
                              variant={hairdresser.is_active ? "default" : "secondary"}
                              className={hairdresser.is_active ? "bg-green-500" : "bg-gray-400"}
                            >
                              {hairdresser.is_active ? "Actif" : "Inactif"}
                            </Badge>
                            {hairdresser.coiffeur_profiles && hairdresser.coiffeur_profiles.length > 0 && (
                              <Badge className="bg-blue-500 text-white">Compte créé</Badge>
                            )}
                          </div>
                          <div className="text-sm text-gray-600 space-y-1">
                            <div className="flex items-center">
                              <Mail className="h-3 w-3 mr-1" />
                              {hairdresser.email}
                            </div>
                            {hairdresser.phone && (
                              <div className="flex items-center">
                                <Phone className="h-3 w-3 mr-1" />
                                {hairdresser.phone}
                              </div>
                            )}
                            <div className="text-xs">
                              ⭐ {hairdresser.rating} • {hairdresser.specialties?.join(', ')}
                            </div>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant={hairdresser.is_active ? "destructive" : "default"}
                          onClick={() => toggleHairdresserStatus(hairdresser.id, hairdresser.is_active)}
                        >
                          {hairdresser.is_active ? "Désactiver" : "Activer"}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Liste des utilisateurs */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Users className="h-5 w-5 mr-2 text-blue-500" />
                    Gestion des Utilisateurs
                  </div>
                  <Badge variant="secondary">{users.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {users.map((user) => (
                    <div key={user.id} className="p-3 border rounded-lg">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold">{user.first_name} {user.last_name}</h3>
                            <Badge 
                              variant={user.user_type === 'admin' ? "default" : user.user_type === 'coiffeur' ? "secondary" : "outline"}
                              className={
                                user.user_type === 'admin' ? "bg-red-500" : 
                                user.user_type === 'coiffeur' ? "bg-green-500" : 
                                "bg-blue-500"
                              }
                            >
                              {user.user_type.toUpperCase()}
                            </Badge>
                            <Badge 
                              variant={user.is_active ? "default" : "secondary"}
                              className={user.is_active ? "bg-green-500" : "bg-gray-400"}
                            >
                              {user.is_active ? "Actif" : "Inactif"}
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-600">
                            <div className="flex items-center">
                              <Mail className="h-3 w-3 mr-1" />
                              {user.email}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              Créé le {new Date(user.created_at).toLocaleDateString('fr-FR')}
                            </div>
                          </div>
                        </div>
                        {user.user_type !== 'admin' && (
                          <Button
                            size="sm"
                            variant={user.is_active ? "destructive" : "default"}
                            onClick={() => toggleUserStatus(user.id, user.is_active)}
                          >
                            {user.is_active ? "Désactiver" : "Activer"}
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Modal de création de compte coiffeur */}
        <CreateCoiffeurModal
          isOpen={isCreateCoiffeurModalOpen}
          onClose={() => {
            setIsCreateCoiffeurModalOpen(false);
            loadData(); // Recharger les données après création
          }}
        />
      </div>
    </AuthenticatedRoute>
  );
};

export default AdminDashboard;
