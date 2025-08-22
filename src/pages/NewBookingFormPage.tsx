import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useRoleAuth } from '@/hooks/useRoleAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { RealTimeAvailability } from '@/components/RealTimeAvailability';
import { 
  ArrowLeft, 
  User, 
  Search, 
  Clock,
  Calendar as CalendarIcon,
  Check,
  Star,
  Scissors,
  Euro,
  ArrowRight
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import PageHeader from '@/components/PageHeader';

interface Professional {
  id: string;
  auth_id: string;
  full_name: string;
  avatar_url?: string;
  role: 'coiffeur' | 'coiffeuse' | 'cosmetique';
  rating: number;
  specialties?: string[];
}

interface Service {
  id: string;
  name: string;
  description?: string;
  price: number;
  duration: number;
  category?: string;
}

interface BookingFormData {
  nom: string;
  prenom: string;
  email: string;
  telephone?: string;
}

const NewBookingFormPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const expertId = searchParams.get('expert');
  const { userProfile, isAuthenticated } = useRoleAuth();
  const { toast } = useToast();

  const [currentStep, setCurrentStep] = useState(1);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedProfessional, setSelectedProfessional] = useState<Professional | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [formData, setFormData] = useState<BookingFormData>({
    nom: '',
    prenom: '',
    email: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'coiffeur' | 'coiffeuse' | 'cosmetique' | 'all'>('all');

  // 🔎 1. Chargement initial - Récupérer la liste des professionnels actifs
  const loadProfessionals = async () => {
    try {
      console.log('🔍 Chargement des professionnels...');
      
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, full_name, avatar_url, role')
        .in('role', ['coiffeur', 'coiffeuse', 'cosmetique']);

      if (profilesError) throw profilesError;

      if (profilesData) {
        const userIds = profilesData.map(p => p.user_id);
        const { data: hairdressersData } = await supabase
          .from('hairdressers')
          .select('auth_id, rating, specialties')
          .in('auth_id', userIds)
          .eq('is_active', true);

        const professionalsWithData = profilesData
          .map(p => {
            const hairdresserData = hairdressersData?.find(h => h.auth_id === p.user_id);
            if (!hairdresserData) return null;
            
            return {
              id: p.user_id,
              auth_id: p.user_id,
              full_name: p.full_name || 'Professionnel',
              avatar_url: p.avatar_url,
              role: p.role as 'coiffeur' | 'coiffeuse' | 'cosmetique',
              rating: hairdresserData.rating || 5.0,
              specialties: hairdresserData.specialties || []
            };
          })
          .filter(Boolean) as Professional[];

        setProfessionals(professionalsWithData);
        console.log('✅ Professionnels chargés:', professionalsWithData.length);

        // Si un expert ID est fourni, le sélectionner automatiquement
        if (expertId) {
          const expert = professionalsWithData.find(p => p.auth_id === expertId);
          if (expert) {
            setSelectedProfessional(expert);
            setCurrentStep(2);
            await loadServices(expert.auth_id);
          }
        }
      }
    } catch (error) {
      console.error('❌ Erreur chargement professionnels:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger la liste des professionnels",
        variant: "destructive"
      });
    }
  };

  // Récupérer les services offerts par chaque professionnel
  const loadServices = async (professionalId: string) => {
    try {
      console.log('🔍 Chargement des services pour:', professionalId);
      
      const { data: hairdresserData } = await supabase
        .from('hairdressers')
        .select('id')
        .eq('auth_id', professionalId)
        .eq('is_active', true)
        .single();

      if (!hairdresserData) {
        setServices([]);
        return;
      }
      
      const { data, error } = await supabase
        .from('hairdresser_services')
        .select(`
          services (
            id,
            name,
            description,
            price,
            duration,
            category
          )
        `)
        .eq('hairdresser_id', hairdresserData.id);

      if (error) throw error;

      const servicesList = data?.map((item: any) => item.services).filter(Boolean) || [];
      setServices(servicesList);
      console.log('✅ Services chargés:', servicesList.length);
    } catch (error) {
      console.error('❌ Erreur chargement services:', error);
      setServices([]);
    }
  };

  // Gérer la sélection du professionnel
  const handleProfessionalSelection = async (professional: Professional) => {
    setSelectedProfessional(professional);
    setSelectedService(null);
    setSelectedTime('');
    await loadServices(professional.auth_id);
  };

  // Gérer la sélection depuis RealTimeAvailability
  const handleTimeSelection = (date: Date, time: string) => {
    setSelectedDate(date);
    setSelectedTime(time);
  };

  // Finaliser la réservation
  const handleBookingSubmit = async () => {
    if (!selectedProfessional || !selectedDate || !selectedTime) {
      toast({
        title: "Informations manquantes",
        description: "Veuillez compléter tous les champs requis",
        variant: "destructive"
      });
      return;
    }

    if (!formData.nom || !formData.prenom || !formData.email) {
      toast({
        title: "Informations personnelles manquantes",
        description: "Veuillez renseigner vos nom, prénom et email",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const [hours, minutes] = selectedTime.split(':').map(Number);
      const scheduledAt = new Date(selectedDate);
      scheduledAt.setHours(hours, minutes, 0, 0);

      // Si l'utilisateur est connecté, utiliser son ID
      const clientUserId = isAuthenticated && userProfile?.user_id 
        ? userProfile.user_id 
        : null;

      const reservationData = {
        client_user_id: clientUserId,
        stylist_user_id: selectedProfessional.auth_id,
        service_id: selectedService?.id || null,
        scheduled_at: scheduledAt.toISOString(),
        status: 'pending' as const,
        notes: `Client: ${formData.prenom} ${formData.nom} - Email: ${formData.email}${formData.telephone ? ` - Tél: ${formData.telephone}` : ''}`
      };

      console.log('🔄 Création de la réservation:', reservationData);

      const { error } = await supabase
        .from('new_reservations')
        .insert(reservationData);

      if (error) throw error;

      toast({
        title: "Réservation créée avec succès !",
        description: `Votre rendez-vous avec ${selectedProfessional.full_name} a été demandé pour le ${format(selectedDate, 'EEEE d MMMM yyyy', { locale: fr })} à ${selectedTime}.`,
      });

      console.log('✅ Réservation créée avec succès');

      // Rediriger selon le statut d'authentification
      if (isAuthenticated) {
        navigate('/app/bookings');
      } else {
        navigate('/auth?message=reservation-created');
      }
    } catch (error: any) {
      console.error('❌ Erreur création réservation:', error);
      
      // Gestion spécifique de l'erreur de rate limiting
      if (error.message?.includes('Trop de réservations créées récemment')) {
        toast({
          title: "Limitation temporaire",
          description: "Vous avez créé plusieurs réservations récemment. Veuillez attendre quelques minutes avant de réessayer.",
          variant: "destructive"
        });
        return;
      }
      
      toast({
        title: "Erreur",
        description: "Impossible de créer la réservation. Veuillez réessayer.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Initialisation
  useEffect(() => {
    loadProfessionals();
  }, []);

  // Pré-remplir le formulaire si l'utilisateur est connecté
  useEffect(() => {
    if (isAuthenticated && userProfile) {
      const fullName = userProfile.full_name || '';
      const nameParts = fullName.split(' ');
      setFormData(prev => ({
        ...prev,
        prenom: nameParts[0] || '',
        nom: nameParts.slice(1).join(' ') || '',
        email: userProfile.user_id ? '' : '' // L'email n'est pas dans le profil
      }));
    }
  }, [isAuthenticated, userProfile]);

  const filteredProfessionals = professionals.filter(professional => {
    const matchesSearch = professional.full_name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || professional.role === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const canProceedToNext = () => {
    switch (currentStep) {
      case 1: return selectedProfessional !== null;
      case 2: return services.length === 0 || selectedService !== null;
      case 3: return selectedDate && selectedTime;
      case 4: return formData.nom && formData.prenom && formData.email;
      default: return false;
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">🧑 Choisir un professionnel</h2>
              <p className="text-muted-foreground">Sélectionnez le professionnel de votre choix</p>
            </div>

            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher un professionnel..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="flex gap-2 flex-wrap justify-center">
                <Button
                  variant={selectedCategory === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory('all')}
                >
                  Tous
                </Button>
                <Button
                  variant={selectedCategory === 'coiffeur' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory('coiffeur')}
                  className={selectedCategory === 'coiffeur' ? '' : 'border-blue-500 text-blue-500 hover:bg-blue-50'}
                >
                  Coiffeurs
                </Button>
                <Button
                  variant={selectedCategory === 'coiffeuse' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory('coiffeuse')}
                  className={selectedCategory === 'coiffeuse' ? '' : 'border-pink-500 text-pink-500 hover:bg-pink-50'}
                >
                  Coiffeuses
                </Button>
                <Button
                  variant={selectedCategory === 'cosmetique' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory('cosmetique')}
                  className={selectedCategory === 'cosmetique' ? '' : 'border-purple-500 text-purple-500 hover:bg-purple-50'}
                >
                  Cosmétique
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
              {filteredProfessionals.map((professional) => (
                <Card 
                  key={professional.id}
                  className={cn(
                    "cursor-pointer transition-all hover:shadow-lg hover:scale-105",
                    selectedProfessional?.id === professional.id && "ring-2 ring-primary bg-primary/5"
                  )}
                  onClick={() => handleProfessionalSelection(professional)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={professional.avatar_url} />
                        <AvatarFallback>
                          {professional.full_name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h3 className="font-medium">{professional.full_name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge 
                            variant="secondary" 
                            className={cn(
                              "text-xs",
                              professional.role === 'coiffeur' && "bg-blue-100 text-blue-800",
                              professional.role === 'coiffeuse' && "bg-pink-100 text-pink-800",
                              professional.role === 'cosmetique' && "bg-purple-100 text-purple-800"
                            )}
                          >
                            {professional.role === 'coiffeur' ? 'Coiffeur' : 
                             professional.role === 'coiffeuse' ? 'Coiffeuse' : 
                             'Cosmétique'}
                          </Badge>
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 text-yellow-400 fill-current" />
                            <span className="text-xs text-muted-foreground">
                              {professional.rating.toFixed(1)}
                            </span>
                          </div>
                        </div>
                      </div>
                      {selectedProfessional?.id === professional.id && (
                        <Check className="h-5 w-5 text-primary" />
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            {selectedProfessional && (
              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={selectedProfessional.avatar_url} />
                      <AvatarFallback>
                        {selectedProfessional.full_name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-medium">{selectedProfessional.full_name}</h3>
                      <Badge variant="outline" className="text-xs">
                        {selectedProfessional.role === 'coiffeur' ? 'Coiffeur' : 
                         selectedProfessional.role === 'coiffeuse' ? 'Coiffeuse' : 
                         'Cosmétique'}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">✂️ Choisir un service</h2>
              <p className="text-muted-foreground">Sélectionnez le service souhaité</p>
            </div>

            <div className="grid grid-cols-1 gap-4 max-h-96 overflow-y-auto">
              {services.length === 0 ? (
                <Card className="border-dashed">
                  <CardContent className="p-6 text-center">
                    <Scissors className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground mb-2">
                      Ce professionnel n'a pas encore configuré de services spécifiques.
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Vous pouvez continuer pour un service général.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                services.map((service) => (
                  <Card 
                    key={service.id}
                    className={cn(
                      "cursor-pointer transition-all hover:shadow-lg hover:scale-105",
                      selectedService?.id === service.id && "ring-2 ring-primary bg-primary/5"
                    )}
                    onClick={() => setSelectedService(service)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium">{service.name}</h3>
                          {service.description && (
                            <p className="text-sm text-muted-foreground mt-1">{service.description}</p>
                          )}
                          <div className="flex gap-2 mt-2">
                            <Badge variant="secondary" className="flex items-center gap-1 text-xs">
                              <Euro className="h-3 w-3" />
                              {service.price}€
                            </Badge>
                            <Badge variant="secondary" className="flex items-center gap-1 text-xs">
                              <Clock className="h-3 w-3" />
                              {service.duration} min
                            </Badge>
                          </div>
                        </div>
                        {selectedService?.id === service.id && (
                          <Check className="h-5 w-5 text-primary" />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">📆 Choisir la date et l'heure</h2>
              <p className="text-muted-foreground">Sélectionnez votre créneau préféré</p>
            </div>

            {selectedProfessional && (
              <div>
                <RealTimeAvailability 
                  stylistId={selectedProfessional.auth_id}
                  showControls={false}
                  onTimeSelection={(date, time) => {
                    setSelectedDate(date);
                    setSelectedTime(time);
                  }}
                />
              </div>
            )}
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">🧾 Vos informations</h2>
              <p className="text-muted-foreground">Complétez vos coordonnées pour finaliser la réservation</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="prenom">Prénom *</Label>
                <Input
                  id="prenom"
                  value={formData.prenom}
                  onChange={(e) => setFormData(prev => ({ ...prev, prenom: e.target.value }))}
                  placeholder="Votre prénom"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nom">Nom *</Label>
                <Input
                  id="nom"
                  value={formData.nom}
                  onChange={(e) => setFormData(prev => ({ ...prev, nom: e.target.value }))}
                  placeholder="Votre nom"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="votre.email@exemple.com"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="telephone">Téléphone (optionnel)</Label>
              <Input
                id="telephone"
                type="tel"
                value={formData.telephone || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, telephone: e.target.value }))}
                placeholder="Votre numéro de téléphone"
              />
            </div>

            {/* Résumé de la réservation */}
            <Card className="bg-muted/50">
              <CardHeader>
                <CardTitle className="text-lg">Résumé de votre réservation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Professionnel:</span>
                  <span className="font-medium">{selectedProfessional?.full_name}</span>
                </div>
                {selectedService && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Service:</span>
                    <span className="font-medium">{selectedService.name} - {selectedService.price}€</span>
                  </div>
                )}
                {selectedDate && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Date:</span>
                    <span className="font-medium">{format(selectedDate, 'EEEE d MMMM yyyy', { locale: fr })}</span>
                  </div>
                )}
                {selectedTime && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Heure:</span>
                    <span className="font-medium">{selectedTime}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        );
      
      default:
        return null;
    }
  };

  const stepTitles = [
    'Professionnel',
    'Service', 
    'Date & Heure',
    'Vos informations'
  ];

  return (
    <div className="min-h-screen bg-background">
      <PageHeader
        title="Réserver un rendez-vous"
        description="Prenez rendez-vous en quelques clics"
        showBackButton={true}
        breadcrumbs={[
          { label: 'Accueil', path: '/' },
          { label: 'Réserver maintenant' }
        ]}
      />

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {stepTitles.map((title, index) => (
              <div key={index} className="flex items-center">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                  index + 1 <= currentStep ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                )}>
                  {index + 1}
                </div>
                <span className="ml-2 text-sm font-medium hidden sm:block">{title}</span>
                {index < stepTitles.length - 1 && (
                  <div className={cn(
                    "w-12 h-0.5 mx-4",
                    index + 1 < currentStep ? "bg-primary" : "bg-muted"
                  )} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step content */}
        <Card>
          <CardContent className="p-6">
            {renderStepContent()}
          </CardContent>
        </Card>

        {/* Navigation buttons */}
        <div className="flex justify-between mt-6">
          <Button
            variant="outline"
            onClick={() => currentStep > 1 ? setCurrentStep(prev => prev - 1) : navigate(-1)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            {currentStep > 1 ? 'Précédent' : 'Retour'}
          </Button>

          {currentStep < 4 ? (
            <Button
              onClick={() => setCurrentStep(prev => prev + 1)}
              disabled={!canProceedToNext()}
              className="flex items-center gap-2"
            >
              Suivant
              <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={handleBookingSubmit}
              disabled={!canProceedToNext() || loading}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
            >
              {loading ? 'Création...' : 'Confirmer la réservation'}
              <Check className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default NewBookingFormPage;