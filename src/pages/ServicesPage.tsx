
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

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        
        // Récupérer tous les services avec le nombre de coiffeurs qui les proposent
        const { data: servicesData, error: servicesError } = await supabase
          .from('services')
          .select(`
            *,
            hairdresser_services(count)
          `);

        if (servicesError) {
          console.error('Erreur lors du chargement des services:', servicesError);
          toast({
            title: "Erreur",
            description: "Impossible de charger les services",
            variant: "destructive",
          });
          return;
        }

        // Traiter les données pour compter les coiffeurs par service
        const processedServices = servicesData?.map(service => ({
          ...service,
          hairdresser_count: service.hairdresser_services?.length || 0
        })) || [];

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
                  <Card key={service.id} className="hover:shadow-lg transition-shadow duration-200">
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
                            Proposé par {service.hairdresser_count} expert{service.hairdresser_count > 1 ? 's' : ''}
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
