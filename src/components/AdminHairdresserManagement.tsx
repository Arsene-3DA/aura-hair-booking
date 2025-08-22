import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { UserPlus, Edit, Trash2, Phone, Mail, MapPin, Star, Scissors } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Hairdresser {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  specialties: string[] | null;
  experience: string | null;
  location: string | null;
  gender: string | null;
  rating: number | null;
  is_active: boolean | null;
  image_url: string | null;
  auth_id: string | null;
  created_at: string;
  updated_at: string;
}

const AdminHairdresserManagement = () => {
  const [hairdressers, setHairdressers] = useState<Hairdresser[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingHairdresser, setEditingHairdresser] = useState<Hairdresser | null>(null);
  const { toast } = useToast();

  const [newHairdresserData, setNewHairdresserData] = useState({
    name: '',
    email: '',
    phone: '',
    specialties: '',
    experience: '',
    location: '',
    gender: '',
    is_active: true,
    image_url: ''
  });

  const fetchHairdressers = async () => {
    try {
      const { data, error } = await supabase
        .from('hairdressers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setHairdressers(data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des coiffeurs:', error);
      toast({
        title: "❌ Erreur",
        description: "Impossible de charger les coiffeurs",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHairdressers();
  }, []);

  const handleCreateHairdresser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { error } = await supabase
        .from('hairdressers')
        .insert([{
          name: newHairdresserData.name,
          email: newHairdresserData.email,
          phone: newHairdresserData.phone || null,
          specialties: newHairdresserData.specialties 
            ? newHairdresserData.specialties.split(',').map(s => s.trim())
            : null,
          experience: newHairdresserData.experience || null,
          location: newHairdresserData.location || null,
          gender: newHairdresserData.gender || null,
          is_active: newHairdresserData.is_active,
          image_url: newHairdresserData.image_url || null,
          rating: 0.0
        }]);

      if (error) throw error;

      toast({
        title: "✅ Succès",
        description: "Coiffeur créé avec succès"
      });

      setNewHairdresserData({
        name: '',
        email: '',
        phone: '',
        specialties: '',
        experience: '',
        location: '',
        gender: '',
        is_active: true,
        image_url: ''
      });
      setIsCreateModalOpen(false);
      fetchHairdressers();
    } catch (error) {
      console.error('Erreur lors de la création:', error);
      toast({
        title: "❌ Erreur",
        description: "Impossible de créer le coiffeur",
        variant: "destructive"
      });
    }
  };

  const handleUpdateHairdresser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingHairdresser) return;

    try {
      const { error } = await supabase
        .from('hairdressers')
        .update({
          name: editingHairdresser.name,
          email: editingHairdresser.email,
          phone: editingHairdresser.phone,
          specialties: editingHairdresser.specialties,
          experience: editingHairdresser.experience,
          location: editingHairdresser.location,
          gender: editingHairdresser.gender,
          is_active: editingHairdresser.is_active,
          image_url: editingHairdresser.image_url
        })
        .eq('id', editingHairdresser.id);

      if (error) throw error;

      toast({
        title: "✅ Succès",
        description: "Coiffeur mis à jour avec succès"
      });

      setEditingHairdresser(null);
      fetchHairdressers();
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      toast({
        title: "❌ Erreur",
        description: "Impossible de mettre à jour le coiffeur",
        variant: "destructive"
      });
    }
  };

  const handleDeleteHairdresser = async (id: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce coiffeur ?')) return;

    try {
      const { error } = await supabase
        .from('hairdressers')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "✅ Succès",
        description: "Coiffeur supprimé avec succès"
      });

      fetchHairdressers();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      toast({
        title: "❌ Erreur",
        description: "Impossible de supprimer le coiffeur",
        variant: "destructive"
      });
    }
  };

  const handleToggleActive = async (hairdresser: Hairdresser) => {
    try {
      const { error } = await supabase
        .from('hairdressers')
        .update({ is_active: !hairdresser.is_active })
        .eq('id', hairdresser.id);

      if (error) throw error;

      toast({
        title: "✅ Succès",
        description: `Coiffeur ${hairdresser.is_active ? 'désactivé' : 'activé'} avec succès`
      });

      fetchHairdressers();
    } catch (error) {
      console.error('Erreur lors du changement de statut:', error);
      toast({
        title: "❌ Erreur",
        description: "Impossible de changer le statut",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold-500 mx-auto mb-4"></div>
        <p className="text-gray-600">Chargement des coiffeurs...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold">Gestion des Coiffeurs</h2>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">Gérez les profils des coiffeurs du salon</p>
        </div>
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gold-500 hover:bg-gold-600">
              <UserPlus className="h-4 w-4 mr-2" />
              Nouveau Coiffeur
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Créer un nouveau coiffeur</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateHairdresser} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nom complet *</Label>
                  <Input
                    id="name"
                    value={newHairdresserData.name}
                    onChange={(e) => setNewHairdresserData({...newHairdresserData, name: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newHairdresserData.email}
                    onChange={(e) => setNewHairdresserData({...newHairdresserData, email: e.target.value})}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">Téléphone</Label>
                  <Input
                    id="phone"
                    value={newHairdresserData.phone}
                    onChange={(e) => setNewHairdresserData({...newHairdresserData, phone: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="gender">Genre</Label>
                  <Select value={newHairdresserData.gender} onValueChange={(value) => setNewHairdresserData({...newHairdresserData, gender: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Homme</SelectItem>
                      <SelectItem value="female">Femme</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="location">Localisation</Label>
                <Input
                  id="location"
                  value={newHairdresserData.location}
                  onChange={(e) => setNewHairdresserData({...newHairdresserData, location: e.target.value})}
                  placeholder="ex: Ottawa, Ontario"
                />
              </div>
              <div>
                <Label htmlFor="specialties">Spécialités (séparées par des virgules)</Label>
                <Input
                  id="specialties"
                  value={newHairdresserData.specialties}
                  onChange={(e) => setNewHairdresserData({...newHairdresserData, specialties: e.target.value})}
                  placeholder="ex: Coupe, Coloration, Permanente"
                />
              </div>
              <div>
                <Label htmlFor="experience">Expérience</Label>
                <Textarea
                  id="experience"
                  value={newHairdresserData.experience}
                  onChange={(e) => setNewHairdresserData({...newHairdresserData, experience: e.target.value})}
                  placeholder="Description de l'expérience..."
                />
              </div>
              <div>
                <Label htmlFor="image_url">URL de l'image</Label>
                <Input
                  id="image_url"
                  value={newHairdresserData.image_url}
                  onChange={(e) => setNewHairdresserData({...newHairdresserData, image_url: e.target.value})}
                  placeholder="https://..."
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={newHairdresserData.is_active}
                  onCheckedChange={(checked) => setNewHairdresserData({...newHairdresserData, is_active: checked})}
                />
                <Label htmlFor="is_active">Actif</Label>
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

      <div className="grid gap-4">
        {hairdressers.map((hairdresser) => (
          <Card key={hairdresser.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-3 sm:p-4 lg:p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex items-start space-x-3 sm:space-x-4 flex-1 min-w-0">
                  <Avatar className="h-12 w-12 sm:h-14 sm:w-14 lg:h-16 lg:w-16 flex-shrink-0">
                    <AvatarImage src={hairdresser.image_url || undefined} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      <Scissors className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                      <h3 className="font-semibold text-base sm:text-lg truncate">{hairdresser.name}</h3>
                      <div className="flex flex-wrap gap-1">
                        <Badge variant={hairdresser.is_active ? "default" : "secondary"} className="text-xs">
                          {hairdresser.is_active ? "Actif" : "Inactif"}
                        </Badge>
                        {hairdresser.rating !== null && (
                          <Badge variant="outline" className="text-yellow-600 text-xs">
                            <Star className="h-3 w-3 mr-1" />
                            {hairdresser.rating.toFixed(1)}
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="space-y-1 text-xs sm:text-sm text-muted-foreground">
                      <div className="flex items-center space-x-2">
                        <Mail className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                        <span className="truncate">{hairdresser.email}</span>
                      </div>
                      {hairdresser.phone && (
                        <div className="flex items-center space-x-2">
                          <Phone className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                          <span className="truncate">{hairdresser.phone}</span>
                        </div>
                      )}
                      {hairdresser.location && (
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                          <span className="truncate">{hairdresser.location}</span>
                        </div>
                      )}
                    </div>

                    {hairdresser.specialties && hairdresser.specialties.length > 0 && (
                      <div className="mt-2 sm:mt-3">
                        <p className="text-xs sm:text-sm font-medium mb-1">Spécialités:</p>
                        <div className="flex flex-wrap gap-1">
                          {hairdresser.specialties.slice(0, 3).map((specialty, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {specialty}
                            </Badge>
                          ))}
                          {hairdresser.specialties.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{hairdresser.specialties.length - 3}
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}

                    {hairdresser.experience && (
                      <div className="mt-2 sm:mt-3 sm:hidden lg:block">
                        <p className="text-xs sm:text-sm font-medium mb-1">Expérience:</p>
                        <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">{hairdresser.experience}</p>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex flex-row sm:flex-col gap-2 self-start">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingHairdresser(hairdresser)}
                    className="flex-1 sm:flex-none"
                  >
                    <Edit className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
                    <span className="hidden sm:inline">Modifier</span>
                  </Button>
                  <Button
                    variant={hairdresser.is_active ? "secondary" : "default"}
                    size="sm"
                    onClick={() => handleToggleActive(hairdresser)}
                    className="flex-1 sm:flex-none text-xs"
                  >
                    {hairdresser.is_active ? "Désactiver" : "Activer"}
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteHairdresser(hairdresser.id)}
                    className="flex-1 sm:flex-none"
                  >
                    <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
                    <span className="hidden sm:inline">Supprimer</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {hairdressers.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <Scissors className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Aucun coiffeur trouvé</p>
              <p className="text-sm text-gray-500 mt-2">
                Créez votre premier coiffeur en cliquant sur "Nouveau Coiffeur"
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Modal d'édition */}
      <Dialog open={!!editingHairdresser} onOpenChange={() => setEditingHairdresser(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Modifier le coiffeur</DialogTitle>
          </DialogHeader>
          {editingHairdresser && (
            <form onSubmit={handleUpdateHairdresser} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-name">Nom complet *</Label>
                  <Input
                    id="edit-name"
                    value={editingHairdresser.name}
                    onChange={(e) => setEditingHairdresser({...editingHairdresser, name: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="edit-email">Email *</Label>
                  <Input
                    id="edit-email"
                    type="email"
                    value={editingHairdresser.email}
                    onChange={(e) => setEditingHairdresser({...editingHairdresser, email: e.target.value})}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-phone">Téléphone</Label>
                  <Input
                    id="edit-phone"
                    value={editingHairdresser.phone || ''}
                    onChange={(e) => setEditingHairdresser({...editingHairdresser, phone: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-gender">Genre</Label>
                  <Select value={editingHairdresser.gender || ''} onValueChange={(value) => setEditingHairdresser({...editingHairdresser, gender: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Homme</SelectItem>
                      <SelectItem value="female">Femme</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="edit-location">Localisation</Label>
                <Input
                  id="edit-location"
                  value={editingHairdresser.location || ''}
                  onChange={(e) => setEditingHairdresser({...editingHairdresser, location: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="edit-specialties">Spécialités (séparées par des virgules)</Label>
                <Input
                  id="edit-specialties"
                  value={editingHairdresser.specialties?.join(', ') || ''}
                  onChange={(e) => setEditingHairdresser({
                    ...editingHairdresser, 
                    specialties: e.target.value.split(',').map(s => s.trim())
                  })}
                />
              </div>
              <div>
                <Label htmlFor="edit-experience">Expérience</Label>
                <Textarea
                  id="edit-experience"
                  value={editingHairdresser.experience || ''}
                  onChange={(e) => setEditingHairdresser({...editingHairdresser, experience: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="edit-image_url">URL de l'image</Label>
                <Input
                  id="edit-image_url"
                  value={editingHairdresser.image_url || ''}
                  onChange={(e) => setEditingHairdresser({...editingHairdresser, image_url: e.target.value})}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="edit-is_active"
                  checked={editingHairdresser.is_active || false}
                  onCheckedChange={(checked) => setEditingHairdresser({...editingHairdresser, is_active: checked})}
                />
                <Label htmlFor="edit-is_active">Actif</Label>
              </div>
              <div className="flex gap-2">
                <Button type="submit" className="flex-1">Sauvegarder</Button>
                <Button type="button" variant="outline" onClick={() => setEditingHairdresser(null)}>
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

export default AdminHairdresserManagement;