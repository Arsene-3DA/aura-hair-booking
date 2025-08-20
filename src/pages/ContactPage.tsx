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
import { supabase } from '@/integrations/supabase/client';

const contactSchema = z.object({
  prenom: z.string().min(2, 'Le prénom doit contenir au moins 2 caractères'),
  nom: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  email: z.string().email('Veuillez saisir une adresse email valide'),
  sujet: z.string().min(3, 'Le sujet doit contenir au moins 3 caractères'),
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
      // Submit form securely via edge function
      const { data: response, error } = await supabase.functions.invoke('contact-form', {
        body: {
          name: `${data.prenom} ${data.nom}`.trim(),
          email: data.email.trim(),
          subject: data.sujet.trim(),
          message: data.message.trim(),
          to: 'tchix3da@gmail.com', // Specified redirect email
          csrf_token: Date.now().toString() // Simple CSRF token
        }
      });

      if (error) {
        console.error('Contact form error:', error);
        toast({
          title: "Erreur d'envoi",
          description: "Une erreur s'est produite. Veuillez réessayer.",
          variant: "destructive",
        });
        return;
      }

      if (!response?.success) {
        toast({
          title: "Erreur d'envoi",
          description: response?.error || "Une erreur s'est produite.",
          variant: "destructive",
        });
        return;
      }

      // Success
      setIsSubmitted(true);
      toast({
        title: "Message envoyé !",
        description: "Merci pour votre message. Nous vous répondrons dans les plus brefs délais.",
        duration: 5000,
      });
      
      reset();
      
      // Reset confirmation après 5 secondes
      setTimeout(() => {
        setIsSubmitted(false);
      }, 5000);
      
    } catch (error) {
      console.error('Contact form submission error:', error);
      toast({
        title: "Erreur d'envoi",
        description: "Une erreur s'est produite. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <div className="bg-black py-16 border-b border-[#FFD700]/20">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center mb-6">
            <div className="p-3 rounded-xl bg-[#FFD700] mr-4">
              <Scissors className="h-8 w-8 text-black" />
            </div>
            <h1 className="text-5xl font-bold text-[#FFD700]">Tchiix</h1>
          </div>
          <h2 className="text-3xl font-light mb-4 text-white">Contactez-nous</h2>
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
            <div className="relative rounded-2xl overflow-hidden h-96 border border-[#FFD700]/30">
              <div className="absolute inset-0 bg-gradient-to-br from-[#FFD700]/20 via-[#FFD700]/30 to-[#FFD700]/40">
                <div className="absolute inset-0 bg-black/40"></div>
                <img 
                  src="https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&h=600&fit=crop&crop=face"
                  alt="Tchiix - Salon de coiffure moderne" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-white">
                  <Scissors className="h-16 w-16 mx-auto mb-4 drop-shadow-lg text-[#FFD700]" />
                  <h3 className="text-2xl font-bold mb-2 text-[#FFD700]">Tchiix</h3>
                  <p className="text-lg font-light">L'excellence coiffure</p>
                </div>
              </div>
            </div>

            {/* Contact Info Cards */}
            <div className="space-y-6">
              <div className="bg-[#1a1a1a] rounded-2xl p-6 border border-[#FFD700]/30 hover:border-[#FFD700]/60 transition-all duration-300">
                <div className="flex items-start space-x-4">
                  <div className="p-3 rounded-xl bg-[#FFD700]">
                    <Phone className="h-5 w-5 text-black" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-1">📞 Téléphone</h3>
                    <a 
                      href="tel:+18736555275" 
                      className="text-[#FFD700] hover:text-[#FFD700]/80 transition-colors"
                    >
                      +1 (873) 655-5275
                    </a>
                  </div>
                </div>
              </div>

              <div className="bg-[#1a1a1a] rounded-2xl p-6 border border-[#FFD700]/30 hover:border-[#FFD700]/60 transition-all duration-300">
                <div className="flex items-start space-x-4">
                  <div className="p-3 rounded-xl bg-[#FFD700]">
                    <Mail className="h-5 w-5 text-black" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-1">✉️ Email</h3>
                    <a 
                      href="mailto:tchix3da@gmail.com" 
                      className="text-[#FFD700] hover:text-[#FFD700]/80 transition-colors"
                    >
                      tchix3da@gmail.com
                    </a>
                  </div>
                </div>
              </div>

              <div className="bg-[#1a1a1a] rounded-2xl p-6 border border-[#FFD700]/30 hover:border-[#FFD700]/60 transition-all duration-300">
                <div className="flex items-start space-x-4">
                  <div className="p-3 rounded-xl bg-[#FFD700]">
                    <MapPin className="h-5 w-5 text-black" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-1">📍 Localisation</h3>
                    <p className="text-gray-300">Canada</p>
                  </div>
                </div>
              </div>

              <div className="bg-[#1a1a1a] rounded-2xl p-6 border border-[#FFD700]/30 hover:border-[#FFD700]/60 transition-all duration-300">
                <div className="flex items-start space-x-4">
                  <div className="p-3 rounded-xl bg-[#FFD700]">
                    <Clock className="h-5 w-5 text-black" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-1">🕒 Horaires</h3>
                    <div className="space-y-1 text-sm text-gray-300">
                      <p>Lundi - Samedi: 9h - 21h</p>
                      <p>Dimanche: Fermé</p>
                      <p className="text-[#FFD700] font-medium">Réservation 24h/24</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Contact Form */}
          <div>
            <div className="bg-[#1a1a1a] rounded-2xl shadow-2xl border border-[#FFD700]/30">
              <div className="p-8 border-b border-[#FFD700]/20">
                <h2 className="text-2xl font-bold text-center text-white mb-4">
                  Envoyez-nous un message
                </h2>
                <div className="h-1 bg-[#FFD700] rounded-full mx-auto w-20"></div>
              </div>

              <div className="p-8">
                {isSubmitted ? (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 bg-[#FFD700]/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-[#FFD700]/30">
                      <CheckCircle className="h-12 w-12 text-[#FFD700]" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-4">
                      Merci pour votre message !
                    </h3>
                    <p className="text-gray-300 mb-6">
                      Merci pour votre message. Nous vous répondrons dans les plus brefs délais.
                    </p>
                    <Button
                      onClick={() => setIsSubmitted(false)}
                      className="bg-transparent border border-[#FFD700] text-[#FFD700] hover:bg-[#FFD700] hover:text-black transition-all duration-300"
                    >
                      Envoyer un autre message
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="prenom" className="text-white font-medium">
                          Prénom <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="prenom"
                          {...register('prenom')}
                          placeholder="Votre prénom"
                          className={`bg-black/50 border-[#FFD700]/30 text-white placeholder:text-gray-400 focus:border-[#FFD700] focus:ring-[#FFD700]/50 transition-all duration-200 ${
                            errors.prenom 
                              ? 'border-red-500 focus:ring-red-500' 
                              : ''
                          }`}
                          disabled={isSubmitting}
                        />
                        {errors.prenom && (
                          <p className="text-red-500 text-sm">{errors.prenom.message}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="nom" className="text-white font-medium">
                          Nom <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="nom"
                          {...register('nom')}
                          placeholder="Votre nom"
                          className={`bg-black/50 border-[#FFD700]/30 text-white placeholder:text-gray-400 focus:border-[#FFD700] focus:ring-[#FFD700]/50 transition-all duration-200 ${
                            errors.nom 
                              ? 'border-red-500 focus:ring-red-500' 
                              : ''
                          }`}
                          disabled={isSubmitting}
                        />
                        {errors.nom && (
                          <p className="text-red-500 text-sm">{errors.nom.message}</p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-white font-medium">
                        Adresse e-mail <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        {...register('email')}
                        placeholder="votre@email.com"
                        className={`bg-black/50 border-[#FFD700]/30 text-white placeholder:text-gray-400 focus:border-[#FFD700] focus:ring-[#FFD700]/50 transition-all duration-200 ${
                          errors.email 
                            ? 'border-red-500 focus:ring-red-500' 
                            : ''
                        }`}
                        disabled={isSubmitting}
                      />
                      {errors.email && (
                        <p className="text-red-500 text-sm">{errors.email.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="sujet" className="text-white font-medium">
                        Objet <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="sujet"
                        {...register('sujet')}
                        placeholder="Objet de votre message"
                        className={`bg-black/50 border-[#FFD700]/30 text-white placeholder:text-gray-400 focus:border-[#FFD700] focus:ring-[#FFD700]/50 transition-all duration-200 ${
                          errors.sujet 
                            ? 'border-red-500 focus:ring-red-500' 
                            : ''
                        }`}
                        disabled={isSubmitting}
                      />
                      {errors.sujet && (
                        <p className="text-red-500 text-sm">{errors.sujet.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message" className="text-white font-medium">
                        Message <span className="text-red-500">*</span>
                      </Label>
                      <Textarea
                        id="message"
                        {...register('message')}
                        placeholder="Décrivez votre demande, vos besoins ou posez votre question..."
                        className={`min-h-32 resize-none bg-black/50 border-[#FFD700]/30 text-white placeholder:text-gray-400 focus:border-[#FFD700] focus:ring-[#FFD700]/50 transition-all duration-200 ${
                          errors.message 
                            ? 'border-red-500 focus:ring-red-500' 
                            : ''
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
                        className="w-full bg-[#FFD700] text-black hover:bg-[#FFD700]/90 hover:shadow-lg hover:shadow-[#FFD700]/20 transition-all duration-300 font-semibold py-6 text-lg"
                      >
                        {isSubmitting ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black mr-2"></div>
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

                    <p className="text-xs text-gray-400 text-center">
                      En envoyant ce formulaire, vous acceptez que nous traitions vos données 
                      pour répondre à votre demande.
                    </p>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Additional Info Section */}
        <div className="mt-16 text-center">
          <div className="bg-[#1a1a1a] border border-[#FFD700]/30 rounded-2xl p-8 max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-[#FFD700] mb-4">
              Pourquoi choisir Tchiix ?
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
              <div className="text-center">
                <div className="w-12 h-12 bg-[#FFD700] rounded-full flex items-center justify-center mx-auto mb-3">
                  <Scissors className="h-6 w-6 text-black" />
                </div>
                <h4 className="font-semibold text-white mb-2">Expertise</h4>
                <p className="text-gray-300">Professionnels qualifiés et expérimentés</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-[#FFD700] rounded-full flex items-center justify-center mx-auto mb-3">
                  <Clock className="h-6 w-6 text-black" />
                </div>
                <h4 className="font-semibold text-white mb-2">Flexibilité</h4>
                <p className="text-gray-300">Réservation en ligne 24h/24</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-[#FFD700] rounded-full flex items-center justify-center mx-auto mb-3">
                  <CheckCircle className="h-6 w-6 text-black" />
                </div>
                <h4 className="font-semibold text-white mb-2">Qualité</h4>
                <p className="text-gray-300">Produits premium et service personnalisé</p>
              </div>
            </div>
            
            {/* Social Icons */}
            <div className="flex justify-center gap-4 mt-8">
              <a href="#" className="w-10 h-10 bg-[#FFD700] rounded-full flex items-center justify-center text-black hover:bg-[#FFD700]/90 hover:shadow-lg hover:shadow-[#FFD700]/20 transition-all duration-300">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.042-3.441.219-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.357-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001 12.017.001z"/>
                </svg>
              </a>
              <a href="#" className="w-10 h-10 bg-[#FFD700] rounded-full flex items-center justify-center text-black hover:bg-[#FFD700]/90 hover:shadow-lg hover:shadow-[#FFD700]/20 transition-all duration-300">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;