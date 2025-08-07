
import { Button } from "@/components/ui/button";
import { Calendar, Star, Users, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ResponsiveContainer, ResponsiveGrid, ResponsiveFlex } from '@/components/ui/responsive-layout';
import { responsiveText, responsiveSpacing } from '@/hooks/useResponsive';
import { cn } from '@/lib/utils';

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
    <section id="accueil" className={cn("bg-gradient-to-br from-luxury-gold-50 via-white to-luxury-gold-50 overflow-hidden", responsiveSpacing.section)}>
      <ResponsiveContainer size="xl" padding="lg">
        <div className="flex flex-col lg:flex-row items-center justify-between min-h-[500px] lg:min-h-[600px] gap-8 lg:gap-12">
          {/* Left Content */}
          <div className="w-full lg:w-1/2 space-y-6 lg:space-y-8 animate-fade-in text-center lg:text-left">
            <div className="space-y-4">
              <div className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-luxury-gold-200">
                <Star className="h-4 w-4 text-luxury-gold-500" />
                <span className="text-sm text-luxury-charcoal">Salon n°1 de la région</span>
              </div>
              
              <h1 className={cn("font-bold leading-tight text-luxury-black", responsiveText.hero)}>
                Réservez votre
                <span className="text-gradient-gold block">
                  coiffeur en ligne
                </span>
              </h1>
              
              <p className={cn("text-luxury-charcoal/70 leading-relaxed max-w-lg mx-auto lg:mx-0", responsiveText.subheading)}>
                Découvrez nos experts capillaires et réservez votre créneau en quelques clics. 
                Une expérience beauté personnalisée vous attend.
              </p>
            </div>

            <ResponsiveFlex direction="row" justify="center" className="lg:justify-start w-full">
              <Button 
                size="lg" 
                className="luxury-button text-base lg:text-lg w-full sm:w-auto"
                onClick={handleBookNowClick}
              >
                <Calendar className="h-5 w-5 mr-2" />
                Réserver maintenant
              </Button>
              
              <Button 
                variant="outline" 
                size="lg"
                className="border-2 border-luxury-gold-300 text-luxury-gold-700 hover:bg-luxury-gold-100 hover:text-luxury-gold-800 hover:border-luxury-gold-400 px-6 lg:px-8 py-3 lg:py-4 text-base lg:text-lg w-full sm:w-auto transition-all duration-300"
                onClick={handleDiscoverServicesClick}
              >
                Découvrir nos services
              </Button>
            </ResponsiveFlex>

            {/* Stats */}
            <ResponsiveGrid cols={{ mobile: 3, tablet: 3, desktop: 3 }} gap="md" className="pt-6 lg:pt-8 border-t border-luxury-gold-200">
              <div className="text-center">
                <div className="flex items-center justify-center mb-1 lg:mb-2">
                  <Users className="h-6 w-6 lg:h-8 lg:w-8 text-luxury-gold-500" />
                </div>
                <div className="text-xl lg:text-2xl font-bold text-luxury-black">500+</div>
                <div className="text-xs lg:text-sm text-luxury-charcoal/60">Clients satisfaits</div>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center mb-1 lg:mb-2">
                  <Star className="h-6 w-6 lg:h-8 lg:w-8 text-luxury-gold-500" />
                </div>
                <div className="text-xl lg:text-2xl font-bold text-luxury-black">4.9</div>
                <div className="text-xs lg:text-sm text-luxury-charcoal/60">Note moyenne</div>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center mb-1 lg:mb-2">
                  <Clock className="h-6 w-6 lg:h-8 lg:w-8 text-luxury-gold-500" />
                </div>
                <div className="text-xl lg:text-2xl font-bold text-luxury-black">24h</div>
                <div className="text-xs lg:text-sm text-luxury-charcoal/60">Ouvert 7j/7</div>
              </div>
            </ResponsiveGrid>
          </div>

          {/* Right Image/Visual */}
          <div className="w-full lg:w-1/2 mt-8 lg:mt-0 animate-slide-in">
            <div className="relative max-w-md mx-auto lg:max-w-none">
              {/* Decorative elements */}
              <div className="absolute -top-2 -right-2 lg:-top-4 lg:-right-4 w-20 h-20 lg:w-32 lg:h-32 bg-gradient-gold rounded-full opacity-20 animate-pulse"></div>
              <div className="absolute -bottom-4 -left-4 lg:-bottom-8 lg:-left-8 w-16 h-16 lg:w-24 lg:h-24 bg-gradient-gold rounded-full opacity-30 animate-pulse delay-1000"></div>
              
              {/* Main visual container */}
              <div className="relative bg-white rounded-2xl lg:rounded-3xl shadow-luxury p-4 sm:p-6 lg:p-8 hover-lift">
                <ResponsiveGrid cols={{ mobile: 2, tablet: 2, desktop: 2 }} gap="sm">
                  {/* Sample stylist cards */}
                  <div className="space-y-3 lg:space-y-4">
                    <div className="bg-gradient-to-br from-luxury-gold-100 to-luxury-gold-200 rounded-xl lg:rounded-2xl p-3 lg:p-4 hover:scale-105 transition-transform">
                      <div className="w-8 h-8 lg:w-12 lg:h-12 bg-gradient-gold rounded-full flex items-center justify-center mb-2 lg:mb-3">
                        <span className="text-white font-semibold text-xs lg:text-sm">AM</span>
                      </div>
                      <h3 className="font-semibold text-luxury-black text-sm lg:text-base">Anna Martin</h3>
                      <p className="text-xs lg:text-sm text-luxury-charcoal/70">Coupe & Couleur</p>
                      <div className="flex items-center mt-1 lg:mt-2">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="h-2 w-2 lg:h-3 lg:w-3 text-luxury-gold-400 fill-current" />
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
                </ResponsiveGrid>
              </div>
            </div>
          </div>
        </div>
      </ResponsiveContainer>
    </section>
  );
};

export default HeroSection;
