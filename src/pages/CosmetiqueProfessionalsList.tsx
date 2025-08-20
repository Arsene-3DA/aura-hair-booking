import { useNavigate } from 'react-router-dom';
import { useCompleteProfessionals } from '@/hooks/useCompleteProfessionals';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import HairdresserCard from '@/components/HairdresserCard';
import { Button } from "@/components/ui/button";
import { ArrowLeft, Sparkles } from 'lucide-react';

interface CosmetiqueProfessional {
  id: string;
  name: string;
  specialties: string[];
  rating: number;
  image_url: string;
  experience: string;
  location: string;
  auth_id: string;
  is_active: boolean;
}

const CosmetiqueProfessionalsList = () => {
  const navigate = useNavigate();
  const { professionals: allProfessionals, loading, error } = useCompleteProfessionals();

  // Filtrer les professionnels cosmétique
  const professionals = allProfessionals.filter(prof => prof.role === 'cosmetique');

  return (
    <div className="min-h-screen bg-black">
      <Header />
      <main>
        {/* Header Section */}
        <section className="bg-black py-16 border-b border-purple-500/20">
          <div className="container mx-auto px-4">
            <Button 
              variant="outline" 
              onClick={() => navigate('/')}
              className="mb-6 bg-transparent border-purple-500/30 text-purple-400 hover:bg-purple-500 hover:text-white transition-all duration-300"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour à l'accueil
            </Button>
            
            <div className="text-center">
              <div className="flex items-center justify-center mb-6">
                <div className="w-20 h-20 bg-purple-500 rounded-full flex items-center justify-center mr-4">
                  <Sparkles className="h-10 w-10 text-white" />
                </div>
                <h1 className="text-5xl font-bold text-white">
                  Nos Experts <span className="text-purple-400">Cosmétique</span>
                </h1>
              </div>
              <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                Spécialistes en soins esthétiques, cosmétiques et bien-être
              </p>
              <p className="text-sm text-purple-400 mt-4">
                ✨ Experts certifiés • 💜 Disponibles aujourd'hui
              </p>
            </div>
          </div>
        </section>

        {/* Professionals Grid */}
        <section className="py-20 bg-black">
          <div className="container mx-auto px-4">
            {loading ? (
              <div className="text-center py-16">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
                <p className="text-gray-300 text-lg">Chargement des experts cosmétique...</p>
              </div>
            ) : professionals.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {professionals.map((professional) => (
                  <div key={professional.id} className="animate-fade-in">
                    <HairdresserCard 
                      id={professional.id}
                      name={professional.name || professional.full_name}
                      photo={professional.image_url || professional.avatar_url}
                      tags={['Soins esthétiques', 'Cosmétique']}
                      rating={professional.rating}
                      experience="Expert en soins esthétiques"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="w-24 h-24 mx-auto mb-6 bg-purple-500/20 rounded-full flex items-center justify-center">
                  <Sparkles className="h-12 w-12 text-purple-400" />
                </div>
                <p className="text-gray-300 text-lg mb-4">
                  Aucun expert en cosmétique trouvé pour le moment.
                </p>
                <p className="text-gray-500 text-sm mb-6">
                  Nos experts cosmétique seront bientôt disponibles sur la plateforme.
                </p>
                <Button 
                  onClick={() => navigate('/auth')} 
                  className="bg-purple-500 text-white hover:bg-purple-600 hover:shadow-lg hover:shadow-purple-500/20 transition-all duration-300"
                >
                  Être notifié de leur arrivée
                </Button>
              </div>
            )}
            
            {/* Contact Info */}
            <div className="text-center mt-16">
              <p className="text-gray-300 mb-6">
                Besoin d'un soin spécifique ? Contactez-nous directement
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <div className="bg-[#1a1a1a] p-4 rounded-lg border border-purple-500/30 hover:border-purple-500/60 transition-all duration-300">
                  <p className="font-semibold text-white">📞 Téléphone</p>
                  <p className="text-purple-400">+1 (873) 655-5275</p>
                </div>
                <div className="bg-[#1a1a1a] p-4 rounded-lg border border-purple-500/30 hover:border-purple-500/60 transition-all duration-300">
                  <p className="font-semibold text-white">⏰ Horaires</p>
                  <p className="text-purple-400">9h-21h du lundi au samedi</p>
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

export default CosmetiqueProfessionalsList;