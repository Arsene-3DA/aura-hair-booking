import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Mail, Send, CheckCircle, Phone, MapPin, Clock, Scissors } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

const contactSchema = z.object({
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  email: z.string().email('Veuillez saisir une adresse email valide'),
  message: z.string().min(10, 'Le message doit contenir au moins 10 caractères'),
});

type ContactForm = z.infer<typeof contactSchema>;

const ContactPage = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ContactForm>({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = async (data: ContactForm) => {
    setIsSubmitting(true);
    
    try {
      // Simulation d'envoi d'email - À remplacer par votre edge function
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setIsSubmitted(true);
      toast({
        title: "Message envoyé !",
        description: "Merci pour votre message, nous vous répondrons bientôt !",
        duration: 5000,
      });
      
      reset();
      
      // Reset confirmation après 5 secondes
      setTimeout(() => {
        setIsSubmitted(false);
      }, 5000);
      
    } catch (error) {
      toast({
        title: "Erreur d'envoi",
        description: "Une erreur est survenue lors de l'envoi. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-luxury-gold-50 to-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-luxury-black to-luxury-charcoal text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center mb-6">
            <div className="p-3 rounded-xl bg-gradient-gold mr-4">
              <Scissors className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-5xl font-bold gradient-text">Tchiix</h1>
          </div>
          <h2 className="text-3xl font-light mb-4">Contactez-nous</h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Une question, une réservation ou besoin de conseils ? 
            Notre équipe est là pour vous accompagner.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-7xl mx-auto">
          
          {/* Left Side - Visual & Info */}
          <div className="space-y-8">
            {/* Image Section */}
            <div className="relative rounded-2xl overflow-hidden shadow-luxury h-96">
              <div className="absolute inset-0 bg-gradient-to-br from-luxury-gold-400 via-luxury-gold-500 to-luxury-gold-600">
                <div className="absolute inset-0 bg-black/30"></div>
                <img 
                  src="/lovable-uploads/dfda7518-5719-4fad-9e89-8f721fdfbab7.png" 
                  alt="Tchiix - Univers coiffure" 
                  className="w-full h-full object-cover mix-blend-overlay"
                />
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-white">
                  <Scissors className="h-16 w-16 mx-auto mb-4 drop-shadow-lg" />
                  <h3 className="text-2xl font-bold mb-2">Tchiix</h3>
                  <p className="text-lg font-light">L'excellence coiffure</p>
                </div>
              </div>
            </div>

            {/* Contact Info Cards */}
            <div className="space-y-6">
              <Card className="luxury-card">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="p-3 rounded-xl bg-gradient-gold">
                      <Phone className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-luxury-black mb-1">Téléphone</h3>
                      <a 
                        href="tel:+18736555275" 
                        className="text-luxury-gold-600 hover:text-luxury-gold-700 transition-colors"
                      >
                        +1 (873) 655-5275
                      </a>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="luxury-card">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="p-3 rounded-xl bg-gradient-gold">
                      <Mail className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-luxury-black mb-1">Email</h3>
                      <a 
                        href="mailto:tchix3da@gmail.com" 
                        className="text-luxury-gold-600 hover:text-luxury-gold-700 transition-colors"
                      >
                        tchix3da@gmail.com
                      </a>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="luxury-card">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="p-3 rounded-xl bg-gradient-gold">
                      <MapPin className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-luxury-black mb-1">Localisation</h3>
                      <p className="text-gray-600">Canada</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="luxury-card">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="p-3 rounded-xl bg-gradient-gold">
                      <Clock className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-luxury-black mb-1">Horaires</h3>
                      <div className="space-y-1 text-sm text-gray-600">
                        <p>Lundi - Samedi: 9h - 21h</p>
                        <p>Dimanche: Fermé</p>
                        <p className="text-luxury-gold-600 font-medium">Réservation 24h/24</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Right Side - Contact Form */}
          <div>
            <Card className="luxury-card shadow-2xl">
              <CardHeader className="pb-6">
                <CardTitle className="text-2xl font-bold text-center text-luxury-black">
                  Envoyez-nous un message
                </CardTitle>
                <Separator className="bg-gradient-gold h-1 rounded-full" />
              </CardHeader>

              <CardContent className="p-8">
                {isSubmitted ? (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <CheckCircle className="h-12 w-12 text-green-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-luxury-black mb-4">
                      Merci pour votre message !
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Nous vous répondrons dans les plus brefs délais.
                    </p>
                    <Button
                      onClick={() => setIsSubmitted(false)}
                      variant="outline"
                      className="border-luxury-gold-400 text-luxury-gold-600 hover:bg-luxury-gold-50"
                    >
                      Envoyer un autre message
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-luxury-black font-medium">
                        Nom complet <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="name"
                        {...register('name')}
                        placeholder="Votre nom complet"
                        className={`transition-all duration-200 ${
                          errors.name 
                            ? 'border-red-500 focus:ring-red-500' 
                            : 'border-gray-300 focus:ring-luxury-gold-500 focus:border-luxury-gold-500'
                        }`}
                        disabled={isSubmitting}
                      />
                      {errors.name && (
                        <p className="text-red-500 text-sm">{errors.name.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-luxury-black font-medium">
                        Adresse e-mail <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        {...register('email')}
                        placeholder="votre@email.com"
                        className={`transition-all duration-200 ${
                          errors.email 
                            ? 'border-red-500 focus:ring-red-500' 
                            : 'border-gray-300 focus:ring-luxury-gold-500 focus:border-luxury-gold-500'
                        }`}
                        disabled={isSubmitting}
                      />
                      {errors.email && (
                        <p className="text-red-500 text-sm">{errors.email.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message" className="text-luxury-black font-medium">
                        Message <span className="text-red-500">*</span>
                      </Label>
                      <Textarea
                        id="message"
                        {...register('message')}
                        placeholder="Décrivez votre demande, vos besoins ou posez votre question..."
                        className={`min-h-32 resize-none transition-all duration-200 ${
                          errors.message 
                            ? 'border-red-500 focus:ring-red-500' 
                            : 'border-gray-300 focus:ring-luxury-gold-500 focus:border-luxury-gold-500'
                        }`}
                        disabled={isSubmitting}
                      />
                      {errors.message && (
                        <p className="text-red-500 text-sm">{errors.message.message}</p>
                      )}
                    </div>

                    <div className="pt-4">
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full luxury-button bg-gradient-gold text-luxury-black hover:shadow-luxury transition-all duration-300 font-semibold py-6 text-lg"
                      >
                        {isSubmitting ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                            Envoi en cours...
                          </>
                        ) : (
                          <>
                            <Send className="h-5 w-5 mr-2" />
                            Envoyer le message
                          </>
                        )}
                      </Button>
                    </div>

                    <p className="text-xs text-gray-500 text-center">
                      En envoyant ce formulaire, vous acceptez que nous traitions vos données 
                      pour répondre à votre demande.
                    </p>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Additional Info Section */}
        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-luxury-gold-100 to-luxury-gold-200 rounded-2xl p-8 max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-luxury-black mb-4">
              Pourquoi choisir Tchiix ?
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-gold rounded-full flex items-center justify-center mx-auto mb-3">
                  <Scissors className="h-6 w-6 text-white" />
                </div>
                <h4 className="font-semibold text-luxury-black mb-2">Expertise</h4>
                <p className="text-gray-700">Professionnels qualifiés et expérimentés</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-gold rounded-full flex items-center justify-center mx-auto mb-3">
                  <Clock className="h-6 w-6 text-white" />
                </div>
                <h4 className="font-semibold text-luxury-black mb-2">Flexibilité</h4>
                <p className="text-gray-700">Réservation en ligne 24h/24</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-gold rounded-full flex items-center justify-center mx-auto mb-3">
                  <CheckCircle className="h-6 w-6 text-white" />
                </div>
                <h4 className="font-semibold text-luxury-black mb-2">Qualité</h4>
                <p className="text-gray-700">Produits premium et service personnalisé</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;