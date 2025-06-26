
import { Button } from "@/components/ui/button";
import { Calendar, Star, Users, Clock } from 'lucide-react';

const HeroSection = () => {
  return (
    <section className="pt-20 pb-16 bg-gradient-to-br from-orange-50 via-gold-50 to-white overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center justify-between min-h-[600px]">
          {/* Left Content */}
          <div className="lg:w-1/2 space-y-8 animate-fade-in">
            <div className="space-y-4">
              <div className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-gold-200">
                <Star className="h-4 w-4 text-gold-500" />
                <span className="text-sm text-gray-700">Salon n°1 de la région</span>
              </div>
              
              <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
                Réservez votre
                <span className="gradient-text block">
                  coiffeur en ligne
                </span>
              </h1>
              
              <p className="text-xl text-gray-600 leading-relaxed max-w-lg">
                Découvrez nos experts capillaires et réservez votre créneau en quelques clics. 
                Une expérience beauté personnalisée vous attend.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg" 
                className="bg-gradient-gold hover:opacity-90 text-white shadow-xl hover:shadow-2xl transition-all duration-300 px-8 py-4 text-lg"
              >
                <Calendar className="h-5 w-5 mr-2" />
                Réserver maintenant
              </Button>
              
              <Button 
                variant="outline" 
                size="lg"
                className="border-2 border-gold-300 text-gold-700 hover:bg-gold-50 px-8 py-4 text-lg"
              >
                Découvrir nos services
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 pt-8 border-t border-gold-200">
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Users className="h-8 w-8 text-gold-500" />
                </div>
                <div className="text-2xl font-bold text-gray-900">500+</div>
                <div className="text-sm text-gray-600">Clients satisfaits</div>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Star className="h-8 w-8 text-gold-500" />
                </div>
                <div className="text-2xl font-bold text-gray-900">4.9</div>
                <div className="text-sm text-gray-600">Note moyenne</div>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Clock className="h-8 w-8 text-gold-500" />
                </div>
                <div className="text-2xl font-bold text-gray-900">24h</div>
                <div className="text-sm text-gray-600">Ouvert 7j/7</div>
              </div>
            </div>
          </div>

          {/* Right Image/Visual */}
          <div className="lg:w-1/2 mt-12 lg:mt-0 animate-slide-in">
            <div className="relative">
              {/* Decorative elements */}
              <div className="absolute -top-4 -right-4 w-32 h-32 bg-gradient-gold rounded-full opacity-20 animate-pulse"></div>
              <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-gradient-orange rounded-full opacity-30 animate-pulse delay-1000"></div>
              
              {/* Main visual container */}
              <div className="relative bg-white rounded-3xl shadow-2xl p-8 hover-lift">
                <div className="grid grid-cols-2 gap-6">
                  {/* Sample stylist cards */}
                  <div className="space-y-4">
                    <div className="bg-gradient-to-br from-gold-100 to-orange-100 rounded-2xl p-4 hover:scale-105 transition-transform">
                      <div className="w-12 h-12 bg-gradient-gold rounded-full flex items-center justify-center mb-3">
                        <span className="text-white font-semibold">AM</span>
                      </div>
                      <h3 className="font-semibold text-gray-900">Anna Martin</h3>
                      <p className="text-sm text-gray-600">Coupe & Couleur</p>
                      <div className="flex items-center mt-2">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="h-3 w-3 text-gold-400 fill-current" />
                        ))}
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-br from-orange-100 to-gold-100 rounded-2xl p-4 hover:scale-105 transition-transform">
                      <div className="w-12 h-12 bg-gradient-orange rounded-full flex items-center justify-center mb-3">
                        <span className="text-white font-semibold">JD</span>
                      </div>
                      <h3 className="font-semibold text-gray-900">Julie Dubois</h3>
                      <p className="text-sm text-gray-600">Soins & Extensions</p>
                      <div className="flex items-center mt-2">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="h-3 w-3 text-gold-400 fill-current" />
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4 pt-8">
                    <div className="bg-gradient-to-br from-gold-100 to-orange-100 rounded-2xl p-4 hover:scale-105 transition-transform">
                      <div className="w-12 h-12 bg-gradient-gold rounded-full flex items-center justify-center mb-3">
                        <span className="text-white font-semibold">MR</span>
                      </div>
                      <h3 className="font-semibold text-gray-900">Marc Rousseau</h3>
                      <p className="text-sm text-gray-600">Coiffure Homme</p>
                      <div className="flex items-center mt-2">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="h-3 w-3 text-gold-400 fill-current" />
                        ))}
                      </div>
                    </div>
                    
                    <div className="bg-white rounded-2xl p-4 shadow-lg border border-gold-200 animate-glow">
                      <div className="text-center">
                        <Calendar className="h-8 w-8 text-gold-500 mx-auto mb-2" />
                        <p className="text-sm font-medium text-gray-900">Disponible aujourd'hui</p>
                        <p className="text-xs text-gray-600">14:30 - 18:00</p>
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
