
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/hooks/use-toast";
import { useEffect } from 'react';

interface CreateCoiffeurModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Hairdresser {
  id: string;
  name: string;
  email: string;
}

const CreateCoiffeurModal = ({ isOpen, onClose }: CreateCoiffeurModalProps) => {
  const { createCoiffeurUser } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [hairdressers, setHairdressers] = useState<Hairdresser[]>([]);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    first_name: '',
    last_name: '',
    phone: '',
    hairdresser_id: ''
  });

  useEffect(() => {
    if (isOpen) {
      loadHairdressers();
    }
  }, [isOpen]);

  const loadHairdressers = async () => {
    try {
      const { data, error } = await supabase
        .from('hairdressers')
        .select('id, name, email')
        .eq('is_active', true);

      if (error) {
        console.error('Erreur lors du chargement des coiffeurs:', error);
        return;
      }

      // Filtrer les coiffeurs qui n'ont pas encore de compte utilisateur
      const { data: existingProfiles } = await supabase
        .from('coiffeur_profiles')
        .select('hairdresser_id');

      const existingHairdresserIds = existingProfiles?.map(p => p.hairdresser_id) || [];
      const availableHairdressers = data?.filter(h => !existingHairdresserIds.includes(h.id)) || [];

      setHairdressers(availableHairdressers);
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "❌ Erreur",
        description: "Les mots de passe ne correspondent pas",
        variant: "destructive"
      });
      return;
    }

    if (formData.password.length < 6) {
      toast({
        title: "❌ Erreur",
        description: "Le mot de passe doit contenir au moins 6 caractères",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);
      const result = await createCoiffeurUser({
        email: formData.email,
        password: formData.password,
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone: formData.phone,
        hairdresser_id: formData.hairdresser_id
      });

      if (result.success) {
        setFormData({
          email: '',
          password: '',
          confirmPassword: '',
          first_name: '',
          last_name: '',
          phone: '',
          hairdresser_id: ''
        });
        onClose();
        loadHairdressers(); // Recharger la liste
      }
    } catch (error) {
      console.error('Erreur lors de la création du compte:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Créer un compte coiffeur</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="hairdresser_id">Coiffeur</Label>
            <Select value={formData.hairdresser_id} onValueChange={(value) => setFormData({...formData, hairdresser_id: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un coiffeur" />
              </SelectTrigger>
              <SelectContent>
                {hairdressers.map((hairdresser) => (
                  <SelectItem key={hairdresser.id} value={hairdresser.id}>
                    {hairdresser.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              required
            />
          </div>

          <div>
            <Label htmlFor="first_name">Prénom</Label>
            <Input
              id="first_name"
              type="text"
              value={formData.first_name}
              onChange={(e) => setFormData({...formData, first_name: e.target.value})}
              required
            />
          </div>

          <div>
            <Label htmlFor="last_name">Nom (optionnel)</Label>
            <Input
              id="last_name"
              type="text"
              value={formData.last_name}
              onChange={(e) => setFormData({...formData, last_name: e.target.value})}
            />
          </div>

          <div>
            <Label htmlFor="phone">Téléphone (optionnel)</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
            />
          </div>

          <div>
            <Label htmlFor="password">Mot de passe</Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              required
              minLength={6}
            />
          </div>

          <div>
            <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
              required
              minLength={6}
            />
          </div>

          <div className="flex gap-2">
            <Button type="submit" className="flex-1 bg-gradient-gold text-white" disabled={loading}>
              {loading ? "Création..." : "Créer le compte"}
            </Button>
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Annuler
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateCoiffeurModal;
