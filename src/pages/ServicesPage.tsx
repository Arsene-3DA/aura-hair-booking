import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, DollarSign, Users } from 'lucide-react';
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
              price: 35,
              duration: 30,
              category: 'Coupe',
              hairdresser_count: 5
            },
            {
              id: '2',
              name: 'Coupe Femme',
              description: 'Coupe moderne pour femme avec styling',
              price: 45,
              duration: 45,
              category: 'Coupe',
              hairdresser_count: 5
            },
            {
              id: '3',
              name: 'Coloration',
              description: 'Coloration complète des cheveux',
              price: 80,
              duration: 90,
              category: 'Couleur',
              hairdresser_count: 8
            },
            {
              id: '4',
              name: 'Barbe',
              description: 'Taille et mise en forme de la barbe',
              price: 20,
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
    return `${price}$ CAD`;
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
    <div className="min-h-screen bg-black">
      <Header />
      
      <main>
        {/* Hero Section */}
        <section className="bg-black border-b border-[#FFD700]/20 py-20">
          <div className="container mx-auto px-4">
            <div className="text-center">
              <h1 className="text-5xl font-bold mb-6 text-white">
                Nos <span className="text-[#FFD700]">Services</span> Premium
              </h1>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
                Découvrez une expérience beauté sur-mesure avec notre gamme complète de services 
                professionnels, réalisés par nos experts coiffeurs passionnés.
              </p>
            </div>
          </div>
        </section>

        {/* Category Filters */}
        <section className="py-12 bg-[#1a1a1a] border-b border-[#FFD700]/20">
          <div className="container mx-auto px-4">
            <div className="flex flex-wrap gap-3 justify-center">
              {categories.map((category) => (
                <button
                  key={category.key}
                  className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                    selectedCategory === category.key
                      ? 'bg-[#FFD700] text-black shadow-lg shadow-[#FFD700]/30 scale-105'
                      : 'bg-black border border-[#FFD700]/40 text-[#FFD700] hover:border-[#FFD700]/80 hover:bg-[#FFD700]/10 hover:scale-102'
                  }`}
                  onClick={() => setSelectedCategory(category.key)}
                >
                  {category.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Services Grid */}
        <section className="py-20 bg-black">
          <div className="container mx-auto px-4">
            {loading ? (
              <div className="text-center py-20">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#FFD700]/20 border-t-[#FFD700] mx-auto mb-6"></div>
                <p className="text-gray-300 text-xl">Chargement de nos services premium...</p>
              </div>
            ) : filteredServices.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredServices.map((service) => (
                  <div 
                    key={service.id} 
                    className="bg-[#1a1a1a] rounded-2xl overflow-hidden border border-[#FFD700]/30 hover:border-[#FFD700]/60 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-[#FFD700]/20 group"
                  >
                    {/* Image du service avec overlay doré */}
                    <div className="relative h-56 overflow-hidden">
                      <img 
                        src={service.image_url}
                        alt={service.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = 'https://images.unsplash.com/photo-1560869713-7d0954b04f2d?w=400&h=300&fit=crop';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                      <div className="absolute top-4 right-4">
                        <span className="bg-black/70 backdrop-blur-sm text-[#FFD700] px-3 py-1 rounded-full text-sm font-medium border border-[#FFD700]/30">
                          {service.category}
                        </span>
                      </div>
                    </div>
                    
                    <div className="p-6">
                      <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-[#FFD700] transition-colors duration-300">
                        {service.name}
                      </h3>
                      <p className="text-gray-300 mb-6 leading-relaxed">
                        {service.description}
                      </p>
                      
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center text-[#FFD700]">
                            <DollarSign className="h-5 w-5 mr-2" />
                            <span className="font-bold text-xl">
                              {formatPrice(service.price)}
                            </span>
                          </div>
                          <div className="flex items-center text-gray-400">
                            <Clock className="h-4 w-4 mr-2" />
                            <span className="text-sm">
                              {formatDuration(service.duration)}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex items-center text-gray-400">
                          <Users className="h-4 w-4 mr-2 text-[#FFD700]" />
                          <span className="text-sm">
                            Proposé par <span className="text-[#FFD700] font-medium">{service.hairdresser_count || 0}</span> expert{(service.hairdresser_count || 0) > 1 ? 's' : ''}
                          </span>
                        </div>
                        
                        <div className="pt-4">
                          <div className="w-full h-1 bg-[#FFD700]/20 rounded-full overflow-hidden">
                            <div className="w-3/4 h-full bg-gradient-to-r from-[#FFD700] to-[#FFD700]/60 rounded-full"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <div className="max-w-md mx-auto">
                  <div className="w-16 h-16 mx-auto mb-6 bg-[#FFD700]/20 rounded-full flex items-center justify-center">
                    <Users className="h-8 w-8 text-[#FFD700]" />
                  </div>
                  <p className="text-gray-300 text-xl mb-4">
                    Aucun service trouvé pour cette catégorie.
                  </p>
                  <p className="text-gray-500">
                    Essayez une autre catégorie ou consultez tous nos services.
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-20 bg-[#1a1a1a] border-t border-[#FFD700]/20">
          <div className="container mx-auto px-4 text-center">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-4xl font-bold mb-6 text-white">
                Prêt à vivre une expérience <span className="text-[#FFD700]">exceptionnelle</span> ?
              </h2>
              <p className="text-xl text-gray-300 mb-10 leading-relaxed">
                Nos experts sont à votre disposition pour vous offrir un service personnalisé 
                et des résultats qui dépasseront vos attentes.
              </p>
              <div className="flex justify-center">
                <Link
                  to="/professionals"
                  className="bg-[#FFD700] text-black px-12 py-4 rounded-xl font-bold text-xl transition-all duration-300 hover:bg-[#FFD700]/90 hover:scale-105 hover:shadow-lg hover:shadow-[#FFD700]/40"
                >
                  NOS PROFESSIONNELS
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default ServicesPage;
