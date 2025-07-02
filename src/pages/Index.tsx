
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Scissors, Star, Clock, MapPin } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import HeroSection from '@/components/HeroSection';
import ServicesSection from '@/components/ServicesSection';
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    if (location.state?.message) {
      toast({
        title: "✅ Succès",
        description: location.state.message,
      });
    }
  }, [location.state, toast]);

  const handleGenderSelection = (gender: 'male' | 'female') => {
    navigate(`/professionals/${gender}`);
  };

  const handleProfessionalLogin = () => {
    navigate('/auth');
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main>
        <HeroSection />
        <ServicesSection />
        
        {/* Section de sélection du genre */}
        <section className="py-20 bg-gradient-to-br from-gold-50 via-orange-50 to-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">
                Choisissez votre <span className="gradient-text">Expert</span>
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Nos professionnels spécialisés vous attendent pour une expérience sur mesure
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {/* Coiffeurs Hommes */}
              <Card className="group hover:scale-105 transition-all duration-300 cursor-pointer border-2 hover:border-gold-300 hover:shadow-xl" 
                    onClick={() => handleGenderSelection('male')}>
                <CardHeader className="text-center pb-4">
                  <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                    <Scissors className="h-10 w-10 text-white" />
                  </div>
                  <CardTitle className="text-2xl font-bold text-gray-900">
                    Coiffeurs Experts
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-gray-600 mb-6">
                    Spécialistes en coupe homme, barbe et styling masculin
                  </p>
                  <div className="space-y-2 mb-6">
                    <div className="flex items-center justify-center text-sm text-gray-600">
                      <Star className="h-4 w-4 text-yellow-400 mr-2" />
                      Experts certifiés
                    </div>
                    <div className="flex items-center justify-center text-sm text-gray-600">
                      <Clock className="h-4 w-4 text-green-500 mr-2" />
                      Disponibles aujourd'hui
                    </div>
                  </div>
                  <Button className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white">
                    Voir nos coiffeurs
                  </Button>
                </CardContent>
              </Card>

              {/* Coiffeuses Femmes */}
              <Card className="group hover:scale-105 transition-all duration-300 cursor-pointer border-2 hover:border-gold-300 hover:shadow-xl" 
                    onClick={() => handleGenderSelection('female')}>
                <CardHeader className="text-center pb-4">
                  <div className="w-20 h-20 mx-auto mb-4 bg-gradient-gold rounded-full flex items-center justify-center">
                    <Scissors className="h-10 w-10 text-white" />
                  </div>
                  <CardTitle className="text-2xl font-bold text-gray-900">
                    Coiffeuses Expertes
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-gray-600 mb-6">
                    Spécialistes en coupe femme, couleur et coiffage
                  </p>
                  <div className="space-y-2 mb-6">
                    <div className="flex items-center justify-center text-sm text-gray-600">
                      <Star className="h-4 w-4 text-yellow-400 mr-2" />
                      Expertes certifiées
                    </div>
                    <div className="flex items-center justify-center text-sm text-gray-600">
                      <Clock className="h-4 w-4 text-green-500 mr-2" />
                      Disponibles aujourd'hui
                    </div>
                  </div>
                  <Button className="w-full bg-gradient-gold hover:bg-gold-600 text-white">
                    Voir nos coiffeuses
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Section pour les professionnels */}
            <div className="text-center mt-16">
              <div className="bg-gray-50 rounded-lg p-6 max-w-md mx-auto">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Vous êtes un professionnel ?
                </h3>
                <p className="text-gray-600 mb-4">
                  Accédez à votre espace de gestion
                </p>
                <Button 
                  onClick={handleProfessionalLogin}
                  variant="outline" 
                  className="border-gold-300 text-gold-700 hover:bg-gold-50"
                >
                  Connexion Professionnelle
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Section informations pratiques */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Informations Pratiques</h2>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-gold rounded-full flex items-center justify-center">
                  <MapPin className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Adresse</h3>
                <p className="text-gray-600">123 Rue de la Beauté<br />75001 Paris</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-gold rounded-full flex items-center justify-center">
                  <Clock className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Horaires</h3>
                <p className="text-gray-600">Lun-Sam: 9h-19h<br />Dimanche: Fermé</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-gold rounded-full flex items-center justify-center">
                  <span className="text-2xl">📞</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Contact</h3>
                <p className="text-gray-600">01 23 45 67 89<br />contact@salon.fr</p>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
