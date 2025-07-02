
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, User, Phone, Mail } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';

interface ReservationFormProps {
  hairdresserId: string;
  hairdresserName: string;
  onSuccess: () => void;
}

const ReservationForm = ({ hairdresserId, hairdresserName, onSuccess }: ReservationFormProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    service: '',
    date: '',
    time: '',
    notes: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('bookings')
        .insert({
          hairdresser_id: hairdresserId,
          client_name: formData.clientName,
          client_email: formData.clientEmail,
          client_phone: formData.clientPhone,
          service: formData.service,
          booking_date: formData.date,
          booking_time: formData.time,
          comments: formData.notes || null,
          status: 'en_attente'
        });

      if (error) {
        console.error('Erreur lors de la réservation:', error);
        toast({
          title: "Erreur",
          description: "Impossible de créer la réservation. Veuillez réessayer.",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "✅ Réservation créée",
        description: `Votre demande de réservation chez ${hairdresserName} a été envoyée !`
      });

      onSuccess();
    } catch (error) {
      console.error('Erreur:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue. Veuillez réessayer.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center text-2xl">
          <Calendar className="h-6 w-6 mr-2" />
          Réserver avec {hairdresserName}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informations client */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="clientName" className="flex items-center">
                <User className="h-4 w-4 mr-2" />
                Nom complet *
              </Label>
              <Input
                id="clientName"
                value={formData.clientName}
                onChange={(e) => handleInputChange('clientName', e.target.value)}
                placeholder="Votre nom complet"
                required
                disabled={loading}
              />
            </div>
            
            <div>
              <Label htmlFor="clientPhone" className="flex items-center">
                <Phone className="h-4 w-4 mr-2" />
                Téléphone *
              </Label>
              <Input
                id="clientPhone"
                type="tel"
                value={formData.clientPhone}
                onChange={(e) => handleInputChange('clientPhone', e.target.value)}
                placeholder="06 12 34 56 78"
                required
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="clientEmail" className="flex items-center">
              <Mail className="h-4 w-4 mr-2" />
              Email *
            </Label>
            <Input
              id="clientEmail"
              type="email"
              value={formData.clientEmail}
              onChange={(e) => handleInputChange('clientEmail', e.target.value)}
              placeholder="votre@email.com"
              required
              disabled={loading}
            />
          </div>

          {/* Service demandé */}
          <div>
            <Label htmlFor="service">
              Service demandé *
            </Label>
            <Input
              id="service"
              value={formData.service}
              onChange={(e) => handleInputChange('service', e.target.value)}
              placeholder="Ex: Coupe + Brushing, Coloration, etc."
              required
              disabled={loading}
            />
          </div>

          {/* Date et heure */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="date" className="flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                Date souhaitée *
              </Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => handleInputChange('date', e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                required
                disabled={loading}
              />
            </div>
            
            <div>
              <Label htmlFor="time" className="flex items-center">
                <Clock className="h-4 w-4 mr-2" />
                Heure souhaitée *
              </Label>
              <Input
                id="time"
                type="time"
                value={formData.time}
                onChange={(e) => handleInputChange('time', e.target.value)}
                required
                disabled={loading}
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <Label htmlFor="notes">
              Notes ou demandes particulières
            </Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Précisez vos souhaits, allergies, etc."
              disabled={loading}
              rows={3}
            />
          </div>

          <Button 
            type="submit" 
            className="w-full bg-gradient-gold text-white py-3 text-lg"
            disabled={loading}
          >
            {loading ? "Envoi en cours..." : "Envoyer la demande de réservation"}
          </Button>
        </form>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>ℹ️ Information :</strong> Votre demande sera envoyée directement au coiffeur. 
            Vous recevrez une confirmation par email une fois votre réservation validée.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReservationForm;
