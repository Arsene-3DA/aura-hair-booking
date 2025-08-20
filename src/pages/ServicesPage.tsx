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
  isRealService?: boolean; // Pour distinguer les services réels des services de démo
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
      // Coupes - Images fiables testées
      'Coupe Homme': 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=500&h=400&q=80',
      'Coupe Femme': 'https://images.unsplash.com/photo-1560869713-7d0954b04f2d?auto=format&fit=crop&w=500&h=400&q=80',
      'Dégradé': 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=500&h=400&q=80',
      
      // Barbe - Images de barbier professionnelles
      'Barbe': 'https://images.unsplash.com/photo-1511018797779-3bc6fb8d7db3?auto=format&fit=crop&w=500&h=400&q=80',
      'Rasage Traditionnel': 'https://images.unsplash.com/photo-1585747065706-d3d2b6b11aa6?auto=format&fit=crop&w=500&h=400&q=80',
      'Barbe Sculptée': 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=500&h=400&q=80',
      
      // Couleur - Images de coloration
      'Coloration': 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?auto=format&fit=crop&w=500&h=400&q=80',
      'Mèches': 'https://images.unsplash.com/photo-1522337660859-02fbefca4702?auto=format&fit=crop&w=500&h=400&q=80',
      'Balayage': 'https://images.unsplash.com/photo-1594736797933-d0200ba5bfe1?auto=format&fit=crop&w=500&h=400&q=80',
      'Coloration Fantaisie': 'https://images.unsplash.com/photo-1604902396830-aca29e19b067?auto=format&fit=crop&w=500&h=400&q=80',
      
      // Soins - Images de soins capillaires
      'Soin Capillaire': 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=500&h=400&q=80',
      'Massage Cuir Chevelu': 'https://images.unsplash.com/photo-1519415943484-9fa1873496d4?auto=format&fit=crop&w=500&h=400&q=80',
      
      // Coiffage - Images de styling
      'Extensions': 'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?auto=format&fit=crop&w=500&h=400&q=80',
      'Chignon': 'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?auto=format&fit=crop&w=500&h=400&q=80',
      'Styling': 'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=500&h=400&q=80',
      
      // Traitements - Images de traitements
      'Permanente': 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=500&h=400&q=80',
      'Lissage': 'https://images.unsplash.com/photo-1520637836862-4d197d17c50a?auto=format&fit=crop&w=500&h=400&q=80',
      
      // Conseil - Images de consultation
      'Relooking': 'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?auto=format&fit=crop&w=500&h=400&q=80',
      'Conseil': 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=500&h=400&q=80'
    };

    // Retourner l'image spécifique ou une image par catégorie
    if (imageMap[serviceName]) {
      return imageMap[serviceName];
    }

    // Images par défaut pour chaque catégorie
    const categoryDefaults: { [key: string]: string } = {
      'Coupe': 'https://images.unsplash.com/photo-1560869713-7d0954b04f2d?auto=format&fit=crop&w=500&h=400&q=80',
      'Couleur': 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?auto=format&fit=crop&w=500&h=400&q=80',
      'Barbe': 'https://images.unsplash.com/photo-1511018797779-3bc6fb8d7db3?auto=format&fit=crop&w=500&h=400&q=80',
      'Soin': 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=500&h=400&q=80',
      'Coiffage': 'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?auto=format&fit=crop&w=500&h=400&q=80',
      'Traitement': 'https://images.unsplash.com/photo-1520637836862-4d197d17c50a?auto=format&fit=crop&w=500&h=400&q=80',
      'Conseil': 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=500&h=400&q=80',
      'Autre': 'https://images.unsplash.com/photo-1560869713-7d0954b04f2d?auto=format&fit=crop&w=500&h=400&q=80'
    };

    return categoryDefaults[category] || categoryDefaults['Autre'];
  };

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        
        // Services prédéfinis comme base
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
          },
          {
            id: '5',
            name: 'Dégradé',
            description: 'Dégradé moderne avec finitions précises',
            price: 40,
            duration: 35,
            category: 'Coupe',
            hairdresser_count: 6
          },
          {
            id: '6',
            name: 'Mèches',
            description: 'Mèches naturelles pour illuminer vos cheveux',
            price: 65,
            duration: 75,
            category: 'Couleur',
            hairdresser_count: 7
          },
          {
            id: '7',
            name: 'Balayage',
            description: 'Technique de coloration naturelle et tendance',
            price: 95,
            duration: 120,
            category: 'Couleur',
            hairdresser_count: 5
          },
          {
            id: '8',
            name: 'Soin Capillaire',
            description: 'Soin réparateur et nourrissant pour tous types de cheveux',
            price: 35,
            duration: 30,
            category: 'Soin',
            hairdresser_count: 8
          },
          {
            id: '9',
            name: 'Extensions',
            description: 'Pose d\'extensions pour une nouvelle longueur',
            price: 120,
            duration: 180,
            category: 'Coiffage',
            hairdresser_count: 3
          },
          {
            id: '10',
            name: 'Lissage',
            description: 'Lissage professionnel pour cheveux lisses et brillants',
            price: 85,
            duration: 90,
            category: 'Traitement',
            hairdresser_count: 4
          },
          {
            id: '11',
            name: 'Rasage Traditionnel',
            description: 'Rasage à l\'ancienne avec serviettes chaudes',
            price: 25,
            duration: 25,
            category: 'Barbe',
            hairdresser_count: 3
          },
          {
            id: '12',
            name: 'Relooking',
            description: 'Conseil personnalisé pour un nouveau style',
            price: 50,
            duration: 60,
            category: 'Conseil',
            hairdresser_count: 2
          }
        ];

        let allServices = [...demoServices];

        // Essayer de charger les services réels des professionnels
        try {
          const { data: realServices, error: servicesError } = await supabase
            .from('services')
            .select('*');

          if (!servicesError && realServices && realServices.length > 0) {
            console.log('Services réels trouvés:', realServices.length);
            
            // Traiter les services réels
            const processedRealServices = await Promise.all(
              realServices.map(async (service: any) => {
                try {
                  // Compter combien de professionnels offrent ce service
                  const { data: countData, error: countError } = await supabase
                    .from('hairdresser_services')
                    .select('id')
                    .eq('service_id', service.id);

                  return {
                    id: `real-${service.id}`,
                    name: service.name,
                    description: service.description || `Service professionnel : ${service.name}`,
                    price: service.price || 50,
                    duration: service.duration || 60,
                    category: service.category || 'Autre',
                    hairdresser_count: countError ? 0 : (countData?.length || 0),
                    image_url: getServiceImage(service.name, service.category || 'Autre'),
                    isRealService: true
                  };
                } catch (error) {
                  console.error('Erreur lors du traitement du service:', error);
                  return {
                    id: `real-${service.id}`,
                    name: service.name,
                    description: service.description || `Service professionnel : ${service.name}`,
                    price: service.price || 50,
                    duration: service.duration || 60,
                    category: service.category || 'Autre',
                    hairdresser_count: 0,
                    image_url: getServiceImage(service.name, service.category || 'Autre'),
                    isRealService: true
                  };
                }
              })
            );

            // Fusionner les services en évitant les doublons
            const existingNames = demoServices.map(s => s.name.toLowerCase());
            const uniqueRealServices = processedRealServices.filter(
              service => !existingNames.includes(service.name.toLowerCase())
            );

            allServices = [...demoServices, ...uniqueRealServices];
            
            if (uniqueRealServices.length > 0) {
              toast({
                title: "Services mis à jour",
                description: `${uniqueRealServices.length} services professionnels ajoutés`,
              });
            }
          }
        } catch (error) {
          console.log('Services de la base non disponibles, utilisation des services de démonstration');
        }

        // Ajouter les images aux services
        const servicesWithImages = allServices.map(service => ({
          ...service,
          image_url: getServiceImage(service.name, service.category)
        }));
        
        setServices(servicesWithImages);
        console.log('Services chargés:', servicesWithImages.length);

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
                      <div className="absolute top-4 right-4 flex gap-2">
                        <span className="bg-black/70 backdrop-blur-sm text-[#FFD700] px-3 py-1 rounded-full text-sm font-medium border border-[#FFD700]/30">
                          {service.category}
                        </span>
                        {service.isRealService && (
                          <span className="bg-green-600/80 backdrop-blur-sm text-white px-2 py-1 rounded-full text-xs font-medium">
                            PRO
                          </span>
                        )}
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
