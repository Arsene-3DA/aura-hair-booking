
import { Card, CardContent } from "@/components/ui/card";
import { Scissors, Palette, Heart, Crown, Users, Sparkles } from 'lucide-react';

const services = [
  {
    icon: Scissors,
    title: "Coupe & Styling",
    description: "Coupes tendances adaptées à votre style et morphologie",
    price: "À partir de 45$ CAD",
    popular: false
  },
  {
    icon: Palette,
    title: "Couleur & Mèches",
    description: "Colorations personnalisées et techniques de mèches modernes",
    price: "À partir de 85$ CAD",
    popular: true
  },
  {
    icon: Heart,
    title: "Soins Capillaires",
    description: "Traitements nourrissants pour des cheveux en pleine santé",
    price: "À partir de 35$ CAD",
    popular: false
  },
  {
    icon: Crown,
    title: "Coiffure Mariée",
    description: "Créations sur-mesure pour votre jour J",
    price: "À partir de 160$ CAD",
    popular: false
  },
  {
    icon: Users,
    title: "Coiffure Homme",
    description: "Coupes masculines classiques et modernes",
    price: "À partir de 38$ CAD",
    popular: false
  },
  {
    icon: Sparkles,
    title: "Extensions",
    description: "Pose d'extensions pour plus de volume et de longueur",
    price: "À partir de 200$ CAD",
    popular: false
  }
];

const ServicesSection = () => {
  return (
    <section id="services" className="py-20 bg-[#1a1a1a] border-y border-[#FFD700]/20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4 text-white">
            Nos <span className="text-[#FFD700]">Services</span> Premium
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Une gamme complète de services pour sublimer votre beauté naturelle, 
            avec des techniques modernes et des produits haut de gamme.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <div 
              key={index}
              className={`bg-black rounded-2xl p-8 text-center border transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-[#FFD700]/10 relative group ${
                service.popular ? 'border-[#FFD700]/60' : 'border-[#FFD700]/30 hover:border-[#FFD700]/60'
              }`}
            >
              {service.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-[#FFD700] text-black px-4 py-1 rounded-full text-sm font-medium shadow-lg">
                    Populaire
                  </span>
                </div>
              )}
              
              <div className={`w-16 h-16 mx-auto mb-6 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                service.popular 
                  ? 'bg-[#FFD700] shadow-lg shadow-[#FFD700]/20' 
                  : 'bg-[#FFD700]/20 group-hover:bg-[#FFD700]/30'
              }`}>
                <service.icon className={`h-8 w-8 ${
                  service.popular ? 'text-black' : 'text-[#FFD700]'
                }`} />
              </div>
              
              <h3 className="text-xl font-bold text-white mb-3">
                {service.title}
              </h3>
              
              <p className="text-gray-300 mb-6 leading-relaxed">
                {service.description}
              </p>
              
              <div className="space-y-4">
                <div className={`text-2xl font-bold ${
                  service.popular ? 'text-[#FFD700]' : 'text-[#FFD700]'
                }`}>
                  {service.price}
                </div>
                
                <div className="pt-2">
                  <div className={`w-12 h-1 mx-auto rounded-full ${
                    service.popular 
                      ? 'bg-[#FFD700]' 
                      : 'bg-[#FFD700]/60'
                  }`}></div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="text-center mt-16">
          <div className="bg-black rounded-2xl shadow-lg p-8 border border-[#FFD700]/30 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-white mb-4">
              Besoin de conseils personnalisés ?
            </h3>
            <p className="text-gray-300 mb-6">
              Nos experts sont là pour vous accompagner dans le choix du service 
              le plus adapté à vos besoins et vos envies.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <div className="text-center">
                <div className="text-lg font-semibold text-[#FFD700]">Consultation gratuite</div>
                <div className="text-sm text-gray-400">Avec nos stylistes</div>
              </div>
              <div className="hidden sm:block w-px bg-[#FFD700]/30"></div>
              <div className="text-center">
                <div className="text-lg font-semibold text-[#FFD700]">Devis sur mesure</div>
                <div className="text-sm text-gray-400">Selon vos besoins</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
