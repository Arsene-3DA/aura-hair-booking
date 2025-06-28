import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { UserPlus, Star } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface Hairdresser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  specialties?: string[];
  experience?: string;
  rating?: number;
  image_url?: string;
  is_active: boolean;
}

const AdminDashboard = () => {
  const [hairdressers, setHairdressers] = useState<Hairdresser[]>([]);
  const [loadingHairdressers, setLoadingHairdressers] = useState(true);
  const { toast } = useToast();
  const { createCoiffeurUser } = useAuth();
  const [newAccountData, setNewAccountData] = useState({
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    phone: '',
    hairdresser_id: ''
  });

  useEffect(() => {
    loadHairdressers();
  }, []);

  const loadHairdressers = async () => {
    try {
      setLoadingHairdressers(true);
      const { data, error } = await supabase
        .from('hairdressers')
        .select(`
          *,
          coiffeur_profiles!left(
            user_id,
            users!inner(email, first_name, last_name, is_active)
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erreur lors du chargement des coiffeurs:', error);
        throw error;
      }

      setHairdressers(data || []);
    } catch (error) {
      toast({
        title: "❌ Erreur",
        description: "Impossible de charger les coiffeurs",
        variant: "destructive",
      });
    } finally {
      setLoadingHairdressers(false);
    }
  };

  const handleCreateAccount = async (hairdresser: Hairdresser) => {
    setNewAccountData({
      ...newAccountData,
      hairdresser_id: hairdresser.id,
      email: hairdresser.email,
      first_name: hairdresser.name.split(' ')[0],
      last_name: hairdresser.name.split(' ').slice(1).join(' ')
    });

    const password = 'coiffeur123'; // Mot de passe par défaut
    try {
      const result = await createCoiffeurUser({
        ...newAccountData,
        email: hairdresser.email,
        password: password,
        first_name: hairdresser.name.split(' ')[0],
        last_name: hairdresser.name.split(' ').slice(1).join(' '),
        hairdresser_id: hairdresser.id
      });

      if (result.success) {
        toast({
          title: "✅ Compte coiffeur créé",
          description: `Un compte a été créé pour ${hairdresser.name} avec le mot de passe par défaut: coiffeur123`
        });
        loadHairdressers(); // Actualiser la liste après la création
      }
    } catch (error) {
      console.error('Erreur lors de la création du compte:', error);
    }
  };

  const renderHairdresserCard = (hairdresser: any) => {
    const hasAccount = hairdresser.coiffeur_profiles && hairdresser.coiffeur_profiles.length > 0;
    const userInfo = hasAccount ? hairdresser.coiffeur_profiles[0]?.users : null;

    return (
      <Card key={hairdresser.id} className="hover:shadow-lg transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={hairdresser.image_url} alt={hairdresser.name} />
                <AvatarFallback className="bg-gold-100 text-gold-700 text-lg font-semibold">
                  {hairdresser.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-xl font-bold text-gray-900">{hairdresser.name}</h3>
                <p className="text-gray-600">{hairdresser.email}</p>
                {hairdresser.phone && (
                  <p className="text-sm text-gray-500">{hairdresser.phone}</p>
                )}
              </div>
            </div>
            <div className="flex flex-col items-end space-y-2">
              <Badge variant={hairdresser.is_active ? "default" : "secondary"}>
                {hairdresser.is_active ? "Actif" : "Inactif"}
              </Badge>
              {hasAccount && (
                <Badge className="bg-green-500 text-white">
                  Compte créé
                </Badge>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Spécialités</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {hairdresser.specialties?.map((specialty: string, index: number) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {specialty}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Expérience</p>
              <p className="text-sm text-gray-900">{hairdresser.experience || 'Non spécifiée'}</p>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-1">
              <Star className="h-4 w-4 text-yellow-400 fill-current" />
              <span className="text-sm font-medium">{hairdresser.rating || 0}/5</span>
            </div>
            
            {!hasAccount && (
              <Button
                onClick={() => handleCreateAccount(hairdresser)}
                className="bg-gold-500 hover:bg-gold-600 text-white"
                size="sm"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Créer compte
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Tableau de bord Admin</h1>
      <h2 className="text-2xl font-semibold mb-4">Gestion des Coiffeurs</h2>

      {loadingHairdressers ? (
        <div className="text-center">Chargement des coiffeurs...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {hairdressers.map(renderHairdresserCard)}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
