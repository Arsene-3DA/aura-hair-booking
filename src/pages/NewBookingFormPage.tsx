import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Calendar, Clock, User, MessageSquare } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useRoleAuth } from '@/hooks/useRoleAuth';

const bookingSchema = z.object({
  service: z.string().optional(),
  service_id: z.string().optional(),
  scheduled_at: z.string().min(1, 'Veuillez sélectionner une date et heure'),
  comments: z.string().optional()
});

type BookingFormData = z.infer<typeof bookingSchema>;

interface ExpertData {
  id: string;
  name: string;
  image_url: string;
  auth_id: string;
  services: Array<{
    id: string;
    name: string;
    price: number;
    duration: number;
  }>;
}

const NewBookingFormPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const expertId = searchParams.get('expert');
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useRoleAuth();

  const form = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      service: '',
      scheduled_at: '',
      comments: ''
    }
  });

  // Récupérer les données de l'expert
  const { data: expert, isLoading: expertLoading } = useQuery({
    queryKey: ['expert-booking', expertId],
    queryFn: async () => {
      if (!expertId) throw new Error('ID expert manquant');

      const { data: expertData, error } = await supabase
        .from('hairdressers')
        .select(`
          id,
          auth_id,
          name,
          image_url
        `)
        .eq('auth_id', expertId)
        .eq('is_active', true)
        .single();

      if (error) throw error;

      // Récupérer les services
      const { data: servicesData } = await supabase
        .from('hairdresser_services')
        .select(`
          services (
            id,
            name,
            price,
            duration
          )
        `)
        .eq('hairdresser_id', expertData.auth_id);

      const services = servicesData?.map(item => item.services).filter(Boolean) || [];

      return {
        id: expertData.id,
        name: expertData.name,
        image_url: expertData.image_url || '/placeholder.svg',
        auth_id: expertData.auth_id,
        services
      } as ExpertData;
    },
    enabled: !!expertId
  });

  // Mutation pour créer une réservation
  const createBookingMutation = useMutation({
    mutationFn: async (data: BookingFormData) => {
      if (!user?.id || !expertId) {
        throw new Error('Utilisateur ou expert non défini');
      }

      // Validation : si des services existent pour ce pro, un service doit être sélectionné
      if (expert?.services && expert.services.length > 0 && !data.service) {
        throw new Error('service_required');
      }

      const selectedService = expert?.services?.find(s => s.name === data.service);

      const { error } = await supabase
        .from('bookings')
        .insert({
          client_id: user.id,
          stylist_id: expertId,
          service: data.service || null,
          service_id: selectedService?.id || null,
          scheduled_at: data.scheduled_at,
          comments: data.comments || null,
          status: 'pending',
          // Champs requis pour la compatibilité
          client_name: user.email?.split('@')[0] || 'Client',
          client_email: user.email,
          client_phone: '', // À améliorer avec un profil utilisateur complet
          hairdresser_id: expertId,
          booking_date: data.scheduled_at.split('T')[0],
          booking_time: data.scheduled_at.split('T')[1]
        });

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Demande envoyée !",
        description: "Votre demande de rendez-vous a été envoyée avec succès. Le professionnel vous confirmera sous peu.",
      });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      navigate('/app/bookings');
    },
    onError: (error: any) => {
      console.error('Erreur lors de la création:', error);
      const errorMessage = error.message === 'service_required' 
        ? 'Veuillez choisir un service avant de confirmer.'
        : 'Impossible d\'envoyer votre demande. Veuillez réessayer.';
      
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive",
      });
    }
  });

  // Générer les créneaux horaires (exemple simple)
  const generateTimeSlots = () => {
    const slots = [];
    const today = new Date();
    for (let day = 1; day <= 14; day++) {
      const date = new Date(today);
      date.setDate(today.getDate() + day);
      
      // Créneaux de 9h à 18h
      for (let hour = 9; hour <= 18; hour++) {
        if (hour === 12 || hour === 13) continue; // Pause déjeuner
        
        const dateTime = new Date(date);
        dateTime.setHours(hour, 0, 0, 0);
        
        // Format ISO pour l'input datetime-local
        const isoString = dateTime.toISOString().slice(0, 16);
        
        // Format d'affichage
        const displayDate = date.toLocaleDateString('fr-FR', { 
          weekday: 'long', 
          day: 'numeric', 
          month: 'long' 
        });
        const displayTime = `${hour.toString().padStart(2, '0')}:00`;
        
        slots.push({
          value: isoString,
          label: `${displayDate} à ${displayTime}`
        });
      }
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  const onSubmit = (data: BookingFormData) => {
    // Validation côté client : si des services existent, un service doit être sélectionné
    if (expert?.services && expert.services.length > 0 && !data.service) {
      toast({
        title: "Service requis",
        description: "Veuillez choisir un service avant de confirmer.",
        variant: "destructive"
      });
      return;
    }
    
    createBookingMutation.mutate(data);
  };

  if (!expertId) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Expert non spécifié</h2>
          <Button onClick={() => navigate('/experts')}>
            Choisir un expert
          </Button>
        </div>
      </div>
    );
  }

  if (expertLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!expert) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Expert non trouvé</h2>
          <Button onClick={() => navigate('/experts')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour aux experts
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Button 
        variant="outline" 
        onClick={() => navigate(`/experts/${expertId}`)}
        className="mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Retour au profil
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Résumé de l'expert */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Votre expert
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <Avatar className="h-20 w-20 mx-auto mb-4">
                <AvatarImage src={expert.image_url} alt={expert.name} />
                <AvatarFallback>
                  {expert.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <h3 className="font-semibold text-lg">{expert.name}</h3>
              {expert.services.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm text-muted-foreground mb-2">Services disponibles:</p>
                  <div className="flex flex-wrap gap-1 justify-center">
                    {expert.services.slice(0, 3).map((service) => (
                      <Badge key={service.id} variant="outline" className="text-xs">
                        {service.name}
                      </Badge>
                    ))}
                    {expert.services.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{expert.services.length - 3}
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Formulaire de réservation */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Réserver un rendez-vous
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="service"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Service souhaité</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionnez un service" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {expert.services.length > 0 ? (
                              expert.services.map((service) => (
                                <SelectItem key={service.id} value={service.name}>
                                  {service.name} - {service.price}€ ({service.duration}min)
                                </SelectItem>
                              ))
                            ) : (
                              <>
                                <SelectItem value="coupe">Coupe de cheveux</SelectItem>
                                <SelectItem value="couleur">Coloration</SelectItem>
                                <SelectItem value="meches">Mèches</SelectItem>
                                <SelectItem value="brushing">Brushing</SelectItem>
                                <SelectItem value="soin">Soin capillaire</SelectItem>
                              </>
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="scheduled_at"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date et heure</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Choisissez un créneau" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="max-h-[200px]">
                            {timeSlots.map((slot) => (
                              <SelectItem key={slot.value} value={slot.value}>
                                <div className="flex items-center gap-2">
                                  <Clock className="h-4 w-4" />
                                  {slot.label}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="comments"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Commentaires (optionnel)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Décrivez vos attentes, préférences particulières..."
                            className="resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex gap-4 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => navigate(`/experts/${expertId}`)}
                      className="flex-1"
                    >
                      Annuler
                    </Button>
                    <Button
                      type="submit"
                      disabled={createBookingMutation.isPending}
                      className="flex-1"
                    >
                      {createBookingMutation.isPending ? (
                        "Envoi en cours..."
                      ) : (
                        <>
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Envoyer la demande
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default NewBookingFormPage;