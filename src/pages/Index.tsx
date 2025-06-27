
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
        {/* Hero Section Redesigné */}
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
                <span className="text-lg font-bold text-luxury-charcoal">Salon Premium #1 Paris</span>
                <div className="flex space-x-1">
                  {[1,2,3,4,5].map(i => (
                    <Star key={i} className="h-5 w-5 text-luxury-gold-500 fill-current" />
                  ))}
                </div>
                <Sparkles className="h-5 w-5 text-luxury-gold-500" />
              </div>

              <h1 className="title-luxury mb-8">
                Votre Expert
                <span className="block text-gradient-gold">
                  Capillaire
                </span>
                <span className="block text-luxury-charcoal text-5xl lg:text-7xl mt-4">de Luxe</span>
              </h1>
              
              <p className="subtitle-luxury mb-16 max-w-4xl mx-auto leading-relaxed">
                Découvrez l'excellence capillaire avec nos maîtres artisans. 
                <span className="block mt-4 font-semibold text-luxury-charcoal">
                  Une expérience sur-mesure dans un cadre d'exception.
                </span>
              </p>

              {/* Statistiques Premium */}
              <div className="grid grid-cols-3 gap-12 max-w-3xl mx-auto mb-16">
                <div className="text-center group">
                  <div className="text-5xl font-black text-gradient-gold mb-3 group-hover:scale-110 transition-transform duration-300">1000+</div>
                  <div className="text-luxury-charcoal/70 font-medium tracking-wide">Clients VIP</div>
                </div>
                <div className="text-center group">
                  <div className="text-5xl font-black text-gradient-gold mb-3 group-hover:scale-110 transition-transform duration-300">5.0★</div>
                  <div className="text-luxury-charcoal/70 font-medium tracking-wide">Excellence</div>
                </div>
                <div className="text-center group">
                  <div className="text-5xl font-black text-gradient-gold mb-3 group-hover:scale-110 transition-transform duration-300">24/7</div>
                  <div className="text-luxury-charcoal/70 font-medium tracking-wide">Service</div>
                </div>
              </div>

              <Button 
                className="luxury-button text-xl px-12 py-6 mb-8"
                onClick={scrollToProfessionals}
              >
                <Diamond className="h-6 w-6 mr-3" />
                Réserver Votre Expérience VIP
              </Button>
            </div>
          </div>
        </section>

        {/* Section Sélection - Design Ultra Premium */}
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
                Choisissez votre <span className="text-gradient-gold">Maître</span>
              </h2>
              <p className="text-2xl text-white/80 max-w-3xl mx-auto font-light">
                Nos artistes capillaires d'exception vous attendent
              </p>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-16 max-w-7xl mx-auto">
              {/* Maître Coiffeur Card */}
              <Card className="professional-card bg-white/95 backdrop-blur-sm border-0 shadow-luxury hover:shadow-gold p-0 overflow-hidden">
                <CardContent className="p-0">
                  <div className="relative h-96 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-indigo-600/30"></div>
                    <img 
                      src="https://images.unsplash.com/photo-1560250097-0b93528c311a?w=800&h=600&fit=crop&crop=face"
                      alt="Maître Coiffeur"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                      <div className="absolute bottom-8 left-8 text-white">
                        <div className="flex items-center space-x-3 mb-3">
                          <CheckCircle className="h-6 w-6" />
                          <span className="text-lg font-bold">Maître Artisan</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Calendar className="h-5 w-5" />
                          <span className="font-medium">Disponible aujourd'hui</span>
                        </div>
                      </div>
                    </div>

                    <div className="absolute top-6 right-6">
                      <div className="bg-luxury-gold-500 text-luxury-black px-4 py-2 rounded-full text-sm font-black shadow-luxury">
                        3 CRÉNEAUX VIP
                      </div>
                    </div>
                  </div>

                  <div className="p-10">
                    <div className="text-center mb-8">
                      <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl mb-6 shadow-luxury group-hover:shadow-gold transition-all duration-300 transform group-hover:scale-110">
                        <User className="h-10 w-10 text-white" />
                      </div>
                      <h3 className="text-4xl font-black text-luxury-charcoal mb-3">MAÎTRE COIFFEUR</h3>
                      <p className="text-lg text-luxury-charcoal/70 leading-relaxed font-medium">
                        Virtuose de l'art capillaire masculin et du styling d'exception
                      </p>
                    </div>

                    <div className="space-y-4 mb-8">
                      <div className="flex items-center space-x-4 text-luxury-charcoal/80">
                        <div className="w-2 h-2 bg-gradient-gold rounded-full"></div>
                        <span className="font-medium">Coupe signature & styling de luxe</span>
                      </div>
                      <div className="flex items-center space-x-4 text-luxury-charcoal/80">
                        <div className="w-2 h-2 bg-gradient-gold rounded-full"></div>
                        <span className="font-medium">Art de la barbe & rasage traditionnel</span>
                      </div>
                      <div className="flex items-center space-x-4 text-luxury-charcoal/80">
                        <div className="w-2 h-2 bg-gradient-gold rounded-full"></div>
                        <span className="font-medium">Service VIP express</span>
                      </div>
                    </div>

                    <Button 
                      onClick={() => handleGenderSelection('male')}
                      className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-8 py-6 text-lg font-bold shadow-luxury hover:shadow-gold transition-all duration-300 rounded-2xl group-hover:scale-105"
                    >
                      <Scissors className="h-6 w-6 mr-3" />
                      Découvrir nos Maîtres
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Maître Coiffeuse Card */}
              <Card className="professional-card bg-white/95 backdrop-blur-sm border-0 shadow-luxury hover:shadow-gold p-0 overflow-hidden">
                <CardContent className="p-0">
                  <div className="relative h-96 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-pink-500/20 to-rose-600/30"></div>
                    <img 
                      src="https://images.unsplash.com/photo-1562322140-8baeececf3df?w=800&h=600&fit=crop&crop=face"
                      alt="Maître Coiffeuse"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                      <div className="absolute bottom-8 left-8 text-white">
                        <div className="flex items-center space-x-3 mb-3">
                          <CheckCircle className="h-6 w-6" />
                          <span className="text-lg font-bold">Maître Artiste</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Calendar className="h-5 w-5" />
                          <span className="font-medium">Disponible aujourd'hui</span>
                        </div>
                      </div>
                    </div>

                    <div className="absolute top-6 right-6">
                      <div className="bg-luxury-gold-500 text-luxury-black px-4 py-2 rounded-full text-sm font-black shadow-luxury">
                        5 CRÉNEAUX VIP
                      </div>
                    </div>
                  </div>

                  <div className="p-10">
                    <div className="text-center mb-8">
                      <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-pink-500 to-rose-600 rounded-3xl mb-6 shadow-luxury group-hover:shadow-gold transition-all duration-300 transform group-hover:scale-110">
                        <User className="h-10 w-10 text-white" />
                      </div>
                      <h3 className="text-4xl font-black text-luxury-charcoal mb-3">MAÎTRE COIFFEUSE</h3>
                      <p className="text-lg text-luxury-charcoal/70 leading-relaxed font-medium">
                        Virtuose de l'art capillaire féminin et de la haute coiffure
                      </p>
                    </div>

                    <div className="space-y-4 mb-8">
                      <div className="flex items-center space-x-4 text-luxury-charcoal/80">
                        <div className="w-2 h-2 bg-gradient-gold rounded-full"></div>
                        <span className="font-medium">Coupe haute couture & coiffage d'art</span>
                      </div>
                      <div className="flex items-center space-x-4 text-luxury-charcoal/80">
                        <div className="w-2 h-2 bg-gradient-gold rounded-full"></div>
                        <span className="font-medium">Coloration exclusive & techniques premium</span>
                      </div>
                      <div className="flex items-center space-x-4 text-luxury-charcoal/80">
                        <div className="w-2 h-2 bg-gradient-gold rounded-full"></div>
                        <span className="font-medium">Coiffage événements de prestige</span>
                      </div>
                    </div>

                    <Button 
                      onClick={() => handleGenderSelection('female')}
                      className="w-full bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white px-8 py-6 text-lg font-bold shadow-luxury hover:shadow-gold transition-all duration-300 rounded-2xl group-hover:scale-105"
                    >
                      <Scissors className="h-6 w-6 mr-3" />
                      Découvrir nos Maîtresses
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Section Excellence */}
        <section id="services" className="py-32 bg-white relative overflow-hidden">
          <div className="container mx-auto px-4">
            <div className="text-center mb-20">
              <h2 className="text-5xl lg:text-6xl font-black mb-6 text-luxury-charcoal">
                L'Excellence <span className="text-gradient-gold">SalonBook</span>
              </h2>
              <p className="text-2xl text-luxury-charcoal/70 max-w-3xl mx-auto">L'art de la perfection capillaire</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-6xl mx-auto">
              <div className="text-center group hover-lift">
                <div className="w-24 h-24 bg-gradient-gold rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-gold group-hover:shadow-luxury transition-all duration-500 group-hover:scale-110">
                  <Award className="h-12 w-12 text-luxury-black" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-luxury-charcoal">Maîtrise Absolue</h3>
                <p className="text-luxury-charcoal/70 leading-relaxed font-medium">Nos artistes maîtrisent les techniques les plus avancées et les tendances exclusives</p>
              </div>

              <div className="text-center group hover-lift">
                <div className="w-24 h-24 bg-gradient-gold rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-gold group-hover:shadow-luxury transition-all duration-500 group-hover:scale-110">
                  <Clock className="h-12 w-12 text-luxury-black" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-luxury-charcoal">Service Premium</h3>
                <p className="text-luxury-charcoal/70 leading-relaxed font-medium">Réservation VIP 24h/7j avec service de conciergerie et annulation flexible</p>
              </div>

              <div className="text-center group hover-lift">
                <div className="w-24 h-24 bg-gradient-gold rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-gold group-hover:shadow-luxury transition-all duration-500 group-hover:scale-110">
                  <MapPin className="h-12 w-12 text-luxury-black" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-luxury-charcoal">Lieux d'Exception</h3>
                <p className="text-luxury-charcoal/70 leading-relaxed font-medium">Salons situés dans les quartiers les plus prestigieux de Paris</p>
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
