
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import { Scissors, User, Star, Calendar, Award, MapPin, Clock, CheckCircle, Sparkles, Crown, Diamond } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();

  const handleGenderSelection = (gender: 'male' | 'female') => {
    navigate(`/professionals/${gender}`);
  };

  const scrollToProfessionals = () => {
    const professionalsSection = document.getElementById('professionals');
    if (professionalsSection) {
      professionalsSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="pt-20">
        {/* Hero Section - Plateforme de Réservation */}
        <section id="accueil" className="hero-section">
          {/* Background Effects */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-20 left-10 w-72 h-72 bg-luxury-gold-100 rounded-full opacity-20 animate-float"></div>
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-gold opacity-10 rounded-full animate-float" style={{animationDelay: '2s'}}></div>
            <div className="absolute top-1/2 left-1/4 w-48 h-48 bg-luxury-gold-200 rounded-full opacity-15 animate-float" style={{animationDelay: '4s'}}></div>
          </div>

          <div className="container mx-auto px-4 text-center relative z-10">
            <div className="max-w-6xl mx-auto">
              {/* Badge Premium */}
              <div className="inline-flex items-center space-x-3 bg-white/90 backdrop-blur-sm px-8 py-4 rounded-full border-2 border-luxury-gold-200 shadow-gold mb-12 hover:shadow-luxury transition-all duration-500">
                <Crown className="h-6 w-6 text-luxury-gold-600" />
                <span className="text-lg font-bold text-luxury-charcoal">Plateforme de Réservation #1</span>
                <div className="flex space-x-1">
                  {[1,2,3,4,5].map(i => (
                    <Star key={i} className="h-5 w-5 text-luxury-gold-500 fill-current" />
                  ))}
                </div>
                <Sparkles className="h-5 w-5 text-luxury-gold-500" />
              </div>

              <h1 className="title-luxury mb-8">
                Réservez Votre
                <span className="block text-gradient-gold">
                  Coiffeur
                </span>
                <span className="block text-luxury-charcoal text-5xl lg:text-7xl mt-4">en Ligne</span>
              </h1>
              
              <p className="subtitle-luxury mb-16 max-w-4xl mx-auto leading-relaxed">
                Découvrez nos professionnels de la coiffure et réservez instantanément.
                <span className="block mt-4 font-semibold text-luxury-charcoal">
                  Une plateforme moderne pour une expérience client exceptionnelle.
                </span>
              </p>

              {/* Statistiques de la Plateforme */}
              <div className="grid grid-cols-3 gap-12 max-w-3xl mx-auto mb-16">
                <div className="text-center group">
                  <div className="text-5xl font-black text-gradient-gold mb-3 group-hover:scale-110 transition-transform duration-300">50+</div>
                  <div className="text-luxury-charcoal/70 font-medium tracking-wide">Professionnels</div>
                </div>
                <div className="text-center group">
                  <div className="text-5xl font-black text-gradient-gold mb-3 group-hover:scale-110 transition-transform duration-300">24/7</div>
                  <div className="text-luxury-charcoal/70 font-medium tracking-wide">Réservation</div>
                </div>
                <div className="text-center group">
                  <div className="text-5xl font-black text-gradient-gold mb-3 group-hover:scale-110 transition-transform duration-300">5.0★</div>
                  <div className="text-luxury-charcoal/70 font-medium tracking-wide">Satisfaction</div>
                </div>
              </div>

              <Button 
                className="luxury-button text-xl px-12 py-6 mb-8"
                onClick={scrollToProfessionals}
              >
                <Diamond className="h-6 w-6 mr-3" />
                Choisir Mon Professionnel
              </Button>
            </div>
          </div>
        </section>

        {/* Section Sélection de Professionnel */}
        <section id="professionals" className="py-32 bg-gradient-to-br from-luxury-black via-luxury-charcoal to-luxury-gray relative overflow-hidden">
          {/* Background Effects */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-gold opacity-5"></div>
            <div className="absolute top-20 right-20 w-64 h-64 bg-luxury-gold-400 rounded-full blur-3xl opacity-20"></div>
            <div className="absolute bottom-20 left-20 w-80 h-80 bg-luxury-gold-300 rounded-full blur-3xl opacity-15"></div>
          </div>

          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center mb-20">
              <h2 className="text-6xl lg:text-7xl font-black mb-8 text-white">
                Choisissez votre <span className="text-gradient-gold">Professionnel</span>
              </h2>
              <p className="text-2xl text-white/80 max-w-3xl mx-auto font-light">
                Sélectionnez le type de service qui vous correspond
              </p>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-16 max-w-7xl mx-auto">
              {/* Card Coiffeur Homme */}
              <Card className="professional-card bg-white/95 backdrop-blur-sm border-0 shadow-luxury hover:shadow-gold p-0 overflow-hidden group">
                <CardContent className="p-0">
                  <div className="relative h-96 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-indigo-600/30"></div>
                    <img 
                      src="https://images.unsplash.com/photo-1560250097-0b93528c311a?w=800&h=600&fit=crop&crop=face"
                      alt="Coiffeur Professionnel"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                      <div className="absolute bottom-8 left-8 text-white">
                        <div className="flex items-center space-x-3 mb-3">
                          <CheckCircle className="h-6 w-6" />
                          <span className="text-lg font-bold">Experts Disponibles</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Calendar className="h-5 w-5" />
                          <span className="font-medium">Réservation instantanée</span>
                        </div>
                      </div>
                    </div>

                    <div className="absolute top-6 right-6">
                      <div className="bg-luxury-gold-500 text-luxury-black px-4 py-2 rounded-full text-sm font-black shadow-luxury">
                        DISPONIBLE
                      </div>
                    </div>
                  </div>

                  <div className="p-10">
                    <div className="text-center mb-8">
                      <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl mb-6 shadow-luxury group-hover:shadow-gold transition-all duration-300 transform group-hover:scale-110">
                        <User className="h-10 w-10 text-white" />
                      </div>
                      <h3 className="text-4xl font-black text-luxury-charcoal mb-3">COIFFEUR</h3>
                      <p className="text-lg text-luxury-charcoal/70 leading-relaxed font-medium">
                        Spécialistes de la coiffure masculine et du style moderne
                      </p>
                    </div>

                    <div className="space-y-4 mb-8">
                      <div className="flex items-center space-x-4 text-luxury-charcoal/80">
                        <div className="w-2 h-2 bg-gradient-gold rounded-full"></div>
                        <span className="font-medium">Coupe classique & tendance</span>
                      </div>
                      <div className="flex items-center space-x-4 text-luxury-charcoal/80">
                        <div className="w-2 h-2 bg-gradient-gold rounded-full"></div>
                        <span className="font-medium">Barbe & rasage professionnel</span>
                      </div>
                      <div className="flex items-center space-x-4 text-luxury-charcoal/80">
                        <div className="w-2 h-2 bg-gradient-gold rounded-full"></div>
                        <span className="font-medium">Styling & conseils personnalisés</span>
                      </div>
                    </div>

                    <Button 
                      onClick={() => handleGenderSelection('male')}
                      className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-8 py-6 text-lg font-bold shadow-luxury hover:shadow-gold transition-all duration-300 rounded-2xl group-hover:scale-105"
                    >
                      <Scissors className="h-6 w-6 mr-3" />
                      Voir les Coiffeurs
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Card Coiffeuse Femme */}
              <Card className="professional-card bg-white/95 backdrop-blur-sm border-0 shadow-luxury hover:shadow-gold p-0 overflow-hidden group">
                <CardContent className="p-0">
                  <div className="relative h-96 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-pink-500/20 to-rose-600/30"></div>
                    <img 
                      src="https://images.unsplash.com/photo-1562322140-8baeececf3df?w=800&h=600&fit=crop&crop=face"
                      alt="Coiffeuse Professionnelle"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                      <div className="absolute bottom-8 left-8 text-white">
                        <div className="flex items-center space-x-3 mb-3">
                          <CheckCircle className="h-6 w-6" />
                          <span className="text-lg font-bold">Expertes Disponibles</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Calendar className="h-5 w-5" />
                          <span className="font-medium">Réservation instantanée</span>
                        </div>
                      </div>
                    </div>

                    <div className="absolute top-6 right-6">
                      <div className="bg-luxury-gold-500 text-luxury-black px-4 py-2 rounded-full text-sm font-black shadow-luxury">
                        DISPONIBLE
                      </div>
                    </div>
                  </div>

                  <div className="p-10">
                    <div className="text-center mb-8">
                      <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-pink-500 to-rose-600 rounded-3xl mb-6 shadow-luxury group-hover:shadow-gold transition-all duration-300 transform group-hover:scale-110">
                        <User className="h-10 w-10 text-white" />
                      </div>
                      <h3 className="text-4xl font-black text-luxury-charcoal mb-3">COIFFEUSE</h3>
                      <p className="text-lg text-luxury-charcoal/70 leading-relaxed font-medium">
                        Spécialistes de la coiffure féminine et de la beauté capillaire
                      </p>
                    </div>

                    <div className="space-y-4 mb-8">
                      <div className="flex items-center space-x-4 text-luxury-charcoal/80">
                        <div className="w-2 h-2 bg-gradient-gold rounded-full"></div>
                        <span className="font-medium">Coupe & coiffage haute couture</span>
                      </div>
                      <div className="flex items-center space-x-4 text-luxury-charcoal/80">
                        <div className="w-2 h-2 bg-gradient-gold rounded-full"></div>
                        <span className="font-medium">Coloration & techniques premium</span>
                      </div>
                      <div className="flex items-center space-x-4 text-luxury-charcoal/80">
                        <div className="w-2 h-2 bg-gradient-gold rounded-full"></div>
                        <span className="font-medium">Coiffure mariage & événements</span>
                      </div>
                    </div>

                    <Button 
                      onClick={() => handleGenderSelection('female')}
                      className="w-full bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white px-8 py-6 text-lg font-bold shadow-luxury hover:shadow-gold transition-all duration-300 rounded-2xl group-hover:scale-105"
                    >
                      <Scissors className="h-6 w-6 mr-3" />
                      Voir les Coiffeuses
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Section Avantages de la Plateforme */}
        <section id="services" className="py-32 bg-white relative overflow-hidden">
          <div className="container mx-auto px-4">
            <div className="text-center mb-20">
              <h2 className="text-5xl lg:text-6xl font-black mb-6 text-luxury-charcoal">
                Pourquoi Choisir <span className="text-gradient-gold">Notre Plateforme</span>
              </h2>
              <p className="text-2xl text-luxury-charcoal/70 max-w-3xl mx-auto">La réservation coiffure simplifiée</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-6xl mx-auto">
              <div className="text-center group hover-lift">
                <div className="w-24 h-24 bg-gradient-gold rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-gold group-hover:shadow-luxury transition-all duration-500 group-hover:scale-110">
                  <Calendar className="h-12 w-12 text-luxury-black" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-luxury-charcoal">Réservation Instantanée</h3>
                <p className="text-luxury-charcoal/70 leading-relaxed font-medium">Réservez en quelques clics, 24h/24 et 7j/7. Confirmation immédiate par email.</p>
              </div>

              <div className="text-center group hover-lift">
                <div className="w-24 h-24 bg-gradient-gold rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-gold group-hover:shadow-luxury transition-all duration-500 group-hover:scale-110">
                  <Award className="h-12 w-12 text-luxury-black" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-luxury-charcoal">Professionnels Certifiés</h3>
                <p className="text-luxury-charcoal/70 leading-relaxed font-medium">Tous nos coiffeurs sont sélectionnés et certifiés pour leur expertise.</p>
              </div>

              <div className="text-center group hover-lift">
                <div className="w-24 h-24 bg-gradient-gold rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-gold group-hover:shadow-luxury transition-all duration-500 group-hover:scale-110">
                  <MapPin className="h-12 w-12 text-luxury-black" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-luxury-charcoal">Partout en Ville</h3>
                <p className="text-luxury-charcoal/70 leading-relaxed font-medium">Trouvez le coiffeur le plus proche de chez vous grâce à notre géolocalisation.</p>
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
