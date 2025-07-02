
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Euro, Users } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/hooks/use-toast";

interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number;
  category: string;
  image_url?: string;
  hairdresser_count?: number;
}

const ServicesPage = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const { toast } = useToast();

  const categories = [
    { key: 'all', label: 'Tous les services' },
    { key: 'Coupe', label: 'Coupes' },
    { key: 'Couleur', label: 'Coloration' },
    { key: 'Barbe', label: 'Barbe & Rasage' },
    { key: 'Soin', label: 'Soins' },
    { key: 'Coiffage', label: 'Coiffage' },
    { key: 'Traitement', label: 'Traitements' },
    { key: 'Conseil', label: 'Conseils' }
  ];

  // Images associées aux services par catégorie
  const getServiceImage = (serviceName: string, category: string) => {
    const imageMap: { [key: string]: string } = {
      // Coupes
      'Coupe Homme': 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=400&h=300&fit=crop',
      'Coupe Femme': 'https://images.unsplash.com/photo-1560869713-7d0954b04f2d?w=400&h=300&fit=crop',
      'Dégradé': 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=400&h=300&fit=crop',
      
      // Barbe
      'Barbe': 'https://images.unsplash.com/photo-1511018797779-3bc6fb8d7db3?w=400&h=300&fit=crop',
      'Rasage Traditionnel': 'https://images.unsplash.com/photo-1585747065706-d3d2b6b11aa6?w=400&h=300&fit=crop',
      'Barbe Sculptée': 'https://images.unsplash.com/photo-1542909168-82c3e7fdca5c?w=400&h=300&fit=crop',
      
      // Couleur
      'Coloration': 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=400&h=300&fit=crop',
      'Mèches': 'https://images.unsplash.com/photo-1522337660859-02fbefca4702?w=400&h=300&fit=crop',
      'Balayage': 'https://images.unsplash.com/photo-1594736797933-d0200ba5bfe1?w=400&h=300&fit=crop',
      'Coloration Fantaisie': 'https://images.unsplash.com/photo-1596815064285-45ed8a9c0463?w=400&h=300&fit=crop',
      
      // Soins
      'Soin Capillaire': 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=400&h=300&fit=crop',
      'Massage Cuir Chevelu': 'https://images.unsplash.com/photo-1487412912498-0447578fcca8?w=400&h=300&fit=crop',
      
      // Coiffage
      'Extensions': 'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=400&h=300&fit=crop',
      'Chignon': 'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=400&h=300&fit=crop',
      'Styling': 'https://images.unsplash.com/photo-1560869713-7d0954b04f2d?w=400&h=300&fit=crop',
      
      // Traitements
      'Permanente': 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&h=300&fit=crop',
      'Lissage': 'https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=400&h=300&fit=crop',
      
      // Conseil
      'Relooking': 'https://images.unsplash.com/photo-1522337662859-02fbefca4702?w=400&h=300&fit=crop'
    };

    return imageMap[serviceName] || 'https://images.unsplash.com/photo-1560869713-7d0954b04f2d?w=400&h=300&fit=crop';
  };

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        
        // Utiliser une requête directe avec cast pour contourner les problèmes de types
        const { data: servicesData, error: servicesError } = await (supabase as any)
          .from('services')
          .select('*');

        if (servicesError) {
          console.error('Erreur lors du chargement des services:', servicesError);
          // Créer des services de démonstration si la table n'est pas accessible
          const demoServices: Service[] = [
            {
              id: '1',
              name: 'Coupe Homme',
              description: 'Coupe classique pour homme avec finitions',
              price: 25,
              duration: 30,
              category: 'Coupe',
              hairdresser_count: 5
            },
            {
              id: '2',
              name: 'Coupe Femme',
              description: 'Coupe moderne pour femme avec styling',
              price: 35,
              duration: 45,
              category: 'Coupe',
              hairdresser_count: 5
            },
            {
              id: '3',
              name: 'Coloration',
              description: 'Coloration complète des cheveux',
              price: 60,
              duration: 90,
              category: 'Couleur',
              hairdresser_count: 8
            },
            {
              id: '4',
              name: 'Barbe',
              description: 'Taille et mise en forme de la barbe',
              price: 15,
              duration: 20,
              category: 'Barbe',
              hairdresser_count: 4
            }
          ];
          // Ajouter les images aux services de démo
          const servicesWithImages = demoServices.map(service => ({
            ...service,
            image_url: getServiceImage(service.name, service.category)
          }));
          setServices(servicesWithImages);
          toast({
            title: "Mode démonstration",
            description: "Affichage des services de démonstration",
          });
          return;
        }

        // Récupérer le nombre de coiffeurs par service et ajouter les images
        const processedServices = await Promise.all(
          (servicesData || []).map(async (service: any) => {
            try {
              const { data: countData, error: countError } = await (supabase as any)
                .from('hairdresser_services')
                .select('id')
                .eq('service_id', service.id);

              return {
                ...service,
                hairdresser_count: countError ? 0 : (countData?.length || 0),
                image_url: getServiceImage(service.name, service.category)
              };
            } catch (error) {
              console.error('Erreur lors du comptage:', error);
              return {
                ...service,
                hairdresser_count: 0,
                image_url: getServiceImage(service.name, service.category)
              };
            }
          })
        );

        setServices(processedServices);
      } catch (error) {
        console.error('Erreur:', error);
        toast({
          title: "Erreur",
          description: "Une erreur est survenue lors du chargement",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, [toast]);

  const filteredServices = selectedCategory === 'all' 
    ? services 
    : services.filter(service => service.category === selectedCategory);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(price);
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (remainingMinutes === 0) {
      return `${hours}h`;
    }
    return `${hours}h${remainingMinutes}`;
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main>
        {/* Header Section */}
        <section className="bg-gradient-to-br from-gold-50 via-orange-50 to-white py-16">
          <div className="container mx-auto px-4">
            <div className="text-center">
              <h1 className="text-4xl font-bold mb-4">
                Nos <span className="gradient-text">Services</span>
              </h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Découvrez la gamme complète de services offerts par nos experts coiffeurs
              </p>
            </div>
          </div>
        </section>

        {/* Filtres par catégorie */}
        <section className="py-8 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="flex flex-wrap gap-2 justify-center">
              {categories.map((category) => (
                <Badge
                  key={category.key}
                  variant={selectedCategory === category.key ? "default" : "outline"}
                  className={`cursor-pointer px-4 py-2 text-sm ${
                    selectedCategory === category.key
                      ? 'bg-gradient-gold text-white hover:bg-gold-600'
                      : 'hover:bg-gold-50 hover:text-gold-700'
                  }`}
                  onClick={() => setSelectedCategory(category.key)}
                >
                  {category.label}
                </Badge>
              ))}
            </div>
          </div>
        </section>

        {/* Services Grid */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            {loading ? (
              <div className="text-center py-16">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold-500 mx-auto mb-4"></div>
                <p className="text-gray-600 text-lg">Chargement des services...</p>
              </div>
            ) : filteredServices.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredServices.map((service) => (
                  <Card key={service.id} className="hover:shadow-lg transition-shadow duration-200 overflow-hidden">
                    {/* Image du service */}
                    <div className="h-48 overflow-hidden">
                      <img 
                        src={service.image_url}
                        alt={service.name}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = 'https://images.unsplash.com/photo-1560869713-7d0954b04f2d?w=400&h=300&fit=crop';
                        }}
                      />
                    </div>
                    
                    <CardHeader>
                      <div className="flex justify-between items-start mb-2">
                        <CardTitle className="text-xl font-bold text-gray-900">
                          {service.name}
                        </CardTitle>
                        <Badge variant="outline" className="ml-2">
                          {service.category}
                        </Badge>
                      </div>
                      <p className="text-gray-600 text-sm">
                        {service.description}
                      </p>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center text-gold-600">
                            <Euro className="h-4 w-4 mr-1" />
                            <span className="font-semibold text-lg">
                              {formatPrice(service.price)}
                            </span>
                          </div>
                          <div className="flex items-center text-gray-600">
                            <Clock className="h-4 w-4 mr-1" />
                            <span className="text-sm">
                              {formatDuration(service.duration)}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex items-center text-gray-500">
                          <Users className="h-4 w-4 mr-1" />
                          <span className="text-sm">
                            Proposé par {service.hairdresser_count || 0} expert{(service.hairdresser_count || 0) > 1 ? 's' : ''}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <p className="text-gray-600 text-lg">
                  Aucun service trouvé pour cette catégorie.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-16 bg-gradient-to-br from-gold-50 via-orange-50 to-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">
              Prêt à réserver votre <span className="gradient-text">service</span> ?
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Choisissez votre expert et réservez dès maintenant pour une expérience sur mesure
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/professionals/male"
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 hover:shadow-lg"
              >
                Nos Coiffeurs Experts
              </a>
              <a
                href="/professionals/female"
                className="bg-gradient-gold hover:bg-gold-600 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 hover:shadow-lg"
              >
                Nos Coiffeuses Expertes
              </a>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default ServicesPage;
