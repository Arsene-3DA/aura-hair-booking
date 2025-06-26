
import { Card, CardContent } from "@/components/ui/card";
import { Scissors, Palette, Heart, Crown, Users, Sparkles } from 'lucide-react';

const services = [
  {
    icon: Scissors,
    title: "Coupe & Styling",
    description: "Coupes tendances adaptées à votre style et morphologie",
    price: "À partir de 35€",
    popular: false
  },
  {
    icon: Palette,
    title: "Couleur & Mèches",
    description: "Colorations personnalisées et techniques de mèches modernes",
    price: "À partir de 65€",
    popular: true
  },
  {
    icon: Heart,
    title: "Soins Capillaires",
    description: "Traitements nourrissants pour des cheveux en pleine santé",
    price: "À partir de 25€",
    popular: false
  },
  {
    icon: Crown,
    title: "Coiffure Mariée",
    description: "Créations sur-mesure pour votre jour J",
    price: "À partir de 120€",
    popular: false
  },
  {
    icon: Users,
    title: "Coiffure Homme",
    description: "Coupes masculines classiques et modernes",
    price: "À partir de 28€",
    popular: false
  },
  {
    icon: Sparkles,
    title: "Extensions",
    description: "Pose d'extensions pour plus de volume et de longueur",
    price: "À partir de 150€",
    popular: false
  }
];

const ServicesSection = () => {
  return (
    <section id="services" className="py-20 bg-gradient-to-br from-gray-50 to-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">
            Nos <span className="gradient-text">Services</span> Premium
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Une gamme complète de services pour sublimer votre beauté naturelle, 
            avec des techniques modernes et des produits haut de gamme.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <Card 
              key={index}
              className={`group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0 shadow-lg ${
                service.popular ? 'ring-2 ring-gold-300 bg-gradient-to-br from-gold-50 to-orange-50' : 'bg-white'
              }`}
            >
              {service.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-gold text-white px-4 py-1 rounded-full text-sm font-medium shadow-lg">
                    Populaire
                  </span>
                </div>
              )}
              
              <CardContent className="p-8 text-center relative">
                <div className={`w-16 h-16 mx-auto mb-6 rounded-2xl flex items-center justify-center ${
                  service.popular 
                    ? 'bg-gradient-gold shadow-lg' 
                    : 'bg-gradient-to-br from-gold-100 to-orange-100 group-hover:from-gold-200 group-hover:to-orange-200'
                } transition-all duration-300`}>
                  <service.icon className={`h-8 w-8 ${
                    service.popular ? 'text-white' : 'text-gold-600'
                  }`} />
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {service.title}
                </h3>
                
                <p className="text-gray-600 mb-6 leading-relaxed">
                  {service.description}
                </p>
                
                <div className="space-y-4">
                  <div className={`text-2xl font-bold ${
                    service.popular ? 'gradient-text' : 'text-gold-600'
                  }`}>
                    {service.price}
                  </div>
                  
                  <div className="pt-2">
                    <div className={`w-12 h-1 mx-auto rounded-full ${
                      service.popular 
                        ? 'bg-gradient-gold' 
                        : 'bg-gradient-to-r from-gold-300 to-orange-300'
                    }`}></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="text-center mt-16">
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gold-200 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Besoin de conseils personnalisés ?
            </h3>
            <p className="text-gray-600 mb-6">
              Nos experts sont là pour vous accompagner dans le choix du service 
              le plus adapté à vos besoins et vos envies.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <div className="text-center">
                <div className="text-lg font-semibold text-gold-600">Consultation gratuite</div>
                <div className="text-sm text-gray-500">Avec nos stylistes</div>
              </div>
              <div className="hidden sm:block w-px bg-gray-300"></div>
              <div className="text-center">
                <div className="text-lg font-semibold text-orange-600">Devis sur mesure</div>
                <div className="text-sm text-gray-500">Selon vos besoins</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
