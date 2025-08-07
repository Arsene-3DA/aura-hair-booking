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
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">Nos Tarifs</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Découvrez nos prestations et forfaits conçus pour sublimer votre beauté
          </p>
        </div>

        {/* Services individuels */}
        <section className="mb-16">
          <h2 className="text-3xl font-semibold text-foreground mb-8 text-center">
            Services à la carte
          </h2>
          
          <div className="grid gap-8">
            {services.map((category, categoryIndex) => (
              <Card key={categoryIndex} className="overflow-hidden">
                <CardHeader className="bg-primary/5">
                  <CardTitle className="text-xl text-primary">
                    {category.category}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y divide-border">
                    {category.items.map((service, serviceIndex) => (
                      <div key={serviceIndex} className="p-6 flex justify-between items-center hover:bg-muted/30 transition-colors">
                        <div className="flex-1">
                          <h3 className="font-semibold text-foreground mb-1">
                            {service.name}
                          </h3>
                          <p className="text-sm text-muted-foreground mb-2">
                            {service.description}
                          </p>
                          <Badge variant="outline" className="text-xs">
                            {service.duration}
                          </Badge>
                        </div>
                        <div className="text-right ml-4">
                          <div className="text-2xl font-bold text-primary">
                            {service.price}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Forfaits */}
        <section>
          <h2 className="text-3xl font-semibold text-foreground mb-8 text-center">
            Forfaits Avantageux
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {packages.map((pkg, index) => (
              <Card key={index} className={`relative overflow-hidden ${pkg.popular ? 'ring-2 ring-primary scale-105' : ''}`}>
                {pkg.popular && (
                  <div className="absolute top-0 left-0 right-0">
                    <div className="bg-primary text-primary-foreground text-center py-2 text-sm font-medium flex items-center justify-center gap-1">
                      <Star className="w-4 h-4 fill-current" />
                      Le plus populaire
                    </div>
                  </div>
                )}
                
                <CardHeader className={pkg.popular ? 'pt-12' : ''}>
                  <CardTitle className="text-center text-xl">{pkg.name}</CardTitle>
                  <CardDescription className="text-center">
                    <div className="space-y-1">
                      <div className="text-3xl font-bold text-primary">{pkg.price}</div>
                      {pkg.originalPrice && (
                        <div className="text-sm text-muted-foreground line-through">
                          {pkg.originalPrice}
                        </div>
                      )}
                    </div>
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <ul className="space-y-3">
                    {pkg.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 text-primary flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Button 
                    className="w-full" 
                    variant={pkg.popular ? "default" : "outline"}
                  >
                    Réserver ce forfait
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Informations complémentaires */}
        <section className="mt-16 bg-muted/30 rounded-lg p-8">
          <h3 className="text-xl font-semibold text-foreground mb-4 text-center">
            Informations importantes
          </h3>
          <div className="grid md:grid-cols-2 gap-6 text-sm text-muted-foreground">
            <div>
              <h4 className="font-medium text-foreground mb-2">Modalités de paiement</h4>
              <ul className="space-y-1">
                <li>• Espèces, CB, chèques acceptés</li>
                <li>• Paiement échelonné possible sur les forfaits</li>
                <li>• Cartes cadeaux disponibles</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-2">Conditions d'annulation</h4>
              <ul className="space-y-1">
                <li>• Annulation gratuite 24h avant</li>
                <li>• Modification possible jusqu'à 12h avant</li>
                <li>• Forfaits valables 6 mois</li>
              </ul>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default TarifsPage;