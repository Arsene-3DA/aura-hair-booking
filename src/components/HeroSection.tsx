
import { Button } from "@/components/ui/button";
import { Calendar, Star, Users, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const HeroSection = () => {
  const navigate = useNavigate();

  const handleBookNowClick = () => {
    // Scroll to professionals section
    const professionalsSection = document.getElementById('professionals');
    if (professionalsSection) {
      professionalsSection.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate('/professionals');
    }
  };

  const handleDiscoverServicesClick = () => {
    const servicesSection = document.getElementById('services');
    if (servicesSection) {
      servicesSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="accueil" className="pt-20 pb-16 bg-gradient-to-br from-luxury-gold-50 via-white to-luxury-gold-50 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center justify-between min-h-[600px]">
          {/* Left Content */}
          <div className="lg:w-1/2 space-y-8 animate-fade-in">
            <div className="space-y-4">
              <div className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-luxury-gold-200">
                <Star className="h-4 w-4 text-luxury-gold-500" />
                <span className="text-sm text-luxury-charcoal">Salon n°1 de la région</span>
              </div>
              
              <h1 className="text-5xl lg:text-6xl font-bold leading-tight text-luxury-black">
                Réservez votre
                <span className="text-gradient-gold block">
                  coiffeur en ligne
                </span>
              </h1>
              
              <p className="text-xl text-luxury-charcoal/70 leading-relaxed max-w-lg">
                Découvrez nos experts capillaires et réservez votre créneau en quelques clics. 
                Une expérience beauté personnalisée vous attend.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg" 
                className="luxury-button text-lg"
                onClick={handleBookNowClick}
              >
                <Calendar className="h-5 w-5 mr-2" />
                Réserver maintenant
              </Button>
              
              <Button 
                variant="outline" 
                size="lg"
                className="border-2 border-luxury-gold-300 text-luxury-gold-700 hover:bg-luxury-gold-50 px-8 py-4 text-lg"
                onClick={handleDiscoverServicesClick}
              >
                Découvrir nos services
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 pt-8 border-t border-luxury-gold-200">
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Users className="h-8 w-8 text-luxury-gold-500" />
                </div>
                <div className="text-2xl font-bold text-luxury-black">500+</div>
                <div className="text-sm text-luxury-charcoal/60">Clients satisfaits</div>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Star className="h-8 w-8 text-luxury-gold-500" />
                </div>
                <div className="text-2xl font-bold text-luxury-black">4.9</div>
                <div className="text-sm text-luxury-charcoal/60">Note moyenne</div>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Clock className="h-8 w-8 text-luxury-gold-500" />
                </div>
                <div className="text-2xl font-bold text-luxury-black">24h</div>
                <div className="text-sm text-luxury-charcoal/60">Ouvert 7j/7</div>
              </div>
            </div>
          </div>

          {/* Right Image/Visual */}
          <div className="lg:w-1/2 mt-12 lg:mt-0 animate-slide-in">
            <div className="relative">
              {/* Decorative elements */}
              <div className="absolute -top-4 -right-4 w-32 h-32 bg-gradient-gold rounded-full opacity-20 animate-pulse"></div>
              <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-gradient-gold rounded-full opacity-30 animate-pulse delay-1000"></div>
              
              {/* Main visual container */}
              <div className="relative bg-white rounded-3xl shadow-luxury p-8 hover-lift">
                <div className="grid grid-cols-2 gap-6">
                  {/* Sample stylist cards */}
                  <div className="space-y-4">
                    <div className="bg-gradient-to-br from-luxury-gold-100 to-luxury-gold-200 rounded-2xl p-4 hover:scale-105 transition-transform">
                      <div className="w-12 h-12 bg-gradient-gold rounded-full flex items-center justify-center mb-3">
                        <span className="text-white font-semibold">AM</span>
                      </div>
                      <h3 className="font-semibold text-luxury-black">Anna Martin</h3>
                      <p className="text-sm text-luxury-charcoal/70">Coupe & Couleur</p>
                      <div className="flex items-center mt-2">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="h-3 w-3 text-luxury-gold-400 fill-current" />
                        ))}
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-br from-luxury-gold-200 to-luxury-gold-100 rounded-2xl p-4 hover:scale-105 transition-transform">
                      <div className="w-12 h-12 bg-gradient-gold rounded-full flex items-center justify-center mb-3">
                        <span className="text-white font-semibold">JD</span>
                      </div>
                      <h3 className="font-semibold text-luxury-black">Julie Dubois</h3>
                      <p className="text-sm text-luxury-charcoal/70">Soins & Extensions</p>
                      <div className="flex items-center mt-2">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="h-3 w-3 text-luxury-gold-400 fill-current" />
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4 pt-8">
                    <div className="bg-gradient-to-br from-luxury-gold-100 to-luxury-gold-200 rounded-2xl p-4 hover:scale-105 transition-transform">
                      <div className="w-12 h-12 bg-gradient-gold rounded-full flex items-center justify-center mb-3">
                        <span className="text-white font-semibold">MR</span>
                      </div>
                      <h3 className="font-semibold text-luxury-black">Marc Rousseau</h3>
                      <p className="text-sm text-luxury-charcoal/70">Coiffure Homme</p>
                      <div className="flex items-center mt-2">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="h-3 w-3 text-luxury-gold-400 fill-current" />
                        ))}
                      </div>
                    </div>
                    
                    <div className="bg-white rounded-2xl p-4 shadow-gold border border-luxury-gold-200 animate-glow">
                      <div className="text-center">
                        <Calendar className="h-8 w-8 text-luxury-gold-500 mx-auto mb-2" />
                        <p className="text-sm font-medium text-luxury-black">Disponible aujourd'hui</p>
                        <p className="text-xs text-luxury-charcoal/60">14:30 - 18:00</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
