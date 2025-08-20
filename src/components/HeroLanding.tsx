
import { Button } from "@/components/ui/button";
import { Sparkles } from 'lucide-react';

const HeroLanding = () => {
  return (
    <section className="relative w-full min-h-screen flex items-center justify-center overflow-hidden bg-black">
      {/* Background avec overlay noir et doré */}
      <div className="absolute inset-0">
        <img 
          src="https://images.unsplash.com/photo-1562322140-8baeececf3df?w=1920&h=1080&fit=crop&crop=face"
          alt="Salon de coiffure"
          className="w-full h-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/60 to-[#FFD700]/20"></div>
      </div>

      {/* Contenu */}
      <div className="relative z-10 text-center text-white px-4 animate-fade-in">
        <h1 className="text-6xl lg:text-8xl font-black mb-8 tracking-tight">
          Réservez votre
          <span className="block text-[#FFD700]">
            Coiffeur de Rêve
          </span>
        </h1>
        
        <p className="text-2xl lg:text-3xl mb-12 max-w-4xl mx-auto font-light text-gray-300">
          L'excellence capillaire à portée de clic
        </p>

        <Button className="bg-[#FFD700] text-black hover:bg-[#FFD700]/90 hover:shadow-lg hover:shadow-[#FFD700]/20 transition-all duration-300 text-2xl px-16 py-8 hover:scale-105">
          <Sparkles className="h-8 w-8 mr-4" />
          Découvrir nos Experts
        </Button>
      </div>
    </section>
  );
};

export default HeroLanding;
