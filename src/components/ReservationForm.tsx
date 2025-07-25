import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, Phone, Mail, Scissors, Clock } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import BookingCalendar from './BookingCalendar';

interface ReservationFormProps {
  hairdresserId: string;
  hairdresserName: string;
  onSuccess: () => void;
}

interface Service {
  id: string;
  name: string;
  price: number;
  duration: number;
  category: string;
}

const ReservationForm = ({ hairdresserId, hairdresserName, onSuccess }: ReservationFormProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [availableServices, setAvailableServices] = useState<Service[]>([]);
  const [loadingServices, setLoadingServices] = useState(true);
  
  const [formData, setFormData] = useState({
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    service: '',
    date: '',
    time: '',
    notes: ''
  });

  // Charger les services disponibles pour ce coiffeur
  useEffect(() => {
    const fetchHairdresserServices = async () => {
      try {
        setLoadingServices(true);
        
        const { data, error } = await (supabase as any)
          .from('hairdresser_services')
          .select(`
            services (
              id,
              name,
              price,
              duration,
              category
            )
          `)
          .eq('hairdresser_id', hairdresserId);

        if (error) {
          console.error('Erreur lors du chargement des services:', error);
          // Services par défaut en cas d'erreur
          const defaultServices: Service[] = [
            { id: '1', name: 'Coupe Classique', price: 40, duration: 45, category: 'Coupe' },
            { id: '2', name: 'Coupe + Brushing', price: 55, duration: 60, category: 'Coupe' },
            { id: '3', name: 'Coloration', price: 80, duration: 90, category: 'Couleur' },
            { id: '4', name: 'Mèches', price: 65, duration: 75, category: 'Couleur' },
            { id: '5', name: 'Soin Capillaire', price: 35, duration: 30, category: 'Soin' }
          ];
          setAvailableServices(defaultServices);
          return;
        }

        // Extraire les services de la réponse
        const servicesList = data?.map((item: any) => item.services).filter(Boolean) || [];
        setAvailableServices(servicesList);
      } catch (error) {
        console.error('Erreur:', error);
        // Services par défaut en cas d'erreur
        const defaultServices: Service[] = [
          { id: '1', name: 'Coupe Classique', price: 40, duration: 45, category: 'Coupe' },
          { id: '2', name: 'Coupe + Brushing', price: 55, duration: 60, category: 'Coupe' },
          { id: '3', name: 'Coloration', price: 80, duration: 90, category: 'Couleur' }
        ];
        setAvailableServices(defaultServices);
      } finally {
        setLoadingServices(false);
      }
    };

    fetchHairdresserServices();
  }, [hairdresserId]);

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
          scheduled_at: `${formData.date}T${formData.time}:00`,
          comments: formData.notes || null,
          status: 'pending'
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

  const handleTimeSlotSelect = (date: string, time: string) => {
    setFormData(prev => ({
      ...prev,
      date,
      time
    }));
  };

  const getSelectedServiceDetails = () => {
    const selectedService = availableServices.find(service => service.name === formData.service);
    return selectedService;
  };

  return (
    <div className="space-y-8">
      {/* Informations client */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-xl">
            <User className="h-5 w-5 mr-2" />
            Vos informations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
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
                  placeholder="(613) 555-0123"
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
          </form>
        </CardContent>
      </Card>

      {/* Service demandé */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-xl">
            <Scissors className="h-5 w-5 mr-2" />
            Service demandé
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loadingServices ? (
            <div className="flex items-center space-x-2 py-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gold-500"></div>
              <span className="text-sm text-gray-600">Chargement des services...</span>
            </div>
          ) : (
            <Select 
              value={formData.service} 
              onValueChange={(value) => handleInputChange('service', value)}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choisissez un service" />
              </SelectTrigger>
              <SelectContent>
                {availableServices.map((service) => (
                  <SelectItem key={service.id} value={service.name}>
                    <div className="flex flex-col">
                      <span className="font-medium">{service.name}</span>
                      <span className="text-sm text-gray-500">
                        {service.price}$ CAD • {service.duration} min • {service.category}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          
          {/* Afficher les détails du service sélectionné */}
          {formData.service && getSelectedServiceDetails() && (
            <div className="mt-2 p-3 bg-gold-50 rounded-lg border border-gold-200">
              <div className="flex items-center justify-between">
                <span className="font-medium text-gold-800">{getSelectedServiceDetails()?.name}</span>
                <span className="text-gold-600 font-semibold">{getSelectedServiceDetails()?.price}$ CAD</span>
              </div>
              <div className="flex items-center text-sm text-gold-600 mt-1">
                <Clock className="h-3 w-3 mr-1" />
                Durée estimée: {getSelectedServiceDetails()?.duration} minutes
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Calendrier de réservation */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">
            Choisissez votre créneau
          </CardTitle>
        </CardHeader>
        <CardContent>
          <BookingCalendar
            hairdresserId={hairdresserId}
            onTimeSlotSelect={handleTimeSlotSelect}
            selectedDate={formData.date}
            selectedTime={formData.time}
          />
        </CardContent>
      </Card>

      {/* Notes */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">
            Notes particulières
          </CardTitle>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>

      {/* Bouton de soumission */}
      <Card>
        <CardContent className="pt-6">
          <Button 
            onClick={handleSubmit}
            className="w-full bg-gradient-gold text-white py-3 text-lg"
            disabled={loading || !formData.service || !formData.date || !formData.time}
          >
            {loading ? "Envoi en cours..." : "Confirmer la réservation"}
          </Button>
          
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>ℹ️ Information :</strong> Votre demande sera envoyée directement au coiffeur. 
              Vous recevrez une confirmation par email une fois votre réservation validée.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReservationForm;
