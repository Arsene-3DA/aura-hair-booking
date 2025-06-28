
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Clock, User, Phone, Mail, MessageSquare } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface ReservationFormProps {
  hairdresserId: string;
  hairdresserName: string;
  onSuccess?: () => void;
}

const services = [
  'Coupe Femme',
  'Coupe Homme',
  'Couleur',
  'Mèches',
  'Brushing',
  'Soins',
  'Barbe',
  'Coiffage Mariage'
];

const timeSlots = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '14:00', '14:30', '15:00', '15:30',
  '16:00', '16:30', '17:00', '17:30', '18:00', '18:30'
];

const ReservationForm = ({ hairdresserId, hairdresserName, onSuccess }: ReservationFormProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    client_name: user?.first_name || '',
    client_email: user?.email || '',
    client_phone: user?.phone || '',
    service: '',
    booking_date: '',
    booking_time: '',
    comments: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Créer l'expiration (2 heures après la création)
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 2);

      const { error } = await supabase
        .from('bookings')
        .insert({
          hairdresser_id: hairdresserId,
          client_name: formData.client_name,
          client_email: formData.client_email,
          client_phone: formData.client_phone,
          service: formData.service,
          booking_date: formData.booking_date,
          booking_time: formData.booking_time,
          comments: formData.comments || null,
          status: 'en_attente',
          expires_at: expiresAt.toISOString()
        });

      if (error) {
        console.error('Erreur lors de la réservation:', error);
        throw error;
      }

      toast({
        title: "✅ Réservation envoyée !",
        description: `Votre demande a été envoyée à ${hairdresserName}. Vous recevrez une confirmation sous peu.`
      });

      // Réinitialiser le formulaire
      setFormData({
        ...formData,
        service: '',
        booking_date: '',
        booking_time: '',
        comments: ''
      });

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      toast({
        title: "❌ Erreur",
        description: "Impossible d'envoyer votre réservation. Veuillez réessayer.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = formData.client_name && formData.client_email && formData.client_phone && 
                     formData.service && formData.booking_date && formData.booking_time;

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center bg-gradient-to-r from-gold-50 to-orange-50">
        <CardTitle className="text-2xl font-bold gradient-text">
          Réserver avec {hairdresserName}
        </CardTitle>
        <p className="text-gray-600">Remplissez les informations ci-dessous pour votre rendez-vous</p>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informations client */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center">
              <User className="h-5 w-5 mr-2 text-gold-500" />
              Vos informations
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="client_name">Nom complet *</Label>
                <Input
                  id="client_name"
                  value={formData.client_name}
                  onChange={(e) => setFormData({...formData, client_name: e.target.value})}
                  placeholder="Votre nom complet"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="client_phone">Téléphone *</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="client_phone"
                    type="tel"
                    value={formData.client_phone}
                    onChange={(e) => setFormData({...formData, client_phone: e.target.value})}
                    placeholder="06 12 34 56 78"
                    className="pl-10"
                    required
                  />
                </div>
              </div>
            </div>
            
            <div>
              <Label htmlFor="client_email">Email *</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="client_email"
                  type="email"
                  value={formData.client_email}
                  onChange={(e) => setFormData({...formData, client_email: e.target.value})}
                  placeholder="votre@email.com"
                  className="pl-10"
                  required
                />
              </div>
            </div>
          </div>

          {/* Détails de la réservation */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-gold-500" />
              Détails du rendez-vous
            </h3>
            
            <div>
              <Label htmlFor="service">Service souhaité *</Label>
              <Select value={formData.service} onValueChange={(value) => setFormData({...formData, service: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Choisissez un service" />
                </SelectTrigger>
                <SelectContent>
                  {services.map((service) => (
                    <SelectItem key={service} value={service}>
                      {service}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="booking_date">Date souhaitée *</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="booking_date"
                    type="date"
                    value={formData.booking_date}
                    onChange={(e) => setFormData({...formData, booking_date: e.target.value})}
                    min={new Date().toISOString().split('T')[0]}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="booking_time">Heure souhaitée *</Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Select value={formData.booking_time} onValueChange={(value) => setFormData({...formData, booking_time: value})}>
                    <SelectTrigger className="pl-10">
                      <SelectValue placeholder="Choisissez l'heure" />
                    </SelectTrigger>
                    <SelectContent>
                      {timeSlots.map((time) => (
                        <SelectItem key={time} value={time}>
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>

          {/* Commentaires */}
          <div>
            <Label htmlFor="comments">Commentaires (optionnel)</Label>
            <div className="relative">
              <MessageSquare className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Textarea
                id="comments"
                value={formData.comments}
                onChange={(e) => setFormData({...formData, comments: e.target.value})}
                placeholder="Précisions sur votre demande, préférences particulières..."
                className="pl-10 min-h-[80px]"
              />
            </div>
          </div>

          {/* Bouton de soumission */}
          <div className="pt-4">
            <Button
              type="submit"
              disabled={!isFormValid || isSubmitting}
              className="w-full bg-gradient-gold text-white py-3 text-lg font-semibold"
            >
              {isSubmitting ? "Envoi en cours..." : "Envoyer ma demande"}
            </Button>
            <p className="text-sm text-gray-500 text-center mt-2">
              Votre demande sera envoyée au coiffeur qui vous confirmera le rendez-vous
            </p>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ReservationForm;
