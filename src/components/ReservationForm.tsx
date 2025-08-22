import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, Phone, Mail, Scissors, Clock, AlertTriangle } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useRoleAuth } from '@/hooks/useRoleAuth';
import { validateEmail, validateFrenchPhone, validateName, sanitizeInput } from '@/utils/validation';
import { convertFrenchTimeToStandard } from '@/utils/timeFormatter';
import BookingCalendar from './BookingCalendar';
import BookingHelp from './BookingHelp';
import GuestBookingInfo from './GuestBookingInfo';
import PriceDisplay from '@/components/ui/price-display';

interface ReservationFormProps {
  hairdresserId: string;
  hairdresserName: string;
  onSuccess: () => void;
  preselectedService?: string;
}

interface Service {
  id: string;
  name: string;
  price: number;
  duration: number;
  category: string;
}

const ReservationForm = ({ hairdresserId, hairdresserName, onSuccess, preselectedService }: ReservationFormProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user } = useRoleAuth();
  const [loading, setLoading] = useState(false);
  const [availableServices, setAvailableServices] = useState<Service[]>([]);
  const [loadingServices, setLoadingServices] = useState(true);
  
  const [formData, setFormData] = useState({
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    service: preselectedService || '',
    serviceId: '',
    date: '',
    time: '',
    notes: ''
  });

  const [validationErrors, setValidationErrors] = useState({
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    notes: ''
  });

  // Key pour localStorage basé sur le coiffeur et l'URL actuelle
  const storageKey = `reservation_form_${hairdresserId}_${window.location.pathname}`;

  // Restaurer les données du formulaire depuis localStorage
  useEffect(() => {
    const savedData = localStorage.getItem(storageKey);
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        setFormData(prev => ({
          ...prev,
          ...parsedData,
          service: preselectedService || parsedData.service || '',
        }));
        
        // Nettoyer les données sauvegardées après restauration
        localStorage.removeItem(storageKey);
      } catch (error) {
        console.error('Erreur lors de la restauration des données:', error);
      }
    }
  }, [storageKey, preselectedService]);

  // Sauvegarder les données du formulaire
  const saveFormData = () => {
    localStorage.setItem(storageKey, JSON.stringify(formData));
  };

  // Charger les services disponibles pour ce coiffeur
  useEffect(() => {
    const fetchHairdresserServices = async () => {
      try {
        setLoadingServices(true);
        
        // D'abord récupérer l'ID du hairdresser basé sur auth_id
        const { data: hairdresserData, error: hairdresserError } = await supabase
          .from('hairdressers')
          .select('id')
          .eq('auth_id', hairdresserId)
          .single();

        if (hairdresserError || !hairdresserData) {
          console.error('Coiffeur non trouvé:', hairdresserError);
          setAvailableServices([]);
          return;
        }
        
        // Ensuite récupérer les services pour ce coiffeur
        const { data, error } = await supabase
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
          .eq('hairdresser_id', hairdresserData.id);

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
        
        // Pré-sélectionner le service si spécifié
        if (preselectedService && servicesList.length > 0) {
          const matchingService = servicesList.find((service: Service) => 
            service.name.toLowerCase().includes(preselectedService.toLowerCase())
          );
          if (matchingService) {
            setFormData(prev => ({ 
              ...prev, 
              service: matchingService.name,
              serviceId: matchingService.id 
            }));
          }
        }
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

    // Écouter les changements en temps réel pour les services du coiffeur
    const channel = supabase
      .channel('hairdresser-services-changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Écouter tous les changements (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'hairdresser_services'
        },
        () => {
          // Recharger les services quand il y a un changement
          fetchHairdresserServices();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'services'
        },
        () => {
          // Recharger aussi si les services sont modifiés
          fetchHairdresserServices();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [hairdresserId, preselectedService]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    console.log('🚀 Début de la soumission avec données:', {
      formData,
      hairdresserId,
      isGuestBooking: !isAuthenticated || !user,
      user: !!user
    });

    try {
      // Validation des champs obligatoires
      if (!formData.clientName.trim() || !formData.clientEmail.trim() || !formData.date || !formData.time) {
        toast({
          title: "Erreur",
          description: "Veuillez remplir tous les champs obligatoires.",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }

      // Permettre les réservations d'invités (pas besoin d'être connecté)
      const isGuestBooking = !isAuthenticated || !user;

      // Validation : si des services existent pour ce pro, un service doit être sélectionné
      if (availableServices.length > 0 && !formData.service) {
        toast({
          title: "Service requis",
          description: "Veuillez choisir un service avant de confirmer.",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }

      // Récupérer l'ID du hairdresser pour utiliser la nouvelle fonction
      const { data: hairdresserData, error: hairdresserError } = await supabase
        .from('hairdressers')
        .select('id')
        .eq('auth_id', hairdresserId)
        .single();

      if (hairdresserError || !hairdresserData) {
        console.error('Coiffeur non trouvé:', hairdresserError);
        toast({
          title: "Erreur",
          description: "Professionnel non trouvé.",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }

      // Validation et création de la date complète
      if (!formData.date || !formData.time) {
        toast({
          title: "Erreur",
          description: "Date et heure obligatoires.",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }

      // Créer la date complète avec validation
      // Convertir le format français "10h00" vers "10:00" pour la création de la date
      const standardTime = convertFrenchTimeToStandard(formData.time);
      const timeFormatted = standardTime.includes(':') ? 
        (standardTime.split(':').length === 2 ? `${standardTime}:00` : standardTime) : 
        `${standardTime}:00`;
      const dateTimeString = `${formData.date}T${timeFormatted}`;
      const localDateTime = new Date(dateTimeString);
      
      // Vérifier que la date est valide
      if (isNaN(localDateTime.getTime())) {
        console.error('❌ Date invalide:', { date: formData.date, time: formData.time, dateTimeString });
        toast({
          title: "Erreur",
          description: "Date ou heure invalide. Veuillez vérifier vos sélections.",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }

      console.log('✅ Date créée:', { dateTimeString, localDateTime: localDateTime.toISOString() });
      
      let data, error;
      
      if (isGuestBooking) {
        // Utiliser la fonction pour invités
        const result = await supabase.rpc('create_guest_booking', {
          p_hairdresser_id: hairdresserData.id,
          p_client_name: formData.clientName,
          p_client_email: formData.clientEmail,
          p_client_phone: formData.clientPhone,
          p_scheduled_datetime: localDateTime.toISOString(),
          p_service_id: formData.serviceId || null,
          p_notes: formData.notes || null
        });
        
        data = result.data;
        error = result.error;
      } else {
        // Utiliser la fonction pour utilisateurs connectés
        const result = await supabase.rpc('create_booking_by_hairdresser_id', {
          hairdresser_id: hairdresserData.id,
          client_name: formData.clientName,
          client_email: formData.clientEmail,
          client_phone: formData.clientPhone,
          service_id: formData.serviceId || null,
          scheduled_datetime: localDateTime.toISOString(),
          notes: formData.notes || null
        });
        
        data = result.data;
        error = result.error;
      }

      console.log('📊 Résultat de la réservation:', { data, error });

      if (error) {
        console.error('❌ Erreur lors de la réservation:', error);
        toast({
          title: "Erreur",
          description: `Impossible de créer la réservation: ${error.message}`,
          variant: "destructive"
        });
        return;
      }

      const result = data as any;
      if (!result?.success) {
        toast({
          title: "Erreur",
          description: result?.error || "Impossible de créer la réservation",
          variant: "destructive"
        });
        return;
      }

      // Nettoyer les données sauvegardées en cas de succès
      localStorage.removeItem(storageKey);

      toast({
        title: "✅ Réservation créée",
        description: isGuestBooking 
          ? `Votre demande de réservation chez ${hairdresserName} a été envoyée ! Vous recevrez une confirmation par email.`
          : `Votre demande de réservation chez ${hairdresserName} a été envoyée !`
      });

      // Pour les invités, rediriger vers la page d'accueil avec un message de succès
      if (isGuestBooking) {
        setTimeout(() => {
          navigate('/', { 
            state: { 
              reservationSuccess: true,
              message: 'Réservation créée avec succès ! Vous recevrez une confirmation par email.'
            } 
          });
        }, 1500);
      } else {
        onSuccess();
      }

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

  // SECURITY FIX: Enhanced input validation with XSS protection
  const validateInput = (field: string, value: string): string => {
    let error = '';
    
    switch (field) {
      case 'clientName':
        if (!value.trim()) {
          error = 'Le nom est requis';
        } else if (!validateName(value)) {
          error = 'Le nom doit contenir uniquement des lettres, espaces, traits d\'union et apostrophes';
        } else if (value.length < 2) {
          error = 'Le nom doit contenir au moins 2 caractères';
        } else if (value.length > 100) {
          error = 'Le nom ne peut pas dépasser 100 caractères';
        }
        break;
        
      case 'clientEmail':
        if (!value.trim()) {
          error = 'L\'email est requis';
        } else if (!validateEmail(value)) {
          error = 'Format d\'email invalide';
        }
        break;
        
      case 'clientPhone':
        if (!value.trim()) {
          error = 'Le téléphone est requis';
        } else if (!validateFrenchPhone(value)) {
          error = 'Format de téléphone invalide (ex: 613-555-0123)';
        }
        break;
        
      case 'notes':
        if (value.length > 500) {
          error = 'Les notes ne peuvent pas dépasser 500 caractères';
        }
        // Check for potential XSS patterns
        const suspiciousPatterns = /<script|javascript:|onclick|onerror|onload/i;
        if (suspiciousPatterns.test(value)) {
          error = 'Contenu non autorisé détecté';
        }
        break;
    }
    
    return error;
  };

  const handleInputChange = (field: string, value: string) => {
    // Sanitize input first with special handling for notes
    const sanitizedValue = field === 'notes' ? sanitizeInput(value, true) : sanitizeInput(value);
    
    // Validate the input
    const error = validateInput(field, sanitizedValue);
    
    // Update form data
    setFormData(prev => ({
      ...prev,
      [field]: sanitizedValue
    }));
    
    // Update validation errors
    setValidationErrors(prev => ({
      ...prev,
      [field]: error
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

  const isFormValid = () => {
    const hasRequiredFields = formData.clientName && 
                              formData.clientEmail && 
                              formData.clientPhone && 
                              formData.date && 
                              formData.time;
    
    // Si des services existent pour ce pro, en sélectionner un est obligatoire
    if (availableServices.length > 0) {
      return hasRequiredFields && formData.service;
    }
    
    // Si aucun service spécifique, les champs de base suffisent
    return hasRequiredFields;
  };

  return (
    <div className="space-y-8">
      {/* Informations pour les invités */}
      {!isAuthenticated && <GuestBookingInfo />}
      
      {/* Guide d'aide */}
      <BookingHelp />
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
                  className={validationErrors.clientName ? 'border-red-500' : ''}
                />
                {validationErrors.clientName && (
                  <div className="flex items-center gap-1 mt-1 text-sm text-red-600">
                    <AlertTriangle className="h-3 w-3" />
                    {validationErrors.clientName}
                  </div>
                )}
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
                  className={validationErrors.clientPhone ? 'border-red-500' : ''}
                />
                {validationErrors.clientPhone && (
                  <div className="flex items-center gap-1 mt-1 text-sm text-red-600">
                    <AlertTriangle className="h-3 w-3" />
                    {validationErrors.clientPhone}
                  </div>
                )}
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
                className={validationErrors.clientEmail ? 'border-red-500' : ''}
              />
              {validationErrors.clientEmail && (
                <div className="flex items-center gap-1 mt-1 text-sm text-red-600">
                  <AlertTriangle className="h-3 w-3" />
                  {validationErrors.clientEmail}
                </div>
              )}
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
              onValueChange={(value) => {
                const selectedService = availableServices.find(s => s.name === value);
                setFormData(prev => ({
                  ...prev,
                  service: value,
                  serviceId: selectedService?.id || ''
                }));
              }}
              disabled={loading}
            >
              <SelectTrigger className="min-h-[2.75rem] w-full">
                <SelectValue placeholder="Choisissez un service" className="text-left truncate" />
              </SelectTrigger>
              <SelectContent>
              {availableServices.length > 0 ? (
                availableServices.map((service) => (
                  <SelectItem key={service.id} value={service.name}>
                    <div className="flex flex-col">
                      <span className="font-medium">{service.name}</span>
                       <span className="text-sm text-gray-500">
                        <PriceDisplay amount={service.price} size="sm" /> • {service.duration} min • {service.category}
                       </span>
                    </div>
                  </SelectItem>
                ))
              ) : (
                <>
                  <SelectItem value="Coupe de cheveux">Coupe de cheveux</SelectItem>
                  <SelectItem value="Coloration">Coloration</SelectItem>
                  <SelectItem value="Mèches">Mèches</SelectItem>
                  <SelectItem value="Brushing">Brushing</SelectItem>
                  <SelectItem value="Soin capillaire">Soin capillaire</SelectItem>
                  <SelectItem value="Autre service">Autre service (à préciser en notes)</SelectItem>
                </>
              )}
              </SelectContent>
            </Select>
          )}
          
          {/* Message si aucun service spécifique disponible */}
          {!loadingServices && availableServices.length === 0 && (
            <div className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800">
                ℹ️ Services génériques disponibles. Vous pouvez préciser vos besoins spécifiques dans les notes ci-dessous.
              </p>
            </div>
          )}
          
          {/* Afficher les détails du service sélectionné */}
          {formData.service && getSelectedServiceDetails() && (
            <div className="mt-2 p-3 bg-gold-50 rounded-lg border border-gold-200">
              <div className="flex items-center justify-between">
                <span className="font-medium text-gold-800">{getSelectedServiceDetails()?.name}</span>
                <PriceDisplay 
                  amount={getSelectedServiceDetails()?.price} 
                  className="text-gold-600 font-semibold" 
                  size="md"
                />
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
          <p className="text-sm text-gray-600 mt-2">
            💡 Sélectionnez d'abord une date sur le calendrier, puis choisissez un horaire disponible
          </p>
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
            placeholder="Précisez vos souhaits, allergies, etc.&#10;Vous pouvez utiliser plusieurs lignes et des espaces."
            disabled={loading}
            rows={4}
            className={`resize-none ${validationErrors.notes ? 'border-red-500' : ''}`}
            style={{ whiteSpace: 'pre-wrap' }}
          />
          {validationErrors.notes && (
            <div className="flex items-center gap-1 mt-1 text-sm text-red-600">
              <AlertTriangle className="h-3 w-3" />
              {validationErrors.notes}
            </div>
          )}
          <div className="mt-1 text-xs text-gray-500">
            {formData.notes.length}/500 caractères
          </div>
        </CardContent>
      </Card>

      {/* Bouton de soumission */}
      <Card>
        <CardContent className="pt-6">
          <Button 
            onClick={handleSubmit}
            className="w-full bg-gradient-gold text-white py-3 text-lg"
            disabled={loading || !isFormValid()}
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
