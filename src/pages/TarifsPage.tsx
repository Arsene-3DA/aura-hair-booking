import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Check, Star } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const TarifsPage = () => {
  const services = [
    {
      category: "Coupe & Styling",
      items: [
        { name: "Coupe classique", price: "35$ CAD", duration: "45 min", description: "Coupe et mise en forme" },
        { name: "Coupe & brushing", price: "50$ CAD", duration: "60 min", description: "Coupe avec mise en plis" },
        { name: "Styling événementiel", price: "70$ CAD", duration: "90 min", description: "Coiffure pour occasions spéciales" }
      ]
    },
    {
      category: "Coloration",
      items: [
        { name: "Coloration racines", price: "60$ CAD", duration: "120 min", description: "Retouche des racines" },
        { name: "Coloration complète", price: "80$ CAD", duration: "150 min", description: "Coloration sur toute la longueur" },
        { name: "Mèches", price: "90$ CAD", duration: "180 min", description: "Techniques de mèches" }
      ]
    },
    {
      category: "Soins",
      items: [
        { name: "Soin hydratant", price: "25$ CAD", duration: "30 min", description: "Masque nourrissant" },
        { name: "Soin réparateur", price: "35$ CAD", duration: "45 min", description: "Traitement intensif" },
        { name: "Soin anti-chute", price: "40$ CAD", duration: "60 min", description: "Traitement spécialisé" }
      ]
    },
    {
      category: "Homme",
      items: [
        { name: "Coupe homme", price: "25$ CAD", duration: "30 min", description: "Coupe masculine classique" },
        { name: "Barbe", price: "20$ CAD", duration: "20 min", description: "Taille et mise en forme" },
        { name: "Coupe + Barbe", price: "40$ CAD", duration: "45 min", description: "Service complet" }
      ]
    }
  ];

  const packages = [
    {
      name: "Découverte",
      price: "120$ CAD",
      originalPrice: "150$ CAD",
      popular: false,
      features: [
        "Consultation personnalisée",
        "Coupe & brushing",
        "Soin hydratant",
        "Conseils styling"
      ]
    },
    {
      name: "Transformation",
      price: "200$ CAD",
      originalPrice: "250$ CAD",
      popular: true,
      features: [
        "Consultation approfondie",
        "Coupe & styling",
        "Coloration complète",
        "Soin réparateur",
        "Suivi 1 mois"
      ]
    },
    {
      name: "Premium",
      price: "300$ CAD",
      originalPrice: "380$ CAD",
      popular: false,
      features: [
        "Service VIP complet",
        "Toutes prestations incluses",
        "Produits haute gamme",
        "Suivi personnalisé 3 mois",
        "Retouches gratuites"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-black">
      <Header />
      
      <main>
        {/* Hero Section */}
        <section className="bg-black border-b border-[#FFD700]/20 py-20">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-5xl font-bold mb-6 text-white">
              Nos <span className="text-[#FFD700]">Tarifs</span> Premium
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Découvrez nos prestations et forfaits conçus pour sublimer votre beauté avec l'excellence Tchiix
            </p>
          </div>
        </section>

        {/* Services individuels */}
        <section className="py-20 bg-black">
          <div className="container mx-auto px-4">
            <h2 className="text-4xl font-bold text-center mb-12 text-white">
              Services <span className="text-[#FFD700]">à la carte</span>
            </h2>
            
            <div className="grid gap-8">
              {services.map((category, categoryIndex) => (
                <div key={categoryIndex} className="bg-[#1a1a1a] rounded-2xl overflow-hidden border border-[#FFD700]/30 hover:border-[#FFD700]/60 transition-all duration-300">
                  <div className="bg-gradient-to-r from-[#FFD700]/20 to-[#FFD700]/10 border-b border-[#FFD700]/30 p-6">
                    <h3 className="text-2xl font-bold text-[#FFD700]">
                      {category.category}
                    </h3>
                  </div>
                  <div className="divide-y divide-[#FFD700]/20">
                    {category.items.map((service, serviceIndex) => (
                      <div key={serviceIndex} className="p-6 flex justify-between items-center hover:bg-[#FFD700]/5 transition-all duration-300 group">
                        <div className="flex-1">
                          <h4 className="font-bold text-white mb-2 text-lg group-hover:text-[#FFD700] transition-colors duration-300">
                            {service.name}
                          </h4>
                          <p className="text-gray-300 mb-3 leading-relaxed">
                            {service.description}
                          </p>
                          <span className="bg-black/50 border border-[#FFD700]/40 text-[#FFD700] px-3 py-1 rounded-full text-sm font-medium">
                            {service.duration}
                          </span>
                        </div>
                        <div className="text-right ml-6">
                          <div className="text-3xl font-bold text-[#FFD700]">
                            {service.price}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
            ))}
            </div>
          </div>
        </section>

        {/* Forfaits */}
        <section className="py-20 bg-[#1a1a1a] border-y border-[#FFD700]/20">
          <div className="container mx-auto px-4">
            <h2 className="text-4xl font-bold text-center mb-12 text-white">
              Forfaits <span className="text-[#FFD700]">Avantageux</span>
            </h2>
            
            <div className="grid md:grid-cols-3 gap-8">
              {packages.map((pkg, index) => (
                <div key={index} className={`relative bg-black rounded-2xl overflow-hidden border-2 transition-all duration-300 ${
                  pkg.popular 
                    ? 'border-[#FFD700] shadow-2xl shadow-[#FFD700]/30 scale-105' 
                    : 'border-[#FFD700]/40 hover:border-[#FFD700]/70 hover:shadow-lg hover:shadow-[#FFD700]/20'
                }`}>
                  {pkg.popular && (
                    <div className="absolute top-0 left-0 right-0">
                      <div className="bg-gradient-to-r from-[#FFD700] to-[#FFD700]/80 text-black text-center py-3 text-sm font-bold flex items-center justify-center gap-2">
                        <Star className="w-4 h-4 fill-current" />
                        LE PLUS POPULAIRE
                      </div>
                    </div>
                  )}
                  
                  <div className={`p-8 ${pkg.popular ? 'pt-16' : ''}`}>
                    <h3 className="text-center text-2xl font-bold text-white mb-4">{pkg.name}</h3>
                    <div className="text-center mb-6">
                      <div className="space-y-2">
                        <div className="text-4xl font-bold text-[#FFD700]">{pkg.price}</div>
                        {pkg.originalPrice && (
                          <div className="text-lg text-gray-400 line-through">
                            {pkg.originalPrice}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="space-y-6">
                      <ul className="space-y-4">
                        {pkg.features.map((feature, featureIndex) => (
                          <li key={featureIndex} className="flex items-center gap-3 text-gray-300">
                            <Check className="w-5 h-5 text-[#FFD700] flex-shrink-0" />
                            <span className="font-medium">{feature}</span>
                          </li>
                        ))}
                      </ul>
                      
                      <Button 
                        className={`w-full py-4 text-lg font-bold transition-all duration-300 ${
                          pkg.popular 
                            ? 'bg-[#FFD700] text-black hover:bg-[#FFD700]/90 hover:shadow-lg hover:shadow-[#FFD700]/40 hover:scale-105' 
                            : 'bg-transparent border-2 border-[#FFD700] text-[#FFD700] hover:bg-[#FFD700] hover:text-black hover:scale-105'
                        }`}
                      >
                        Réserver ce forfait
                      </Button>
                    </div>
                  </div>
                </div>
            ))}
            </div>
          </div>
        </section>

        {/* Informations complémentaires */}
        <section className="py-20 bg-black">
          <div className="container mx-auto px-4">
            <div className="bg-[#1a1a1a] rounded-2xl border border-[#FFD700]/30 p-8">
              <h3 className="text-3xl font-bold text-center mb-8 text-white">
                Informations <span className="text-[#FFD700]">importantes</span>
              </h3>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-black/50 rounded-xl p-6 border border-[#FFD700]/20">
                  <h4 className="font-bold text-[#FFD700] mb-4 text-xl flex items-center">
                    💳 Modalités de paiement
                  </h4>
                  <ul className="space-y-3 text-gray-300">
                    <li className="flex items-center"><span className="text-[#FFD700] mr-3">•</span> Espèces, CB, chèques acceptés</li>
                    <li className="flex items-center"><span className="text-[#FFD700] mr-3">•</span> Paiement échelonné possible sur les forfaits</li>
                    <li className="flex items-center"><span className="text-[#FFD700] mr-3">•</span> Cartes cadeaux disponibles</li>
                  </ul>
                </div>
                <div className="bg-black/50 rounded-xl p-6 border border-[#FFD700]/20">
                  <h4 className="font-bold text-[#FFD700] mb-4 text-xl flex items-center">
                    📅 Conditions d'annulation
                  </h4>
                  <ul className="space-y-3 text-gray-300">
                    <li className="flex items-center"><span className="text-[#FFD700] mr-3">•</span> Annulation gratuite 24h avant</li>
                    <li className="flex items-center"><span className="text-[#FFD700] mr-3">•</span> Modification possible jusqu'à 12h avant</li>
                    <li className="flex items-center"><span className="text-[#FFD700] mr-3">•</span> Forfaits valables 6 mois</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default TarifsPage;