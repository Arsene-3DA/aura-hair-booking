
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import { Scissors, User } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();

  const handleGenderSelection = (gender: 'male' | 'female') => {
    navigate(`/professionals/${gender}`);
  };

  return (
    <div className="min-h-screen">
      <Header />
      <main>
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-gold-50 via-orange-50 to-white py-20">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-5xl font-bold mb-6">
              Réservez votre <span className="gradient-text">Expert Capillaire</span>
            </h1>
            <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
              Choisissez votre professionnel et réservez votre créneau en quelques clics. 
              Service premium avec des experts passionnés.
            </p>
          </div>
        </section>

        {/* Gender Selection */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4">
                Choisissez votre <span className="gradient-text">Professionnel</span>
              </h2>
              <p className="text-xl text-gray-600">
                Sélectionnez le type de professionnel que vous souhaitez
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-4xl mx-auto">
              {/* Coiffeur Card */}
              <Card className="group hover:shadow-2xl transition-all duration-300 hover:-translate-y-4 cursor-pointer overflow-hidden border-0 shadow-lg">
                <CardContent className="p-0">
                  <div className="relative h-80 bg-gradient-to-br from-blue-100 to-blue-200">
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <div className="w-32 h-32 rounded-full overflow-hidden shadow-lg border-4 border-white mb-4">
                        <img 
                          src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face"
                          alt="Coiffeur professionnel"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <User className="h-8 w-8 text-blue-600 mb-2" />
                      <h3 className="text-2xl font-bold text-gray-900">COIFFEUR</h3>
                      <p className="text-gray-600 text-center px-4">
                        Experts en coupe homme, barbe et styling masculin
                      </p>
                    </div>
                  </div>
                  <div className="p-6 text-center">
                    <Button 
                      onClick={() => handleGenderSelection('male')}
                      className="bg-gradient-to-r from-blue-500 to-blue-600 hover:opacity-90 text-white px-8 py-3 text-lg font-semibold w-full"
                    >
                      <Scissors className="h-5 w-5 mr-2" />
                      Voir les Coiffeurs
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Coiffeuse Card */}
              <Card className="group hover:shadow-2xl transition-all duration-300 hover:-translate-y-4 cursor-pointer overflow-hidden border-0 shadow-lg">
                <CardContent className="p-0">
                  <div className="relative h-80 bg-gradient-to-br from-pink-100 to-rose-200">
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <div className="w-32 h-32 rounded-full overflow-hidden shadow-lg border-4 border-white mb-4">
                        <img 
                          src="https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=400&h=400&fit=crop&crop=face"
                          alt="Coiffeuse professionnelle"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <User className="h-8 w-8 text-pink-600 mb-2" />
                      <h3 className="text-2xl font-bold text-gray-900">COIFFEUSE</h3>
                      <p className="text-gray-600 text-center px-4">
                        Expertes en coupe femme, couleur et coiffage
                      </p>
                    </div>
                  </div>
                  <div className="p-6 text-center">
                    <Button 
                      onClick={() => handleGenderSelection('female')}
                      className="bg-gradient-to-r from-pink-500 to-rose-600 hover:opacity-90 text-white px-8 py-3 text-lg font-semibold w-full"
                    >
                      <Scissors className="h-5 w-5 mr-2" />
                      Voir les Coiffeuses
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Services Preview */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-4xl font-bold mb-8">
              Nos <span className="gradient-text">Services</span>
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              {[
                "Coupe Classique",
                "Coupe Moderne", 
                "Coloration",
                "Coiffage Événement",
                "Barbe & Styling",
                "Soins Capillaires",
                "Mèches & Balayage",
                "Coupe Enfant"
              ].map((service, index) => (
                <div key={index} className="bg-white p-4 rounded-lg shadow-md">
                  <p className="font-medium text-gray-900">{service}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
