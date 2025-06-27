
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import { Scissors, User, Star, Calendar, Award, MapPin, Clock, CheckCircle } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();

  const handleGenderSelection = (gender: 'male' | 'female') => {
    navigate(`/professionals/${gender}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-white">
      <Header />
      <main>
        {/* Hero Section Enhanced */}
        <section className="relative py-20 overflow-hidden">
          {/* Background elements */}
          <div className="absolute inset-0">
            <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-gold-200 to-orange-200 rounded-full opacity-20 animate-pulse"></div>
            <div className="absolute bottom-20 right-10 w-24 h-24 bg-gradient-to-br from-orange-200 to-gold-200 rounded-full opacity-30 animate-pulse delay-1000"></div>
            <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-gradient-to-br from-gold-300 to-orange-300 rounded-full opacity-25 animate-pulse delay-500"></div>
          </div>

          <div className="container mx-auto px-4 text-center relative z-10">
            <div className="max-w-4xl mx-auto">
              {/* Badge de confiance */}
              <div className="inline-flex items-center space-x-2 bg-white/90 backdrop-blur-sm px-6 py-3 rounded-full border border-gold-200 shadow-lg mb-8">
                <Award className="h-5 w-5 text-gold-500" />
                <span className="text-sm font-medium text-gray-700">Salon de coiffure premium #1 à Paris</span>
                <div className="flex">
                  {[1,2,3,4,5].map(i => (
                    <Star key={i} className="h-4 w-4 text-gold-400 fill-current" />
                  ))}
                </div>
              </div>

              <h1 className="text-6xl lg:text-7xl font-bold mb-8 leading-tight">
                Trouvez votre
                <span className="block gradient-text bg-gradient-to-r from-gold-500 via-orange-500 to-gold-600 bg-clip-text text-transparent">
                  Expert Capillaire
                </span>
                <span className="block text-4xl lg:text-5xl text-gray-700 mt-4">de confiance</span>
              </h1>
              
              <p className="text-xl lg:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
                Réservez en quelques clics avec nos professionnels passionnés. 
                <span className="block mt-2 font-medium text-gray-700">
                  Une expérience sur-mesure vous attend.
                </span>
              </p>

              {/* Statistiques en temps réel */}
              <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto mb-12">
                <div className="text-center">
                  <div className="text-3xl font-bold text-gold-600 mb-2">500+</div>
                  <div className="text-sm text-gray-600">Clients satisfaits</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-gold-600 mb-2">4.9★</div>
                  <div className="text-sm text-gray-600">Note moyenne</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-gold-600 mb-2">7j/7</div>
                  <div className="text-sm text-gray-600">Disponibilité</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Gender Selection - Redesigné avec de meilleures photos */}
        <section className="py-20 bg-white relative">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-5xl font-bold mb-6">
                Choisissez votre <span className="gradient-text">Professionnel</span>
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Nos experts sont spécialisés pour vous offrir le meilleur service selon vos besoins
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
              {/* Coiffeur Card - Photo améliorée */}
              <Card className="group relative overflow-hidden border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:-translate-y-6 cursor-pointer bg-gradient-to-br from-blue-50 to-indigo-100">
                <CardContent className="p-0">
                  {/* Image Section */}
                  <div className="relative h-80 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-indigo-500/30"></div>
                    <img 
                      src="https://images.unsplash.com/photo-1560250097-0b93528c311a?w=600&h=400&fit=crop&crop=face"
                      alt="Coiffeur professionnel"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    
                    {/* Overlay avec info */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="absolute bottom-6 left-6 text-white">
                        <div className="flex items-center space-x-2 mb-2">
                          <CheckCircle className="h-5 w-5" />
                          <span className="text-sm font-medium">Spécialiste hommes</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4" />
                          <span className="text-sm">Disponible aujourd'hui</span>
                        </div>
                      </div>
                    </div>

                    {/* Badge disponibilité */}
                    <div className="absolute top-4 right-4">
                      <div className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium shadow-lg">
                        3 créneaux libres
                      </div>
                    </div>
                  </div>

                  {/* Content Section */}
                  <div className="p-8">
                    <div className="text-center mb-6">
                      <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full mb-4 shadow-lg">
                        <User className="h-8 w-8 text-white" />
                      </div>
                      <h3 className="text-3xl font-bold text-gray-900 mb-2">COIFFEUR</h3>
                      <p className="text-gray-600 text-lg leading-relaxed">
                        Experts en coupe moderne, barbe et styling masculin
                      </p>
                    </div>

                    {/* Services populaires */}
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center space-x-3 text-sm text-gray-600">
                        <Scissors className="h-4 w-4 text-blue-500" />
                        <span>Coupe moderne & classique</span>
                      </div>
                      <div className="flex items-center space-x-3 text-sm text-gray-600">
                        <Star className="h-4 w-4 text-blue-500" />
                        <span>Taille de barbe & styling</span>
                      </div>
                      <div className="flex items-center space-x-3 text-sm text-gray-600">
                        <Clock className="h-4 w-4 text-blue-500" />
                        <span>Service express disponible</span>
                      </div>
                    </div>

                    <Button 
                      onClick={() => handleGenderSelection('male')}
                      className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-105"
                    >
                      <Scissors className="h-5 w-5 mr-2" />
                      Voir nos Coiffeurs
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Coiffeuse Card - Photo améliorée */}
              <Card className="group relative overflow-hidden border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:-translate-y-6 cursor-pointer bg-gradient-to-br from-pink-50 to-rose-100">
                <CardContent className="p-0">
                  {/* Image Section */}
                  <div className="relative h-80 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-pink-400/20 to-rose-500/30"></div>
                    <img 
                      src="https://images.unsplash.com/photo-1562322140-8baeececf3df?w=600&h=400&fit=crop&crop=face"
                      alt="Coiffeuse professionnelle"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    
                    {/* Overlay avec info */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="absolute bottom-6 left-6 text-white">
                        <div className="flex items-center space-x-2 mb-2">
                          <CheckCircle className="h-5 w-5" />
                          <span className="text-sm font-medium">Spécialiste femmes</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4" />
                          <span className="text-sm">Disponible aujourd'hui</span>
                        </div>
                      </div>
                    </div>

                    {/* Badge disponibilité */}
                    <div className="absolute top-4 right-4">
                      <div className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium shadow-lg">
                        5 créneaux libres
                      </div>
                    </div>
                  </div>

                  {/* Content Section */}
                  <div className="p-8">
                    <div className="text-center mb-6">
                      <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-pink-500 to-rose-600 rounded-full mb-4 shadow-lg">
                        <User className="h-8 w-8 text-white" />
                      </div>
                      <h3 className="text-3xl font-bold text-gray-900 mb-2">COIFFEUSE</h3>
                      <p className="text-gray-600 text-lg leading-relaxed">
                        Expertes en coupe tendance, couleur et coiffage événementiel
                      </p>
                    </div>

                    {/* Services populaires */}
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center space-x-3 text-sm text-gray-600">
                        <Scissors className="h-4 w-4 text-pink-500" />
                        <span>Coupe & coiffage personnalisé</span>
                      </div>
                      <div className="flex items-center space-x-3 text-sm text-gray-600">
                        <Star className="h-4 w-4 text-pink-500" />
                        <span>Coloration & balayage</span>
                      </div>
                      <div className="flex items-center space-x-3 text-sm text-gray-600">
                        <Calendar className="h-4 w-4 text-pink-500" />
                        <span>Coiffage événements</span>
                      </div>
                    </div>

                    <Button 
                      onClick={() => handleGenderSelection('female')}
                      className="w-full bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-105"
                    >
                      <Scissors className="h-5 w-5 mr-2" />
                      Voir nos Coiffeuses
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Section Pourquoi nous choisir */}
        <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4">
                Pourquoi choisir <span className="gradient-text">notre salon ?</span>
              </h2>
              <p className="text-xl text-gray-600">Une expérience unique qui dépasse vos attentes</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <div className="text-center p-6 rounded-2xl bg-white shadow-lg hover:shadow-xl transition-shadow">
                <div className="w-16 h-16 bg-gradient-gold rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3">Expertise Reconnue</h3>
                <p className="text-gray-600">Nos professionnels sont formés aux dernières tendances et techniques</p>
              </div>

              <div className="text-center p-6 rounded-2xl bg-white shadow-lg hover:shadow-xl transition-shadow">
                <div className="w-16 h-16 bg-gradient-gold rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3">Flexibilité Totale</h3>
                <p className="text-gray-600">Réservation en ligne 24h/7j avec annulation gratuite jusqu'à 2h avant</p>
              </div>

              <div className="text-center p-6 rounded-2xl bg-white shadow-lg hover:shadow-xl transition-shadow">
                <div className="w-16 h-16 bg-gradient-gold rounded-full flex items-center justify-center mx-auto mb-4">
                  <MapPin className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3">Localisation Premium</h3>
                <p className="text-gray-600">Salons situés dans les meilleurs quartiers de Paris</p>
              </div>
            </div>
          </div>
        </section>

        {/* Services populaires redesignés */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-4xl font-bold mb-8">
              Nos <span className="gradient-text">Services Populaires</span>
            </h2>
            <p className="text-xl text-gray-600 mb-12">Des prestations adaptées à tous vos besoins</p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
              {[
                { name: "Coupe Tendance", icon: "✂️", popular: true },
                { name: "Coloration", icon: "🎨", popular: true },
                { name: "Coiffage Mariage", icon: "💒", popular: false },
                { name: "Barbe & Styling", icon: "💼", popular: true },
                { name: "Soins Capillaires", icon: "🌿", popular: false },
                { name: "Mèches & Balayage", icon: "✨", popular: true },
                { name: "Coupe Enfant", icon: "👶", popular: false },
                { name: "Lissage", icon: "💫", popular: false }
              ].map((service, index) => (
                <div key={index} className={`relative p-6 rounded-2xl transition-all duration-300 hover:scale-105 ${
                  service.popular 
                    ? 'bg-gradient-to-br from-gold-100 to-orange-100 shadow-lg hover:shadow-xl border-2 border-gold-200' 
                    : 'bg-gray-50 hover:bg-gray-100 shadow-md hover:shadow-lg'
                }`}>
                  {service.popular && (
                    <div className="absolute -top-2 -right-2 bg-gold-500 text-white text-xs px-2 py-1 rounded-full">
                      Populaire
                    </div>
                  )}
                  <div className="text-3xl mb-3">{service.icon}</div>
                  <p className={`font-medium ${service.popular ? 'text-gold-800' : 'text-gray-900'}`}>
                    {service.name}
                  </p>
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
