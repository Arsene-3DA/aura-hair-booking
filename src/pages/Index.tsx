import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Scissors, Star, Clock, MapPin, ArrowLeft, Sparkles, User, Calendar, Settings } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import HeroSection from '@/components/HeroSection';
import ServicesSection from '@/components/ServicesSection';
import HairdresserCard from '@/components/HairdresserCard';
import { useToast } from "@/hooks/use-toast";
import { useRoleAuth } from '@/hooks/useRoleAuth';
import { supabase } from '@/integrations/supabase/client';
interface Professional {
  id: string;
  name: string;
  specialties: string[];
  rating: number;
  image_url: string;
  experience: string;
  location: string;
  gender: 'homme' | 'femme' | 'autre' | 'non_specifie';
  email: string;
  phone?: string;
  is_active: boolean;
  role: 'coiffeur' | 'coiffeuse' | 'cosmetique';
}
const Index = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    toast
  } = useToast();
  const {
    user,
    userProfile,
    isAuthenticated
  } = useRoleAuth();
  const [showExperts, setShowExperts] = useState(false);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<'coiffeur' | 'coiffeuse' | 'cosmetique' | null>(null);
  useEffect(() => {
    if (location.state?.message) {
      toast({
        title: "✅ Succès",
        description: location.state.message
      });
    }
  }, [location.state, toast]);

  // Écouter les changements de rôles pour rafraîchir automatiquement
  useEffect(() => {
    const handleRefreshProfessionals = () => {
      if (showExperts) {
        // Rafraîchir la liste actuelle si on est sur l'affichage des experts
        handleShowExperts(selectedCategory || undefined);
      }
    };
    window.addEventListener('refreshProfessionals', handleRefreshProfessionals);
    return () => {
      window.removeEventListener('refreshProfessionals', handleRefreshProfessionals);
    };
  }, [showExperts, selectedCategory]);
  const handleShowExperts = async (category?: 'coiffeur' | 'coiffeuse' | 'cosmetique') => {
    setLoading(true);
    setShowExperts(true);
    setSelectedCategory(category || null);
    try {
      // Utiliser directement la fonction publique pour éviter les problèmes RLS
      const { data, error } = await supabase
        .rpc('get_public_hairdresser_data');
      console.log('Query result:', {
        data,
        error,
        category
      });
      if (error) {
        console.error('Erreur lors du chargement des professionnels:', error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les professionnels",
          variant: "destructive"
        });
        return;
      }
      // Filtrer par catégorie si spécifiée
      let filteredData = data || [];
      if (category) {
        // Récupérer les profils pour le filtrage par rôle
        const profilePromises = filteredData.map(async (item) => {
          if (!item.auth_id) return item; // Garder les professionnels sans compte
          
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('user_id', item.auth_id)
            .maybeSingle();
            
          return profile?.role === category ? item : null;
        });
        
        const profileResults = await Promise.all(profilePromises);
        filteredData = profileResults.filter(item => item !== null);
      }

      // Mapper les données directement depuis get_public_hairdresser_data
      const mappedProfessionals: Professional[] = filteredData.map(item => ({
        id: item.auth_id || item.id,
        name: item.name || 'Nom non défini',
        specialties: item.specialties || [],
        rating: item.rating || 5.0,
        image_url: item.image_url || '/placeholder.svg',
        experience: item.experience || 'Professionnel expérimenté',
        location: item.salon_address || item.location || '',
        gender: (item.gender || 'non_specifie') as 'homme' | 'femme' | 'autre' | 'non_specifie',
        email: '',
        phone: '',
        is_active: item.is_active ?? true,
        role: category || 'coiffeur'
      }));
      setProfessionals(mappedProfessionals);
      if (mappedProfessionals.length === 0) {
        toast({
          title: "Information",
          description: `Aucun professionnel ${category || ''} trouvé.`
        });
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  const handleCategorySelection = (category: 'coiffeur' | 'coiffeuse' | 'cosmetique') => {
    handleShowExperts(category);
  };
  const handleProfessionalLogin = () => {
    navigate('/auth');
  };
  const handleBackToHome = () => {
    setShowExperts(false);
    setProfessionals([]);
    setSelectedCategory(null);
  };
  const getDashboardRedirect = () => {
    if (!userProfile?.role) return '/auth';
    switch (userProfile.role) {
      case 'admin':
        return '/admin';
      case 'coiffeur':
      case 'coiffeuse':
      case 'cosmetique':
        return '/stylist';
      case 'client':
        return '/app';
      default:
        return '/auth';
    }
  };
  if (showExperts) {
    return <div className="min-h-screen bg-black">
        <Header />
        
        <main>
          {/* Header Section */}
          <section className="bg-black py-16 border-b border-[#FFD700]/20">
            <div className="container mx-auto px-4">
              <Button variant="outline" onClick={handleBackToHome} className="mb-6 bg-transparent border-[#FFD700]/30 text-[#FFD700] hover:bg-[#FFD700] hover:text-black transition-all duration-300">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour à l'accueil
              </Button>
              
              <div className="text-center">
                <h1 className="text-4xl font-bold mb-4 text-white">
                  {selectedCategory === 'coiffeur' ? <>Nos <span className="text-[#FFD700]">Coiffeurs</span></> : selectedCategory === 'coiffeuse' ? <>Nos <span className="text-[#FFD700]">Coiffeuses</span></> : selectedCategory === 'cosmetique' ? <>Nos Experts <span className="text-[#FFD700]">Cosmétique</span></> : <>Nos <span className="text-[#FFD700]">Experts</span></>}
                </h1>
                <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                  {selectedCategory === 'coiffeur' ? 'Découvrez nos coiffeurs qualifiés et réservez directement' : selectedCategory === 'coiffeuse' ? 'Découvrez nos coiffeuses qualifiées et réservez directement' : selectedCategory === 'cosmetique' ? 'Découvrez nos experts en cosmétique et soins esthétiques' : 'Découvrez nos professionnels qualifiés et réservez directement'}
                </p>
              </div>
            </div>
          </section>

          {/* Professionals Grid */}
          <section className="py-20 bg-black">
            <div className="container mx-auto px-4">
              {loading ? <div className="text-center py-16">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FFD700] mx-auto mb-4"></div>
                  <p className="text-gray-300 text-lg">Chargement des professionnels...</p>
                </div> : professionals.length > 0 ? <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {professionals.map(professional => <div key={professional.id} className="animate-fade-in">
                      <HairdresserCard id={professional.id} name={professional.name} photo={professional.image_url} tags={professional.specialties} rating={professional.rating} experience={professional.experience} />
                    </div>)}
                </div> : <div className="text-center py-16">
                  <p className="text-gray-300 text-lg mb-4">
                    Aucun professionnel trouvé.
                  </p>
                  <p className="text-gray-400 text-sm mb-6">
                    Utilisez le bouton "Initialiser" sur la page de connexion pour créer des comptes de test.
                  </p>
                  <Button onClick={() => navigate('/auth')} className="bg-[#FFD700] text-black hover:bg-[#FFD700]/90 hover:shadow-lg hover:shadow-[#FFD700]/20 transition-all duration-300">
                    Aller à la page de connexion
                  </Button>
                </div>}
            </div>
          </section>
        </main>
        
        <Footer />
      </div>;
  }
  return <div className="min-h-screen bg-black">
      <Header />
      
      <main>
        <HeroSection />
        
        {/* Section d'accès rapide pour les utilisateurs connectés */}
        {isAuthenticated && userProfile && <section className="py-12 bg-[#1a1a1a] border-y border-[#FFD700]/20">
            <div className="container mx-auto px-4">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-4 text-white">
                  Bonjour <span className="text-[#FFD700]">{userProfile.full_name || user?.email}</span> !
                </h2>
                <p className="text-xl text-gray-300">
                  Accédez rapidement à votre espace de travail
                </p>
              </div>
              
              <div className="flex justify-center gap-4">
                <Button onClick={() => navigate(getDashboardRedirect())} className="bg-[#FFD700] text-black hover:bg-[#FFD700]/90 hover:shadow-lg hover:shadow-[#FFD700]/20 transition-all duration-300 px-8 py-4 text-lg">
                  <Settings className="h-6 w-6 mr-3" />
                  Mon Dashboard
                </Button>
                
                {userProfile.role === 'client' && <Button onClick={() => navigate('/app/bookings/new')} className="bg-transparent border border-[#FFD700]/30 text-[#FFD700] hover:bg-[#FFD700] hover:text-black transition-all duration-300 px-8 py-4 text-lg">
                    <Calendar className="h-6 w-6 mr-3" />
                    Nouvelle Réservation
                  </Button>}
              </div>
            </div>
          </section>}
        
        <ServicesSection />
        
        {/* Section de sélection du genre */}
        <section className="py-20 bg-black">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4 text-white">
                Choisissez votre <span className="text-[#FFD700]">Expert</span>
              </h2>
              <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                Nos professionnels spécialisés vous attendent pour une expérience sur mesure
              </p>
            </div>
            
            {/* Bouton principal pour voir tous les experts */}
            <div className="text-center mb-12">
              <Button onClick={() => handleShowExperts()} className="bg-[#FFD700] text-black hover:bg-[#FFD700]/90 hover:shadow-lg hover:shadow-[#FFD700]/20 transition-all duration-300 text-xl px-12 py-4 rounded-xl">
                <Scissors className="h-6 w-6 mr-3" />
                Voir tous nos Experts
              </Button>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {/* Coiffeurs */}
              <div className="bg-[#1a1a1a] rounded-2xl p-8 border border-gray-700 hover:border-blue-500/60 hover:scale-105 transition-all duration-300 cursor-pointer group" onClick={() => handleCategorySelection('coiffeur')}>
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-6 bg-blue-500 rounded-full flex items-center justify-center">
                    <Scissors className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">
                    Voir nos coiffeurs
                  </h3>
                  <p className="text-gray-300 mb-6 text-sm leading-relaxed">
                    Spécialistes en coupe, barbe et styling masculin
                  </p>
                  <div className="space-y-3 mb-8">
                    <div className="flex items-center justify-center text-sm text-yellow-400">
                      <Star className="h-4 w-4 mr-2" />
                      Experts certifiés
                    </div>
                    <div className="flex items-center justify-center text-sm text-green-400">
                      <Clock className="h-4 w-4 mr-2" />
                      Disponibles aujourd'hui
                    </div>
                  </div>
                  <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 rounded-lg transition-all duration-300">
                    Voir nos coiffeurs
                  </Button>
                </div>
              </div>

              {/* Coiffeuses */}
              <div className="bg-[#1a1a1a] rounded-2xl p-8 border border-gray-700 hover:border-yellow-500/60 hover:scale-105 transition-all duration-300 cursor-pointer group" onClick={() => handleCategorySelection('coiffeuse')}>
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-6 bg-yellow-500 rounded-full flex items-center justify-center">
                    <Scissors className="h-8 w-8 text-black" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">
                    Voir nos coiffeuses
                  </h3>
                  <p className="text-gray-300 mb-6 text-sm leading-relaxed">
                    Spécialistes en coupe, couleur et coiffage féminin
                  </p>
                  <div className="space-y-3 mb-8">
                    <div className="flex items-center justify-center text-sm text-yellow-400">
                      <Star className="h-4 w-4 mr-2" />
                      Expertes certifiées
                    </div>
                    <div className="flex items-center justify-center text-sm text-green-400">
                      <Clock className="h-4 w-4 mr-2" />
                      Disponibles aujourd'hui
                    </div>
                  </div>
                  <Button className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-medium py-3 rounded-lg transition-all duration-300">
                    Voir nos coiffeuses
                  </Button>
                </div>
              </div>

              {/* Cosmétique */}
              <div className="bg-[#1a1a1a] rounded-2xl p-8 border border-gray-700 hover:border-purple-500/60 hover:scale-105 transition-all duration-300 cursor-pointer group" onClick={() => handleCategorySelection('cosmetique')}>
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-6 bg-purple-500 rounded-full flex items-center justify-center">
                    <Sparkles className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">
                    Cosmétique
                  </h3>
                  <p className="text-gray-300 mb-6 text-sm leading-relaxed">
                    Spécialistes en soins esthétiques et cosmétiques
                  </p>
                  <div className="space-y-3 mb-8">
                    <div className="flex items-center justify-center text-sm text-yellow-400">
                      <Star className="h-4 w-4 mr-2" />
                      Experts certifiés
                    </div>
                    <div className="flex items-center justify-center text-sm text-green-400">
                      <Clock className="h-4 w-4 mr-2" />
                      Disponibles aujourd'hui
                    </div>
                  </div>
                  <Button className="w-full bg-purple-500 hover:bg-purple-600 text-white font-medium py-3 rounded-lg transition-all duration-300">
                    Cosmétique
                  </Button>
                </div>
              </div>
            </div>

            {/* Section pour les professionnels - masquée si utilisateur connecté */}
            {!isAuthenticated && <div className="text-center mt-16">
                <div className="bg-[#1a1a1a] border border-[#FFD700]/30 rounded-lg p-6 max-w-md mx-auto">
                  <h3 className="text-lg font-semibold text-white mb-2">
                    Vous êtes un professionnel ?
                  </h3>
                  <p className="text-gray-300 mb-4">
                    Accédez à votre espace de gestion
                  </p>
                  <Button onClick={handleProfessionalLogin} className="bg-transparent border border-[#FFD700]/30 text-[#FFD700] hover:bg-[#FFD700] hover:text-black transition-all duration-300">
                    Connexion Professionnelle
                  </Button>
                </div>
              </div>}
          </div>
        </section>

        {/* Section informations pratiques */}
        <section className="py-16 bg-[#1a1a1a] border-t border-[#FFD700]/20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4 text-white">Informations Pratiques</h2>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-[#FFD700] rounded-full flex items-center justify-center">
                  <MapPin className="h-8 w-8 text-black" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-white">Adresse</h3>
                <p className="text-gray-300">Canada</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-[#FFD700] rounded-full flex items-center justify-center">
                  <Clock className="h-8 w-8 text-black" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-white">Horaires</h3>
                <p className="text-gray-300">Lun-Sam: 9h-21h<br />Dimanche: Fermé</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-[#FFD700] rounded-full flex items-center justify-center">
                  <span className="text-2xl">📞</span>
                </div>
                <h3 className="text-xl font-semibold mb-2 text-white">Contact</h3>
                <p className="text-gray-300">(873) 655-5275<br />contact@salonottawa.ca</p>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>;
};
export default Index;